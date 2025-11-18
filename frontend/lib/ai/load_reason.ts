/**
 * 負荷の原因を分析
 */

interface Task {
  task_id: string
  title: string
  difficulty: number
  estimated_hours: number
  deadline: string
  status: 'pending' | 'in_progress' | 'completed'
  category: string
}

export interface LoadReason {
  mainCauses: Array<{
    cause: string
    severity: 'high' | 'medium' | 'low'
    description: string
    tasks?: string[]
  }>
  summary: string
  score: number
}

/**
 * 負荷の原因を分析
 */
export function analyzeLoadReason(
  tasks: Task[],
  loadScore: number
): LoadReason {
  const mainCauses: LoadReason['mainCauses'] = []
  const now = new Date()
  
  const activeTasks = tasks.filter(t => t.status !== 'completed')
  
  // 1. 期限超過タスク
  const overdueTasks = activeTasks.filter(t => {
    const deadline = new Date(t.deadline)
    return deadline < now
  })
  
  if (overdueTasks.length > 0) {
    mainCauses.push({
      cause: '期限超過タスク',
      severity: overdueTasks.length >= 3 ? 'high' : overdueTasks.length >= 2 ? 'medium' : 'low',
      description: `${overdueTasks.length}件のタスクが期限を超過しています。`,
      tasks: overdueTasks.map(t => t.title)
    })
  }
  
  // 2. 緊急タスク（1日以内）
  const urgentTasks = activeTasks.filter(t => {
    const deadline = new Date(t.deadline)
    const daysUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return daysUntilDeadline >= 0 && daysUntilDeadline < 1
  })
  
  if (urgentTasks.length > 0) {
    mainCauses.push({
      cause: '緊急タスク',
      severity: urgentTasks.length >= 3 ? 'high' : 'medium',
      description: `${urgentTasks.length}件のタスクが1日以内に期限を迎えます。`,
      tasks: urgentTasks.map(t => t.title)
    })
  }
  
  // 3. 高難易度タスク
  const highDifficultyTasks = activeTasks.filter(t => t.difficulty >= 4)
  
  if (highDifficultyTasks.length > 0) {
    mainCauses.push({
      cause: '高難易度タスク',
      severity: highDifficultyTasks.length >= 2 ? 'high' : 'medium',
      description: `難易度4以上のタスクが${highDifficultyTasks.length}件あります。`,
      tasks: highDifficultyTasks.map(t => t.title)
    })
  }
  
  // 4. 長時間タスク
  const longTasks = activeTasks.filter(t => t.estimated_hours >= 8)
  
  if (longTasks.length > 0) {
    mainCauses.push({
      cause: '長時間タスク',
      severity: longTasks.length >= 2 ? 'high' : 'medium',
      description: `8時間以上の長時間タスクが${longTasks.length}件あります。`,
      tasks: longTasks.map(t => t.title)
    })
  }
  
  // 5. タスク数
  if (activeTasks.length >= 5) {
    mainCauses.push({
      cause: 'タスク数過多',
      severity: activeTasks.length >= 7 ? 'high' : 'medium',
      description: `同時に${activeTasks.length}件のタスクを抱えています。`,
      tasks: activeTasks.slice(0, 5).map(t => t.title)
    })
  }
  
  // サマリーを生成
  let summary = ''
  if (loadScore >= 4) {
    summary = '負荷が非常に高い状態です。'
  } else if (loadScore >= 3) {
    summary = '負荷が高い状態です。'
  } else {
    summary = '負荷は適切な範囲内です。'
  }
  
  if (mainCauses.length > 0) {
    const highSeverityCount = mainCauses.filter(c => c.severity === 'high').length
    if (highSeverityCount > 0) {
      summary += ` ${highSeverityCount}つの主要な要因が確認されました。`
    } else {
      summary += ' いくつかの要因が確認されました。'
    }
  } else {
    summary += ' 特に問題となる要因は見られません。'
  }
  
  return {
    mainCauses,
    summary,
    score: loadScore
  }
}

