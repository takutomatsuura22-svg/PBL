/**
 * 学生への個別AIアドバイスを生成するAPIエンドポイント
 * GET /api/students/[id]/ai-advice
 */

import { NextResponse } from 'next/server'
import { getStudentById, getTasks } from '@/lib/datastore'
import { generateStudentAdvice } from '@/lib/ai/student_advisor'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    const student = await getStudentById(params.id)
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      ) as Response
    }

    // 学生のタスクを取得
    const allTasks = await getTasks()
    const studentTasks = allTasks.filter((t: any) => t.assignee_id === student.student_id)

    // AIアドバイスを生成
    const advice = await generateStudentAdvice(
      {
        student_id: student.student_id,
        name: student.name,
        MBTI: student.MBTI,
        motivation_score: student.motivation_score,
        load_score: student.load_score,
        skill_企画: student.skill_企画,
        skill_実行: student.skill_実行,
        skill_調整: student.skill_調整,
        skill_探索: student.skill_探索,
        strengths: student.strengths,
        weaknesses: student.weaknesses,
        team_id: student.team_id
      },
      studentTasks.map((t: any) => ({
        task_id: t.task_id,
        title: t.title,
        status: t.status,
        category: t.category,
        difficulty: t.difficulty,
        deadline: t.deadline
      }))
    )

    return NextResponse.json({
      success: true,
      student_id: student.student_id,
      student_name: student.name,
      advice: advice
    }) as Response

  } catch (error) {
    console.error('Error generating AI advice:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate AI advice',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    ) as Response
  }
}

