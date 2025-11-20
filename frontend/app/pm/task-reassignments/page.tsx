// @ts-nocheck
'use client'

import React from 'react'
import Link from 'next/link'

interface TaskReassignment {
  task_id: string
  task_title: string
  task_category: string
  task_difficulty: number
  task_estimated_hours: number
  task_deadline: string
  from_student_id: string
  from_student_name: string
  from_student_load: number
  from_student_motivation: number
  to_student_id: string
  to_student_name: string
  to_student_load: number
  to_student_motivation: number
  reason: string
  priority: 'high' | 'medium' | 'low'
  score: number
  detailed_reason: string
  impact_score?: number
}

export default function TaskReassignmentsPage() {
  const [reassignments, setReassignments] = React.useState<TaskReassignment[]>([])
  const [processingReassignment, setProcessingReassignment] = React.useState<string | null>(null)

  React.useEffect(() => {
    // クライアント側でのみ実行
    if (typeof window === 'undefined') return

    const fetchData = async () => {
      try {
        const response = await fetch('/api/pm/task-reassignments')
        if (response.ok) {
          const data = await response.json()
          setReassignments(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error('Error fetching task reassignments:', error)
        setReassignments([])
      }
    }

    fetchData()
  }, [])

  const handleExecuteReassignment = async (taskId: string, toStudentId: string) => {
    setProcessingReassignment(taskId)
    try {
      const response = await fetch(`/api/pm/task-reassignments/${taskId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ to_student_id: toStudentId })
      })

      if (response.ok) {
        const result = await response.json()
        setReassignments(prev => prev.filter(r => r.task_id !== taskId))
        alert(result.message || 'タスクの再割り当てが完了しました。AirtableとWBSの担当者も自動で更新されました。')
        
        // データを再取得
        const reassignmentsRes = await fetch('/api/pm/task-reassignments')
        if (reassignmentsRes.ok) {
          const reassignmentsData = await reassignmentsRes.json()
          setReassignments(Array.isArray(reassignmentsData) ? reassignmentsData : [])
        }
      } else {
        const error = await response.json()
        alert(`エラー: ${error.error || 'タスクの再割り当てに失敗しました'}`)
      }
    } catch (error) {
      console.error('Error executing reassignment:', error)
      alert('タスクの再割り当て中にエラーが発生しました')
    } finally {
      setProcessingReassignment(null)
    }
  }

  const handleRejectReassignment = async (taskId: string) => {
    setProcessingReassignment(taskId)
    try {
      const response = await fetch(`/api/pm/task-reassignments/${taskId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: 'ユーザーが却下' })
      })

      if (response.ok) {
        setReassignments(prev => prev.filter(r => r.task_id !== taskId))
        alert('タスク再割り当て提案を却下しました')
      } else {
        const error = await response.json()
        alert(`エラー: ${error.error || '提案の却下に失敗しました'}`)
      }
    } catch (error) {
      console.error('Error rejecting reassignment:', error)
      alert('提案の却下中にエラーが発生しました')
    } finally {
      setProcessingReassignment(null)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">🔄 タスク再割り当て提案</h1>
          <p className="text-gray-600">AIが提案するタスク再割り当ての確認と実行</p>
        </div>
        <Link
          href="/pm"
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-semibold"
        >
          ← PMページに戻る
        </Link>
      </div>

      {!Array.isArray(reassignments) || reassignments.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 shadow-sm text-center">
          <p className="text-gray-500 text-lg">現在、タスク再割り当ての提案はありません。</p>
          <p className="text-gray-400 text-sm mt-2">全体的に良好な状態です。</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reassignments
            .filter((r: TaskReassignment) => r && r.task_id)
            .map((reassignment, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-lg border-l-4 ${
                reassignment.priority === 'high' ? 'border-red-500 bg-red-50' :
                reassignment.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                'border-blue-500 bg-blue-50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{reassignment.task_title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      reassignment.priority === 'high' ? 'bg-red-200 text-red-800' :
                      reassignment.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-blue-200 text-blue-800'
                    }`}>
                      {reassignment.priority === 'high' ? '高優先度' : reassignment.priority === 'medium' ? '中優先度' : '低優先度'}
                    </span>
                    <span className="px-2 py-1 rounded text-xs bg-gray-200 text-gray-700">
                      適合度: {reassignment.score}%
                    </span>
                  </div>
                  
                  {/* タスク情報 */}
                  <div className="flex gap-4 text-sm text-gray-600 mb-3">
                    <span>カテゴリ: {reassignment.task_category}</span>
                    <span>難易度: {reassignment.task_difficulty}/5</span>
                    {reassignment.task_deadline && (
                      <span>締切: {new Date(reassignment.task_deadline).toLocaleDateString('ja-JP')}</span>
                    )}
                  </div>

                  {/* 再割り当ての詳細 */}
                  <div className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
                    {/* 移管先の表示 */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <Link
                            href={`/student/${reassignment.from_student_id}`}
                            className="font-semibold text-red-600 hover:underline block"
                          >
                            {reassignment.from_student_name}さん
                          </Link>
                          <span className="text-xs text-gray-500">現在の担当者</span>
                        </div>
                        <span className="text-2xl text-gray-400">→</span>
                        <div className="text-center">
                          <Link
                            href={`/student/${reassignment.to_student_id}`}
                            className="font-semibold text-green-600 hover:underline block"
                          >
                            {reassignment.to_student_name}さん
                          </Link>
                          <span className="text-xs text-gray-500">移管先</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 数値比較（視覚的に表示） */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {/* タスク量の比較 */}
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-xs text-gray-600 mb-2">タスク量</p>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-red-600">
                            {reassignment.from_student_load}/5
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="text-sm font-semibold text-green-600">
                            {reassignment.to_student_load}/5
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-red-500 h-2 rounded-full"
                              style={{ width: `${(reassignment.from_student_load / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">→</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${(reassignment.to_student_load / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                        {reassignment.from_student_load > reassignment.to_student_load && (
                          <p className="text-xs text-green-600 mt-1">
                            {((reassignment.from_student_load - reassignment.to_student_load) * 20).toFixed(0)}%軽減
                          </p>
                        )}
                      </div>

                      {/* モチベーションの比較 */}
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-xs text-gray-600 mb-2">モチベーション</p>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-semibold ${reassignment.from_student_motivation <= 2 ? 'text-red-600' : 'text-gray-600'}`}>
                            {reassignment.from_student_motivation}/5
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className={`text-sm font-semibold ${reassignment.to_student_motivation > reassignment.from_student_motivation ? 'text-green-600' : 'text-gray-600'}`}>
                            {reassignment.to_student_motivation}/5
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${reassignment.from_student_motivation <= 2 ? 'bg-red-500' : 'bg-blue-500'}`}
                              style={{ width: `${(reassignment.from_student_motivation / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">→</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${reassignment.to_student_motivation > reassignment.from_student_motivation ? 'bg-green-500' : 'bg-blue-500'}`}
                              style={{ width: `${(reassignment.to_student_motivation / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                        {reassignment.to_student_motivation > reassignment.from_student_motivation && (
                          <p className="text-xs text-green-600 mt-1">
                            {((reassignment.to_student_motivation - reassignment.from_student_motivation) * 20).toFixed(0)}%向上
                          </p>
                        )}
                      </div>
                    </div>

                    {/* 影響度スコア */}
                    {reassignment.impact_score !== undefined && reassignment.impact_score > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-blue-800">影響度スコア</span>
                          <span className="text-2xl font-bold text-blue-600">{reassignment.impact_score}/100</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(100, reassignment.impact_score)}%` }}
                          />
                        </div>
                        <p className="text-xs text-blue-700 mt-1">
                          {reassignment.impact_score > 50 ? '高い影響が期待できます' :
                           reassignment.impact_score > 30 ? '中程度の影響が期待できます' :
                           '軽微な影響が期待できます'}
                        </p>
                      </div>
                    )}

                    {/* 詳細な理由 */}
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-sm font-semibold text-gray-800 mb-2">📋 詳細な理由:</p>
                      <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                        {reassignment.detailed_reason || reassignment.reason}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex gap-3 mt-4 pt-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    if (confirm(`「${reassignment.task_title}」を${reassignment.from_student_name}さんから${reassignment.to_student_name}さんに移管しますか？`)) {
                      handleExecuteReassignment(reassignment.task_id, reassignment.to_student_id)
                    }
                  }}
                  disabled={processingReassignment === reassignment.task_id}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  {processingReassignment === reassignment.task_id ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>実行中...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl">✓</span>
                      <span>この提案を実施する</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    if (confirm(`この提案を却下しますか？\n\nタスク: ${reassignment.task_title}\n移管先: ${reassignment.to_student_name}さん`)) {
                      handleRejectReassignment(reassignment.task_id)
                    }
                  }}
                  disabled={processingReassignment === reassignment.task_id}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold transition-all"
                >
                  <span className="text-xl">✕</span>
                  <span>却下</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

