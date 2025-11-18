/**
 * チーム分析レポートを生成するAPIエンドポイント
 * GET /api/teams/[id]/ai-analysis
 */

import { NextResponse } from 'next/server'
import { getStudents } from '@/lib/datastore'
import { generateTeamAnalysisReport } from '@/lib/ai/student_advisor'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    const teamId = params.id

    // すべての学生を取得してチームメンバーをフィルタリング
    const allStudents = await getStudents()
    const teamMembers = allStudents.filter(s => s.team_id === teamId)

    if (teamMembers.length === 0) {
      return NextResponse.json(
        { error: 'Team not found or has no members' },
        { status: 404 }
      ) as Response
    }

    // チーム分析レポートを生成
    const report = await generateTeamAnalysisReport(
      teamMembers.map(s => ({
        student_id: s.student_id,
        name: s.name,
        MBTI: s.MBTI,
        motivation_score: s.motivation_score,
        load_score: s.load_score,
        skill_企画: s.skill_企画,
        skill_実行: s.skill_実行,
        skill_調整: s.skill_調整,
        skill_探索: s.skill_探索,
        strengths: s.strengths,
        weaknesses: s.weaknesses,
        team_id: s.team_id
      })),
      teamId
    )

    return NextResponse.json({
      success: true,
      team_id: teamId,
      member_count: teamMembers.length,
      report: report
    }) as Response

  } catch (error) {
    console.error('Error generating team analysis:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate team analysis',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    ) as Response
  }
}

