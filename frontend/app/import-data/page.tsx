'use client'

import React from 'react'

export default function ImportDataPage() {
  const [loading, setLoading] = React.useState(false)
  const [message, setMessage] = React.useState('')

  const handleImportSample = async () => {
    setLoading(true)
    setMessage('インポート中...')
    
    try {
      const response = await fetch('/api/airtable/import-sample', {
        method: 'POST'
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setMessage(`✅ 成功！ ${JSON.stringify(result)}`)
      } else {
        setMessage(`❌ エラー: ${result.error || 'Failed'}`)
      }
    } catch (error) {
      setMessage(`❌ エラー: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleImportRealStudents = async () => {
    setLoading(true)
    setMessage('10人の学生データをインポート中...')
    
    try {
      const response = await fetch('/api/airtable/import-real-students', {
        method: 'POST'
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setMessage(`✅ 成功！ 10人の学生データをインポートしました\n${JSON.stringify(result, null, 2)}`)
      } else {
        setMessage(`❌ エラー: ${result.error || 'Failed'}`)
      }
    } catch (error) {
      setMessage(`❌ エラー: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleImportWBSTasks = async () => {
    console.log('🔵 WBSタスクインポートボタンがクリックされました')
    setLoading(true)
    setMessage('WBSのタスクをAirtableにインポート中...')
    
    try {
      console.log('📡 APIリクエストを送信: /api/airtable/import-wbs-tasks')
      const response = await fetch('/api/airtable/import-wbs-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('📥 レスポンス受信:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ エラーレスポンス:', errorText)
        try {
          const errorJson = JSON.parse(errorText)
          setMessage(`❌ エラー (${response.status}): ${errorJson.error || 'Failed'}\n詳細: ${errorJson.details || ''}`)
        } catch {
          setMessage(`❌ エラー (${response.status}): ${errorText || 'Unknown error'}`)
        }
        return
      }
      
      const result = await response.json()
      console.log('✅ レスポンスデータ:', result)
      
      let message = `✅ 成功！\n`
      message += `作成: ${result.results?.tasks?.created || 0}件\n`
      message += `スキップ: ${result.results?.tasks?.skipped || 0}件\n`
      if (result.warnings && result.warnings.length > 0) {
        message += `\n⚠️ 警告（${result.warnings.length}件）:\n`
        message += result.warnings.slice(0, 5).join('\n')
        if (result.warnings.length > 5) {
          message += `\n...他${result.warnings.length - 5}件`
        }
      }
      setMessage(message)
    } catch (error: any) {
      console.error('❌ 例外エラー:', error)
      const errorMessage = error.message || String(error)
      setMessage(`❌ エラー: ${errorMessage}\n\nネットワークエラーの可能性があります。開発サーバーが起動しているか確認してください。`)
    } finally {
      setLoading(false)
      console.log('🏁 インポート処理完了')
    }
  }

  // ページ読み込み時のテスト（クライアント側のみ）
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('📄 インポートページが読み込まれました')
    }
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">データインポート</h1>
      
      <div className="bg-white border rounded-lg p-6 shadow-sm max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Airtableにデータをインポート</h2>
        
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
          <p className="font-semibold mb-1">💡 トラブルシューティング:</p>
          <p>ボタンが動作しない場合、<a href="/test-import" className="text-blue-600 underline">テストページ</a>でAPIを直接テストできます。</p>
        </div>
        
        <div className="space-y-4">
          {/* 学生データのインポート */}
          <div>
            <h3 className="font-semibold mb-2">1. 学生データ</h3>
            <p className="text-gray-600 text-sm mb-3">
              backend/data/students.json の10人の学生データをインポートします。
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={handleImportRealStudents}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? 'インポート中...' : '✅ 10人の学生データをインポート'}
              </button>
              
              <button
                onClick={handleImportSample}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'インポート中...' : '📤 サンプルデータ（5人）'}
              </button>
            </div>
          </div>

          {/* WBSタスクのインポート */}
          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">2. WBSタスク</h3>
            <p className="text-gray-600 text-sm mb-3">
              現在選択されているWBSファイル（test_wbs_10students.json）のタスクをAirtableにインポートします。
            </p>
            
            <button
              onClick={(e) => {
                e.preventDefault()
                console.log('🔘 ボタンクリックイベント:', e)
                handleImportWBSTasks()
              }}
              disabled={loading}
              type="button"
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
            >
              {loading ? '⏳ インポート中...' : '📋 WBSタスクをインポート'}
            </button>
          </div>
        </div>
        
        {message && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm">{message}</pre>
          </div>
        )}
        
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-semibold mb-2">次のステップ:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
            <li>インポートが完了したらAirtableを確認</li>
            <li><a href="/wbs" className="text-blue-600 hover:underline">WBSページ</a>でテストWBSをアップロード</li>
            <li><a href="/dashboard" className="text-blue-600 hover:underline">ダッシュボード</a>で確認</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

