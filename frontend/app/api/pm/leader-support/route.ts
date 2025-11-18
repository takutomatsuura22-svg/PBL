import { NextResponse } from 'next/server'
import { getStudents, getTasks, getTeams } from '@/lib/datastore'

/**
 * チームのリーダーを特定
 * 1. team.leader_idが指定されている場合はそれを使用
 * 2. リーダーシップスキルが最も高いメンバーをリーダーとみなす
 * 3. それでも特定できない場合は最初のメンバーをリーダーとみなす
 */
function identifyLeader(team: any, teamStudents: any[]): any | null {
  // 1. leader_idが指定されている場合
  if (team.leader_id) {
    const leader = teamStudents.find((s: any) => s.student_id === team.leader_id)
    if (leader) return leader
  }

  // 2. リーダーシップスキルが最も高いメンバー
  const studentsWithLeadership = teamStudents
    .map((s: any) => ({
      student: s,
      leadership: s.skill_リーダーシップ || 0
    }))
    .filter(item => item.leadership > 0)
    .sort((a, b) => b.leadership - a.leadership)

  if (studentsWithLeadership.length > 0) {
    return studentsWithLeadership[0].student
  }

  // 3. 最初のメンバーをリーダーとみなす
  if (teamStudents.length > 0) {
    return teamStudents[0]
  }

  return null
}

export async function GET(): Promise<Response> {
  try {
    const students = await getStudents()
    const tasks = await getTasks()
    const teams = await getTeams()
    const now = new Date()

    const leaderSupportNeeds = []

    for (const team of teams) {
      const teamStudents = students.filter((s: any) => 
        (team.student_ids || []).includes(s.student_id)
      )

      if (teamStudents.length === 0) continue

      // リーダーを特定
      const leader = identifyLeader(team, teamStudents)
      if (!leader) continue

      const teamStudentIds = teamStudents.map((s: any) => s.student_id)
      const teamTasks = tasks.filter((t: any) => {
        const assigneeIds = Array.isArray(t.assignee_id) ? t.assignee_id : [t.assignee_id]
        return assigneeIds.some((id: string) => teamStudentIds.includes(id))
      })

      // リーダー個人の状態
      const leaderMotivation = leader.motivation_score || 3
      const leaderLoad = leader.load_score || 3
      const leaderDangerScore = leader.danger_score || 3

      // チーム全体の状態
      const dangerStudents = teamStudents.filter((s: any) => 
        (s.motivation_score || 3) <= 2.5 || (s.load_score || 3) >= 4
      )

      // 期限超過タスク
      const overdueTasks = teamTasks.filter((t: any) => {
        if (t.status === 'completed') return false
        if (!t.deadline) return false
        const deadline = new Date(t.deadline)
        return deadline < now
      })

      // 完了率
      const completionRate = teamTasks.length > 0
        ? teamTasks.filter((t: any) => t.status === 'completed').length / teamTasks.length
        : 0

      // リーダー個人への支援が必要か判定
      let supportScore = 0
      const reasons: string[] = []

      // リーダー個人の状態
      if (leaderMotivation <= 2) {
        supportScore += 3
        reasons.push(`リーダーのモチベーションが低い（${leaderMotivation.toFixed(1)}）`)
      } else if (leaderMotivation <= 2.5) {
        supportScore += 2
        reasons.push(`リーダーのモチベーションがやや低い（${leaderMotivation.toFixed(1)}）`)
      }

      if (leaderLoad >= 4.5) {
        supportScore += 3
        reasons.push(`リーダーの負荷が非常に高い（${leaderLoad.toFixed(1)}）`)
      } else if (leaderLoad >= 4) {
        supportScore += 2
        reasons.push(`リーダーの負荷が高い（${leaderLoad.toFixed(1)}）`)
      }

      if (leaderDangerScore >= 4) {
        supportScore += 2
        reasons.push(`リーダーの危険度が高い（${leaderDangerScore.toFixed(1)}）`)
      }

      // チーム全体の状態（リーダーが対応しきれない状況）
      if (dangerStudents.length >= teamStudents.length * 0.5) {
        supportScore += 2
        reasons.push(`チームメンバーの${dangerStudents.length}名が危険状態`)
      } else if (dangerStudents.length > 0) {
        supportScore += 1
        reasons.push(`チームメンバーの${dangerStudents.length}名が危険状態`)
      }

      if (overdueTasks.length >= teamTasks.length * 0.3) {
        supportScore += 2
        reasons.push(`期限超過タスクが${overdueTasks.length}件`)
      } else if (overdueTasks.length > 0) {
        supportScore += 1
        reasons.push(`期限超過タスクが${overdueTasks.length}件`)
      }

      if (completionRate < 0.3) {
        supportScore += 2
        reasons.push(`チームの完了率が${Math.round(completionRate * 100)}%と低い`)
      } else if (completionRate < 0.5) {
        supportScore += 1
        reasons.push(`チームの完了率が${Math.round(completionRate * 100)}%`)
      }

      // リーダーシップスキルが低い場合
      const leadershipSkill = leader.skill_リーダーシップ || 3
      if (leadershipSkill < 2.5) {
        supportScore += 1
        reasons.push(`リーダーシップスキルが低い（${leadershipSkill.toFixed(1)}）`)
      }

      // 支援が必要な場合（スコア3以上）
      if (supportScore >= 3) {
        leaderSupportNeeds.push({
          leader_id: leader.student_id,
          leader_name: leader.name,
          team_id: team.team_id,
          team_name: team.name,
          project_name: team.project_name,
          support_score: supportScore,
          priority: supportScore >= 6 ? 'high' : supportScore >= 4 ? 'medium' : 'low',
          reasons,
          leader_motivation: leaderMotivation,
          leader_load: leaderLoad,
          leader_danger_score: leaderDangerScore,
          danger_students_count: dangerStudents.length,
          overdue_tasks_count: overdueTasks.length,
          completion_rate: Math.round(completionRate * 100),
          recommended_actions: [
            'リーダーへの個別サポート',
            'チームミーティングの実施支援',
            'タスクの優先順位見直し支援',
            '危険状態のメンバーへの対応支援',
            '負荷分散の検討支援'
          ]
        })
      }
    }

    // 優先度順にソート
    leaderSupportNeeds.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })

    return NextResponse.json(leaderSupportNeeds) as Response
  } catch (error) {
    console.error('Error fetching leader support needs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leader support needs' },
      { status: 500 }
    ) as Response
  }
}

