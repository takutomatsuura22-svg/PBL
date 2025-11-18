import { NextResponse } from 'next/server'
import { getStudents, getTasks, getTeams } from '@/lib/datastore'

export async function GET(): Promise<Response> {
  try {
    const students = await getStudents()
    const tasks = await getTasks()
    const teams = await getTeams()
    const now = new Date()

    const stagnantProjects = teams.map((team: any) => {
      const teamStudents = students.filter((s: any) => 
        team.student_ids.includes(s.student_id)
      )
      const teamStudentIds = teamStudents.map((s: any) => s.student_id)
      const teamTasks = tasks.filter((t: any) => 
        teamStudentIds.includes(t.assignee_id)
      )

      // 完了タスクの割合
      const completedTasks = teamTasks.filter((t: any) => t.status === 'completed').length
      const totalTasks = teamTasks.length
      const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0

      // 期限超過タスク
      const overdueTasks = teamTasks.filter((t: any) => {
        if (t.status === 'completed') return false
        const deadline = new Date(t.deadline)
        return deadline < now
      }).length

      // 進行中のタスクの平均遅延日数
      const inProgressTasks = teamTasks.filter((t: any) => t.status === 'in_progress')
      const avgDelayDays = inProgressTasks.length > 0
        ? inProgressTasks.reduce((sum: number, t: any) => {
            const deadline = new Date(t.deadline)
            const delay = (now.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24)
            return sum + Math.max(0, delay)
          }, 0) / inProgressTasks.length
        : 0

      // チームの平均モチベーション
      const avgMotivation = teamStudents.length > 0
        ? teamStudents.reduce((sum: number, s: any) => sum + s.motivation_score, 0) / teamStudents.length
        : 0

      // 停滞度スコア（0-5、高いほど停滞している）
      let stagnationScore = 0
      if (completionRate < 0.3) stagnationScore += 2
      else if (completionRate < 0.5) stagnationScore += 1

      if (overdueTasks > totalTasks * 0.3) stagnationScore += 2
      else if (overdueTasks > totalTasks * 0.1) stagnationScore += 1

      if (avgDelayDays > 7) stagnationScore += 2
      else if (avgDelayDays > 3) stagnationScore += 1

      if (avgMotivation < 2.5) stagnationScore += 1

      stagnationScore = Math.min(5, stagnationScore)

      return {
        team_id: team.team_id,
        team_name: team.name,
        project_name: team.project_name,
        stagnation_score: Math.round(stagnationScore * 10) / 10,
        completion_rate: Math.round(completionRate * 100),
        overdue_tasks: overdueTasks,
        total_tasks: totalTasks,
        avg_delay_days: Math.round(avgDelayDays * 10) / 10,
        avg_motivation: Math.round(avgMotivation * 10) / 10,
        is_stagnant: stagnationScore >= 3
      }
    }).filter((p: any) => p.is_stagnant)
      .sort((a: any, b: any) => b.stagnation_score - a.stagnation_score)

    return NextResponse.json(stagnantProjects) as Response
  } catch (error) {
    console.error('Error fetching stagnant projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stagnant projects' },
      { status: 500 }
    ) as Response
  }
}

