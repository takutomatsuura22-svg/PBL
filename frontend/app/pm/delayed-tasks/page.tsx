// @ts-nocheck
'use client'

import React from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'

interface DelayedTaskAlert {
  task_id: string
  task_title: string
  task_category: string
  assignee_id: string
  assignee_name: string
  deadline: string
  delay_days: number
  status: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  reason: string
  recommended_actions: string[]
  impact_score: number
}

export default function DelayedTasksPage() {
  const [delayedTasks, setDelayedTasks] = React.useState<DelayedTaskAlert[]>([])

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/pm/delayed-tasks')
        if (response.ok) {
          const data = await response.json()
          setDelayedTasks(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error('Error fetching delayed tasks:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">🚨 WBS遅延アラート</h1>
          <p className="text-gray-600">期限を超過または期限が近いタスクの詳細確認</p>
        </div>
        <Link
          href="/pm"
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-semibold"
        >
          ← PMページに戻る
        </Link>
      </div>

      {delayedTasks.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 shadow-sm text-center">
          <p className="text-gray-500 text-lg">現在、遅延しているタスクはありません。</p>
          <p className="text-gray-400 text-sm mt-2">すべてのタスクが順調に進行しています。</p>
        </div>
      ) : (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-red-800 mb-4">
            {delayedTasks.length}件のタスクが期限を超過しています
          </h2>
          <div className="space-y-4">
            {delayedTasks.map((alert) => (
              <div
                key={alert.task_id}
                className={`p-4 rounded border-l-4 ${
                  alert.priority === 'critical' ? 'border-red-600 bg-white' :
                  alert.priority === 'high' ? 'border-orange-500 bg-white' :
                  alert.priority === 'medium' ? 'border-yellow-500 bg-white' :
                  'border-gray-400 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{alert.task_title}</h3>
                      <span className={`px-3 py-1 rounded text-sm font-semibold ${
                        alert.priority === 'critical' ? 'bg-red-200 text-red-800' :
                        alert.priority === 'high' ? 'bg-orange-200 text-orange-800' :
                        alert.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-gray-200 text-gray-800'
                      }`}>
                        {alert.priority === 'critical' ? '緊急' : 
                         alert.priority === 'high' ? '高' : 
                         alert.priority === 'medium' ? '中' : '低'}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {alert.task_category}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600 mb-2">
                      <span>
                        担当者: {alert.assignee_id ? (
                          <Link href={`/student/${alert.assignee_id}`} className="text-blue-600 hover:underline">
                            {alert.assignee_name}
                          </Link>
                        ) : (
                          <span className="text-gray-400">未割り当て</span>
                        )}
                      </span>
                      <span>期限: {new Date(alert.deadline).toLocaleDateString('ja-JP')}</span>
                      <span className="text-red-600 font-semibold">
                        遅延: {alert.delay_days}日
                      </span>
                      <span>影響度: {alert.impact_score}/10</span>
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <p className="text-sm font-semibold text-gray-700 mb-1">📋 遅延原因分析:</p>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{alert.reason}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">💡 推奨アクション:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {alert.recommended_actions.map((action, idx) => (
                      <li key={idx}>{action}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <Link
                    href={`/wbs/view`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    → WBS一覧でこのタスクを確認・編集
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Navigation />
    </div>
  )
}

