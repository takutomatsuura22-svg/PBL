import { NextResponse } from 'next/server'
import { fetchWBSFromAirtable } from '@/lib/airtable-server'
import { getStudents } from '@/lib/datastore'

/**
 * 選択中のWBSからタスクを取得
 */
export async function GET(): Promise<Response> {
  try {
    // AirtableからWBS一覧を取得
    const wbsList = await fetchWBSFromAirtable()
    
    // 現在選択中のWBSを取得（is_currentがtrueのもの）
    const currentWBS = wbsList.find(w => w.is_current)
    
    if (!currentWBS) {
      console.log('⚠️ WBSが選択されていません')
      return NextResponse.json([]) as Response
    }

    let tasks = currentWBS.tasks || []

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

    console.log(`📋 WBSから ${tasksWithAssignee.length}件のタスクを取得しました (WBS ID: ${currentWBS.wbs_id})`)
    return NextResponse.json(tasksWithAssignee) as Response
  } catch (error) {
    console.error('Error fetching WBS tasks:', error)
    // Airtableが設定されていない場合は空配列を返す
    if (error instanceof Error && error.message.includes('not configured')) {
      return NextResponse.json([]) as Response
    }
    return NextResponse.json(
      { error: 'Failed to fetch WBS tasks', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    ) as Response
  }
}

