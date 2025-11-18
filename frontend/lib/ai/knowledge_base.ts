/**
 * AI知識ベース
 * モチベーション3.0、ビジネスフレームワーク、1on1、学び3.0などの
 * 教育・マネジメント理論を統合
 */

/**
 * モチベーション3.0（ダニエル・ピンク）の知識
 */
export const motivation30Knowledge = {
  title: "モチベーション3.0",
  author: "ダニエル・ピンク",
  keyConcepts: {
    autonomy: {
      name: "自律性（Autonomy）",
      description: "何を、いつ、どのように、誰と行うかについて、自分で選択する自由",
      application: "学生にタスクの選択肢を与え、自分で決めさせる"
    },
    mastery: {
      name: "熟達（Mastery）",
      description: "何かを上達させたい、成長したいという欲求",
      application: "スキル向上の機会を提供し、成長を実感できるようにする"
    },
    purpose: {
      name: "目的（Purpose）",
      description: "自分よりも大きな何かのために貢献したいという欲求",
      application: "プロジェクトの社会的意義や目的を明確に伝える"
    }
  },
  principles: [
    "外発的動機づけ（報酬・罰）は創造性を破壊する",
    "内発的動機づけ（自律性・熟達・目的）が持続的なやる気を生む",
    "21世紀の仕事には創造性が必要で、内発的動機づけが重要"
  ]
}

/**
 * ビジネスフレームワーク図鑑の知識
 */
export const businessFrameworksKnowledge = {
  title: "ビジネス フレームワーク 図鑑",
  author: "株式会社アンド",
  categories: {
    problemFinding: {
      name: "問題発見（PROBLEM FINDING）",
      frameworks: [
        "5W1H分析",
        "Why分析",
        "課題の構造化",
        "問題の可視化"
      ]
    },
    analytics: {
      name: "分析（ANALYTICS）",
      frameworks: [
        "SWOT分析",
        "3C分析",
        "PEST分析",
        "バリューチェーン分析"
      ]
    },
    serviceDevelopment: {
      name: "サービス開発（SERVICE DEVELOPMENT）",
      frameworks: [
        "カスタマージャーニー",
        "ペルソナ設計",
        "MVP（最小実行可能製品）",
        "デザイン思考"
      ]
    },
    businessImprovement: {
      name: "業務改善（BUSINESS IMPROVEMENT）",
      frameworks: [
        "PDCAサイクル",
        "カイゼン",
        "プロセス改善",
        "効率化フレームワーク"
      ]
    },
    creatingIdeas: {
      name: "アイデア創出（CREATING IDEAS）",
      frameworks: [
        "ブレインストーミング",
        "マインドマップ",
        "SCAMPER法",
        "オズボーンのチェックリスト"
      ]
    },
    strategyPlanning: {
      name: "戦略立案（STRATEGY PLANNING）",
      frameworks: [
        "ビジョン・ミッション設定",
        "戦略マップ",
        "ロードマップ作成",
        "KPI設計"
      ]
    },
    facilitation: {
      name: "ファシリテーション（FACILITATION）",
      frameworks: [
        "会議設計",
        "合意形成",
        "対話促進",
        "チームビルディング"
      ]
    }
  }
}

/**
 * 1on1の基本と実践の知識
 */
export const oneOnOneKnowledge = {
  title: "1on1の基本と実践がよくわかる本",
  authors: ["寺内健朗", "島田友和"],
  keySkills: {
    activeListening: {
      name: "傾聴（Active Listening）",
      description: "メンバーの話を受けとめるスキル",
      techniques: [
        "相槌を打つ",
        "要約して確認する",
        "感情を理解する",
        "判断を保留する"
      ]
    },
    questioning: {
      name: "質問（Questioning）",
      description: "話を整理し気づきを引き出すスキル",
      techniques: [
        "オープンクエスチョン（5W1H）",
        "クローズドクエスチョン（Yes/No）",
        "未来質問（どうなりたいか）",
        "リフレーミング（視点を変える）"
      ]
    },
    feedback: {
      name: "フィードバック",
      description: "建設的なフィードバックを提供する",
      techniques: [
        "SBI（状況・行動・影響）",
        "ポジティブフィードバック",
        "改善提案",
        "行動変容の支援"
      ]
    }
  },
  structure: {
    opening: "関係構築（ラポール形成）",
    main: "対話（傾聴・質問・フィードバック）",
    closing: "行動促進（アクションプラン設定）"
  }
}

