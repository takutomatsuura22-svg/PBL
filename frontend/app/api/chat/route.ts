import { NextRequest, NextResponse } from 'next/server'
import { chatCompletion, isOpenAIEnabled } from '@/lib/openai-client'

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const { messages } = await request.json()

    console.log('📨 Chat API called:', { messageCount: messages?.length })

    if (!Array.isArray(messages) || messages.length === 0) {
      console.error('❌ Invalid messages format')
      return NextResponse.json(
        { error: 'Messages are required', message: 'メッセージが正しく送信されませんでした。' },
        { status: 400 }
      ) as Response
    }

    // OpenAI APIが有効でない場合
    if (!isOpenAIEnabled()) {
      console.warn('⚠️ OpenAI API not enabled')
      return NextResponse.json({
        message: 'OpenAI APIが設定されていません。環境変数 OPENAI_API_KEY を設定してください。'
      }) as Response
    }

    // システムプロンプトを追加
    const systemPrompt = `あなたはPBL（Project-Based Learning）プロジェクトのAIアシスタントです。
以下の役割を果たしてください：

1. **プロジェクト管理のサポート**
   - タスク管理、スケジュール調整、進捗確認などの質問に答える
   - WBS（Work Breakdown Structure）に関する質問に対応

2. **学生支援**
   - 学生のモチベーション向上のためのアドバイス
   - タスクの進め方やスキル向上の提案
   - チームワークやコミュニケーションの改善提案

3. **データ分析の支援**
   - ダッシュボードの見方やデータの解釈
   - 危険度スコアやモチベーションスコアの説明

4. **AI活用の提案**
   - タスクに最適なAIツールの提案
   - ChatGPT、Claude、Copilotなどの使い方

回答は簡潔で実用的にしてください。日本語で回答してください。`

    // 最後のメッセージがユーザーのメッセージであることを確認
    const lastMessage = messages[messages.length - 1]
    if (!lastMessage || lastMessage.role !== 'user') {
      console.error('❌ Invalid last message:', lastMessage)
      return NextResponse.json(
        { error: 'Last message must be from user', message: 'メッセージの形式が正しくありません。' },
        { status: 400 }
      ) as Response
    }

    // メッセージ履歴を構築（システムプロンプト + 会話履歴）
    const conversationMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.slice(-10) // 最新10件のメッセージのみ使用（トークン節約）
    ]

    console.log('🤖 Calling OpenAI API...')
    
    // ChatGPT APIを呼び出し
    try {
      const response = await chatCompletion(conversationMessages, {
        model: process.env.OPENAI_MODEL || 'gpt-4o',
        temperature: 0.7,
        max_tokens: 1000
      })

      console.log('✅ OpenAI API response received')
      
      return NextResponse.json({
        message: response || '申し訳ございません。応答を生成できませんでした。'
      }) as Response
    } catch (openaiError: any) {
      console.error('❌ OpenAI API error:', openaiError)
      
      // OpenAI APIのエラーを詳細に処理
      let errorMessage = 'AIアシスタントへの接続に失敗しました。'
      let statusCode = 500
      
      if (openaiError?.status === 429 || openaiError?.message?.includes('quota') || openaiError?.message?.includes('429')) {
        errorMessage = `⚠️ APIの利用制限に達しました。

OpenAIアカウントのクォータが上限に達しているか、支払い情報が設定されていない可能性があります。

【解決方法】
1. OpenAIのダッシュボード（https://platform.openai.com/account/billing）で支払い情報を確認
2. クレジット残高を確認
3. 必要に応じて支払い方法を追加

しばらくしてから再度お試しください。`
        statusCode = 429
      } else if (openaiError?.message?.includes('API key') || openaiError?.status === 401) {
        errorMessage = 'OpenAI APIキーが無効です。環境変数 OPENAI_API_KEY を確認してください。'
        statusCode = 401
      } else if (openaiError?.message?.includes('rate limit')) {
        errorMessage = 'APIの利用制限に達しました。しばらくしてから再度お試しください。'
        statusCode = 429
      } else if (openaiError?.message?.includes('model')) {
        errorMessage = '指定されたモデルが見つかりません。モデル名を確認してください。'
        statusCode = 400
      } else if (openaiError?.message) {
        errorMessage = `エラー: ${openaiError.message}`
      }
      
      return NextResponse.json({
        message: errorMessage,
        error: openaiError?.message || 'Unknown error',
        status: statusCode
      }, { status: statusCode }) as Response
    }
  } catch (error) {
    console.error('❌ Chat API error:', error)
    const errorDetails = error instanceof Error ? error.message : String(error)
    console.error('Error details:', errorDetails)
    
    return NextResponse.json(
      {
        error: 'Failed to process chat message',
        message: 'メッセージの処理中にエラーが発生しました。しばらくしてから再度お試しください。',
        details: errorDetails
      },
      { status: 500 }
    ) as Response
  }
}

