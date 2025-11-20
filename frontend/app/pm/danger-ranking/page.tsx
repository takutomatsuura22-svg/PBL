// @ts-nocheck
'use client'

import React from 'react'
import Link from 'next/link'

interface Student {
  student_id: string
  name: string
  motivation_score: number
  load_score: number
  danger_score?: number
}

export default function DangerRankingPage() {
  const [dangerRanking, setDangerRanking] = React.useState<Student[]>([])

  React.useEffect(() => {
    // クライアント側でのみ実行
    if (typeof window === 'undefined') return

    const fetchData = async () => {
      try {
        const response = await fetch('/api/pm/danger-ranking')
        if (response.ok) {
          const data = await response.json()
          setDangerRanking(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error('Error fetching danger ranking:', error)
        setDangerRanking([])
      }
    }

    fetchData()
  }, [])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">🚨 危険メンバーランキング（詳細分析）</h1>
          <p className="text-gray-600">危険度スコアに基づく詳細な分析とランキング</p>
        </div>
        <Link
          href="/pm"
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-semibold"
        >
          ← PMページに戻る
        </Link>
      </div>

      {dangerRanking.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 shadow-sm text-center">
          <p className="text-gray-500 text-lg">現在、危険メンバーはありません。</p>
          <p className="text-gray-400 text-sm mt-2">全体的に良好な状態です。</p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="space-y-2">
            {dangerRanking
              .filter((s: Student) => s && s.student_id)
              .map((student, index) => (
              <div
                key={student.student_id}
                className={`flex items-center justify-between p-4 rounded border-l-4 ${
                  student.danger_score && student.danger_score >= 4 ? 'border-red-500 bg-red-50' :
                  student.danger_score && student.danger_score >= 3 ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-gray-500 w-8">#{index + 1}</span>
                  <Link
                    href={`/student/${student.student_id}`}
                    className="text-lg font-semibold text-blue-600 hover:underline"
                  >
                    {student.name}
                  </Link>
                  <div className="flex gap-4 text-sm">
                    <span>モチベ: {student.motivation_score}/5</span>
                    <span>タスク量: {student.load_score}/5</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {student.danger_score && (
                    <>
                      <div className="w-32 bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            student.danger_score >= 4 ? 'bg-red-600' :
                            student.danger_score >= 3 ? 'bg-yellow-600' :
                            'bg-green-600'
                          }`}
                          style={{ width: `${(student.danger_score / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-lg font-bold w-12">
                        {student.danger_score.toFixed(1)}/5
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

