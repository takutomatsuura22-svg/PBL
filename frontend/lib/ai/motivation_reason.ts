/**
 * モチベーション推定理由を生成
 */

interface StudentProfile {
  student_id: string
  MBTI: string
  strengths: string[]
  weaknesses: string[]
  preferred_partners: string[]
  avoided_partners: string[]
}

interface TaskData {
  task_id: string
  status: 'pending' | 'in_progress' | 'completed'
  difficulty: number
  category: string
}

interface TeamCompatibility {
  partner_ids: string[]
  preferred_partners: string[]
  avoided_partners: string[]
}

export interface MotivationReason {
  factors: Array<{
    factor: string
    impact: 'positive' | 'negative' | 'neutral'
    description: string
    score: number
  }>
  summary: string
  score: number
}

/**
 * モチベーション推定理由を生成
 */
export function generateMotivationReason(
  profile: StudentProfile,
  tasks: TaskData[],
  compatibility: TeamCompatibility,
  motivationScore: number
): MotivationReason {
  const factors: MotivationReason['factors'] = []
  
  // 1. タスク完了率
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const totalTasks = tasks.length
  const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0.5
  const taskScore = completionRate * 5
  
  if (completionRate >= 0.7) {
    factors.push({
      factor: 'タスク完了率',
      impact: 'positive',
      description: `${completedTasks}/${totalTasks}件のタスクを完了しています。高い完了率がモチベーションを維持しています。`,
      score: taskScore
    })
  } else if (completionRate < 0.4) {
    factors.push({
      factor: 'タスク完了率',
      impact: 'negative',
      description: `${completedTasks}/${totalTasks}件のタスクを完了しています。完了率が低く、モチベーションに影響している可能性があります。`,
      score: taskScore
    })
  } else {
    factors.push({
      factor: 'タスク完了率',
      impact: 'neutral',
      description: `${completedTasks}/${totalTasks}件のタスクを完了しています。`,
      score: taskScore
    })
  }
  
  // 2. タスクと強みのマッチ度
  const activeTasks = tasks.filter(t => t.status !== 'completed')
  const strengthMatchCount = activeTasks.filter(t => 
    profile.strengths.includes(t.category)
  ).length
  const strengthMatchRate = activeTasks.length > 0 
    ? strengthMatchCount / activeTasks.length 
    : 0
  
  if (strengthMatchRate >= 0.6) {
    factors.push({
      factor: 'タスク適性',
      impact: 'positive',
      description: `現在のタスクの${Math.round(strengthMatchRate * 100)}%が強み（${profile.strengths.join('、')}）に関連しています。`,
      score: strengthMatchRate * 5
    })
  } else if (strengthMatchRate < 0.3) {
    factors.push({
      factor: 'タスク適性',
      impact: 'negative',
      description: `現在のタスクの多くが弱み（${profile.weaknesses.join('、')}）に関連しています。適性の高いタスクへの再配分を検討してください。`,
      score: strengthMatchRate * 5
    })
  }
  
  // 3. チーム相性
  const preferredCount = compatibility.partner_ids.filter(id => 
    compatibility.preferred_partners.includes(id)
  ).length
  const avoidedCount = compatibility.partner_ids.filter(id => 
    compatibility.avoided_partners.includes(id)
  ).length
  
  if (preferredCount > 0 && avoidedCount === 0) {
    factors.push({
      factor: 'チーム相性',
      impact: 'positive',
      description: `相性の良いメンバー${preferredCount}名と一緒に活動しています。`,
      score: 4
    })
  } else if (avoidedCount > 0) {
    factors.push({
      factor: 'チーム相性',
      impact: 'negative',
      description: `相性の良くないメンバー${avoidedCount}名がチームに含まれています。`,
      score: 2
    })
  }
  
  // 4. MBTI特性
  const mbtiBase = getMBTIBaseScore(profile.MBTI)
  if (mbtiBase >= 3.5) {
    factors.push({
      factor: '性格特性',
      impact: 'positive',
      description: `MBTIタイプ（${profile.MBTI}）の特性により、外向的・直感的な活動でモチベーションが維持されやすい傾向があります。`,
      score: mbtiBase
    })
  } else if (mbtiBase < 2.5) {
    factors.push({
      factor: '性格特性',
      impact: 'negative',
      description: `MBTIタイプ（${profile.MBTI}）の特性により、内向的な傾向があり、積極的な関与が必要な場合があります。`,
      score: mbtiBase
    })
  }
  
  // サマリーを生成
  const positiveCount = factors.filter(f => f.impact === 'positive').length
  const negativeCount = factors.filter(f => f.impact === 'negative').length
  
  let summary = ''
  if (motivationScore >= 4) {
    summary = 'モチベーションは高い状態です。'
  } else if (motivationScore >= 3) {
    summary = 'モチベーションは中程度です。'
  } else {
    summary = 'モチベーションが低い状態です。'
  }
  
  if (positiveCount > negativeCount) {
    summary += ' 全体的に良好な要因が多く見られます。'
  } else if (negativeCount > positiveCount) {
    summary += ' いくつかの改善点があります。'
  }
  
  return {
    factors,
    summary,
    score: motivationScore
  }
}

function getMBTIBaseScore(mbti: string): number {
  if (mbti.startsWith('EN')) return 4.0
  if (mbti.startsWith('ES')) return 3.5
  if (mbti.startsWith('IN')) return 3.0
  if (mbti.startsWith('IS')) return 2.5
  return 3.0
}

