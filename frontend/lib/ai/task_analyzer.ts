/**
 * タスク分析AI
 * ChatGPT APIを使用して、タスクの詳細な分析と最適なAI活用方法を提案
 */

import { chatCompletion, isOpenAIEnabled } from '../openai-client'
import { generateKnowledgeBasePrompt, businessFrameworksKnowledge } from './knowledge_base'

interface TaskData {
  task_id: string
  title: string
  description?: string
  category: string
  difficulty: number
  estimated_hours?: number
  required_skills?: string[]
}

export interface TaskAnalysis {
  optimal_ai_tools: Array<{
    tool: string
    usage: string
    prompt: string
    priority: 'high' | 'medium' | 'low'
  }>
  recommended_frameworks?: Array<{
    name: string
    category: string
    how_to_use: string
  }>
  breakdown: {
    subtasks: string[]
    estimated_hours: number
  }
  tips: string[]
  ai_generated: boolean
}

/**
 * タスクの詳細分析とAI活用方法を生成
 */
export async function analyzeTask(task: TaskData): Promise<TaskAnalysis> {
  if (!isOpenAIEnabled()) {
    return generateFallbackTaskAnalysis(task)
  }

  try {
    const systemPrompt = `あなたはPBLプロジェクトのタスク分析エキスパートです。
タスクを分析し、最適なAIツールの活用方法と具体的なアクションプランを提案してください。

${generateKnowledgeBasePrompt()}

ビジネスフレームワーク図鑑の70種類のフレームワークを活用し、タスクのカテゴリに応じて
適切なフレームワークを提案してください。`

    const userPrompt = `
以下のタスクを分析してください：

【タスク情報】
- タイトル: ${task.title}
- 説明: ${task.description || 'なし'}
- カテゴリ: ${task.category}
- 難易度: ${task.difficulty}/5
${task.estimated_hours ? `- 予想時間: ${task.estimated_hours}時間` : ''}
${task.required_skills && task.required_skills.length > 0 ? `- 必要スキル: ${task.required_skills.join(', ')}` : ''}

以下の形式でJSON形式で回答してください：
{
  "optimal_ai_tools": [
    {
      "tool": "ツール名",
      "usage": "具体的な使い方",
      "prompt": "実際に使えるプロンプト例",
      "priority": "high/medium/low"
    }
  ],
  "recommended_frameworks": [
    {
      "name": "フレームワーク名（ビジネスフレームワーク図鑑から）",
      "category": "問題発見/分析/アイデア創出/戦略立案/ファシリテーション",
      "how_to_use": "このタスクでの具体的な使い方"
    }
  ],
  "breakdown": {
    "subtasks": ["サブタスク1", "サブタスク2", "サブタスク3"],
    "estimated_hours": 推定時間（数値）
  },
  "tips": ["実践的なヒント1（フレームワーク活用を含む）", "実践的なヒント2", "実践的なヒント3"]
}

最低3つのAIツール提案と、タスクのカテゴリに応じた適切なフレームワークを2-3個提案してください。
`

    const response = await chatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      {
        model: process.env.OPENAI_MODEL || 'gpt-4o',
        temperature: 0.7,
        max_tokens: 800 // コスト削減: 800トークンで十分な品質を確保
      }
    )

    // JSONをパース
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        ...parsed,
        ai_generated: true
      }
    }

    return generateFallbackTaskAnalysis(task)

  } catch (error) {
    console.error('Error analyzing task:', error)
    return generateFallbackTaskAnalysis(task)
  }
}

/**
 * フォールバック用のタスク分析（ルールベース）
 */
