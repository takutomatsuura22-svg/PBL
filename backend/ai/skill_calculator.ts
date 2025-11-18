/**
 * スキル自動評価システム
 * 方法1-4を実装: タスク完了率、難易度適応度、MBTI補正、完了速度
 */

interface Task {
  task_id: string
  category: string
  difficulty: number // 1-5
  status: 'pending' | 'in_progress' | 'completed'
  assignee_id: string
  estimated_hours?: number
  start_date?: string
  end_date?: string
  deadline?: string
}

interface Student {
  student_id: string
  MBTI: string
}

interface SelfAssessment {
  skill: string
  score: number
  confidence: number
  reason?: string
}

interface SelfAssessmentRecord {
  student_id: string
  date: string
  skills: SelfAssessment[]
  is_initial: boolean
}

// スキル項目の定義
export type SkillCategory = 
  | '企画' 
  | '実行' 
  | '調整' 
  | '探索'
  | 'デザイン'
  | '開発'
  | '分析'
  | 'ドキュメント作成'
  | 'コミュニケーション'
  | 'リーダーシップ'
  | 'プレゼンテーション'
  | '問題解決'

export interface SkillScores {
  企画: number
  実行: number
  調整: number
  探索: number
  デザイン: number
  開発: number
  分析: number
  ドキュメント作成: number
  コミュニケーション: number
  リーダーシップ: number
  プレゼンテーション: number
  問題解決: number
}

export interface SkillEvaluationResult {
  scores: SkillScores
  confidence: SkillScores // 各スキルの信頼度（0-1）
  breakdown: {
    [key in SkillCategory]: {
      completionRate: number
      difficultyAdaptation: number
      speed: number
      mbtiBase: number
    }
  }
}

/**
 * 方法1: タスク完了率ベースの評価
 */
function calculateSkillFromCompletionRate(
  studentId: string,
  category: SkillCategory,
  tasks: Task[]
): number {
  const categoryTasks = tasks.filter(t => 
    t.category === category && t.assignee_id === studentId
  )
  
  if (categoryTasks.length === 0) return 3.0 // デフォルト
  
  const completed = categoryTasks.filter(t => t.status === 'completed').length
  const completionRate = completed / categoryTasks.length
  
  // 完了率を1-5スケールに変換
  // 完了率100% = 5.0, 0% = 1.0
  const skillScore = 1 + (completionRate * 4)
  
  return Math.max(1, Math.min(5, Math.round(skillScore * 10) / 10))
}

/**
 * 方法2: 難易度適応度ベースの評価
 */
function calculateSkillFromDifficultyAdaptation(
  studentId: string,
  category: SkillCategory,
  tasks: Task[]
): number {
  const categoryTasks = tasks.filter(t => 
    t.category === category && 
    t.assignee_id === studentId &&
    t.status === 'completed'
  )
  
  if (categoryTasks.length === 0) return 3.0
  
  // 完了したタスクの難易度の平均
  const avgDifficulty = categoryTasks.reduce((sum, t) => sum + t.difficulty, 0) / categoryTasks.length
  
  // 難易度をそのままスキルスコアとして使用
  return Math.max(1, Math.min(5, Math.round(avgDifficulty * 10) / 10))
}

/**
 * 方法3: 完了速度ベースの評価
 */
function calculateSkillFromCompletionSpeed(
  studentId: string,
  category: SkillCategory,
  tasks: Task[]
): number {
  const completedTasks = tasks.filter(t => 
    t.category === category &&
    t.assignee_id === studentId &&
    t.status === 'completed' &&
    t.start_date &&
    t.end_date
  )
  
  if (completedTasks.length === 0) return 3.0
  
  const efficiencies: number[] = []
  
  completedTasks.forEach(task => {
    const startDate = new Date(task.start_date!)
    const endDate = new Date(task.end_date!)
    const actualDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    const actualHours = actualDays * 8 // 1日8時間と仮定
    const estimatedHours = task.estimated_hours || actualHours
    
    // 効率性 = 推定時間 / 実際の時間
    const efficiency = estimatedHours / Math.max(actualHours, 0.1)
    efficiencies.push(efficiency)
  })
  
  const avgEfficiency = efficiencies.reduce((sum, e) => sum + e, 0) / efficiencies.length
  
  // 効率性を1-5スケールに変換
  let skillScore = 3.0
  if (avgEfficiency >= 1.2) {
    skillScore = 3.0 + (avgEfficiency - 1.2) * 5
  } else if (avgEfficiency >= 1.0) {
    skillScore = 3.0 + (avgEfficiency - 1.0) * 5
  } else {
    skillScore = 3.0 - (1.0 - avgEfficiency) * 10
  }
  
  return Math.max(1, Math.min(5, Math.round(skillScore * 10) / 10))
}

