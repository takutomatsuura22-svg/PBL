'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Student {
  student_id: string
  name: string
  MBTI: string
  animal_type: string
  // スキル評価（1-5スケール）
  skill_企画: number
  skill_実行: number
  skill_調整: number
  skill_探索: number
  skill_デザイン?: number
  skill_開発?: number
  skill_分析?: number
  skill_ドキュメント作成?: number
  skill_コミュニケーション?: number
  skill_リーダーシップ?: number
  skill_プレゼンテーション?: number
  skill_問題解決?: number
  // 後方互換性のため（段階的移行）
  strengths?: string[]
  weaknesses?: string[]
  preferred_partners: string[]
  avoided_partners: string[]
  team_id: string
  motivation_score: number
  load_score: number
  tasks: Array<{
    task_id: string
    title: string
    category: string
    status: string
    difficulty: number
    deadline: string
  }>
}

interface AISuggestion {
  type: string
  message: string
  priority: 'high' | 'medium' | 'low'
}

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

interface AnalysisData {
  motivationReason: {
    factors: Array<{
      factor: string
      impact: 'positive' | 'negative' | 'neutral'
      description: string
      score: number
    }>
    summary: string
    score: number
  }
  loadReason: {
    mainCauses: Array<{
      cause: string
      severity: 'high' | 'medium' | 'low'
      description: string
      tasks?: string[]
    }>
    summary: string
    score: number
  }
  encouragement: {
    examples: Array<{
      situation: string
      message: string
      tone: 'supportive' | 'motivational' | 'gentle' | 'energetic'
    }>
  }
  compatibility: {
    recommended: Array<{
      student_id: string
      name: string
      reason: string
      score: number
    }>
    avoid: Array<{
      student_id: string
      name: string
      reason: string
      score: number
    }>
    neutral: Array<{
      student_id: string
      name: string
      reason: string
      score: number
    }>
  }
}

