// @ts-nocheck
'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface WeeklyReflection {
  id: string
  week_of: string
  achievements: string
  challenges: string
  next_focus: string
  support_needed: string
  confidence_level: number
  notes?: string
}

const formatWeek = (value: string) => {
  if (!value) return ''
  const date = new Date(value)
  return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
}

export default function WeeklyReflectionTrendPage() {
  const params = useParams()
  const [student, setStudent] = React.useState<any>(null)
  const [reflections, setReflections] = React.useState<WeeklyReflection[]>([])

  React.useEffect(() => {
    // クライアント側でのみ実行
    if (typeof window === 'undefined') return
    if (!params.id) return

    fetch(`/api/students/${params.id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setStudent(data)
      })
      .catch(err => {
        console.error('Error fetching student:', err)
        setStudent(null)
      })

    fetch(`/api/weekly-reflections?student_id=${params.id}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        const sorted = Array.isArray(data)
          ? data.sort((a, b) => new Date(a.week_of).getTime() - new Date(b.week_of).getTime())
          : []
        setReflections(sorted)
      })
      .catch(err => {
        console.error('Error fetching reflections:', err)
        setReflections([])
      })
  }, [params.id])

  const chartData = reflections.map(reflection => ({
    week: formatWeek(reflection.week_of),
    confidence: reflection.confidence_level
  }))

  const averageConfidence = reflections.length > 0
    ? reflections.reduce((sum, r) => sum + r.confidence_level, 0) / reflections.length
    : 0

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            🗂️ {student?.name || '学生'}の週次振り返り履歴
          </h1>
          <p className="text-gray-600">自信度の推移と記録内容を確認できます</p>
        </div>
        <Link
          href={`/student/${params.id}`}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-semibold"
        >
          ← 学生詳細に戻る
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#00BFFF]/10 border border-[#00BFFF]/30 rounded-lg p-4">
          <p className="text-sm text-[#00BFFF] mb-1">平均自信度</p>
          <p className="text-3xl font-bold text-[#0077aa]">{averageConfidence.toFixed(1)}/5</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">記録件数</p>
          <p className="text-3xl font-bold text-gray-800">{reflections.length}件</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <p className="text-sm text-indigo-600 mb-1">最新の記録</p>
          <p className="text-lg font-semibold text-indigo-800">
            {reflections.length > 0 ? formatWeek(reflections[reflections.length - 1].week_of) : 'N/A'}
          </p>
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">自信度の推移</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis domain={[1, 5]} />
              <Tooltip />
              <Line type="monotone" dataKey="confidence" stroke="#00BFFF" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-white border rounded-lg p-8 mb-6 shadow-sm text-center">
          <p className="text-gray-500">週次振り返りのデータがありません。</p>
          <p className="text-gray-400 text-sm mt-2">記録を追加すると、ここに推移グラフが表示されます。</p>
          <Link
            href="/reflections"
            className="mt-4 inline-block px-4 py-2 bg-[#00BFFF] text-white rounded hover:bg-[#0099CC] text-sm font-semibold"
          >
            振り返りを記録する →
          </Link>
        </div>
      )}

      <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">振り返りの詳細</h2>
          {reflections.length === 0 ? (
            <p className="text-gray-500 text-center">まだ記録がありません。</p>
          ) : (
            <div className="space-y-4">
              {[...reflections].reverse().map((reflection) => (
                <div key={reflection.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-700">
                      {new Date(reflection.week_of).toLocaleDateString('ja-JP', { 
                        year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' 
                      })}
                    </span>
                    <span className="text-sm font-semibold text-[#00BFFF]">
                      自信度: {reflection.confidence_level.toFixed(1)}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                    <div>
                      <p className="font-semibold text-gray-600 mb-1">できるようになったこと</p>
                      <p>{reflection.achievements || '-'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-600 mb-1">悩み・課題</p>
                      <p>{reflection.challenges || '-'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 mt-3">
                    <div>
                      <p className="font-semibold text-gray-600 mb-1">次に意識すること</p>
                      <p>{reflection.next_focus || '-'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-600 mb-1">必要なサポート</p>
                      <p>{reflection.support_needed || '-'}</p>
                    </div>
                  </div>
                  {reflection.notes && (
                    <p className="text-xs text-gray-500 mt-3">メモ: {reflection.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  )
}