/**
 * 方法4: MBTI特性による補正
 */
function getMBTISkillBase(mbti: string): SkillScores {
  const base: SkillScores = {
    企画: 3.0,
    実行: 3.0,
    調整: 3.0,
    探索: 3.0,
    デザイン: 3.0,
    開発: 3.0,
    分析: 3.0,
    ドキュメント作成: 3.0,
    コミュニケーション: 3.0,
    リーダーシップ: 3.0,
    プレゼンテーション: 3.0,
    問題解決: 3.0
  }
  
  if (!mbti || mbti.length < 4) return base
  
  // E/I（外向/内向）
  if (mbti[0] === 'E') {
    base.調整 += 0.2
    base.探索 += 0.1
    base.コミュニケーション += 0.3
    base.リーダーシップ += 0.2
    base.プレゼンテーション += 0.2
  } else {
    base.企画 += 0.2
    base.実行 += 0.1
    base.分析 += 0.2
    base.ドキュメント作成 += 0.1
  }
  
  // S/N（感覚/直感）
  if (mbti[1] === 'S') {
    base.実行 += 0.3
    base.調整 += 0.2
    base.開発 += 0.2
    base.企画 -= 0.1
    base.探索 -= 0.1
  } else {
    base.企画 += 0.3
    base.探索 += 0.3
    base.実行 -= 0.2
    base.調整 += 0.1
    base.分析 += 0.2
  }
  
  // T/F（思考/感情）
  if (mbti[2] === 'T') {
    base.実行 += 0.1
    base.企画 += 0.1
    base.開発 += 0.2
    base.分析 += 0.2
    base.問題解決 += 0.2
  } else {
    base.調整 += 0.2
    base.コミュニケーション += 0.2
    base.デザイン += 0.1
  }
  
  // J/P（判断/知覚）
  if (mbti[3] === 'J') {
    base.実行 += 0.1
    base.調整 += 0.1
    base.ドキュメント作成 += 0.2
    base.問題解決 += 0.1
  } else {
    base.探索 += 0.1
    base.企画 += 0.1
    base.デザイン += 0.1
  }
  
  // 1-5の範囲に正規化
  Object.keys(base).forEach(key => {
    const skillKey = key as SkillCategory
    base[skillKey] = Math.max(1, Math.min(5, Math.round(base[skillKey] * 10) / 10))
  })
  
  return base
}

/**
 * 自己申告データを取得（簡易版 - 実際の実装ではAPIから取得）
 */
function getSelfAssessments(studentId: string): SelfAssessment[] | null {
  // 実際の実装では、APIから取得する
  // ここではnullを返す（呼び出し側で取得する）
  return null
}

/**
 * 総合スキル評価（方法1-4 + 自己申告を統合）
 */
