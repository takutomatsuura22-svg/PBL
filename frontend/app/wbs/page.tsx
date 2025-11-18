'use client'

import React from 'react'
import { useSidebar } from '@/components/SidebarContext'
import Card from '@/components/Card'

interface WBS {
  wbs_id: string
  name: string
  description: string
  created_at: string
  task_count: number
  is_current: boolean
}

export default function WBSPage() {
  const [file, setFile] = React.useState<File | null>(null)
  const [wbsName, setWbsName] = React.useState('')
  const [wbsDescription, setWbsDescription] = React.useState('')
  const [uploading, setUploading] = React.useState(false)
  const [result, setResult] = React.useState<{ success: boolean; message: string; total_tasks?: number } | null>(null)
  const [wbsList, setWbsList] = React.useState<WBS[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetchWBSList()
  }, [])

  const fetchWBSList = async () => {
    try {
      const response = await fetch('/api/wbs/list', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          setWbsList(data)
        } else {
          setWbsList([])
        }
      }
    } catch (error) {
      console.error('Error fetching WBS list:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
      if (!wbsName) {
        const fileName = e.target.files[0].name.replace(/\.(json|csv)$/i, '')
        setWbsName(fileName)
      }
    }
  }

  const handleUpload = async () => {
    if (!file) {
      alert('ファイルを選択してください')
      return
    }

    if (!wbsName.trim()) {
      alert('WBS名を入力してください')
      return
    }

    setUploading(true)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', wbsName)
    formData.append('description', wbsDescription)

    try {
      const response = await fetch('/api/wbs/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        setFile(null)
        setWbsName('')
        setWbsDescription('')
        fetchWBSList()
      }
    } catch (error) {
      console.error('Error uploading WBS:', error)
      setResult({ success: false, message: 'アップロード中にエラーが発生しました' })
    } finally {
      setUploading(false)
    }
  }

  const handleSelect = async (wbsId: string) => {
    try {
      const response = await fetch('/api/wbs/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wbs_id: wbsId })
      })

      if (response.ok) {
        alert('WBSを選択しました')
        fetchWBSList()
      }
    } catch (error) {
      console.error('Error selecting WBS:', error)
    }
  }

  const { isOpen } = useSidebar()

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <main className={`transition-all duration-300 ${isOpen ? 'lg:ml-64' : 'lg:ml-0'} p-8`}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-semibold text-[#1d1d1f] mb-2 tracking-tight">
              WBS管理
            </h1>
            <p className="text-[#86868b]">WBSファイルのアップロードと管理</p>
          </div>

          {/* アップロードセクション */}
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-6 tracking-tight">
              新しいWBSをアップロード
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
                  ファイル（JSON/CSV）
                </label>
                <input
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl bg-white text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#007aff] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
                  WBS名
                </label>
                <input
                  type="text"
                  value={wbsName}
                  onChange={(e) => setWbsName(e.target.value)}
                  placeholder="例: 2025沖縄PBL"
                  className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl bg-white text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#007aff] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
                  説明（任意）
                </label>
                <textarea
                  value={wbsDescription}
                  onChange={(e) => setWbsDescription(e.target.value)}
                  rows={3}
                  placeholder="WBSの説明を入力..."
                  className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl bg-white text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#007aff] focus:border-transparent resize-none"
                />
              </div>

              {result && (
                <div className={`p-4 rounded-xl ${
                  result.success 
                    ? 'bg-[#34c759]/10 text-[#34c759] border border-[#34c759]/20' 
                    : 'bg-[#ff3b30]/10 text-[#ff3b30] border border-[#ff3b30]/20'
                }`}>
                  <p className="font-medium">{result.message}</p>
                  {result.success && result.total_tasks && (
                    <p className="text-sm mt-1">{result.total_tasks}件のタスクを読み込みました</p>
                  )}
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || !wbsName.trim() || uploading}
                className="w-full px-6 py-4 bg-[#007aff] text-white rounded-xl font-medium hover:bg-[#0051d5] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'アップロード中...' : 'アップロード'}
              </button>
            </div>
          </Card>

          {/* WBS一覧 */}
          <Card className="p-8">
            <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-6 tracking-tight">
              WBS一覧
            </h2>
            
            {loading ? (
              <div className="text-center py-12 text-[#86868b]">
                読み込み中...
              </div>
            ) : wbsList.length === 0 ? (
              <div className="text-center py-12 text-[#86868b]">
                <p className="mb-2">WBSが登録されていません</p>
                <p className="text-sm">上記のフォームから新しいWBSをアップロードしてください</p>
              </div>
            ) : (
              <div className="space-y-3">
                {wbsList.map((wbs) => (
                  <div
                    key={wbs.wbs_id}
                    className={`p-6 rounded-xl border transition-all ${
                      wbs.is_current
                        ? 'border-[#007aff] bg-[#007aff]/5'
                        : 'border-[#e8e8ed] bg-white hover:bg-[#fafafa]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-[#1d1d1f]">
                            {wbs.name}
                          </h3>
                          {wbs.is_current && (
                            <span className="px-3 py-1 bg-[#007aff] text-white text-xs font-medium rounded-full">
                              現在選択中
                            </span>
                          )}
                        </div>
                        {wbs.description && (
                          <p className="text-sm text-[#86868b] mb-2">{wbs.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-[#86868b]">
                          <span>タスク数: {wbs.task_count}件</span>
                          <span>
                            作成日: {new Date(wbs.created_at).toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                      </div>
                      {!wbs.is_current && (
                        <button
                          onClick={() => handleSelect(wbs.wbs_id)}
                          className="ml-4 px-4 py-2 bg-[#007aff] text-white rounded-xl hover:bg-[#0051d5] transition-colors text-sm font-medium"
                        >
                          選択
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}
