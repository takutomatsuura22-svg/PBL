import { NextResponse } from 'next/server'
import { getStudents, getTasks } from '@/lib/datastore'
import { calculateDangerScore, getDangerRecommendations } from '@/lib/ai/danger_score'

export async function GET(): Promise<Response> {
  try {
    const students = await getStudents()
    const tasks = await getTasks()
    const now = new Date()

    const interventions = []

    for (const student of students) {
      const studentTasks = tasks.filter((t: any) => t.assignee_id === student.student_id)
      const overdueTasks = studentTasks.filter((t: any) => {
        if (t.status === 'completed') return false
        const deadline = new Date(t.deadline)
        return deadline < now
      }).length

      const dangerFactors = {
        motivation_score: student.motivation_score,
        load_score: student.load_score,
        overdue_tasks: overdueTasks,
        skill_gap: 0.3,
        recent_activity: 0.7,
        communication_gap: 0.2
      }

      const dangerScore = calculateDangerScore(dangerFactors)

      // 危険度が3以上の場合のみ介入推奨
      if (dangerScore >= 3) {
        const recommendations = getDangerRecommendations(dangerScore, dangerFactors)
        interventions.push({
          student_id: student.student_id,
          student_name: student.name,
          reason: `危険度スコア: ${dangerScore.toFixed(1)}/5`,
          priority: dangerScore >= 4 ? 'high' : dangerScore >= 3.5 ? 'medium' : 'low',
          actions: recommendations
        })
      }
    }

    // 優先度順にソート
    interventions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })

    return NextResponse.json(interventions) as Response
  } catch (error) {
    console.error('Error fetching interventions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interventions' },
      { status: 500 }
    ) as Response
  }
}