export function calculateSkills(
  student: Student,
  tasks: Task[],
  selfAssessments?: SelfAssessment[] | null
): SkillEvaluationResult {
  const allCategories: SkillCategory[] = [
    '企画', '実行', '調整', '探索',
    'デザイン', '開発', '分析', 'ドキュメント作成',
    'コミュニケーション', 'リーダーシップ', 'プレゼンテーション', '問題解決'
  ]
  
  const scores: SkillScores = {
    企画: 3.0,
    実行: 3.0,
    調整: 3.0,
    探索: 3.0,
    デザイン: 3.0,
    開発: 3.0,
    分析: 3.0,
    ドキュメント作成: 3.0,
    コミュニケーション: 3.0,
    リーダーシップ: 3.0,
    プレゼンテーション: 3.0,
    問題解決: 3.0
  }
  
  const confidence: SkillScores = {
    企画: 0.5,
    実行: 0.5,
    調整: 0.5,
    探索: 0.5,
    デザイン: 0.5,
    開発: 0.5,
    分析: 0.5,
    ドキュメント作成: 0.5,
    コミュニケーション: 0.5,
    リーダーシップ: 0.5,
    プレゼンテーション: 0.5,
    問題解決: 0.5
  }
  
  const breakdown: any = {}
  
  const mbtiBase = getMBTISkillBase(student.MBTI)
  
  for (const category of allCategories) {
    // 自己申告データを取得
    const selfAssessment = selfAssessments?.find(a => a.skill === category)
    const hasSelfAssessment = selfAssessment !== undefined
    const selfAssessmentScore = selfAssessment?.score || 3.0
    const selfAssessmentConfidence = selfAssessment?.confidence || 3.0
    // 各指標を計算
    const completionRateScore = calculateSkillFromCompletionRate(
      student.student_id,
      category,
      tasks
    )
    
    const difficultyScore = calculateSkillFromDifficultyAdaptation(
      student.student_id,
      category,
      tasks
    )
    
    const speedScore = calculateSkillFromCompletionSpeed(
      student.student_id,
      category,
      tasks
    )
    
    const mbtiBaseScore = mbtiBase[category]
    
    // データの信頼度を計算
    const categoryTasks = tasks.filter(t => 
      t.category === category && t.assignee_id === student.student_id
    )
    const completedTasks = categoryTasks.filter(t => t.status === 'completed')
    const hasSpeedData = completedTasks.some(t => t.start_date && t.end_date)
    
    // データポイントが多いほど信頼度が高い
    const taskDataConfidence = Math.min(1.0, completedTasks.length / 10)
    
    // 自己申告がある場合の重み付け
    let totalWeight = 0
    let weightedSum = 0
    
    if (hasSelfAssessment) {
      // 自己申告がある場合: 自己申告を優先（重み: 50%）
      // 自己申告の信頼度（confidence）に基づいて重みを調整
      const selfAssessmentWeight = 0.3 + (selfAssessmentConfidence / 5) * 0.2 // 0.3-0.5の範囲
      weightedSum += selfAssessmentScore * selfAssessmentWeight
      totalWeight += selfAssessmentWeight
      
      // タスク実績（重み: 30%）
      weightedSum += completionRateScore * 0.2
      totalWeight += 0.2
      
      if (completedTasks.length > 0) {
        weightedSum += difficultyScore * 0.2
        totalWeight += 0.2
      } else {
        weightedSum += mbtiBaseScore * 0.1
        totalWeight += 0.1
      }
      
      // 速度（重み: 10%）
      if (hasSpeedData) {
        weightedSum += speedScore * 0.1
        totalWeight += 0.1
      }
      
      // MBTIベース（重み: 10%）
      const remainingWeight = 1.0 - totalWeight
      if (remainingWeight > 0) {
        weightedSum += mbtiBaseScore * remainingWeight
        totalWeight += remainingWeight
      }
      
      // 信頼度: 自己申告の信頼度とタスクデータの信頼度を組み合わせ
      confidence[category] = Math.max(
        taskDataConfidence * 0.3 + (selfAssessmentConfidence / 5) * 0.7,
        0.5
      )
    } else {
      // 自己申告がない場合: 従来の重み付け
      // 完了率: 30%, 難易度適応: 30%, 速度: 20%, MBTI: 20%
      weightedSum += completionRateScore * 0.3
      totalWeight += 0.3
      
      if (completedTasks.length > 0) {
        weightedSum += difficultyScore * 0.3
        totalWeight += 0.3
      } else {
        weightedSum += mbtiBaseScore * 0.3
        totalWeight += 0.3
      }
      
      if (hasSpeedData) {
        weightedSum += speedScore * 0.2
        totalWeight += 0.2
      } else {
        weightedSum += mbtiBaseScore * 0.1
        totalWeight += 0.1
      }
      
      const remainingWeight = 1.0 - totalWeight
      if (remainingWeight > 0) {
        weightedSum += mbtiBaseScore * remainingWeight
        totalWeight += remainingWeight
      }
      
      confidence[category] = taskDataConfidence
    }
    
    const finalScore = totalWeight > 0 ? weightedSum / totalWeight : mbtiBaseScore
    scores[category] = Math.max(1, Math.min(5, Math.round(finalScore * 10) / 10))
    
    breakdown[category] = {
      completionRate: completionRateScore,
      difficultyAdaptation: difficultyScore,
      speed: speedScore,
      mbtiBase: mbtiBaseScore,
      selfAssessment: hasSelfAssessment ? selfAssessmentScore : undefined
    }
  }
  
  return {
    scores,
    confidence,
    breakdown
  }
}

/**
 * 特定のスキルカテゴリのみを評価
 */
export function calculateSkillForCategory(
  student: Student,
  category: SkillCategory,
  tasks: Task[]
): {
  score: number
  confidence: number
  breakdown: {
    completionRate: number
    difficultyAdaptation: number
    speed: number
    mbtiBase: number
  }
} {
  const result = calculateSkills(student, tasks)
  return {
    score: result.scores[category],
    confidence: result.confidence[category],
    breakdown: result.breakdown[category]
  }
}

