// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface CheckInData {
  date: string
  motivation_score: number
  energy_level: number
  stress_level: number
  comments?: string
  factors: {
    task_progress: 'positive' | 'neutral' | 'negative'
    team_communication: 'positive' | 'neutral' | 'negative'
    personal_issues: 'none' | 'minor' | 'major'
    achievements: string[]
    challenges: string[]
  }
}

interface MotivationChange {
  changeType: 'sudden_drop' | 'gradual_decline' | 'sudden_rise' | 'gradual_improvement' | 'stable'
  magnitude: number
  duration: number
  confidence: number
  potentialCauses: string[]
  recommendedActions: string[]
}

export default function MotivationTrendPage() {
  const params = useParams()
  const [student, setStudent] = useState<any>(null)
  const [checkins, setCheckins] = useState<CheckInData[]>([])
  const [changeDetection, setChangeDetection] = useState<MotivationChange | null>(null)
  const [enhancedMotivation, setEnhancedMotivation] = useState<any>(null)

  useEffect(() => {
    if (params.id) {
      // 学生データを取得
      fetch(`/api/students/${params.id}`)
        .then(res => res.json())
        .then(data => setStudent(data))
        .catch(err => console.error('Error fetching student:', err))

      // チェックインデータを取得（過去30日間）
      fetch(`/api/checkins?student_id=${params.id}&days=30`)
        .then(res => res.json())
        .then(data => {
          const sorted = Array.isArray(data) ? data.sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          ) : []
          setCheckins(sorted)
        })
        .catch(err => console.error('Error fetching checkins:', err))

      // 改善されたモチベーション計算を取得
      fetch(`/api/students/${params.id}/motivation-enhanced`)
        .then(res => res.json())
        .then(data => {
          setEnhancedMotivation(data)
          if (data.change_detection) {
            setChangeDetection(data.change_detection)
          }
        })
        .catch(err => console.error('Error fetching enhanced motivation:', err))
    }
  }, [params.id])

  // グラフ用データの準備
  const chartData = checkins.map(checkin => ({
    date: new Date(checkin.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
    fullDate: checkin.date,
    motivation: checkin.motivation_score,
    energy: checkin.energy_level,
    stress: checkin.stress_level
  }))

  // 平均値の計算
  const avgMotivation = checkins.length > 0
    ? checkins.reduce((sum, c) => sum + c.motivation_score, 0) / checkins.length
    : 0
  const avgEnergy = checkins.length > 0
    ? checkins.reduce((sum, c) => sum + c.energy_level, 0) / checkins.length
    : 0
  const avgStress = checkins.length > 0
    ? checkins.reduce((sum, c) => sum + c.stress_level, 0) / checkins.length
    : 0

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            📈 {student?.name || '学生'}のモチベーション推移
          </h1>
          <p className="text-gray-600">時系列データと変化検知</p>
        </div>
        <Link
          href={`/student/${params.id}`}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-semibold"
        >
          ← 学生詳細に戻る
        </Link>
      </div>

      {/* 変化検知アラート */}
      {changeDetection && changeDetection.changeType !== 'stable' && (
        <div className={`mb-6 p-4 rounded-lg border-l-4 ${
          changeDetection.changeType === 'sudden_drop' || changeDetection.changeType === 'gradual_decline'
            ? 'bg-red-50 border-red-500'
            : 'bg-green-50 border-green-500'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={`text-lg font-semibold mb-2 ${
                changeDetection.changeType === 'sudden_drop' || changeDetection.changeType === 'gradual_decline'
                  ? 'text-red-800'
                  : 'text-green-800'
              }`}>
                {changeDetection.changeType === 'sudden_drop' ? '⚠️ 急激なモチベーション低下を検知' :
                 changeDetection.changeType === 'gradual_decline' ? '📉 継続的なモチベーション低下を検知' :
                 changeDetection.changeType === 'sudden_rise' ? '📈 急激なモチベーション向上を検知' :
                 '📊 継続的なモチベーション向上を検知'}
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                変化の大きさ: {changeDetection.magnitude.toFixed(1)}ポイント | 
                継続期間: {changeDetection.duration}日 | 
                信頼度: {(changeDetection.confidence * 100).toFixed(0)}%
              </p>
              
              {changeDetection.potentialCauses.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-semibold text-gray-700 mb-1">考えられる原因:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {changeDetection.potentialCauses.slice(0, 3).map((cause, idx) => (
                      <li key={idx}>{cause}</li>
                    ))}
                  </ul>
                </div>
              )}

              {changeDetection.recommendedActions.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">推奨アクション:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {changeDetection.recommendedActions.slice(0, 3).map((action, idx) => (
                      <li key={idx}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 統計サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-600 mb-1">平均モチベーション</p>
          <p className="text-3xl font-bold text-blue-800">{avgMotivation.toFixed(1)}/5</p>
          <p className="text-xs text-gray-600 mt-1">{checkins.length}日分のデータ</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600 mb-1">平均エネルギー</p>
          <p className="text-3xl font-bold text-green-800">{avgEnergy.toFixed(1)}/5</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600 mb-1">平均ストレス</p>
          <p className="text-3xl font-bold text-red-800">{avgStress.toFixed(1)}/5</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <p className="text-sm text-indigo-600 mb-1">データ信頼度</p>
          <p className="text-3xl font-bold text-indigo-800">
            {enhancedMotivation?.confidence 
              ? `${(enhancedMotivation.confidence * 100).toFixed(0)}%`
              : 'N/A'}
          </p>
        </div>
      </div>

      {/* モチベーション推移グラフ */}
      {chartData.length > 0 ? (
        <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">モチベーション・エネルギー・ストレスの推移</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis domain={[1, 5]} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="motivation" 
                name="モチベーション" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="energy" 
                name="エネルギー" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="stress" 
                name="ストレス" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-white border rounded-lg p-8 shadow-sm text-center mb-6">
          <p className="text-gray-500 text-lg">チェックインデータがありません</p>
          <p className="text-gray-400 text-sm mt-2">日次チェックインを記録すると、ここにグラフが表示されます。</p>
          <Link
            href="/checkin"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-semibold"
          >
            チェックインを記録する →
          </Link>
        </div>
      )}

      {/* 改善されたモチベーション計算の詳細 */}
      {enhancedMotivation && (
        <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">モチベーション計算の内訳</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-semibold">最終スコア</span>
              <span className="text-2xl font-bold text-blue-600">
                {enhancedMotivation.motivation_score.toFixed(1)}/5
              </span>
            </div>
            {enhancedMotivation.breakdown && (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 border-b">
                  <span className="text-sm text-gray-600">自己申告（チェックイン）</span>
                  <span className="font-semibold">{enhancedMotivation.breakdown.selfReported?.toFixed(1) || 'N/A'}/5</span>
                </div>
                <div className="flex items-center justify-between p-2 border-b">
                  <span className="text-sm text-gray-600">タスク完了率</span>
                  <span className="font-semibold">{enhancedMotivation.breakdown.taskBased?.toFixed(1) || 'N/A'}/5</span>
                </div>
                <div className="flex items-center justify-between p-2 border-b">
                  <span className="text-sm text-gray-600">チーム相性</span>
                  <span className="font-semibold">{enhancedMotivation.breakdown.teamCompatibility?.toFixed(1) || 'N/A'}/5</span>
                </div>
                <div className="flex items-center justify-between p-2 border-b">
                  <span className="text-sm text-gray-600">MBTI特性</span>
                  <span className="font-semibold">{enhancedMotivation.breakdown.mbtiBase?.toFixed(1) || 'N/A'}/5</span>
                </div>
                {enhancedMotivation.breakdown.activityBased && (
                  <div className="flex items-center justify-between p-2 border-b">
                    <span className="text-sm text-gray-600">活動データ</span>
                    <span className="font-semibold">{enhancedMotivation.breakdown.activityBased.toFixed(1)}/5</span>
                  </div>
                )}
              </div>
            )}
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <p className="text-sm text-gray-700">
                <strong>推奨:</strong> {enhancedMotivation.recommendation || 'データを継続的に記録してください。'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* チェックイン履歴の詳細 */}
      {checkins.length > 0 && (
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">チェックイン履歴（詳細）</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {checkins.reverse().map((checkin, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-700">
                    {new Date(checkin.date).toLocaleDateString('ja-JP', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      weekday: 'short'
                    })}
                  </span>
                  <div className="flex gap-4 text-sm">
                    <span className="text-blue-600">
                      モチベ: {checkin.motivation_score.toFixed(1)}/5
                    </span>
                    <span className="text-green-600">
                      エネルギー: {checkin.energy_level.toFixed(1)}/5
                    </span>
                    <span className="text-red-600">
                      ストレス: {checkin.stress_level.toFixed(1)}/5
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-xs text-gray-600 mb-2">
                  <div>
                    <span className="font-semibold">タスク進捗: </span>
                    <span className={
                      checkin.factors.task_progress === 'positive' ? 'text-green-600' :
                      checkin.factors.task_progress === 'negative' ? 'text-red-600' :
                      'text-gray-600'
                    }>
                      {checkin.factors.task_progress === 'positive' ? '✅ 順調' :
                       checkin.factors.task_progress === 'negative' ? '❌ 停滞' :
                       '➖ 普通'}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">チームコミュ: </span>
                    <span className={
                      checkin.factors.team_communication === 'positive' ? 'text-green-600' :
                      checkin.factors.team_communication === 'negative' ? 'text-red-600' :
                      'text-gray-600'
                    }>
                      {checkin.factors.team_communication === 'positive' ? '✅ 良好' :
                       checkin.factors.team_communication === 'negative' ? '❌ 問題あり' :
                       '➖ 普通'}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">個人的問題: </span>
                    <span className={
                      checkin.factors.personal_issues === 'major' ? 'text-red-600' :
                      checkin.factors.personal_issues === 'minor' ? 'text-yellow-600' :
                      'text-gray-600'
                    }>
                      {checkin.factors.personal_issues === 'major' ? '重大' :
                       checkin.factors.personal_issues === 'minor' ? '軽微' :
                       'なし'}
                    </span>
                  </div>
                </div>
                {checkin.comments && (
                  <p className="text-sm text-gray-700 mt-2 italic">"{checkin.comments}"</p>
                )}
                {checkin.factors.achievements.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">達成事項:</p>
                    <div className="flex flex-wrap gap-1">
                      {checkin.factors.achievements.map((achievement: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          {achievement}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {checkin.factors.challenges.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">課題:</p>
                    <div className="flex flex-wrap gap-1">
                      {checkin.factors.challenges.map((challenge: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                          {challenge}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <Navigation />
    </div>
  )
}

