'use client'

import React from 'react'

interface Student {
  student_id: string
  name: string
}

interface WeeklyReflection {
  id: string
  student_id: string
  student_name: string
  week_of: string
  achievements: string
  challenges: string
  next_focus: string
  support_needed: string
  confidence_level: number
  notes?: string
  submitted_at?: string
}

const formatDate = (value: string) => {
  if (!value) return ''
  const date = new Date(value)
  return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })
}

const getDefaultWeek = () => {
  const today = new Date()
  const day = today.getDay()
  const diff = today.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(today.setDate(diff))
  return monday.toISOString().split('T')[0]
}

export default function WeeklyReflectionsPage() {
  const [students, setStudents] = React.useState<Student[]>([])
  const [selectedStudentId, setSelectedStudentId] = React.useState<string>('')
  const [reflections, setReflections] = React.useState<WeeklyReflection[]>([])
  const [loading, setLoading] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)

  const [form, setForm] = React.useState({
    week_of: getDefaultWeek(),
    achievements: '',
    challenges: '',
    next_focus: '',
    support_needed: '',
    confidence_level: 3,
    notes: ''
  })

  React.useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('/api/students')
        if (res.ok) {
          const data = await res.json()
          setStudents(data)
          if (data.length > 0) {
            setSelectedStudentId(data[0].student_id)
          }
        }
      } catch (error) {
        console.error('Error fetching students:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [])

  React.useEffect(() => {
    if (!selectedStudentId) return
    const fetchReflections = async () => {
      try {
        const res = await fetch(`/api/weekly-reflections?student_id=${selectedStudentId}`)
        if (res.ok) {
          const data = await res.json()
          setReflections(Array.isArray(data) ? data : [])
        } else {
          const error = await res.json()
          console.error('Error fetching reflections:', error)
          setMessage(error.details || error.error || '振り返りデータの取得に失敗しました。')
          setReflections([])
        }
      } catch (error) {
        console.error('Error fetching reflections:', error)
        setMessage('振り返りデータの取得中にエラーが発生しました。')
        setReflections([])
      }
    }
    fetchReflections()
  }, [selectedStudentId])

  const selectedStudent = students.find(s => s.student_id === selectedStudentId)

  const handleInputChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedStudent) {
      setMessage('生徒を選択してください。')
      return
    }

    setSubmitting(true)
    setMessage(null)
    try {
      const payload = {
        student_id: selectedStudent.student_id,
        student_name: selectedStudent.name,
        ...form
      }

      const res = await fetch('/api/weekly-reflections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const data = await res.json()
        setReflections(prev => [data.reflection, ...prev])
        setForm({
          week_of: getDefaultWeek(),
          achievements: '',
          challenges: '',
          next_focus: '',
          support_needed: '',
          confidence_level: 3,
          notes: ''
        })
        setMessage('週次振り返りを保存しました。')
      } else {
        const error = await res.json()
        setMessage(error.error || '保存に失敗しました。')
      }
    } catch (error) {
      console.error('Error saving reflection:', error)
      setMessage('保存中にエラーが発生しました。')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] p-8">
        <div className="max-w-4xl mx-auto text-center text-[#86868b]">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <p className="text-sm font-medium text-[#00BFFF] mb-1">WEEKLY REFLECTION</p>
              <h1 className="text-3xl font-semibold text-[#1d1d1f]">週次振り返りシート</h1>
              <p className="text-[#86868b] mt-2">できるようになったこと・悩み・サポートの履歴を記録します。</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#1d1d1f]">対象の生徒</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="px-4 py-2 border border-[#e8e8ed] rounded-xl bg-white text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#00BFFF]"
              >
                {students.map(student => (
                  <option key={student.student_id} value={student.student_id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">週（週の開始日）</label>
                <input
                  type="date"
                  value={form.week_of}
                  onChange={(e) => handleInputChange('week_of', e.target.value)}
                  className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl bg-white text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#00BFFF]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">自信度（1-5）</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={0.5}
                    value={form.confidence_level}
                    onChange={(e) => handleInputChange('confidence_level', parseFloat(e.target.value))}
                    className="flex-1 accent-[#00BFFF]"
                  />
                  <span className="text-lg font-semibold text-[#1d1d1f]">{form.confidence_level.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">できるようになったこと</label>
                <textarea
                  value={form.achievements}
                  onChange={(e) => handleInputChange('achievements', e.target.value)}
                  className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl bg-white text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#00BFFF] focus:border-transparent resize-none"
                  rows={4}
                  placeholder="例：プレゼン資料をチームで完成させ、自信がついた"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">悩んだこと・困りごと</label>
                <textarea
                  value={form.challenges}
                  onChange={(e) => handleInputChange('challenges', e.target.value)}
                  className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl bg-white text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#00BFFF] focus:border-transparent resize-none"
                  rows={4}
                  placeholder="例：タスクの優先順位が決められず、作業が遅れた"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">次の一週間で意識すること</label>
                <textarea
                  value={form.next_focus}
                  onChange={(e) => handleInputChange('next_focus', e.target.value)}
                  className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl bg-white text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#00BFFF] focus:border-transparent resize-none"
                  rows={4}
                  placeholder="例：毎日タスクの進捗を5分確認する"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">サポートしてほしいこと</label>
                <textarea
                  value={form.support_needed}
                  onChange={(e) => handleInputChange('support_needed', e.target.value)}
                  className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl bg-white text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#00BFFF] focus:border-transparent resize-none"
                  rows={4}
                  placeholder="例：リサーチ方法についてメンターに相談したい"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1d1d1f] mb-1">その他メモ</label>
              <textarea
                value={form.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl bg-white text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#00BFFF] focus:border-transparent resize-none"
                rows={3}
                placeholder="共有したいことがあれば自由に記入してください"
              />
            </div>

            {message && (
              <div className="px-4 py-3 rounded-xl bg-[#00BFFF]/10 text-[#0077aa] text-sm">
                {message}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-[#00BFFF] text-white rounded-xl font-medium hover:bg-[#0099CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? '保存中...' : '振り返りを保存'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-[#1d1d1f]">これまでの振り返り</h2>
              <p className="text-sm text-[#86868b] mt-1">過去のエピソードやサポート履歴を確認できます。</p>
            </div>
            <span className="text-sm text-[#86868b]">{reflections.length}件</span>
          </div>

          {reflections.length === 0 ? (
            <div className="text-center py-12 text-[#86868b] bg-[#f5f5f7] rounded-2xl">
              まだ記録がありません。
            </div>
          ) : (
            <div className="space-y-4">
              {reflections.map(reflection => (
                <div key={reflection.id} className="border border-[#e8e8ed] rounded-2xl p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div>
                      <p className="text-sm font-medium text-[#86868b]">週</p>
                      <p className="text-lg font-semibold text-[#1d1d1f]">
                        {formatDate(reflection.week_of)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#86868b]">自信度</span>
                      <span className="text-xl font-semibold text-[#00BFFF]">
                        {reflection.confidence_level.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-[#00BFFF] mb-1">できるようになったこと</p>
                      <p className="text-sm text-[#1d1d1f] whitespace-pre-line">{reflection.achievements || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#ff9500] mb-1">悩んだこと・困りごと</p>
                      <p className="text-sm text-[#1d1d1f] whitespace-pre-line">{reflection.challenges || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-xs font-semibold text-[#34c759] mb-1">次に意識すること</p>
                      <p className="text-sm text-[#1d1d1f] whitespace-pre-line">{reflection.next_focus || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#ff3b30] mb-1">必要なサポート</p>
                      <p className="text-sm text-[#1d1d1f] whitespace-pre-line">{reflection.support_needed || '-'}</p>
                    </div>
                  </div>

                  {reflection.notes && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-[#86868b] mb-1">メモ</p>
                      <p className="text-sm text-[#1d1d1f] whitespace-pre-line">{reflection.notes}</p>
                    </div>
                  )}

                  <p className="text-xs text-[#86868b] mt-4">
                    記録日: {reflection.submitted_at ? formatDate(reflection.submitted_at) : formatDate(reflection.week_of)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

