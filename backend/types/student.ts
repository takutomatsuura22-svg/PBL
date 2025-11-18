/**
 * 学生データの型定義
 */
export interface Student {
  student_id: string
  name: string
  MBTI: string
  animal_type: string
  // スキル評価（1-5スケール、自動計算または手動設定）
  skill_企画: number
  skill_実行: number
  skill_調整: number
  skill_探索: number
  skill_デザイン: number
  skill_開発: number
  skill_分析: number
  skill_ドキュメント作成: number
  skill_コミュニケーション: number
  skill_リーダーシップ: number
  skill_プレゼンテーション: number
  skill_問題解決: number
  preferred_partners: string[]
  avoided_partners: string[]
  team_id: string
  motivation_score: number
  load_score: number
}




