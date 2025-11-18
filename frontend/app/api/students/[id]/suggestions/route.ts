import { NextResponse } from 'next/server'
import { getStudentById, getTasks } from '@/lib/datastore'
import { calculateDangerScore, getDangerRecommendations } from '@/lib/ai/danger_score'

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

    const tasks = await getTasks()
    const studentTasks = tasks.filter((t: any) => t.assignee_id === student.student_id)
    
    // 期限超過タスクを計算
    const now = new Date()
    const overdueTasks = studentTasks.filter((t: any) => {
      if (t.status === 'completed') return false
      const deadline = new Date(t.deadline)
      return deadline < now
    }).length

    // 危険度スコアを計算
    const dangerFactors = {
      motivation_score: student.motivation_score,
      load_score: student.load_score,
      overdue_tasks: overdueTasks,
      skill_gap: 0.3, // 仮の値（実際はタスクの必要スキルと比較）
      recent_activity: 0.7, // 仮の値
      communication_gap: 0.2 // 仮の値
    }

    const dangerScore = calculateDangerScore(dangerFactors)
    const recommendations = getDangerRecommendations(dangerScore, dangerFactors)

    // AI提案を生成
    const suggestions = recommendations.map((rec, idx) => ({
      type: 'danger_recommendation',
      message: rec,
      priority: idx === 0 && dangerScore >= 4 ? 'high' : 
                dangerScore >= 3 ? 'medium' : 'low'
    }))

    // モチベーションが低い場合の提案
    if (student.motivation_score <= 2) {
      suggestions.push({
        type: 'motivation',
        message: 'モチベーションが低いです。1on1ミーティングやタスクの見直しを検討してください。',
        priority: 'high'
      })
    }

    // 負荷が高い場合の提案
    if (student.load_score >= 4) {
      suggestions.push({
        type: 'load',
        message: 'タスク量が高いです。タスクの優先順位を見直すか、チームメンバーへの移管を検討してください。',
        priority: 'high'
      })
    }

    return NextResponse.json(suggestions) as Response
  } catch (error) {
    console.error('Error fetching suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    ) as Response
  }
}

