// @ts-nocheck
'use client'

import React from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'

interface InterventionRecommendation {
  student_id: string
  student_name: string
  reason: string
  priority: 'high' | 'medium' | 'low'
  actions: string[]
}

export default function InterventionsPage() {
  const [interventions, setInterventions] = React.useState<InterventionRecommendation[]>([])

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/pm/interventions')
        if (response.ok) {
          const data = await response.json()
          setInterventions(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error('Error fetching interventions:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">📋 今週の介入推奨（具体的なアクション）</h1>
          <p className="text-gray-600">すべての介入推奨と具体的なアクション</p>
        </div>
        <Link
          href="/pm"
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-semibold"
        >
          ← PMページに戻る
        </Link>
      </div>

      {!Array.isArray(interventions) || interventions.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 shadow-sm text-center">
          <p className="text-gray-500 text-lg">今週の介入推奨はありません。</p>
          <p className="text-gray-400 text-sm mt-2">全体的に良好な状態です。</p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="space-y-4">
            {interventions
              .filter((i: InterventionRecommendation) => i && i.student_id)
              .map((intervention, idx) => (
              <div
                key={idx}
                className={`p-4 rounded border-l-4 ${
                  intervention.priority === 'high' ? 'border-red-500 bg-red-50' :
                  intervention.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Link
                      href={`/student/${intervention.student_id}`}
                      className="text-lg font-semibold text-blue-600 hover:underline"
                    >
                      {intervention.student_name}
                    </Link>
                    <p className="text-gray-700 mt-1">{intervention.reason}</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-sm font-semibold ${
                    intervention.priority === 'high' ? 'bg-red-200 text-red-800' :
                    intervention.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-blue-200 text-blue-800'
                  }`}>
                    {intervention.priority === 'high' ? '高優先度' : intervention.priority === 'medium' ? '中優先度' : '低優先度'}
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-sm font-semibold text-gray-600 mb-1">推奨アクション:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {intervention.actions.map((action, actionIdx) => (
                      <li key={actionIdx} className="text-sm text-gray-700">{action}</li>
                    ))}
                  </ul>
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

