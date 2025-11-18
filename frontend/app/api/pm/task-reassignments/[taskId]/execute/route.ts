import { NextResponse } from 'next/server'
import { getTasks, getStudents } from '@/lib/datastore'
import { writeFileSync, readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'

/**
 * タスク再割り当てを実行するAPI
 */
export async function POST(
  request: Request,
  { params }: { params: { taskId: string } }
): Promise<Response> {
  try {
    const { taskId } = params
    const body = await request.json()
    const { to_student_id } = body

    if (!to_student_id) {
      return NextResponse.json(
        { error: 'to_student_id is required' },
        { status: 400 }
      ) as Response
    }

    // タスクデータを読み込む
    const dataDir = join(process.cwd(), '..', 'backend', 'data')
    const tasksPath = join(dataDir, 'tasks.json')
    const tasksData = await getTasks()
    
    // タスクを更新（assignee_idのみ変更、statusをin_progressに変更）
    let updatedTask: any = null
    const updatedTasks = tasksData.map((task: any) => {
      if (task.task_id === taskId) {
        updatedTask = {
          ...task,
          assignee_id: to_student_id,
          status: task.status === 'completed' ? 'completed' : 'in_progress' // 完了済みはそのまま、それ以外は実行中に
        }
        return updatedTask
      }
      return task
    })

    // ファイルに保存
    const tasksFile = readFileSync(tasksPath, 'utf8')
    const tasksJson = JSON.parse(tasksFile)
    tasksJson.tasks = updatedTasks
    writeFileSync(tasksPath, JSON.stringify(tasksJson, null, 2), 'utf8')

    // 学生の負荷スコアを再計算
    await updateStudentLoadScores()

    // 学生名を取得
    const students = await getStudents()
    const toStudent = students.find((s: any) => s.student_id === to_student_id)
    const toStudentName = toStudent?.name || to_student_id

    return NextResponse.json({ 
      success: true,
      message: `タスク「${updatedTask?.title || taskId}」を${toStudentName}さんに再割り当てしました。タスクのステータスを「実行中」に変更し、学生の負荷スコアを更新しました。`
    }) as Response
  } catch (error) {
    console.error('Error executing task reassignment:', error)
    return NextResponse.json(
      { error: 'Failed to execute task reassignment' },
      { status: 500 }
    ) as Response
  }
}

/**
 * 学生の負荷スコアを再計算して更新
 */
async function updateStudentLoadScores() {
  try {
    const students = await getStudents()
    const tasks = await getTasks()
    const studentsDir = join(process.cwd(), '..', 'backend', 'data', 'students')

    // 各学生のタスクを集計
    const studentTasks = new Map<string, any[]>()
    tasks.forEach((task: any) => {
      if (task.status !== 'completed' && task.assignee_id) {
        if (!studentTasks.has(task.assignee_id)) {
          studentTasks.set(task.assignee_id, [])
        }
        studentTasks.get(task.assignee_id)!.push(task)
      }
    })

    // 各学生の負荷スコアを計算
    for (const student of students) {
      const studentTaskList = studentTasks.get(student.student_id) || []
      const loadScore = calculateLoadFromTasks(studentTaskList)

      // 学生ファイルを更新
      const sanitizedName = student.name.replace(/\s+/g, '').replace(/[\/\\:*?"<>|]/g, '').trim()
      const studentFilePath = join(studentsDir, `${sanitizedName}.json`)
      
      if (existsSync(studentFilePath)) {
        const studentData = JSON.parse(readFileSync(studentFilePath, 'utf8'))
        studentData.load_score = loadScore
        writeFileSync(studentFilePath, JSON.stringify(studentData, null, 2), 'utf8')
      }
    }
  } catch (error) {
    console.error('Error updating student load scores:', error)
  }
}

/**
 * タスクリストから負荷スコアを計算（1-5）
 */
function calculateLoadFromTasks(tasks: any[]): number {
  if (tasks.length === 0) return 1

  // 見積もり時間の合計
  const totalHours = tasks.reduce((sum, task) => sum + (task.estimated_hours || 0), 0)
  
  // 難易度の平均
  const avgDifficulty = tasks.reduce((sum, task) => sum + (task.difficulty || 3), 0) / tasks.length

  // 期限超過タスクの数
  const now = new Date()
  const overdueCount = tasks.filter((task: any) => {
    if (task.status === 'completed') return false
    const deadline = new Date(task.deadline)
    return deadline < now
  }).length

  // 負荷スコアの計算（1-5）
  let loadScore = 1
  
  // タスク数の影響（最大2.5点）
  if (tasks.length >= 10) loadScore += 2.5
  else if (tasks.length >= 7) loadScore += 2.0
  else if (tasks.length >= 5) loadScore += 1.5
  else if (tasks.length >= 3) loadScore += 1.0
  else if (tasks.length >= 1) loadScore += 0.5

  // 見積もり時間の影響（最大1.0点）
  if (totalHours >= 40) loadScore += 1.0
  else if (totalHours >= 30) loadScore += 0.8
  else if (totalHours >= 20) loadScore += 0.5
  else if (totalHours >= 10) loadScore += 0.3

  // 難易度の影響（最大0.5点）
  if (avgDifficulty >= 4.5) loadScore += 0.5
  else if (avgDifficulty >= 4) loadScore += 0.3
  else if (avgDifficulty >= 3.5) loadScore += 0.2

  // 期限超過の影響（最大1.0点）
  if (overdueCount >= 3) loadScore += 1.0
  else if (overdueCount >= 2) loadScore += 0.7
  else if (overdueCount >= 1) loadScore += 0.4

  return Math.max(1, Math.min(5, Math.round(loadScore * 10) / 10))
}


