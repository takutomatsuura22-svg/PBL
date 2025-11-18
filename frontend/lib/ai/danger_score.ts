/**
 * 危険度スコア計算
 * 総合危険度スコアを1-5で算出
 */

export interface StudentRiskFactors {
  motivation_score: number // 1-5
  load_score: number // 1-5
  overdue_tasks: number // 期限超過タスク数
  skill_gap: number // 0-1 (タスクに必要なスキルとのギャップ)
  recent_activity: number // 0-1 (最近の活動度)
  communication_gap: number // 0-1 (コミュニケーションの減少度)
}

/**
 * 総合危険度スコアを1-5で計算
 */
export function calculateDangerScore(factors: StudentRiskFactors): number {
  let score = 0
  let weightSum = 0

  // 1. モチベーションが低い（重み: 30%）
  const motivationRisk = (6 - factors.motivation_score) / 5 * 5
  score += motivationRisk * 0.3
  weightSum += 0.3

  // 2. 負荷が高い（重み: 25%）
  const loadRisk = factors.load_score
  score += loadRisk * 0.25
  weightSum += 0.25

  // 3. 期限超過タスク（重み: 20%）
  const overdueRisk = Math.min(5, factors.overdue_tasks * 1.5)
  score += overdueRisk * 0.2
  weightSum += 0.2

  // 4. スキルギャップ（重み: 10%）
  const skillGapRisk = factors.skill_gap * 5
  score += skillGapRisk * 0.1
  weightSum += 0.1

  // 5. 活動度の低下（重み: 10%）
  const activityRisk = (1 - factors.recent_activity) * 5
  score += activityRisk * 0.1
  weightSum += 0.1

  // 6. コミュニケーションギャップ（重み: 5%）
  const communicationRisk = factors.communication_gap * 5
  score += communicationRisk * 0.05
  weightSum += 0.05

  const finalScore = weightSum > 0 ? score / weightSum : 3
  return Math.max(1, Math.min(5, Math.round(finalScore * 10) / 10))
}

/**
 * 危険度レベルを判定
 */
export function getDangerLevel(score: number): 'safe' | 'caution' | 'warning' | 'critical' {
  if (score < 2) return 'safe'
  if (score < 3) return 'caution'
  if (score < 4) return 'warning'
  return 'critical'
}

/**
 * 危険度に基づいた推奨アクションを生成
 */
export function getDangerRecommendations(
  score: number, 
  factors: StudentRiskFactors
): string[] {
  const recommendations: string[] = []

  if (score >= 4) {
    recommendations.push('🔴 緊急対応が必要です。PMに即座に連絡してください。')
  }

  if (factors.motivation_score <= 2) {
    recommendations.push('💡 モチベーション向上のためのサポートを検討してください。')
    recommendations.push('   - 1on1ミーティングの実施')
    recommendations.push('   - タスクの難易度や種類の見直し')
  }

  if (factors.load_score >= 4) {
    recommendations.push('⚖️ タスクの再分配を検討してください。')
    recommendations.push('   - 優先度の低いタスクの延期')
    recommendations.push('   - チームメンバーへのタスク移管')
  }

  if (factors.overdue_tasks > 0) {
    recommendations.push(`⏰ ${factors.overdue_tasks}件の期限超過タスクがあります。`)
    recommendations.push('   - 優先順位の見直しが必要です')
    recommendations.push('   - 期限の再設定を検討')
  }

  if (factors.recent_activity < 0.5) {
    recommendations.push('📉 最近の活動が低下しています。')
    recommendations.push('   - 状況確認のためのヒアリング実施')
    recommendations.push('   - ブロッカーがないか確認')
  }

  if (factors.skill_gap > 0.5) {
    recommendations.push('📚 スキルサポートが必要です。')
    recommendations.push('   - メンタリングの実施')
    recommendations.push('   - 学習リソースの提供')
  }

  if (factors.communication_gap > 0.5) {
    recommendations.push('💬 コミュニケーションが減少しています。')
    recommendations.push('   - 定期的なチェックインの設定')
    recommendations.push('   - チームミーティングへの参加促進')
  }

  return recommendations
}
