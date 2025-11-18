/**
 * タスク移動AI
 * 「負荷高」「モチベ低」なら誰に移すべきかを返す
 */

interface Student {
  student_id: string
  name: string
  load_score: number // 1-5
  motivation_score: number // 1-5
  skill_企画: number
  skill_実行: number
  skill_調整: number
  skill_探索: number
  preferred_partners: string[]
  avoided_partners: string[]
  team_id: string
}

interface Task {
  task_id: string
  title: string
  category: string // 企画、実行、調整、探索
  difficulty: number // 1-5
  estimated_hours: number
  assignee_id: string
  deadline: string
  status: 'pending' | 'in_progress' | 'completed'
}

interface ReassignmentSuggestion {
  task_id: string
  task_title: string
  from_student_id: string
  from_student_name: string
  to_student_id: string
  to_student_name: string
  reason: string
  priority: 'high' | 'medium' | 'low'
  score: number // 0-100
}

/**
 * タスク再割り当ての提案を生成
 */
export function suggestTaskReassignments(
  students: Student[],
  tasks: Task[]
): ReassignmentSuggestion[] {
  const suggestions: ReassignmentSuggestion[] = []

  for (const task of tasks) {
    if (task.status === 'completed') continue

    const currentAssignee = students.find(s => s.student_id === task.assignee_id)
    if (!currentAssignee) continue

    // 再割り当てが必要か判定
    const needsReassignment = 
      currentAssignee.load_score >= 4 || // 負荷が高い
      currentAssignee.motivation_score <= 2 || // モチベーションが低い
      !hasRequiredSkill(currentAssignee, task.category) // スキルが不足

    if (!needsReassignment) continue

    // 同じチーム内の学生を候補として検討
    const teamMembers = students.filter(s => 
      s.team_id === currentAssignee.team_id && 
      s.student_id !== currentAssignee.student_id
    )

    if (teamMembers.length === 0) continue

    // 最適な代替者を探す
    const candidates = teamMembers
      .map(student => ({
        student,
        score: calculateReassignmentScore(student, task, currentAssignee)
      }))
      .sort((a, b) => b.score - a.score)

    const bestCandidate = candidates[0]
    if (bestCandidate && bestCandidate.score > 50) {
      suggestions.push({
        task_id: task.task_id,
        task_title: task.title,
        from_student_id: currentAssignee.student_id,
        from_student_name: currentAssignee.name,
        to_student_id: bestCandidate.student.student_id,
        to_student_name: bestCandidate.student.name,
        reason: generateReason(bestCandidate.student, task, currentAssignee),
        priority: determinePriority(currentAssignee, task),
        score: bestCandidate.score
      })
    }
  }

  return suggestions.sort((a, b) => b.score - a.score)
}

/**
 * 必要なスキルを持っているか判定
 */
function hasRequiredSkill(student: Student, category: string): boolean {
  const skillMap: Record<string, keyof Student> = {
    '企画': 'skill_企画',
    '実行': 'skill_実行',
    '調整': 'skill_調整',
    '探索': 'skill_探索'
  }
  
  const skillKey = skillMap[category]
  if (!skillKey) return true // 不明なカテゴリはスキルチェックをスキップ
  
  const skill = student[skillKey] as number
  return skill >= 3 // スキル3以上を基準
}

/**
 * 再割り当てスコアを計算（0-100）
 */
function calculateReassignmentScore(
  candidate: Student,
  task: Task,
  currentAssignee: Student
): number {
  let score = 0

  // 1. 負荷が低いほど高評価（最大30点）
  const loadDiff = currentAssignee.load_score - candidate.load_score
  const loadScore = Math.max(0, Math.min(30, loadDiff * 10))
  score += loadScore

  // 2. スキル適性（最大30点）
  const skillMap: Record<string, keyof Student> = {
    '企画': 'skill_企画',
    '実行': 'skill_実行',
    '調整': 'skill_調整',
    '探索': 'skill_探索'
  }
  const skillKey = skillMap[task.category]
  if (skillKey) {
    const candidateSkill = candidate[skillKey] as number
    const skillScore = (candidateSkill / 5) * 30
    score += skillScore
  }

  // 3. モチベーション（最大20点）
  const motivationScore = (candidate.motivation_score / 5) * 20
  score += motivationScore

  // 4. 相性ボーナス（最大10点）
  const isPreferred = currentAssignee.preferred_partners.includes(candidate.student_id)
  const isAvoided = candidate.avoided_partners.includes(currentAssignee.student_id)
  if (isPreferred && !isAvoided) {
    score += 10
  } else if (isAvoided) {
    score -= 5
  }

  // 5. 負荷バランス（最大10点）
  // 候補者の負荷が現在の担当者より低い場合にボーナス
  if (candidate.load_score < currentAssignee.load_score) {
    score += 10
  }

  return Math.max(0, Math.min(100, Math.round(score)))
}

