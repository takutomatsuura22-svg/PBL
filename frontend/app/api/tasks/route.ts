import { NextResponse } from 'next/server'
import { getTasks, getStudents } from '@/lib/datastore'

export async function GET(): Promise<Response> {
  try {
    const tasks = await getTasks()
    const students = await getStudents()
    
    // タスクに担当者名を追加（複数担当者対応）
    const tasksWithAssignee = tasks.map((task: any) => {
      const assigneeIds = Array.isArray(task.assignee_id) ? task.assignee_id : task.assignee_id ? [task.assignee_id] : []
      const assigneeNames = assigneeIds.map((id: string) => {
        const assignee = students.find((s: any) => s.student_id === id)
        return assignee?.name || id
      })
      
      return {
        ...task,
        assignee_name: assigneeNames.length === 1 ? assigneeNames[0] : assigneeNames.length > 1 ? assigneeNames : '未割り当て'
      }
    })
    
    return NextResponse.json(tasksWithAssignee) as Response
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    ) as Response
  }
}

