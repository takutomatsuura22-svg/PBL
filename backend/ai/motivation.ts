/**
 * モチベーション推定ロジック
 * 生徒のプロフィール・タスク・相性からモチベーションを1〜5で返す
 */

interface StudentProfile {
  student_id: string
  MBTI: string
  animal_type: string
  // スキル値（1-5スケール）
  skill_企画?: number
  skill_実行?: number
  skill_調整?: number
  skill_探索?: number
  skill_デザイン?: number
  skill_開発?: number
  skill_分析?: number
  skill_ドキュメント作成?: number
  skill_コミュニケーション?: number
  skill_リーダーシップ?: number
  skill_プレゼンテーション?: number
  skill_問題解決?: number
  // 後方互換性のため（段階的移行）
  strengths?: string[]
  weaknesses?: string[]
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

/**
 * モチベーションを1-5スケールで計算
 */
export function calculateMotivation(
  profile: StudentProfile,
  tasks: TaskData[],
  compatibility: TeamCompatibility
): number {
  let score = 0
  let weightSum = 0

  // 1. タスク完了率によるスコア（重み: 40%）
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const totalTasks = tasks.length
  const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0.5
  const taskScore = completionRate * 5
  score += taskScore * 0.4
  weightSum += 0.4

  // 2. タスクの難易度と自分のスキルのマッチ度（重み: 25%）
  const strengthMatch = tasks
    .filter(t => t.status !== 'completed')
    .reduce((sum, task) => {
      // スキル値から判定（3.5以上を得意とする）
      let skillValue = 3.0 // デフォルト
      const categoryMap: Record<string, keyof StudentProfile> = {
        '企画': 'skill_企画',
        '実行': 'skill_実行',
        '調整': 'skill_調整',
        '探索': 'skill_探索',
        'デザイン': 'skill_デザイン',
        '開発': 'skill_開発',
        '分析': 'skill_分析',
        'ドキュメント作成': 'skill_ドキュメント作成'
      }
      const skillKey = categoryMap[task.category]
      if (skillKey && profile[skillKey] !== undefined) {
        skillValue = profile[skillKey] as number
      } else if (profile.strengths && profile.strengths.includes(task.category)) {
        // 後方互換性: strengthsが存在する場合は使用
        skillValue = 4.0
      }
      
      // スキル値が3.5以上の場合、マッチ度を計算
      const match = skillValue >= 3.5 ? (skillValue / 5) : 0
      return sum + match * (task.difficulty / 5)
    }, 0)
  const avgStrengthMatch = tasks.length > 0 ? strengthMatch / tasks.length : 0
  const strengthScore = avgStrengthMatch * 5
  score += strengthScore * 0.25
  weightSum += 0.25

  // 3. チーム相性スコア（重み: 20%）
  const preferredCount = compatibility.partner_ids.filter(id => 
    compatibility.preferred_partners.includes(id)
  ).length
  const avoidedCount = compatibility.partner_ids.filter(id => 
    compatibility.avoided_partners.includes(id)
  ).length
  const compatibilityScore = Math.max(0, Math.min(5, 
    3 + (preferredCount * 0.5) - (avoidedCount * 1.0)
  ))
  score += compatibilityScore * 0.2
  weightSum += 0.2

  // 4. MBTI特性によるベーススコア（重み: 15%）
  // ENFP, ENTP, ESFPなど外向的・直感的タイプはやや高め
  const mbtiBase = getMBTIBaseScore(profile.MBTI)
  score += mbtiBase * 0.15
  weightSum += 0.15

  const finalScore = weightSum > 0 ? score / weightSum : 3
  return Math.max(1, Math.min(5, Math.round(finalScore * 10) / 10))
}

/**
 * MBTIタイプからベーススコアを取得（1-5）
 */
function getMBTIBaseScore(mbti: string): number {
  // 外向的・直感的タイプはやや高め
  if (mbti.startsWith('EN')) return 4.0
  if (mbti.startsWith('ES')) return 3.5
  if (mbti.startsWith('IN')) return 3.0
  if (mbti.startsWith('IS')) return 2.5
  return 3.0 // デフォルト
}

/**
 * タスクの進捗状況からモチベーションを推定
 */
export function estimateMotivationFromProgress(
  completedTasks: number,
  inProgressTasks: number,
  pendingTasks: number
): number {
  const total = completedTasks + inProgressTasks + pendingTasks
  if (total === 0) return 3 // デフォルト

  // 完了率が高いほど高評価
  const completionRate = completedTasks / total
  // 進行中タスクがあるとやや高評価
  const progressBonus = inProgressTasks > 0 ? 0.5 : 0

  const score = completionRate * 4 + progressBonus + 1
  return Math.max(1, Math.min(5, Math.round(score * 10) / 10))
}
