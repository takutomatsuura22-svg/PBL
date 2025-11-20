/**
 * OpenAI API クライアント
 * ChatGPT APIを使用した高度なAI機能
 */

import OpenAI from 'openai'

// OpenAIクライアントのシングルトンインスタンス
let openaiClient: OpenAI | null = null

/**
 * OpenAIクライアントを取得
 */
export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured in environment variables')
    }
    
    openaiClient = new OpenAI({
      apiKey: apiKey,
    })
  }
  
  return openaiClient
}

/**
 * OpenAI APIが有効かチェック
 */
export function isOpenAIEnabled(): boolean {
  return !!process.env.OPENAI_API_KEY
}

/**
 * ChatGPTにメッセージを送信して応答を取得
 */
export async function chatCompletion(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options?: {
    model?: string
    temperature?: number
    max_tokens?: number
  }
): Promise<string> {
  const client = getOpenAIClient()
  
  // コスト削減: max_tokensを適切に制限（デフォルト800）
  const maxTokens = options?.max_tokens ?? 800
  
  const response = await client.chat.completions.create({
    model: options?.model || process.env.OPENAI_MODEL || 'gpt-4o', // デフォルトはgpt-4o（高性能モデル）
    messages: messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: maxTokens,
  })
  
  // 使用量をログに記録（開発環境のみ）
  if (process.env.NODE_ENV === 'development') {
    const usage = response.usage
    if (usage) {
      console.log(`📊 OpenAI API使用量: ${usage.total_tokens}トークン (入力: ${usage.prompt_tokens}, 出力: ${usage.completion_tokens})`)
    }
  }
  
  return response.choices[0]?.message?.content || ''
}

/**
 * ストリーミングでChatGPTの応答を取得
 */
export async function* chatCompletionStream(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options?: {
    model?: string
    temperature?: number
    max_tokens?: number
  }
): AsyncGenerator<string> {
  const client = getOpenAIClient()
  
  const stream = await client.chat.completions.create({
    model: options?.model || process.env.OPENAI_MODEL || 'gpt-4o', // デフォルトはgpt-4o（高性能モデル）
    messages: messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.max_tokens ?? 1000,
    stream: true,
  })
  
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || ''
    if (content) {
      yield content
    }
  }
}

