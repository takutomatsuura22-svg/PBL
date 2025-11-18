import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join, resolve } from 'path'
import { getStudents } from '@/lib/datastore'

/**
 * 選択中のWBSファイルからタスクを取得
 */
export async function GET(): Promise<Response> {
  try {
    // パス解決
    const cwd = process.cwd()
    let dataDir: string
    
    const frontendPath = resolve(cwd, '..', 'backend', 'data')
    const rootPath = resolve(cwd, 'backend', 'data')
    
    if (existsSync(frontendPath)) {
      dataDir = frontendPath
    } else if (existsSync(rootPath)) {
      dataDir = rootPath
    } else {
      dataDir = frontendPath
    }
    
    const configPath = join(dataDir, 'wbs_config.json')
    const wbsDir = join(dataDir, 'wbs')

    // 現在選択中のWBS IDを取得
    let currentWbsId: string | null = null
    if (existsSync(configPath)) {
      try {
        const config = JSON.parse(readFileSync(configPath, 'utf8'))
        currentWbsId = config.current_wbs_id || null
      } catch (error) {
        console.error('Error reading WBS config:', error)
      }
    }

    if (!currentWbsId) {
      console.log('⚠️ WBSが選択されていません')
      return NextResponse.json([]) as Response
    }

    const wbsPath = join(wbsDir, `${currentWbsId}.json`)
    if (!existsSync(wbsPath)) {
      console.log(`⚠️ WBSファイルが見つかりません: ${currentWbsId}`)
      return NextResponse.json([]) as Response
    }

    // WBSデータを読み込む
    const wbsData = JSON.parse(readFileSync(wbsPath, 'utf8'))
    let tasks = wbsData.tasks || []

    // 学生データを取得して担当者名を追加
    const students = await getStudents()
    
    const tasksWithAssignee = tasks.map((task: any) => {
      const assigneeIds = Array.isArray(task.assignee_id) 
        ? task.assignee_id 
        : task.assignee_id 
          ? [task.assignee_id] 
          : []
      
      const assigneeNames = assigneeIds.map((id: string) => {
        const assignee = students.find((s: any) => s.student_id === id)
        return assignee?.name || id
      })
      
      return {
        ...task,
        assignee_name: assigneeNames.length === 1 
          ? assigneeNames[0] 
          : assigneeNames.length > 1 
            ? assigneeNames 
            : '未割り当て'
      }
    })

    console.log(`📋 WBSから ${tasksWithAssignee.length}件のタスクを取得しました (WBS ID: ${currentWbsId})`)
    return NextResponse.json(tasksWithAssignee) as Response
  } catch (error) {
    console.error('Error fetching WBS tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch WBS tasks', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    ) as Response
  }
}

