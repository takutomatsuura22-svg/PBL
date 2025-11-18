import { NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, resolve } from 'path'
import { generateAIUsage } from '@/lib/ai/ai_usage_generator'

/**
 * 使用するWBSを選択
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const { wbs_id } = await request.json()

    if (!wbs_id) {
      return NextResponse.json(
        { error: 'wbs_id is required' },
        { status: 400 }
      ) as Response
    }

    // パス解決（list/route.tsと同じロジック）
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
    
    const wbsDir = join(dataDir, 'wbs')
    const wbsPath = join(wbsDir, `${wbs_id}.json`)
    const configPath = join(dataDir, 'wbs_config.json')
    const tasksPath = join(dataDir, 'tasks.json')

    // WBSファイルが存在するか確認
    if (!existsSync(wbsPath)) {
      return NextResponse.json(
        { error: 'WBS not found' },
        { status: 404 }
      ) as Response
    }

    // WBSデータを読み込む
    const wbsData = JSON.parse(readFileSync(wbsPath, 'utf8'))
    let tasks = wbsData.tasks || []

    // 各タスクにAI活用方法を生成（既存の値がない場合）
    tasks = tasks.map((task: any) => {
      if (!task.ai_usage && !task.ai_usage_method) {
        try {
          task.ai_usage = generateAIUsage({
            task_id: task.task_id || '',
            title: task.title || task.name || '',
            description: task.description || '',
            category: task.category || '実行',
            difficulty: task.difficulty || 3
          })
        } catch (error) {
          console.error(`Error generating AI usage for task ${task.task_id}:`, error)
        }
      }
      return task
    })

    // tasks.jsonに反映
    writeFileSync(
      tasksPath,
      JSON.stringify({ tasks }, null, 2),
      'utf8'
    )

    // 設定ファイルを更新
    const config = {
      current_wbs_id: wbs_id,
      updated_at: new Date().toISOString()
    }
    writeFileSync(
      configPath,
      JSON.stringify(config, null, 2),
      'utf8'
    )

    // 学生の負荷スコアを再計算
    try {
      const { getStudents } = await import('@/lib/datastore')
      const students = await getStudents()
      const studentsDir = join(dataDir, 'students')

      const studentTasks = new Map<string, any[]>()
      tasks.forEach((task: any) => {
        if (task.status !== 'completed') {
          // 複数担当者対応
          const assigneeIds = Array.isArray(task.assignee_id) ? task.assignee_id : task.assignee_id ? [task.assignee_id] : []
          assigneeIds.forEach((assigneeId: string) => {
            if (assigneeId) {
              if (!studentTasks.has(assigneeId)) {
                studentTasks.set(assigneeId, [])
              }
              studentTasks.get(assigneeId)!.push(task)
            }
          })
        }
      })

      for (const student of students) {
        const studentTaskList = studentTasks.get(student.student_id) || []
        const loadScore = calculateLoadFromTasks(studentTaskList)

        if (loadScore !== student.load_score) {
          const studentFilePath = join(studentsDir, `${student.name.replace(/\s+/g, '')}.json`)
          if (existsSync(studentFilePath)) {
            const studentData = JSON.parse(readFileSync(studentFilePath, 'utf8'))
            studentData.load_score = loadScore
            writeFileSync(studentFilePath, JSON.stringify(studentData, null, 2), 'utf8')
          }
        }
      }
    } catch (error) {
      console.error('Error updating student load scores:', error)
    }

    return NextResponse.json({
      success: true,
      message: `WBS「${wbsData.name || wbs_id}」を選択しました。学生の負荷スコアを更新しました。`
    }) as Response
  } catch (error) {
    console.error('Error selecting WBS:', error)
    return NextResponse.json(
      { error: 'Failed to select WBS' },
      { status: 500 }
    ) as Response
  }
}

function calculateLoadFromTasks(tasks: any[]): number {
  const activeTasks = tasks.filter(t => t.status !== 'completed')
  if (activeTasks.length === 0) return 1

  let totalLoad = 0
  const currentDate = new Date()

  for (const task of activeTasks) {
    // 見積もり時間が削除されたため、難易度と期間から負荷を計算
    const baseLoad = task.difficulty || 3
    
    // 開始日と終了日から期間を計算
    let durationDays = 1
    if (task.start_date && task.end_date) {
      const start = new Date(task.start_date)
      const end = new Date(task.end_date)
      durationDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
    } else if (task.end_date || task.deadline) {
      const end = new Date(task.end_date || task.deadline)
      durationDays = Math.max(1, Math.ceil((end.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)))
    }
    
    // 期間が短いほど負荷が高い（1日=1.0, 7日=0.5, 30日=0.2）
    const timeWeight = Math.min(1.0, Math.max(0.2, 1.0 / (durationDays / 7)))
    const weightedLoad = baseLoad * timeWeight

    let urgencyMultiplier = 1
    const deadline = task.end_date || task.deadline
    if (deadline) {
      const deadlineDate = new Date(deadline)
      const daysUntilDeadline = (deadlineDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      
      if (daysUntilDeadline < 0) urgencyMultiplier = 2.0
      else if (daysUntilDeadline < 1) urgencyMultiplier = 1.8
      else if (daysUntilDeadline < 3) urgencyMultiplier = 1.5
      else if (daysUntilDeadline < 7) urgencyMultiplier = 1.2
    }

    totalLoad += weightedLoad * urgencyMultiplier
  }

  const taskCountMultiplier = Math.min(activeTasks.length / 3, 1.5)
  const maxLoad = 15
  const normalizedLoad = (totalLoad * taskCountMultiplier / maxLoad) * 4 + 1

  return Math.max(1, Math.min(5, Math.round(normalizedLoad * 10) / 10))
}

