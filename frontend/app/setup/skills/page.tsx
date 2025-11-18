'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface SkillAssessment {
  skill: string
  score: number
  confidence: number // 1-5: 自分の評価にどのくらい自信があるか
  reason?: string // なぜこのスコアか
}

const allSkills = [
  { key: '企画', label: '企画（Planning）', description: 'プロジェクトの方向性を定め、計画を立案する能力' },
  { key: '実行', label: '実行（Execution）', description: '計画に基づいて実際に作業を進め、成果物を完成させる能力' },
  { key: '調整', label: '調整（Coordination）', description: 'チームメンバー間の調整を行い、チーム全体の活動を円滑に進める能力' },
  { key: '探索', label: '探索（Exploration）', description: '新しい情報やアイデアを探索し、イノベーションを生み出す能力' },
  { key: 'デザイン', label: 'デザイン（Design）', description: 'ユーザー体験や視覚的な表現を設計する能力' },
  { key: '開発', label: '開発（Development）', description: 'ソフトウェアやシステムを開発する能力' },
  { key: '分析', label: '分析（Analysis）', description: 'データや情報を分析し、洞察を得る能力' },
  { key: 'ドキュメント作成', label: 'ドキュメント作成（Documentation）', description: 'わかりやすいドキュメントを作成する能力' },
  { key: 'コミュニケーション', label: 'コミュニケーション（Communication）', description: '他者と効果的に意思疎通を行う能力' },
  { key: 'リーダーシップ', label: 'リーダーシップ（Leadership）', description: 'チームを導き、目標達成に向けて動機づける能力' },
  { key: 'プレゼンテーション', label: 'プレゼンテーション（Presentation）', description: '情報を効果的に伝達し、聴衆を説得する能力' },
  { key: '問題解決', label: '問題解決（Problem Solving）', description: '問題を特定し、解決策を見つけて実行する能力' }
]

export default function SkillsSetupPage() {
  const [students, setStudents] = useState<any[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  const [assessments, setAssessments] = useState<SkillAssessment[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [hasExistingAssessment, setHasExistingAssessment] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 学生リストを取得
    setLoading(true)
    setError(null)
    fetch('/api/students')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then(data => {
        if (Array.isArray(data)) {
          setStudents(data)
          if (data.length > 0 && !selectedStudentId) {
            setSelectedStudentId(data[0].student_id)
          }
        } else {
          setError('学生データの形式が正しくありません')
        }
      })
      .catch(err => {
        console.error('Error fetching students:', err)
        setError('学生データの取得に失敗しました')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (selectedStudentId) {
      // 既存の評価を取得
      fetch(`/api/skill-assessments?student_id=${selectedStudentId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            // 最新の評価を使用
            const latest = data[data.length - 1]
            setAssessments(latest.skills || [])
            setHasExistingAssessment(true)
          } else {
            // 初期値を設定
            const initial: SkillAssessment[] = allSkills.map(skill => ({
              skill: skill.key,
              score: 3,
              confidence: 3,
              reason: ''
            }))
            setAssessments(initial)
            setHasExistingAssessment(false)
          }
        })
        .catch(err => {
          console.error('Error fetching assessments:', err)
          // エラー時も初期値を設定
          const initial: SkillAssessment[] = allSkills.map(skill => ({
            skill: skill.key,
            score: 3,
            confidence: 3,
            reason: ''
          }))
          setAssessments(initial)
        })
    }
  }, [selectedStudentId])

  const updateAssessment = (skillKey: string, field: keyof SkillAssessment, value: number | string) => {
    setAssessments(prev => prev.map(a => 
      a.skill === skillKey ? { ...a, [field]: value } : a
    ))
  }

  const handleSubmit = async () => {
    if (!selectedStudentId) {
      alert('学生を選択してください')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/skill-assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: selectedStudentId,
          date: new Date().toISOString().split('T')[0],
          skills: assessments,
          is_initial: !hasExistingAssessment
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save assessment')
      }

      alert('スキル評価を保存しました！')
      window.location.href = '/dashboard'
    } catch (error) {
      console.error('Error saving assessment:', error)
      alert('保存に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedStudent = students.find(s => s.student_id === selectedStudentId)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-[#86868b]">読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800 font-semibold">エラー: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              再読み込み
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">🎯 スキル自己評価（初期セットアップ）</h1>
        <p className="text-gray-600 mb-6">
          このアプリを最大限活用するために、あなたのスキルを自己評価してください。
          ルーブリックを参照しながら、各スキルを1-5で評価してください。
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 font-semibold mb-2">💡 評価のポイント</p>
          <ul className="text-blue-700 text-sm space-y-1 list-disc list-inside">
            <li>各スキルのルーブリック（<Link href="/rubric-skills" className="underline">こちら</Link>）を参照してください</li>
            <li>過去の経験や実績を踏まえて、正直に評価してください</li>
            <li>「自信度」は、自分の評価にどのくらい自信があるかを示します</li>
            <li>「理由」には、なぜこのスコアか、具体的な経験や根拠を記入してください</li>
            <li>後から更新できるので、完璧を目指さず、まずは記入してください</li>
          </ul>
        </div>

        {/* 学生選択 */}
        <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
          <label className="block text-sm font-semibold mb-2">学生を選択</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {students.map(student => (
              <option key={student.student_id} value={student.student_id}>
                {student.name} ({student.student_id})
              </option>
            ))}
          </select>
        </div>

        {/* スキル評価フォーム */}
        <div className="space-y-4 mb-6">
          {allSkills.map((skill, index) => {
            const assessment = assessments.find(a => a.skill === skill.key) || {
              skill: skill.key,
              score: 3,
              confidence: 3,
              reason: ''
            }

            return (
              <div key={skill.key} className="bg-white border rounded-lg p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{skill.label}</h3>
                    <p className="text-sm text-gray-600 mt-1">{skill.description}</p>
                    <Link 
                      href={`/rubric-skills#${skill.key}`}
                      className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                    >
                      📊 ルーブリックを確認
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* スコア */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      スコア (1-5)
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="0.5"
                        value={assessment.score}
                        onChange={(e) => updateAssessment(skill.key, 'score', parseFloat(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-2xl font-bold w-16 text-center">
                        {assessment.score.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1 (非常に低い)</span>
                      <span>5 (非常に高い)</span>
                    </div>
                  </div>

                  {/* 自信度 */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      自信度 (1-5)
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="0.5"
                        value={assessment.confidence}
                        onChange={(e) => updateAssessment(skill.key, 'confidence', parseFloat(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-2xl font-bold w-16 text-center">
                        {assessment.confidence.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1 (全く自信なし)</span>
                      <span>5 (非常に自信あり)</span>
                    </div>
                  </div>
                </div>

                {/* 理由 */}
                <div className="mt-4">
                  <label className="block text-sm font-semibold mb-2">
                    理由・根拠（任意）
                  </label>
                  <textarea
                    value={assessment.reason || ''}
                    onChange={(e) => updateAssessment(skill.key, 'reason', e.target.value)}
                    placeholder="例: 過去に3つのプロジェクトで企画を担当し、すべて期限内に完了できた。ただし、複雑な計画はまだ苦手。"
                    className="w-full p-2 border rounded text-sm"
                    rows={2}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* 送信ボタン */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {hasExistingAssessment ? '既存の評価を更新します' : '新しい評価を保存します'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                後からいつでも更新できます
              </p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting || !selectedStudentId}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              {submitting ? '保存中...' : '保存して完了'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

