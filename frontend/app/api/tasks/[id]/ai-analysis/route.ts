/**
 * タスクの詳細分析APIエンドポイント
 * GET /api/tasks/[id]/ai-analysis
 */

import { NextResponse } from 'next/server'
import { getTasks } from '@/lib/datastore'
import { analyzeTask } from '@/lib/ai/task_analyzer'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    const taskId = params.id

    // タスクを取得
    const allTasks = await getTasks()
    const task = allTasks.find((t: any) => t.task_id === taskId)

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      ) as Response
    }

    // タスク分析を実行
    const analysis = await analyzeTask({
      task_id: task.task_id,
      title: task.title,
      description: task.description,
      category: task.category,
      difficulty: task.difficulty,
      estimated_hours: task.estimated_hours,
      required_skills: task.required_skills
    })

    return NextResponse.json({
      success: true,
      task_id: task.task_id,
      task_title: task.title,
      analysis: analysis
    }) as Response

  } catch (error) {
    console.error('Error analyzing task:', error)
    return NextResponse.json(
      { 
        error: 'Failed to analyze task',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    ) as Response
  }
}

