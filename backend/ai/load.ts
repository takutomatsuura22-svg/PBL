/**
 * 稼働負荷計算ロジック
 * タスクの重み×数×締切で負荷スコアを1-5で計算
 */

interface Task {
  task_id: string
  difficulty: number // 1-5
  estimated_hours: number
  deadline: string // ISO date string
  status: 'pending' | 'in_progress' | 'completed'
  category: string
}

interface LoadCalculationParams {
  tasks: Task[]
  currentDate?: Date
}

/**
 * 負荷スコアを1-5で計算
 */
export function calculateLoad(params: LoadCalculationParams): number {
  const { tasks, currentDate = new Date() } = params

  const activeTasks = tasks.filter(t => t.status !== 'completed')
  
  if (activeTasks.length === 0) return 1 // 最小値

  let totalLoad = 0

  for (const task of activeTasks) {
    // 基本負荷 = 難易度 × 推定時間の重み
    const timeWeight = Math.min(task.estimated_hours / 10, 1) // 10時間を最大として正規化
    const baseLoad = task.difficulty * timeWeight

    // 期限の近さによる負荷増加
    const deadline = new Date(task.deadline)
    const daysUntilDeadline = (deadline.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    
    let urgencyMultiplier = 1
    if (daysUntilDeadline < 0) {
      // 期限超過
      urgencyMultiplier = 2.0
    } else if (daysUntilDeadline < 1) {
      // 1日以内
      urgencyMultiplier = 1.8
    } else if (daysUntilDeadline < 3) {
      // 3日以内
      urgencyMultiplier = 1.5
    } else if (daysUntilDeadline < 7) {
      // 1週間以内
      urgencyMultiplier = 1.2
    }

    totalLoad += baseLoad * urgencyMultiplier
  }

  // タスク数の影響（タスクが多いほど負荷が増える）
  const taskCountMultiplier = Math.min(activeTasks.length / 3, 1.5) // 3タスクを基準

  // 1-5スケールに正規化
  // 最大負荷を15と仮定（難易度5×時間重み1×緊急度2.0×タスク数1.5）
  const maxLoad = 15
  const normalizedLoad = (totalLoad * taskCountMultiplier / maxLoad) * 4 + 1

  return Math.max(1, Math.min(5, Math.round(normalizedLoad * 10) / 10))
}

/**
 * 負荷レベルを判定
 */
export function getLoadLevel(load: number): 'low' | 'medium' | 'high' | 'critical' {
  if (load < 2) return 'low'
  if (load < 3) return 'medium'
  if (load < 4) return 'high'
  return 'critical'
}

/**
 * カテゴリ別の負荷を計算
 */
export function calculateLoadByCategory(tasks: Task[]): Record<string, number> {
  const activeTasks = tasks.filter(t => t.status !== 'completed')
  const categoryLoads: Record<string, { total: number; count: number }> = {}

  for (const task of activeTasks) {
    if (!categoryLoads[task.category]) {
      categoryLoads[task.category] = { total: 0, count: 0 }
    }
    categoryLoads[task.category].total += task.difficulty
    categoryLoads[task.category].count += 1
  }

  const result: Record<string, number> = {}
  for (const [category, data] of Object.entries(categoryLoads)) {
    const avgDifficulty = data.total / data.count
    result[category] = Math.max(1, Math.min(5, Math.round(avgDifficulty * 10) / 10))
  }

  return result
}