/**
 * 再割り当ての理由を生成（より具体的で詳細な説明）
 */
function generateReason(
  candidate: Student,
  task: Task,
  currentAssignee: Student
): string {
  const reasons: string[] = []

  // 負荷の比較（具体的な数値で説明）
  const loadDiff = currentAssignee.load_score - candidate.load_score
  if (loadDiff > 0.5) {
    reasons.push(`${currentAssignee.name}さん（タスク量${currentAssignee.load_score}/5）は負荷が高く、${candidate.name}さん（タスク量${candidate.load_score}/5）に移すことで負荷が${loadDiff.toFixed(1)}ポイント軽減されます`)
  } else if (loadDiff > 0) {
    reasons.push(`負荷分散のため（${currentAssignee.name}さん: ${currentAssignee.load_score}/5 → ${candidate.name}さん: ${candidate.load_score}/5）`)
  }

  // モチベーションの比較
  const motivationDiff = candidate.motivation_score - currentAssignee.motivation_score
  if (motivationDiff > 0.5) {
    reasons.push(`${candidate.name}さんはモチベーションが${candidate.motivation_score}/5と高く（${currentAssignee.name}さん: ${currentAssignee.motivation_score}/5）、作業効率が向上します`)
  }

  // スキル適性の比較
  const skillMap: Record<string, keyof Student> = {
    '企画': 'skill_企画',
    '実行': 'skill_実行',
    '調整': 'skill_調整',
    '探索': 'skill_探索'
  }
  const skillKey = skillMap[task.category]
  if (skillKey) {
    const candidateSkill = candidate[skillKey] as number
    const currentSkill = currentAssignee[skillKey] as number
    const skillDiff = candidateSkill - currentSkill
    if (skillDiff > 0.5) {
      reasons.push(`${task.category}スキルが${currentSkill}/5から${candidateSkill}/5に上がり、タスク「${task.title}」の品質向上が期待できます`)
    } else if (candidateSkill >= 3 && currentSkill < 3) {
      reasons.push(`${candidate.name}さんは${task.category}スキルが${candidateSkill}/5と適性があり、${currentAssignee.name}さん（${currentSkill}/5）より適任です`)
    }
  }

  // 相性
  if (currentAssignee.preferred_partners.includes(candidate.student_id)) {
    reasons.push(`${currentAssignee.name}さんと${candidate.name}さんは相性が良く、協働作業がスムーズです`)
  }

  // タスクの難易度と見積もり時間
  if (task.estimated_hours > 0) {
    reasons.push(`見積もり時間: ${task.estimated_hours}時間`)
  }
  if (task.difficulty >= 4) {
    reasons.push(`高難易度タスク（${task.difficulty}/5）のため、スキル適性の高い${candidate.name}さんへの移管が推奨されます`)
  }

  return reasons.length > 0 
    ? reasons.join('。') 
    : `負荷分散とスキル適性の向上のため、${currentAssignee.name}さんから${candidate.name}さんへの移管を推奨します`
}

/**
 * 優先度を判定
 */
function determinePriority(currentAssignee: Student, task: Task): 'high' | 'medium' | 'low' {
  if (currentAssignee.load_score >= 4.5 || currentAssignee.motivation_score <= 1.5) {
    return 'high'
  }
  if (currentAssignee.load_score >= 4 || currentAssignee.motivation_score <= 2) {
    return 'medium'
  }
  return 'low'
}
