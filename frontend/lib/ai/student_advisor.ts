/**
 * 学生への個別AIアドバイス生成
 * ChatGPT APIを使用して、学生の状況に応じたカスタマイズされたアドバイスを生成
 */

import { chatCompletion, isOpenAIEnabled } from '../openai-client'
import { generateKnowledgeBasePrompt, suggestFrameworksForStudent } from './knowledge_base'

interface StudentData {
  student_id: string
  name: string
  MBTI: string
  motivation_score: number
  load_score: number
  skill_企画: number
  skill_実行: number
  skill_調整: number
  skill_探索: number
  strengths?: string[]
  weaknesses?: string[]
  team_id: string
}

interface TaskData {
  task_id: string
  title: string
  status: string
  category: string
  difficulty: number
  deadline: string
}

export interface AIAdvice {
  summary: string
  detailed_advice: string
  action_items: string[]
  frameworks_to_use?: string[]
  encouragement: string
  ai_generated: boolean
}

/**
 * 学生への個別アドバイスを生成
 */
export async function generateStudentAdvice(
  student: StudentData,
  tasks: TaskData[]
): Promise<AIAdvice> {
  // OpenAI APIが有効でない場合はフォールバック
  if (!isOpenAIEnabled()) {
    return generateFallbackAdvice(student, tasks)
  }

  try {
    // タスクの状況を分析
    const completedTasks = tasks.filter(t => t.status === 'completed').length
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length
    const pendingTasks = tasks.filter(t => t.status === 'pending').length
    const overdueTasks = tasks.filter(t => {
      if (t.status === 'completed') return false
      return new Date(t.deadline) < new Date()
    }).length

    // プロンプトを構築
    const systemPrompt = `あなたはPBL（Project-Based Learning）プロジェクトの教育コーチです。
学生の状況を分析し、建設的で具体的なアドバイスを提供してください。
アドバイスは励ましながらも、改善すべき点を明確に指摘してください。

${generateKnowledgeBasePrompt()}

以下の理論とフレームワークを活用してください：
- モチベーション3.0: 自律性・熟達・目的の3要素を考慮
- ビジネスフレームワーク: 状況に応じた適切なフレームワークを提案
- 1on1スキル: 傾聴・質問・フィードバックの技術を活用
- 学び3.0: 個人の成長だけでなく、チーム全体の成長を意識`

    // 推奨フレームワークを取得
    const suggestedFrameworks = suggestFrameworksForStudent({
      motivation_score: student.motivation_score,
      load_score: student.load_score,
      skill_企画: student.skill_企画,
      skill_実行: student.skill_実行,
      skill_調整: student.skill_調整,
      skill_探索: student.skill_探索
    })

    const userPrompt = `
以下の学生に対して、個別アドバイスを生成してください。

【学生情報】
- 名前: ${student.name}
- MBTI: ${student.MBTI}
- モチベーションスコア: ${student.motivation_score}/5
- 稼働負荷スコア: ${student.load_score}/5
- スキル: 企画${student.skill_企画}/5, 実行${student.skill_実行}/5, 調整${student.skill_調整}/5, 探索${student.skill_探索}/5
${student.strengths && student.strengths.length > 0 ? `- 強み: ${student.strengths.join(', ')}` : ''}
${student.weaknesses && student.weaknesses.length > 0 ? `- 弱み: ${student.weaknesses.join(', ')}` : ''}

【タスク状況】
- 完了: ${completedTasks}件
- 進行中: ${inProgressTasks}件
- 未着手: ${pendingTasks}件
- 期限超過: ${overdueTasks}件

【タスク詳細】
${tasks.slice(0, 5).map(t => `- ${t.title} (${t.category}, 難易度${t.difficulty}/5, ${t.status})`).join('\n')}

【推奨フレームワーク】
${suggestedFrameworks.length > 0 ? suggestedFrameworks.map(f => `- ${f}`).join('\n') : '- 特に推奨なし'}

以下の形式でJSON形式で回答してください：
{
  "summary": "現状の簡潔な要約（1-2文、モチベーション3.0の観点を含む）",
  "detailed_advice": "詳細なアドバイス（3-5文、具体的で実践的な内容。推奨フレームワークや1on1スキルを活用）",
  "action_items": ["具体的なアクション1（フレームワーク名を含む）", "具体的なアクション2", "具体的なアクション3"],
  "frameworks_to_use": ["使用すべきフレームワーク1", "使用すべきフレームワーク2"],
  "encouragement": "励ましのメッセージ（1-2文、学び3.0の観点を含む）"
}
`

    const response = await chatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      {
        model: process.env.OPENAI_MODEL || 'gpt-4o', // 高性能モデルを使用
        temperature: 0.7,
        max_tokens: 1000 // より詳細なアドバイスのためにトークン数を増加
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

    // JSONパースに失敗した場合はフォールバック
    return generateFallbackAdvice(student, tasks)

  } catch (error) {
    console.error('Error generating AI advice:', error)
    return generateFallbackAdvice(student, tasks)
  }
}

/**
 * フォールバック用のアドバイス生成（ルールベース）
 */
function generateFallbackAdvice(
  student: StudentData,
  tasks: TaskData[]
): AIAdvice {
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const overdueTasks = tasks.filter(t => {
    if (t.status === 'completed') return false
    return new Date(t.deadline) < new Date()
  }).length

  let summary = ''
  let detailed_advice = ''
  let action_items: string[] = []
  let encouragement = ''

  // モチベーションと負荷に基づく分析
  if (student.motivation_score <= 2 && student.load_score >= 4) {
    summary = '現在、負荷が高くモチベーションが低い状態です。'
    detailed_advice = 'タスクの負荷が高すぎる可能性があります。チームメンバーと相談して、タスクの再分配を検討しましょう。また、1on1ミーティングで困っていることを共有することが重要です。'
    action_items = [
      'PMやメンターと1on1ミーティングを設定する',
      'タスクの優先順位を見直し、期限の調整を相談する',
      'チームメンバーにヘルプを求める'
    ]
    encouragement = '大変な状況ですが、一人で抱え込まずにチームに相談することが大切です。あなたの貢献はチームにとって価値があります。'
  } else if (student.motivation_score <= 2) {
    summary = 'モチベーションが低下している状態です。'
    detailed_advice = `モチベーションが低下している原因を探りましょう。${student.strengths && student.strengths.length > 0 ? `あなたの強みである${student.strengths.join('、')}を活かせるタスクに注力することで、やりがいを感じられるかもしれません。` : ''}`
    action_items = [
      '興味のあるタスクや得意分野のタスクを見つける',
      'チームメンバーとコミュニケーションを取る',
      '小さな成功体験を積み重ねる'
    ]
    encouragement = `${completedTasks}件のタスクを完了した実績があります。一歩ずつ前進していきましょう。`
  } else if (student.load_score >= 4) {
    summary = '稼働負荷が高い状態です。'
    detailed_advice = '複数のタスクを同時に進めている状況です。優先順位を明確にし、一つずつ確実に完了させることが重要です。必要に応じてタスクの再割り当てを検討しましょう。'
    action_items = [
      'タスクの優先順位を明確にする',
      '期限が近いタスクに集中する',
      '負荷軽減のためチームに相談する'
    ]
    encouragement = '頑張りすぎていませんか？無理をせず、チームで協力して進めましょう。'
  } else if (student.motivation_score >= 4) {
    summary = '高いモチベーションで順調に進んでいます。'
    detailed_advice = `素晴らしい状態です！${student.strengths && student.strengths.length > 0 ? `${student.strengths.join('、')}の強みを活かして、` : ''}さらに挑戦的なタスクにも取り組んでみましょう。また、チームメンバーのサポートもお願いします。`
    action_items = [
      '新しいスキルを習得する機会を探す',
      'チームメンバーのメンタリングをする',
      'プロジェクトの改善提案をする'
    ]
    encouragement = 'あなたの積極的な姿勢がチームを引っ張っています。この調子で頑張ってください！'
  } else {
    summary = '安定した状態でプロジェクトを進めています。'
    detailed_advice = '現在のペースを維持しながら、計画的にタスクを進めましょう。定期的にチームとコミュニケーションを取り、必要に応じてサポートを求めることが大切です。'
    action_items = [
      '定期的な進捗報告を続ける',
      'タスクの品質を維持する',
      '新しい学びの機会を探す'
    ]
    encouragement = '着実に成果を出しています。この調子で進めていきましょう！'
  }

  // 期限超過タスクがある場合の追加アドバイス
  if (overdueTasks > 0) {
    action_items.unshift(`期限超過のタスク(${overdueTasks}件)を最優先で対応する`)
  }

  // 推奨フレームワークを取得
  const frameworks_to_use = suggestFrameworksForStudent({
    motivation_score: student.motivation_score,
    load_score: student.load_score,
    skill_企画: student.skill_企画,
    skill_実行: student.skill_実行,
    skill_調整: student.skill_調整,
    skill_探索: student.skill_探索
  })

  return {
    summary,
    detailed_advice,
    action_items,
    frameworks_to_use: frameworks_to_use.length > 0 ? frameworks_to_use : undefined,
    encouragement,
    ai_generated: false
  }
}

/**
 * チーム全体の分析レポートを生成
 */
export async function generateTeamAnalysisReport(
  students: StudentData[],
  teamId: string
): Promise<string> {
  if (!isOpenAIEnabled()) {
    return generateFallbackTeamReport(students, teamId)
  }

  try {
    const systemPrompt = `あなたはPBLプロジェクトのチーム分析の専門家です。
チーム全体の状況を分析し、課題と改善提案を具体的に提供してください。`

    const teamStats = {
      avgMotivation: students.reduce((sum, s) => sum + s.motivation_score, 0) / students.length,
      avgLoad: students.reduce((sum, s) => sum + s.load_score, 0) / students.length,
      lowMotivationCount: students.filter(s => s.motivation_score <= 2).length,
      highLoadCount: students.filter(s => s.load_score >= 4).length
    }

    const userPrompt = `
チームID: ${teamId}
メンバー数: ${students.length}人

【チーム統計】
- 平均モチベーション: ${teamStats.avgMotivation.toFixed(1)}/5
- 平均稼働負荷: ${teamStats.avgLoad.toFixed(1)}/5
- モチベーション低下メンバー: ${teamStats.lowMotivationCount}人
- 高負荷メンバー: ${teamStats.highLoadCount}人

【メンバー詳細】
${students.map(s => `- ${s.name}: モチベ${s.motivation_score}/5, 負荷${s.load_score}/5, MBTI:${s.MBTI}`).join('\n')}

チーム全体の状況分析と改善提案を、以下の観点でまとめてください：
1. チームの現状評価
2. 主要な課題
3. 具体的な改善提案
4. 各メンバーへの配慮事項

マークダウン形式で、簡潔に（500文字程度）まとめてください。
`

    const response = await chatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      {
        model: process.env.OPENAI_MODEL || 'gpt-4o',
        temperature: 0.7,
        max_tokens: 600 // コスト削減: チーム分析は簡潔に
      }
    )

    return response

  } catch (error) {
    console.error('Error generating team analysis:', error)
    return generateFallbackTeamReport(students, teamId)
  }
}