export default function StudentPage() {
  const params = useParams()
  const [student, setStudent] = React.useState<Student | null>(null)
  const [aiSuggestions, setAiSuggestions] = React.useState<AISuggestion[]>([])
  const [analysis, setAnalysis] = React.useState<AnalysisData | null>(null)
  const [taskReassignments, setTaskReassignments] = React.useState<TaskReassignment[]>([])
  const [processingReassignment, setProcessingReassignment] = React.useState<string | null>(null)
  const [checkins, setCheckins] = React.useState<any[]>([])

  React.useEffect(() => {
    if (params.id) {
      // タイムアウト付きfetch
      const fetchWithTimeout = (url: string, timeout = 5000) => {
        return Promise.race([
          fetch(url).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            return res.json()
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), timeout)
          )
        ])
      }

      // 学生データを読み込む（バックグラウンド）
      fetchWithTimeout(`/api/students/${params.id}`, 5000)
        .then((studentData) => {
          setStudent(studentData)
          
          // その他のデータはバックグラウンドで読み込む
          Promise.allSettled([
            fetchWithTimeout(`/api/students/${params.id}/suggestions`, 5000).catch(() => []),
            fetchWithTimeout(`/api/students/${params.id}/analysis`, 5000).catch(() => null),
            fetchWithTimeout(`/api/students/${params.id}/task-reassignments`, 5000).catch(() => []),
            fetchWithTimeout(`/api/checkins?student_id=${params.id}&days=14`, 5000).catch(() => []),
            fetchWithTimeout(`/api/students/${params.id}/motivation-enhanced`, 5000).catch(() => null)
          ]).then(([suggestionsResult, analysisResult, reassignmentsResult, checkinsResult, enhancedResult]) => {
            if (suggestionsResult.status === 'fulfilled') {
              setAiSuggestions(Array.isArray(suggestionsResult.value) ? suggestionsResult.value : [])
            }
            if (analysisResult.status === 'fulfilled') {
              setAnalysis(analysisResult.value)
            }
            if (reassignmentsResult.status === 'fulfilled') {
              setTaskReassignments(Array.isArray(reassignmentsResult.value) ? reassignmentsResult.value : [])
            }
            if (checkinsResult.status === 'fulfilled') {
              setCheckins(Array.isArray(checkinsResult.value) ? checkinsResult.value : [])
            }
            // 改善されたモチベーション計算結果は後で使用（必要に応じて）
          })
        })
        .catch(err => {
          console.error('Failed to fetch student data:', err)
          setStudent(null)
        })
    }
  }, [params.id])

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
        // 成功したら提案リストから削除
        setTaskReassignments(prev => prev.filter(r => r.task_id !== taskId))
        
        // 学生データとタスク再分配提案を再取得
        const [studentRes, reassignmentsRes] = await Promise.all([
          fetch(`/api/students/${params.id}`),
          fetch(`/api/students/${params.id}/task-reassignments`)
        ])
        
        if (studentRes.ok) {
          const studentData = await studentRes.json()
          setStudent(studentData)
        }
        
        if (reassignmentsRes.ok) {
          const reassignmentsData = await reassignmentsRes.json()
          setTaskReassignments(Array.isArray(reassignmentsData) ? reassignmentsData : [])
        }
        
        // 成功メッセージを表示
        alert(result.message || 'タスクの再割り当てが完了しました。学生の負荷スコアを更新しました。')
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
        // 却下したら提案リストから削除
        setTaskReassignments(prev => prev.filter(r => r.task_id !== taskId))
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

  if (!student) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#86868b]">データを読み込んでいます...</p>
          <Link href="/dashboard" className="text-[#007aff] hover:text-[#0051d5] mt-4 inline-block">
            ← ダッシュボードに戻る
          </Link>
        </div>
      </div>
    )
  }

  const skillCategories = [
    { name: '企画', value: student.skill_企画, color: 'blue' },
    { name: '実行', value: student.skill_実行, color: 'green' },
    { name: '調整', value: student.skill_調整, color: 'yellow' },
    { name: '探索', value: student.skill_探索, color: 'purple' }
  ]

  return (
    <>
      <div className="min-h-screen bg-[#f5f5f7] p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-semibold text-[#1d1d1f] mb-6 tracking-tight">{student.name}の詳細</h1>
      
      {/* プロフィールセクション */}
      <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">プロフィール</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">MBTI</p>
            <p className="text-xl font-semibold">{student.MBTI}</p>
          </div>
          <div>
            <p className="text-gray-600">アニマルタイプ</p>
            <p className="text-xl font-semibold">{student.animal_type}</p>
          </div>
          <div>
            <p className="text-gray-600">スキル評価</p>
            <Link
              href="/rubric-skills"
              className="text-xs text-cyan-600 hover:underline"
              title="スキル評価基準を確認"
            >
              🎯 基準
            </Link>
            <div className="mt-2 space-y-2">
              <SkillDisplay name="企画" value={student.skill_企画} />
              <SkillDisplay name="実行" value={student.skill_実行} />
              <SkillDisplay name="調整" value={student.skill_調整} />
              <SkillDisplay name="探索" value={student.skill_探索} />
              {student.skill_デザイン && <SkillDisplay name="デザイン" value={student.skill_デザイン} />}
              {student.skill_開発 && <SkillDisplay name="開発" value={student.skill_開発} />}
              {student.skill_分析 && <SkillDisplay name="分析" value={student.skill_分析} />}
              {student.skill_ドキュメント作成 && <SkillDisplay name="ドキュメント作成" value={student.skill_ドキュメント作成} />}
              {student.skill_コミュニケーション && <SkillDisplay name="コミュニケーション" value={student.skill_コミュニケーション} />}
              {student.skill_リーダーシップ && <SkillDisplay name="リーダーシップ" value={student.skill_リーダーシップ} />}
              {student.skill_プレゼンテーション && <SkillDisplay name="プレゼンテーション" value={student.skill_プレゼンテーション} />}
              {student.skill_問題解決 && <SkillDisplay name="問題解決" value={student.skill_問題解決} />}
            </div>
            {/* 後方互換性: strengths/weaknessesが存在する場合は表示 */}
            {(student.strengths && student.strengths.length > 0) || (student.weaknesses && student.weaknesses.length > 0) ? (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500 mb-2">※ 旧形式のデータ（段階的移行中）</p>
                {student.strengths && student.strengths.length > 0 && (
                  <div className="mb-2">
                    <p className="text-gray-600 text-sm">強み（旧）</p>
                    <div className="flex gap-2 mt-1">
                      {student.strengths.map((strength, idx) => (
                        <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          {strength}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {student.weaknesses && student.weaknesses.length > 0 && (
                  <div>
                    <p className="text-gray-600 text-sm">弱み（旧）</p>
                    <div className="flex gap-2 mt-1">
                      {student.weaknesses.map((weakness, idx) => (
                        <span key={idx} className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                          {weakness}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* スコアセクション */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border p-4 rounded bg-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">モチベーション</h2>
            <Link
              href="/rubric"
              className="text-xs text-indigo-600 hover:underline"
              title="スコア評価基準を確認"
            >
              📊 基準
            </Link>
          </div>
          <div className="text-4xl font-bold text-blue-600 mb-2">{student.motivation_score}/5</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${(student.motivation_score / 5) * 100}%` }}
            />
          </div>
        </div>
        <div className="border p-4 rounded bg-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">タスク量</h2>
            <Link
              href="/rubric"
              className="text-xs text-indigo-600 hover:underline"
              title="スコア評価基準を確認"
            >
              📊 基準
            </Link>
          </div>
          <div className="text-4xl font-bold text-red-600 mb-2">{student.load_score}/5</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                student.load_score >= 4 ? 'bg-red-600' :
                student.load_score >= 3 ? 'bg-yellow-600' :
                'bg-green-600'
              }`}
              style={{ width: `${(student.load_score / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* チェックイン履歴 */}
      {checkins && checkins.length > 0 && (
        <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">📝 チェックイン履歴（過去14日間）</h2>
            <div className="flex gap-3">
              <Link
                href={`/student/${student.student_id}/motivation-trend`}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm font-semibold"
              >
                📈 推移グラフを見る
              </Link>
              <Link
                href="/checkin"
                className="text-sm text-blue-600 hover:underline"
              >
                チェックインを記録 →
              </Link>
            </div>
          </div>
          <div className="space-y-3">
            {checkins.slice(-7).reverse().map((checkin: any, index: number) => (
              <div
                key={index}
                className="p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-700">
                    {new Date(checkin.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
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
                {checkin.comments && (
                  <p className="text-sm text-gray-600 mt-2">{checkin.comments}</p>
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* スキルセクション */}
      <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">スキル適性</h2>
        <div className="grid grid-cols-2 gap-4">
          {skillCategories.map((skill) => (
            <div key={skill.name}>
              <div className="flex justify-between mb-1">
                <span className="font-medium">{skill.name}</span>
                <span className="text-gray-600">{skill.value}/5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full bg-${skill.color}-600`}
                  style={{ width: `${(skill.value / 5) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* タスク一覧 */}
      <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">タスク一覧</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">タスク名</th>
                <th className="p-2 text-left">カテゴリ</th>
                <th className="p-2 text-left">難易度</th>
                <th className="p-2 text-left">ステータス</th>
                <th className="p-2 text-left">期限</th>
              </tr>
            </thead>
            <tbody>
              {student.tasks.map(task => (
                <tr key={task.task_id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{task.title}</td>
                  <td className="p-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {task.category}
                    </span>
                  </td>
                  <td className="p-2">
                    <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                      {task.difficulty}/5
                    </span>
                  </td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-sm ${
                      task.status === '完了' ? 'bg-green-100 text-green-800' :
                      task.status === '進行中' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="p-2 text-sm text-gray-600">
                    {new Date(task.deadline).toLocaleDateString('ja-JP')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* モチベーション推定理由 */}
      {analysis && (
        <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">モチベーション推定理由</h2>
          <p className="text-gray-700 mb-4">{analysis.motivationReason.summary}</p>
          <div className="space-y-3">
            {analysis.motivationReason.factors.map((factor, idx) => (
              <div
                key={idx}
                className={`p-3 rounded border-l-4 ${
                  factor.impact === 'positive' ? 'border-green-500 bg-green-50' :
                  factor.impact === 'negative' ? 'border-red-500 bg-red-50' :
                  'border-gray-500 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="font-semibold">{factor.factor}</span>
                  <span className={`text-sm ${
                    factor.impact === 'positive' ? 'text-green-700' :
                    factor.impact === 'negative' ? 'text-red-700' :
                    'text-gray-700'
                  }`}>
                    {factor.impact === 'positive' ? '✓ 良好' : factor.impact === 'negative' ? '⚠ 要改善' : '○ 普通'}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{factor.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* タスク量の原因 */}
      {analysis && analysis.loadReason.mainCauses.length > 0 && (
        <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">タスク量の原因</h2>
          <p className="text-gray-700 mb-4">{analysis.loadReason.summary}</p>
          <div className="space-y-3">
            {analysis.loadReason.mainCauses.map((cause, idx) => (
              <div
                key={idx}
                className={`p-4 rounded border-l-4 ${
                  cause.severity === 'high' ? 'border-red-500 bg-red-50' :
                  cause.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-semibold text-lg">{cause.cause}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    cause.severity === 'high' ? 'bg-red-200 text-red-800' :
                    cause.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-blue-200 text-blue-800'
                  }`}>
                    {cause.severity === 'high' ? '高' : cause.severity === 'medium' ? '中' : '低'}
                  </span>
                </div>
                <p className="text-gray-700 mb-2">{cause.description}</p>
                {cause.tasks && cause.tasks.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-semibold text-gray-600 mb-1">関連タスク:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {cause.tasks.map((task, taskIdx) => (
                        <li key={taskIdx}>{task}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 相性（誰と組むべきか） */}
      {analysis && (
        <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">相性（誰と組むべきか）</h2>
          
          {analysis.compatibility.recommended.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-green-700 mb-2">✓ 推奨パートナー</h3>
              <div className="space-y-2">
                {analysis.compatibility.recommended.map((partner) => (
                  <div key={partner.student_id} className="p-3 bg-green-50 rounded border border-green-200">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/student/${partner.student_id}`}
                        className="text-green-700 font-semibold hover:underline"
                      >
                        {partner.name}
                      </Link>
                      <span className="text-sm text-green-600">{partner.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.compatibility.avoid.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-red-700 mb-2">⚠ 注意が必要なパートナー</h3>
              <div className="space-y-2">
                {analysis.compatibility.avoid.map((partner) => (
                  <div key={partner.student_id} className="p-3 bg-red-50 rounded border border-red-200">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/student/${partner.student_id}`}
                        className="text-red-700 font-semibold hover:underline"
                      >
                        {partner.name}
                      </Link>
                      <span className="text-sm text-red-600">{partner.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.compatibility.neutral.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">○ 問題なし</h3>
              <div className="space-y-2">
                {analysis.compatibility.neutral.map((partner) => (
                  <div key={partner.student_id} className="p-3 bg-gray-50 rounded border border-gray-200">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/student/${partner.student_id}`}
                        className="text-gray-700 font-semibold hover:underline"
                      >
                        {partner.name}
                      </Link>
                      <span className="text-sm text-gray-600">{partner.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}


      {/* タスク再割り当て提案セクション */}
      {taskReassignments.length > 0 && (
        <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">🔄 タスク再割り当て提案</h2>
          <div className="space-y-4">
            {taskReassignments
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
                    </div>
                    
                    {/* 再割り当ての詳細 */}
                    <div className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <span className={`font-semibold block ${
                              reassignment.from_student_id === student.student_id ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {reassignment.from_student_name}さん
                            </span>
                            <span className="text-xs text-gray-500">現在の担当者</span>
                          </div>
                          <span className="text-2xl text-gray-400">→</span>
                          <div className="text-center">
                            <span className={`font-semibold block ${
                              reassignment.to_student_id === student.student_id ? 'text-green-600' : 'text-gray-600'
                            }`}>
                              {reassignment.to_student_name}さん
                            </span>
                            <span className="text-xs text-gray-500">移管先</span>
                          </div>
                        </div>
                      </div>
                      
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
                {(reassignment.from_student_id === student.student_id || reassignment.to_student_id === student.student_id) && (
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
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI提案セクション */}
      {aiSuggestions.length > 0 && (
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">AI提案</h2>
          <div className="space-y-3">
            {aiSuggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className={`p-4 rounded border-l-4 ${
                  suggestion.priority === 'high' ? 'border-red-500 bg-red-50' :
                  suggestion.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <p className="text-gray-800">{suggestion.message}</p>
                  <span className={`px-2 py-1 rounded text-xs ${
                    suggestion.priority === 'high' ? 'bg-red-200 text-red-800' :
                    suggestion.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-blue-200 text-blue-800'
                  }`}>
                    {suggestion.priority === 'high' ? '高' : suggestion.priority === 'medium' ? '中' : '低'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
        </div>
      </div>
    </>
  )
}

// スキル表示コンポーネント
function SkillDisplay({ name, value }: { name: string; value: number }) {
  const getColor = (score: number) => {
    if (score >= 4.5) return 'text-green-700 bg-green-100'
    if (score >= 3.5) return 'text-blue-700 bg-blue-100'
    if (score >= 2.5) return 'text-yellow-700 bg-yellow-100'
    if (score >= 1.5) return 'text-orange-700 bg-orange-100'
    return 'text-red-700 bg-red-100'
  }
  
  const getLabel = (score: number) => {
    if (score >= 4.5) return '非常に高い'
    if (score >= 3.5) return '高い'
    if (score >= 2.5) return '標準'
    if (score >= 1.5) return '低い'
    return '非常に低い'
  }
  
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{name}</span>
      <div className="flex items-center gap-2">
        <div className="w-24 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              value >= 4.5 ? 'bg-green-600' :
              value >= 3.5 ? 'bg-blue-600' :
              value >= 2.5 ? 'bg-yellow-600' :
              value >= 1.5 ? 'bg-orange-600' :
              'bg-red-600'
            }`}
            style={{ width: `${(value / 5) * 100}%` }}
          />
        </div>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${getColor(value)}`}>
          {value.toFixed(1)} ({getLabel(value)})
        </span>
      </div>
    </div>
  )
}
