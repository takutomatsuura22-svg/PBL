import { NextResponse } from 'next/server'
import { getStudentById, getStudents, getTasks } from '@/lib/datastore'
import { generateMotivationReason } from '@/lib/ai/motivation_reason'
import { analyzeLoadReason } from '@/lib/ai/load_reason'
import { generateEncouragementExamples } from '@/lib/ai/encouragement'

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

    const allStudents = await getStudents()
    const allTasks = await getTasks()
    const studentTasks = allTasks.filter((t: any) => t.assignee_id === student.student_id)

    // チームメンバーを取得
    const teamMembers = allStudents.filter((s: any) => 
      s.team_id === student.team_id && s.student_id !== student.student_id
    )

    // モチベーション推定理由
    const motivationReason = generateMotivationReason(
      {
        student_id: student.student_id,
        MBTI: student.MBTI,
        strengths: student.strengths,
        weaknesses: student.weaknesses,
        preferred_partners: student.preferred_partners,
        avoided_partners: student.avoided_partners
      },
      studentTasks.map((t: any) => ({
        task_id: t.task_id,
        status: t.status,
        difficulty: t.difficulty,
        category: t.category
      })),
      {
        partner_ids: teamMembers.map((s: any) => s.student_id),
        preferred_partners: student.preferred_partners,
        avoided_partners: student.avoided_partners
      },
      student.motivation_score
    )

    // 負荷の原因
    const loadReason = analyzeLoadReason(
      studentTasks.map((t: any) => ({
        task_id: t.task_id,
        title: t.title,
        difficulty: t.difficulty,
        estimated_hours: t.estimated_hours,
        deadline: t.deadline,
        status: t.status,
        category: t.category
      })),
      student.load_score
    )

    // AI声かけ例
    const encouragement = generateEncouragementExamples({
      name: student.name,
      motivation_score: student.motivation_score,
      load_score: student.load_score,
      MBTI: student.MBTI,
      strengths: student.strengths,
      weaknesses: student.weaknesses,
      recentTasks: studentTasks.slice(0, 5).map((t: any) => ({
        title: t.title,
        status: t.status
      }))
    })

    // 相性情報（誰と組むべきか）
    const compatibility = {
      recommended: teamMembers
        .filter((s: any) => 
          student.preferred_partners.includes(s.student_id) &&
          !student.avoided_partners.includes(s.student_id)
        )
        .map((s: any) => ({
          student_id: s.student_id,
          name: s.name,
          reason: '相性が良い',
          score: 5
        })),
      avoid: teamMembers
        .filter((s: any) => student.avoided_partners.includes(s.student_id))
        .map((s: any) => ({
          student_id: s.student_id,
          name: s.name,
          reason: '相性に注意が必要',
          score: 2
        })),
      neutral: teamMembers
        .filter((s: any) => 
          !student.preferred_partners.includes(s.student_id) &&
          !student.avoided_partners.includes(s.student_id)
        )
        .map((s: any) => ({
          student_id: s.student_id,
          name: s.name,
          reason: '相性は問題なし',
          score: 3
        }))
    }

    return NextResponse.json({
      motivationReason,
      loadReason,
      encouragement,
      compatibility
    }) as Response
  } catch (error) {
    console.error('Error fetching student analysis:', error)
    return NextResponse.json(
      { error: 'Failed to fetch student analysis' },
      { status: 500 }
    ) as Response
  }
}