/**
 * フォールバック用のチーム分析レポート
 */
function generateFallbackTeamReport(students: StudentData[], teamId: string): string {
  const avgMotivation = students.reduce((sum, s) => sum + s.motivation_score, 0) / students.length
  const avgLoad = students.reduce((sum, s) => sum + s.load_score, 0) / students.length
  const lowMotivationCount = students.filter(s => s.motivation_score <= 2).length
  const highLoadCount = students.filter(s => s.load_score >= 4).length

  let report = `# チーム分析レポート (${teamId})\n\n`
  report += `## 現状評価\n`
  report += `- メンバー数: ${students.length}人\n`
  report += `- 平均モチベーション: ${avgMotivation.toFixed(1)}/5\n`
  report += `- 平均稼働負荷: ${avgLoad.toFixed(1)}/5\n\n`

  if (lowMotivationCount > 0 || highLoadCount > 0) {
    report += `## 主要な課題\n`
    if (lowMotivationCount > 0) {
      report += `- ${lowMotivationCount}人のメンバーがモチベーション低下\n`
    }
    if (highLoadCount > 0) {
      report += `- ${highLoadCount}人のメンバーが高負荷状態\n`
    }
    report += `\n`
  }

  report += `## 改善提案\n`
  if (avgLoad >= 3.5) {
    report += `- タスクの再分配を検討してください\n`
  }
  if (avgMotivation <= 3) {
    report += `- チームビルディング活動を実施してください\n`
    report += `- 定期的な1on1ミーティングを設定してください\n`
  }
  report += `- 定期的なチームミーティングで進捗と課題を共有してください\n`

  return report
}