/**
 * 学び3.0の知識
 */
export const learning30Knowledge = {
  title: "学び3.0",
  author: "信岡良亮",
  subtitle: "地域で未来共創人材を育てる",
  keyConcepts: {
    shift: {
      from: "個人が生き残るための学び",
      to: "みんなでよりよく生きるための学び"
    },
    characteristics: [
      "地域を旅する大学",
      "共創型の学習",
      "実践的な学び",
      "社会との接続"
    ],
    principles: [
      "個人の成長だけでなく、社会全体の成長を目指す",
      "地域コミュニティとの連携",
      "多様な価値観の受容",
      "実践を通じた学び"
    ]
  }
}

/**
 * 統合された知識ベース
 */
export const integratedKnowledgeBase = {
  motivation: motivation30Knowledge,
  frameworks: businessFrameworksKnowledge,
  oneOnOne: oneOnOneKnowledge,
  learning: learning30Knowledge
}

/**
 * 学生の状況に応じた適切なフレームワークを提案
 */
export function suggestFrameworksForStudent(
  student: {
    motivation_score: number
    load_score: number
    skill_企画: number
    skill_実行: number
    skill_調整: number
    skill_探索: number
    category?: string
  }
): string[] {
  const suggestions: string[] = []

  // モチベーションが低い場合
  if (student.motivation_score <= 2) {
    suggestions.push("モチベーション3.0: 自律性・熟達・目的の3要素を確認")
    suggestions.push("1on1: 傾聴と質問で内発的動機を引き出す")
  }

  // 負荷が高い場合
  if (student.load_score >= 4) {
    suggestions.push("業務改善フレームワーク: PDCAサイクルで効率化")
    suggestions.push("問題発見フレームワーク: 5W1H分析で課題を整理")
  }

  // スキル別の提案
  if (student.skill_企画 < 3) {
    suggestions.push("戦略立案フレームワーク: ビジョン・ミッション設定")
    suggestions.push("アイデア創出: ブレインストーミング、マインドマップ")
  }

  if (student.skill_調整 < 3) {
    suggestions.push("ファシリテーション: 会議設計、合意形成")
    suggestions.push("1on1: 対話促進スキル")
  }

  if (student.skill_探索 < 3) {
    suggestions.push("分析フレームワーク: SWOT分析、3C分析")
    suggestions.push("サービス開発: カスタマージャーニー、ペルソナ設計")
  }

  return suggestions
}

/**
 * プロンプトに組み込む知識ベースのテキストを生成
 */
export function generateKnowledgeBasePrompt(): string {
  return `
【参考知識ベース】

1. モチベーション3.0（ダニエル・ピンク）
   - 自律性（Autonomy）: 何を、いつ、どのように行うかの選択の自由
   - 熟達（Mastery）: 成長したい、上達したいという欲求
   - 目的（Purpose）: 自分よりも大きな何かのために貢献したい欲求
   - 原則: 内発的動機づけが持続的なやる気を生む

2. ビジネスフレームワーク図鑑
   - 問題発見: 5W1H分析、Why分析、課題の構造化
   - 分析: SWOT分析、3C分析、PEST分析
   - アイデア創出: ブレインストーミング、マインドマップ、SCAMPER法
   - 戦略立案: ビジョン・ミッション設定、ロードマップ作成
   - ファシリテーション: 会議設計、合意形成、対話促進

3. 1on1の基本と実践
   - 傾聴: メンバーの話を受けとめる、要約して確認、感情を理解
   - 質問: オープンクエスチョン、未来質問、リフレーミング
   - フィードバック: SBI（状況・行動・影響）、ポジティブフィードバック

4. 学び3.0
   - 個人の成長から、みんなでよりよく生きるための学びへ
   - 共創型の学習、実践的な学び、社会との接続
   - 地域コミュニティとの連携、多様な価値観の受容

これらの知識を活用して、具体的で実践的なアドバイスを提供してください。
`
}