function generateFallbackTaskAnalysis(task: TaskData): TaskAnalysis {
  const categoryTools: Record<string, Array<{
    tool: string
    usage: string
    prompt: string
    priority: 'high' | 'medium' | 'low'
  }>> = {
    '企画': [
      {
        tool: 'ChatGPT',
        usage: '企画書の構成案やアイデア出し',
        prompt: `「${task.title}」の企画書を作成してください。目的は${task.description || 'プロジェクトの成功'}です。構成案と各セクションの要点を提案してください。`,
        priority: 'high'
      },
      {
        tool: 'Notion AI',
        usage: '企画書のテンプレート生成と文章校正',
        prompt: '企画書の骨子を作成後、AIで文章を洗練し、読みやすく整理',
        priority: 'medium'
      },
      {
        tool: 'Miro AI',
        usage: 'マインドマップやフローチャートの自動生成',
        prompt: '企画の全体像を可視化し、関係性を整理して構造化',
        priority: 'medium'
      }
    ],
    '実行': [
      {
        tool: 'GitHub Copilot',
        usage: 'コード生成とリファクタリング支援',
        prompt: `「${task.title}」の実装コードを生成してください。要件: ${task.description || '機能実装'}`,
        priority: 'high'
      },
      {
        tool: 'Cursor AI',
        usage: 'コードレビューと最適化提案',
        prompt: '実装前の設計レビューやパフォーマンス改善の提案を依頼',
        priority: 'high'
      },
      {
        tool: 'ChatGPT',
        usage: '技術的な質問やエラーハンドリングの相談',
        prompt: `「${task.title}」の実装で詰まった際、具体的なエラーメッセージや状況を共有して解決策を提案してもらう`,
        priority: 'medium'
      }
    ],
    '調整': [
      {
        tool: 'ChatGPT',
        usage: 'メールや議事録の作成支援',
        prompt: `「${task.title}」に関する会議の議事録を作成してください。議題: ${task.description || '調整事項'}`,
        priority: 'high'
      },
      {
        tool: 'Notion AI',
        usage: '進捗レポートの自動生成',
        prompt: 'タスクの進捗状況をまとめてレポート形式に変換し、ステークホルダーに共有',
        priority: 'medium'
      },
      {
        tool: 'Slack AI',
        usage: 'コミュニケーションの最適化',
        prompt: 'チーム内のコミュニケーションを効率化し、必要な情報を適切に伝達',
        priority: 'low'
      }
    ],
    '探索': [
      {
        tool: 'Perplexity AI',
        usage: '最新情報の調査と要約',
        prompt: `「${task.title}」に関する最新の技術トレンドや競合分析の情報を収集し、要約してください`,
        priority: 'high'
      },
      {
        tool: 'ChatGPT',
        usage: 'ユーザーインタビューの質問設計',
        prompt: `「${task.title}」に関するユーザーインタビューの質問リストを作成してください。目的: ${task.description || 'ユーザー理解'}`,
        priority: 'medium'
      },
      {
        tool: 'Claude',
        usage: '調査結果の分析とレポート作成',
        prompt: '収集した情報を整理し、洞察を抽出してレポート形式にまとめる',
        priority: 'medium'
      }
    ]
  }

  const tools = categoryTools[task.category] || categoryTools['実行']

  // サブタスクの生成
  const subtasks: string[] = []
  if (task.difficulty >= 4) {
    subtasks.push('要件定義と設計')
    subtasks.push('実装（フェーズ1）')
    subtasks.push('実装（フェーズ2）')
    subtasks.push('テストと検証')
    subtasks.push('ドキュメント作成')
  } else if (task.difficulty >= 3) {
    subtasks.push('計画と準備')
    subtasks.push('実装')
    subtasks.push('レビューと修正')
  } else {
    subtasks.push('準備')
    subtasks.push('実行')
    subtasks.push('確認')
  }

  // 推定時間
  const estimatedHours = task.estimated_hours || task.difficulty * 2

  // ヒント
  const tips: string[] = []
  if (task.difficulty >= 4) {
    tips.push('タスクを小さく分割し、段階的に進めることが重要です')
    tips.push('各段階でAIに相談しながら進めると効率的です')
    tips.push('定期的にチームとレビューを行いましょう')
  } else {
    tips.push('AIツールを活用して効率化を図りましょう')
    tips.push('定期的に進捗を共有しましょう')
    tips.push('困ったときはチームに相談しましょう')
  }

  return {
    optimal_ai_tools: tools,
    breakdown: {
      subtasks,
      estimated_hours: estimatedHours
    },
    tips,
    ai_generated: false
  }
}

