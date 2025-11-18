import { NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

/**
 * タスクを更新
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    const taskId = params.id
    const updates = await request.json()

    const dataDir = join(process.cwd(), '..', 'backend', 'data')
    const tasksPath = join(dataDir, 'tasks.json')

    if (!existsSync(tasksPath)) {
      return NextResponse.json(
        { error: 'Tasks file not found' },
        { status: 404 }
      ) as Response
    }

    // 既存のタスクデータを読み込む
    const tasksData = JSON.parse(readFileSync(tasksPath, 'utf8'))
    const tasks = tasksData.tasks || []

    // タスクを検索
    const taskIndex = tasks.findIndex((t: any) => t.task_id === taskId)
    if (taskIndex === -1) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      ) as Response
    }

    // タスクを更新（許可されたフィールドのみ）
    const allowedFields = ['status', 'assignee_id', 'title', 'description', 'category', 'difficulty', 'start_date', 'end_date', 'deadline', 'ai_usage']
    const updatedTask = { ...tasks[taskIndex] }
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        updatedTask[field] = updates[field]
        // end_dateを更新した場合はdeadlineも更新（後方互換性）
        if (field === 'end_date' && updates[field]) {
          updatedTask.deadline = updates[field]
        }
        // deadlineを更新した場合はend_dateも更新
        if (field === 'deadline' && updates[field]) {
          updatedTask.end_date = updates[field]
        }
      }
    })

    tasks[taskIndex] = updatedTask

    // ファイルに保存
    writeFileSync(
      tasksPath,
      JSON.stringify({ tasks }, null, 2),
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
      task: updatedTask
    }) as Response
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
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

