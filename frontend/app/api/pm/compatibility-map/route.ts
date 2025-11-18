import { NextResponse } from 'next/server'
import { getStudents, getTeams } from '@/lib/datastore'

export async function GET(): Promise<Response> {
  try {
    const students = await getStudents()
    const teams = await getTeams()

    const compatibilityMap = teams.map((team: any) => {
      const teamStudents = students.filter((s: any) => 
        team.student_ids.includes(s.student_id)
      )

      // チーム内の相性マトリックス
      const compatibilityMatrix = teamStudents.map((student1: any) => {
        return teamStudents.map((student2: any) => {
          if (student1.student_id === student2.student_id) {
            return { score: 0, reason: '同一人物' }
          }

          let score = 3 // デフォルト（中立）
          const reasons: string[] = []

          // 相性が良い
          if (student1.preferred_partners.includes(student2.student_id)) {
            score += 2
            reasons.push('相性良好')
          }

          // 相性が悪い
          if (student1.avoided_partners.includes(student2.student_id)) {
            score -= 2
            reasons.push('相性注意')
          }

          // MBTI相性（簡易版）
          const mbti1 = student1.MBTI
          const mbti2 = student2.MBTI
          
          // 同じ外向/内向性は相性が良い傾向
          if ((mbti1.startsWith('E') && mbti2.startsWith('E')) ||
              (mbti1.startsWith('I') && mbti2.startsWith('I'))) {
            score += 0.5
          }

          // 同じ判断/知覚性は相性が良い傾向
          if ((mbti1.endsWith('J') && mbti2.endsWith('J')) ||
              (mbti1.endsWith('P') && mbti2.endsWith('P'))) {
            score += 0.5
          }

          score = Math.max(1, Math.min(5, Math.round(score * 10) / 10))

          return {
            score,
            reason: reasons.join('、') || '普通'
          }
        })
      })

      return {
        team_id: team.team_id,
        team_name: team.name,
        students: teamStudents.map((s: any) => ({
          student_id: s.student_id,
          name: s.name
        })),
        compatibility_matrix: compatibilityMatrix
      }
    })

    return NextResponse.json(compatibilityMap) as Response
  } catch (error) {
    console.error('Error fetching compatibility map:', error)
    return NextResponse.json(
      { error: 'Failed to fetch compatibility map' },
      { status: 500 }
    ) as Response
  }
}

