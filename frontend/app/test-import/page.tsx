'use client'

import React from 'react'

export default function TestImportPage() {
  const [result, setResult] = React.useState<string>('')
  const [loading, setLoading] = React.useState(false)

  const testAPI = async () => {
    setLoading(true)
    setResult('テスト開始...')
    
    try {
      console.log('🔵 テスト開始')
      const response = await fetch('/api/airtable/import-wbs-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('📥 レスポンス:', response.status)
      
      const text = await response.text()
      console.log('📄 レスポンステキスト:', text)
      
      try {
        const json = JSON.parse(text)
        setResult(`✅ 成功 (${response.status})\n${JSON.stringify(json, null, 2)}`)
      } catch {
        setResult(`⚠️ JSON解析失敗 (${response.status})\n${text}`)
      }
    } catch (error: any) {
      console.error('❌ エラー:', error)
      setResult(`❌ エラー: ${error.message || error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">インポートテスト</h1>
      
      <div className="bg-white border rounded-lg p-6 shadow-sm max-w-2xl">
        <button
          onClick={testAPI}
          disabled={loading}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold mb-4"
        >
          {loading ? 'テスト中...' : '🚀 APIをテスト'}
        </button>
        
        {result && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm">{result}</pre>
          </div>
        )}
        
        <div className="mt-4 text-sm text-gray-600">
          <p>このページは、WBSタスクインポートAPIを直接テストするためのページです。</p>
          <p>ブラウザのコンソール（F12）も確認してください。</p>
        </div>
      </div>
    </div>
  )
}

