/**
 * AI活用方法生成ロジック
 * タスクのカテゴリと説明に基づいて、最適なAI活用方法を提案
 */

interface Task {
  task_id: string
  title: string
  description?: string
  category: string
  difficulty: number
}

/**
 * タスクに最適なAI活用方法を生成
 * AIが判断して、タスクの内容に応じた最適な活用方法を提案
 */
export function generateAIUsage(task: Task): string {
  const { title, description, category, difficulty } = task
  const fullText = `${title} ${description || ''}`.toLowerCase()

  // カテゴリ別の基本AI活用方法（より具体的に）
  const categorySuggestions: Record<string, { tool: string; usage: string; prompt: string }[]> = {
    '企画': [
      {
        tool: 'ChatGPT/Claude',
        usage: '企画書の構成案やアイデア出し',
        prompt: `「${title}」の企画書を作成してください。目的は${description || 'プロジェクトの成功'}です。構成案と各セクションの要点を提案してください。`
      },
      {
        tool: 'Notion AI',
        usage: '企画書のテンプレート生成と文章校正',
        prompt: '企画書の骨子を作成後、AIで文章を洗練し、読みやすく整理'
      },
      {
        tool: 'Miro AI',
        usage: 'マインドマップやフローチャートの自動生成',
        prompt: '企画の全体像を可視化し、関係性を整理して構造化'
      }
    ],
    '実行': [
      {
        tool: 'GitHub Copilot',
        usage: 'コード生成とリファクタリング支援',
        prompt: `「${title}」の実装コードを生成してください。要件: ${description || '機能実装'}`
      },
      {
        tool: 'Cursor AI',
        usage: 'コードレビューと最適化提案',
        prompt: '実装前の設計レビューやパフォーマンス改善の提案を依頼'
      },
      {
        tool: 'ChatGPT',
        usage: '技術的な質問やエラーハンドリングの相談',
        prompt: `「${title}」の実装で詰まった際、具体的なエラーメッセージや状況を共有して解決策を提案してもらう`
      }
    ],
    '調整': [
      {
        tool: 'ChatGPT',
        usage: 'メールや議事録の作成支援',
        prompt: `「${title}」に関する会議の議事録を作成してください。議題: ${description || '調整事項'}`
      },
      {
        tool: 'Notion AI',
        usage: '進捗レポートの自動生成',
        prompt: 'タスクの進捗状況をまとめてレポート形式に変換し、ステークホルダーに共有'
      },
      {
        tool: 'Slack AI',
        usage: 'コミュニケーションの最適化',
        prompt: 'チーム内のコミュニケーションを効率化し、必要な情報を適切に伝達'
      }
    ],
    '探索': [
      {
        tool: 'Perplexity AI',
        usage: '最新情報の調査と要約',
        prompt: `「${title}」に関する最新の技術トレンドや競合分析の情報を収集し、要約してください`
      },
      {
        tool: 'ChatGPT',
        usage: 'ユーザーインタビューの質問設計',
        prompt: `「${title}」に関するユーザーインタビューの質問リストを作成してください。目的: ${description || 'ユーザー理解'}`
      },
      {
        tool: 'Claude',
        usage: '調査結果の分析とレポート作成',
        prompt: '収集した情報を整理し、洞察を抽出してレポート形式にまとめる'
      }
    ]
  }

  // カテゴリ別の基本提案を取得
  const categoryBase = categorySuggestions[category] || categorySuggestions['実行']
  
  // タスクの内容に基づいて最適なAIツールを選択
  let selectedTool = categoryBase[0]
  
  // キーワードベースで最適なツールを選択
  if (fullText.includes('コード') || fullText.includes('実装') || fullText.includes('開発') || fullText.includes('機能')) {
    if (category === '実行') {
      selectedTool = categoryBase.find(t => t.tool.includes('Copilot')) || categoryBase[0]
    }
  } else if (fullText.includes('レビュー') || fullText.includes('確認') || fullText.includes('チェック')) {
    selectedTool = categoryBase.find(t => t.tool.includes('Cursor') || t.tool.includes('ChatGPT')) || categoryBase[0]
  } else if (fullText.includes('調査') || fullText.includes('分析') || fullText.includes('インタビュー')) {
    if (category === '探索') {
      selectedTool = categoryBase.find(t => t.tool.includes('Perplexity')) || categoryBase[0]
    }
  } else if (fullText.includes('レポート') || fullText.includes('報告') || fullText.includes('まとめ')) {
    selectedTool = categoryBase.find(t => t.tool.includes('Notion') || t.tool.includes('Claude')) || categoryBase[0]
  }

  // 結果を組み合わせ
  let result = `🤖 【このタスクに最適なAI活用方法】\n\n`
  result += `📌 推奨AIツール: ${selectedTool.tool}\n`
  result += `💡 活用方法: ${selectedTool.usage}\n\n`
  result += `📝 具体的なプロンプト例:\n${selectedTool.prompt}\n\n`

  // 他の選択肢も提示
  if (categoryBase.length > 1) {
    result += `【他の選択肢】\n`
    categoryBase.slice(1).forEach((tool, idx) => {
      result += `${idx + 2}. ${tool.tool}: ${tool.usage}\n`
    })
    result += '\n'
  }

  // 難易度に応じた提案
  if (difficulty >= 4) {
    result += '⚠️ 【高難易度タスクの推奨アプローチ】\n'
    result += '- タスクを小さく分割し、各段階でAIに相談\n'
    result += '- 複数のAIツールを組み合わせて使用（例: 企画→ChatGPT、実装→Copilot）\n'
    result += '- 各段階でAIの出力を検証し、必要に応じて修正\n\n'
  } else if (difficulty <= 2) {
    result += '✅ 【低難易度タスクの効率化】\n'
    result += '- 定型作業はAIに自動化を依頼\n'
    result += '- テンプレート生成やチェックリスト作成に活用\n'
    result += '- 一度生成したテンプレートは再利用可能\n\n'
  }

  // 一般的なベストプラクティス
  result += '📚 【AI活用のベストプラクティス】\n'
  result += '1. プロンプトは具体的に: 「○○を△△の形式で作成してください。要件は...」\n'
  result += '2. 段階的に依頼: 大きなタスクは分割してAIに相談\n'
  result += '3. 結果を検証: AIの出力は必ず確認し、必要に応じて修正\n'
  result += '4. 複数ツールを活用: 用途に応じて最適なAIツールを選択\n'
  result += '5. コンテキストを共有: タスクの背景や目的を明確に伝える'

  return result
}

/**
 * タスクの説明がない場合のデフォルト提案
 */
export function getDefaultAIUsage(category: string): string {
  const categoryMap: Record<string, string> = {
    '企画': 'ChatGPT/Claudeで企画書の構成案やアイデア出しに活用。プロンプト例: "プロジェクト企画書の構成を提案してください"',
    '実行': 'GitHub Copilotでコード生成とリファクタリング支援。実装中のコード補完を活用',
    '調整': 'ChatGPTでメールや議事録の作成支援。会議の議事録や連絡文作成に活用',
    '探索': 'Perplexity AIで最新情報の調査と要約。技術トレンドや競合分析の情報収集に活用'
  }

  return categoryMap[category] || categoryMap['実行']
}

