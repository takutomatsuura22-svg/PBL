import { NextResponse } from 'next/server'
import { getTasks, getStudents } from '@/lib/datastore'

interface DelayedTaskAlert {
  task_id: string
  task_title: string
  task_category: string
  assignee_id: string
  assignee_name: string
  deadline: string
  delay_days: number
  status: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  reason: string
  recommended_actions: string[]
  impact_score: number
}

/**
 * WBS遅延タスクのアラートを生成
 */
export async function GET(): Promise<Response> {
  try {
    const tasks = await getTasks()
    const students = await getStudents()
    const currentDate = new Date()

    // 学生マップを作成
    const studentMap = new Map(
      students.map(s => [s.student_id, s])
    )

    const delayedTasks: DelayedTaskAlert[] = []

    // 遅延タスクを検出
    for (const task of tasks) {
      if (!task.deadline || task.status === 'completed') {
        continue
      }

      const deadline = new Date(task.deadline)
      const delayDays = Math.floor((currentDate.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24))

      // 期限を過ぎているタスク
      if (delayDays > 0) {
        const assignee = task.assignee_id ? studentMap.get(task.assignee_id) : null
        const assigneeName = assignee?.name || task.assignee_id || '未割り当て'

        // 優先度を決定
        let priority: 'critical' | 'high' | 'medium' | 'low' = 'low'
        if (delayDays >= 7) {
          priority = 'critical'
        } else if (delayDays >= 3) {
          priority = 'high'
        } else if (delayDays >= 1) {
          priority = 'medium'
        }

        // AIが遅延の原因を分析
        const reason = generateDelayReason(task, assignee, delayDays)
        const recommendedActions = generateRecommendedActions(task, assignee, delayDays, priority)
        const impactScore = calculateImpactScore(task, delayDays, assignee)

        delayedTasks.push({
          task_id: task.task_id,
          task_title: task.title || task.task_id,
          task_category: task.category || '未設定',
          assignee_id: task.assignee_id || '',
          assignee_name: assigneeName,
          deadline: task.deadline,
          delay_days: delayDays,
          status: task.status || 'pending',
          priority,
          reason,
          recommended_actions: recommendedActions,
          impact_score: impactScore
        })
      }
    }

    // 優先度と影響度スコアでソート
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    delayedTasks.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      return b.impact_score - a.impact_score
    })

    return NextResponse.json(delayedTasks) as Response
  } catch (error) {
    console.error('Error fetching delayed tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch delayed tasks' },
      { status: 500 }
    ) as Response
  }
}

/**
 * AIが遅延の原因を分析
 */
function generateDelayReason(
  task: any,
  assignee: any,
  delayDays: number
): string {
  const reasons: string[] = []

  // 遅延日数による分析
  if (delayDays >= 7) {
    reasons.push(`【緊急】${delayDays}日間の重大な遅延が発生しています。`)
  } else if (delayDays >= 3) {
    reasons.push(`【重要】${delayDays}日間の遅延が発生しています。`)
  } else {
    reasons.push(`${delayDays}日間の遅延が発生しています。`)
  }

  // 担当者の負荷状況
  if (assignee) {
    if (assignee.load_score >= 4.5) {
      reasons.push(`担当者（${assignee.name}）のタスク量が非常に高く（${assignee.load_score}/5）、対応が困難な状況です。`)
    } else if (assignee.load_score >= 3.5) {
      reasons.push(`担当者（${assignee.name}）のタスク量が高く（${assignee.load_score}/5）、進捗に影響している可能性があります。`)
    }

    if (assignee.motivation_score <= 2) {
      reasons.push(`担当者（${assignee.name}）のモチベーションが低く（${assignee.motivation_score}/5）、作業が停滞している可能性があります。`)
    }
  } else {
    reasons.push('担当者が未割り当てのため、タスクが進行していません。')
  }

  // タスクの難易度
  if (task.difficulty >= 4) {
    reasons.push(`タスクの難易度が高く（${task.difficulty}/5）、想定以上の時間がかかっている可能性があります。`)
  }

  // 見積もり時間と実際の遅延
  if (task.estimated_hours) {
    const estimatedDays = task.estimated_hours / 8 // 1日8時間として計算
    if (delayDays > estimatedDays * 0.5) {
      reasons.push(`見積もり時間（${task.estimated_hours}時間）に対して大幅な遅延が発生しています。`)
    }
  }

  // ステータスによる分析
  if (task.status === 'pending') {
    reasons.push('タスクが未着手の状態で期限を過ぎています。')
  } else if (task.status === 'in_progress') {
    reasons.push('タスクは進行中ですが、期限を超過しています。')
  }

  return reasons.join(' ')
}

/**
 * AIが推奨アクションを生成
 */
function generateRecommendedActions(
  task: any,
  assignee: any,
  delayDays: number,
  priority: string
): string[] {
  const actions: string[] = []

  if (priority === 'critical') {
    actions.push('🔴 緊急対応: PMが直接介入し、状況を確認してください')
    actions.push('📞 担当者への即座のヒアリングを実施')
  } else if (priority === 'high') {
    actions.push('⚠️ 優先対応: 担当者と状況を確認し、支援を検討してください')
  }

  // 担当者への対応
  if (assignee) {
    if (assignee.load_score >= 4) {
      actions.push(`⚖️ タスク再分配: ${assignee.name}さんの負荷が高いため、他のメンバーへの移管を検討`)
    }
    if (assignee.motivation_score <= 2.5) {
      actions.push(`💡 モチベーション支援: ${assignee.name}さんへの1on1ミーティングを実施`)
    }
  } else {
    actions.push('👤 担当者割り当て: タスクに担当者を割り当ててください')
  }

  // タスクの見直し
  if (task.difficulty >= 4) {
    actions.push('📋 タスク分割: 難易度が高いため、より小さなタスクに分割することを検討')
  }

  if (delayDays >= 3) {
    actions.push('📅 期限見直し: 現実的な期限に再設定することを検討')
  }

  // ステータスによる対応
  if (task.status === 'pending') {
    actions.push('🚀 タスク開始: 未着手のため、早急に作業を開始してください')
  }

  // チーム支援
  if (priority === 'critical' || priority === 'high') {
    actions.push('👥 チーム支援: 他のメンバーからの支援を検討')
  }

  return actions
}

/**
 * 影響度スコアを計算（1-10）
 */
function calculateImpactScore(
  task: any,
  delayDays: number,
  assignee: any
): number {
  let score = 0

  // 遅延日数による影響（最大4点）
  score += Math.min(4, delayDays * 0.5)

  // タスクの難易度による影響（最大2点）
  score += (task.difficulty || 3) * 0.4

  // 見積もり時間による影響（最大2点）
  if (task.estimated_hours) {
    score += Math.min(2, task.estimated_hours / 20)
  }

  // 担当者の状況による影響（最大2点）
  if (assignee) {
    if (assignee.load_score >= 4.5) score += 1.5
    else if (assignee.load_score >= 3.5) score += 1
    else if (assignee.load_score >= 2.5) score += 0.5

    if (assignee.motivation_score <= 2) score += 1
    else if (assignee.motivation_score <= 3) score += 0.5
  } else {
    score += 1 // 未割り当ては影響大
  }

  return Math.max(1, Math.min(10, Math.round(score * 10) / 10))
}

