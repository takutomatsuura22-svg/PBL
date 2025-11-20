// @ts-nocheck
'use client'

import React from 'react'
import Link from 'next/link'

interface LeaderSupportNeed {
  leader_id: string
  leader_name: string
  team_id: string
  team_name: string
  project_name: string
  support_score: number
  priority: 'high' | 'medium' | 'low'
  reasons: string[]
  leader_motivation: number
  leader_load: number
  leader_danger_score: number
  danger_students_count: number
  overdue_tasks_count: number
  completion_rate: number
  recommended_actions: string[]
}

export default function LeaderSupportPage() {
  const [leaderSupportNeeds, setLeaderSupportNeeds] = React.useState<LeaderSupportNeed[]>([])

  React.useEffect(() => {
    // クライアント側でのみ実行
    if (typeof window === 'undefined') return

    const fetchData = async () => {
      try {
        const response = await fetch('/api/pm/leader-support')
        if (response.ok) {
          const data = await response.json()
          setLeaderSupportNeeds(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error('Error fetching leader support needs:', error)
        setLeaderSupportNeeds([])
      }
    }

    fetchData()
  }, [])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">🔔 リーダー支援タイミング</h1>
          <p className="text-gray-600">リーダー支援が必要なチームの詳細確認</p>
        </div>
        <Link
          href="/pm"
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-semibold"
        >
          ← PMページに戻る
        </Link>
      </div>

      {leaderSupportNeeds.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 shadow-sm text-center">
          <p className="text-gray-500 text-lg">現在、リーダー支援が必要なチームはありません。</p>
          <p className="text-gray-400 text-sm mt-2">すべてのチームが順調に進行しています。</p>
        </div>
      ) : (
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">
            リーダー支援が必要: {leaderSupportNeeds.length}名
          </h2>
          <div className="space-y-4">
            {leaderSupportNeeds.map((need) => (
              <div
                key={need.team_id}
                className={`p-4 rounded border-l-4 ${
                  need.priority === 'high' ? 'border-red-500 bg-white' :
                  need.priority === 'medium' ? 'border-yellow-500 bg-white' :
                  'border-blue-500 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      👤 {need.leader_name}（{need.team_name}）
                    </h3>
                    <p className="text-sm text-gray-600">{need.project_name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-sm font-semibold ${
                    need.priority === 'high' ? 'bg-red-200 text-red-800' :
                    need.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-blue-200 text-blue-800'
                  }`}>
                    {need.priority === 'high' ? '高優先度' : need.priority === 'medium' ? '中優先度' : '低優先度'}
                  </span>
                </div>
                <div className="mb-3">
                  <p className="text-sm font-semibold text-gray-700 mb-1">理由:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {need.reasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
                <div className="mb-3">
                  <p className="text-sm font-semibold text-gray-700 mb-1">推奨アクション:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {need.recommended_actions.map((action, idx) => (
                      <li key={idx}>{action}</li>
                    ))}
                  </ul>
                </div>
                <div className="mb-3">
                  <p className="text-sm font-semibold text-gray-700 mb-1">リーダーの状態:</p>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>モチベーション: {need.leader_motivation.toFixed(1)}/5</span>
                    <span>負荷: {need.leader_load.toFixed(1)}/5</span>
                    <span>危険度: {need.leader_danger_score.toFixed(1)}/5</span>
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>チーム危険メンバー: {need.danger_students_count}名</span>
                  <span>期限超過: {need.overdue_tasks_count}件</span>
                  <span>完了率: {need.completion_rate}%</span>
                  <span>支援スコア: {need.support_score}/10</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

