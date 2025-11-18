import { NextResponse } from 'next/server'
import { getStudents, getTeams } from '@/lib/datastore'

export async function GET(): Promise<Response> {
  try {
    const students = await getStudents()
    const teams = await getTeams()

    const teamLoadBalance = teams.map((team: any) => {
      const teamStudents = students.filter((s: any) => 
        team.student_ids.includes(s.student_id)
      )

      const avgMotivation = teamStudents.length > 0
        ? teamStudents.reduce((sum: number, s: any) => sum + s.motivation_score, 0) / teamStudents.length
        : 0

      const avgLoad = teamStudents.length > 0
        ? teamStudents.reduce((sum: number, s: any) => sum + s.load_score, 0) / teamStudents.length
        : 0

      const maxLoad = teamStudents.length > 0
        ? Math.max(...teamStudents.map((s: any) => s.load_score))
        : 0

      const minLoad = teamStudents.length > 0
        ? Math.min(...teamStudents.map((s: any) => s.load_score))
        : 0

      const loadVariance = teamStudents.length > 0
        ? teamStudents.reduce((sum: number, s: any) => 
            sum + Math.pow(s.load_score - avgLoad, 2), 0) / teamStudents.length
        : 0

      // 負荷バランススコア（0-5、低いほどバランスが悪い）
      const balanceScore = loadVariance > 2 ? 1 : 
                           loadVariance > 1 ? 2 :
                           loadVariance > 0.5 ? 3 : 5

      return {
        team_id: team.team_id,
        team_name: team.name,
        project_name: team.project_name,
        student_count: teamStudents.length,
        avg_motivation: Math.round(avgMotivation * 10) / 10,
        avg_load: Math.round(avgLoad * 10) / 10,
        max_load: maxLoad,
        min_load: minLoad,
        load_variance: Math.round(loadVariance * 100) / 100,
        balance_score: balanceScore,
        students: teamStudents.map((s: any) => ({
          student_id: s.student_id,
          name: s.name,
          motivation_score: s.motivation_score,
          load_score: s.load_score
        }))
      }
    })

    return NextResponse.json(teamLoadBalance) as Response
  } catch (error) {
    console.error('Error fetching team load balance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team load balance' },
      { status: 500 }
    ) as Response
  }
}

