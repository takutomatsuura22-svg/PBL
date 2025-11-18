import { NextResponse } from 'next/server'
import { getStudentById, getTasks } from '@/lib/datastore'
import { calculateSkills, calculateSkillForCategory } from '../../../../../backend/ai/skill_calculator'

/**
 * 学生のスキルを自動計算
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    const studentId = params.id
    
    // 学生データを取得
    const studentData = await getStudentById(studentId)
    if (!studentData) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      ) as Response
    }
    
    // タスクデータを取得
    const allTasks = await getTasks()
    
    // 学生のタスクを抽出
    const studentTasks = allTasks.filter((t: any) => {
      const assigneeIds = Array.isArray(t.assignee_id) ? t.assignee_id : [t.assignee_id]
      return assigneeIds.includes(studentId)
    })
    
    // 自己申告データを取得（ローカルファイルから）
    let selfAssessments: any[] | null = null
    try {
      const dataDir = join(process.cwd(), '..', 'backend', 'data')
      const assessmentsDir = join(dataDir, 'skill-assessments')
      const assessmentFile = join(assessmentsDir, `${studentId}.json`)
      
      if (existsSync(assessmentFile)) {
        const allAssessments = JSON.parse(readFileSync(assessmentFile, 'utf8'))
        if (allAssessments && allAssessments.length > 0) {
          // 最新の評価を使用
          const latest = allAssessments[allAssessments.length - 1]
          selfAssessments = latest.skills || null
        }
      }
    } catch (error) {
      console.warn('Failed to fetch self assessments:', error)
    }
    
    // スキルを計算
    const result = calculateSkills(
      {
        student_id: studentData.student_id,
        MBTI: studentData.MBTI || 'UNKNOWN'
      },
      studentTasks.map((t: any) => ({
        task_id: t.task_id,
        category: t.category || '',
        difficulty: t.difficulty || 3,
        status: t.status as 'pending' | 'in_progress' | 'completed',
        assignee_id: studentId,
        estimated_hours: t.estimated_hours,
        start_date: t.start_date,
        end_date: t.end_date,
        deadline: t.deadline
      })),
      selfAssessments
    )
    
    return NextResponse.json({
      student_id: studentId,
      ...result
    }) as Response
  } catch (error) {
    console.error('Error calculating skills:', error)
    return NextResponse.json(
      { error: 'Failed to calculate skills' },
      { status: 500 }
    ) as Response
  }
}

/**
 * 特定のスキルカテゴリのみを計算
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    const { category } = await request.json()
    const studentId = params.id
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      ) as Response
    }
    
    const studentData = await getStudentById(studentId)
    if (!studentData) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      ) as Response
    }
    
    const allTasks = await getTasks()
    const studentTasks = allTasks.filter((t: any) => {
      const assigneeIds = Array.isArray(t.assignee_id) ? t.assignee_id : [t.assignee_id]
      return assigneeIds.includes(studentId)
    })
    
    const result = calculateSkillForCategory(
      {
        student_id: studentData.student_id,
        MBTI: studentData.MBTI || 'UNKNOWN'
      },
      category,
      studentTasks.map((t: any) => ({
        task_id: t.task_id,
        category: t.category || '',
        difficulty: t.difficulty || 3,
        status: t.status as 'pending' | 'in_progress' | 'completed',
        assignee_id: studentId,
        estimated_hours: t.estimated_hours,
        start_date: t.start_date,
        end_date: t.end_date,
        deadline: t.deadline
      }))
    )
    
    return NextResponse.json({
      student_id: studentId,
      category,
      ...result
    }) as Response
  } catch (error) {
    console.error('Error calculating skill:', error)
    return NextResponse.json(
      { error: 'Failed to calculate skill' },
      { status: 500 }
    ) as Response
  }
}

