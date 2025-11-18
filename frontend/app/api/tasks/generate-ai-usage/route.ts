import { NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { getTasks } from '@/lib/datastore'
import { generateAIUsage } from '@/lib/ai/ai_usage_generator'

/**
 * すべてのタスクにAI活用方法を生成
 */
export async function POST(): Promise<Response> {
  try {
    const dataDir = join(process.cwd(), '..', 'backend', 'data')
    const tasksPath = join(dataDir, 'tasks.json')

    if (!existsSync(tasksPath)) {
      return NextResponse.json(
        { error: 'タスクファイルが見つかりません' },
        { status: 404 }
      ) as Response
    }

    // 既存のタスクデータを読み込む
    const tasksData = JSON.parse(readFileSync(tasksPath, 'utf8'))
    const tasks = tasksData.tasks || []

    let updatedCount = 0
    const updatedTasks = tasks.map((task: any) => {
      // AI活用方法がない場合のみ生成
      if (!task.ai_usage && !task.ai_usage_method) {
        try {
          task.ai_usage = generateAIUsage({
            task_id: task.task_id || '',
            title: task.title || task.name || '',
            description: task.description || '',
            category: task.category || '実行',
            difficulty: task.difficulty || 3
          })
          updatedCount++
        } catch (error) {
          console.error(`Error generating AI usage for task ${task.task_id}:`, error)
        }
      }
      return task
    })

    // ファイルに保存
    writeFileSync(
      tasksPath,
      JSON.stringify({ tasks: updatedTasks }, null, 2),
      'utf8'
    )

    return NextResponse.json({
      success: true,
      message: `${updatedCount}件のタスクにAI活用方法を生成しました。`,
      updated_count: updatedCount,
      total_tasks: tasks.length
    }) as Response
  } catch (error) {
    console.error('Error generating AI usage:', error)
    return NextResponse.json(
      { error: 'AI活用方法の生成に失敗しました' },
      { status: 500 }
    ) as Response
  }
}

/**
 * 特定のタスクにAI活用方法を生成
 */
export async function PUT(request: Request): Promise<Response> {
  try {
    const { task_id } = await request.json()

    if (!task_id) {
      return NextResponse.json(
        { error: 'タスクIDが指定されていません' },
        { status: 400 }
      ) as Response
    }

    const dataDir = join(process.cwd(), '..', 'backend', 'data')
    const tasksPath = join(dataDir, 'tasks.json')

    if (!existsSync(tasksPath)) {
      return NextResponse.json(
        { error: 'タスクファイルが見つかりません' },
        { status: 404 }
      ) as Response
    }

    // 既存のタスクデータを読み込む
    const tasksData = JSON.parse(readFileSync(tasksPath, 'utf8'))
    const tasks = tasksData.tasks || []

    const taskIndex = tasks.findIndex((t: any) => t.task_id === task_id)
    if (taskIndex === -1) {
      return NextResponse.json(
        { error: '指定されたタスクが見つかりません' },
        { status: 404 }
      ) as Response
    }

    const task = tasks[taskIndex]
    
    // AI活用方法を生成（既存の値を上書き）
    try {
      task.ai_usage = generateAIUsage({
        task_id: task.task_id || '',
        title: task.title || task.name || '',
        description: task.description || '',
        category: task.category || '実行',
        difficulty: task.difficulty || 3
      })
    } catch (error) {
      console.error(`Error generating AI usage for task ${task_id}:`, error)
      return NextResponse.json(
        { error: 'AI活用方法の生成に失敗しました' },
        { status: 500 }
      ) as Response
    }

    tasks[taskIndex] = task

    // ファイルに保存
    writeFileSync(
      tasksPath,
      JSON.stringify({ tasks }, null, 2),
      'utf8'
    )

    return NextResponse.json({
      success: true,
      message: 'AI活用方法を生成しました。',
      task: task
    }) as Response
  } catch (error) {
    console.error('Error generating AI usage:', error)
    return NextResponse.json(
      { error: 'AI活用方法の生成に失敗しました' },
      { status: 500 }
    ) as Response
  }
}

