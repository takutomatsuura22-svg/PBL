'use client'

import React from 'react'
import Card from '@/components/Card'

interface MeetingRecord {
  meeting_id: string
  date: string
  title: string
  participants: string[]
  agenda: string[]
  content: string
  decisions: string[]
  action_items: Array<{
    task: string
    assignee: string
    deadline?: string
  }>
  created_by: string
  created_at: string
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = React.useState<MeetingRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showForm, setShowForm] = React.useState(false)
  const [students, setStudents] = React.useState<any[]>([])
  const [form, setForm] = React.useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    participants: [] as string[],
    agenda: [''],
    content: '',
    decisions: [''],
    action_items: [{ task: '', assignee: '', deadline: '' }],
    created_by: ''
  })
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    // クライアント側でのみ実行
    if (typeof window === 'undefined') return

    fetchMeetings()
    fetchStudents()
  }, [])

  const fetchMeetings = async () => {
    try {
      const response = await fetch('/api/meetings')
      if (response.ok) {
        const data = await response.json()
        const sorted = data.sort((a: MeetingRecord, b: MeetingRecord) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        setMeetings(sorted)
      }
    } catch (error) {
      console.error('Error fetching meetings:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students')
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
        if (data.length > 0 && !form.created_by) {
          setForm(prev => ({ ...prev, created_by: data[0].student_id }))
        }
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          agenda: form.agenda.filter(a => a.trim() !== ''),
          decisions: form.decisions.filter(d => d.trim() !== ''),
          action_items: form.action_items.filter(ai => ai.task.trim() !== '')
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save meeting')
      }

      alert('議事録を保存しました！')
      setShowForm(false)
      setForm({
        date: new Date().toISOString().split('T')[0],
        title: '',
        participants: [],
        agenda: [''],
        content: '',
        decisions: [''],
        action_items: [{ task: '', assignee: '', deadline: '' }],
        created_by: form.created_by
      })
      fetchMeetings()
    } catch (error) {
      console.error('Error saving meeting:', error)
      alert('保存に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleParticipant = (studentId: string) => {
    setForm(prev => ({
      ...prev,
      participants: prev.participants.includes(studentId)
        ? prev.participants.filter(id => id !== studentId)
        : [...prev.participants, studentId]
    }))
  }

  const addItem = (field: 'decisions' | 'agenda' | 'action_items') => {
    if (field === 'action_items') {
      setForm(prev => ({ ...prev, action_items: [...prev.action_items, { task: '', assignee: '', deadline: '' }] }))
    } else {
      setForm(prev => ({ ...prev, [field]: [...prev[field], ''] }))
    }
  }

  const updateItem = (field: 'decisions' | 'agenda', index: number, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const removeItem = (field: 'decisions' | 'agenda' | 'action_items', index: number) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const updateActionItem = (index: number, field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      action_items: prev.action_items.map((ai, i) =>
        i === index ? { ...ai, [field]: value } : ai
      )
    }))
  }

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.student_id === studentId)
    return student ? student.name : studentId
  }

  return (
    <>
      <div className="min-h-screen bg-[#f5f5f7] p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-semibold text-[#1d1d1f] mb-2 tracking-tight">
                議事録
              </h1>
              <p className="text-[#86868b]">会議の議事録を記録・共有</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 bg-[#00BFFF] text-white rounded-xl hover:bg-[#0099CC] transition-colors font-medium"
            >
              {showForm ? '一覧に戻る' : '+ 新規作成'}
            </button>
          </div>

          {showForm ? (
            <Card className="p-8 mb-8">
              <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-6 tracking-tight">
                新しい議事録
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1d1d1f] mb-2">日付 *</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl bg-white text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#00BFFF] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1d1d1f] mb-2">作成者 *</label>
                    <select
                      value={form.created_by}
                      onChange={(e) => setForm(prev => ({ ...prev, created_by: e.target.value }))}
                      className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl bg-white text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#00BFFF] focus:border-transparent"
                      required
                    >
                      <option value="">選択してください</option>
                      {students.map(student => (
                        <option key={student.student_id} value={student.student_id}>
                          {student.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1d1d1f] mb-2">タイトル *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl bg-white text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#00BFFF] focus:border-transparent"
                    placeholder="例: 第1回プロジェクトキックオフミーティング"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1d1d1f] mb-2">参加者 *</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {students.map(student => (
                      <label
                        key={student.student_id}
                        className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                          form.participants.includes(student.student_id)
                            ? 'bg-[#00BFFF]/10 border-[#00BFFF]'
                            : 'bg-white border-[#e8e8ed] hover:bg-[#fafafa]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={form.participants.includes(student.student_id)}
                          onChange={() => toggleParticipant(student.student_id)}
                          className="w-4 h-4 text-[#00BFFF] rounded focus:ring-[#00BFFF]"
                        />
                        <span className="text-sm text-[#1d1d1f]">{student.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1d1d1f] mb-2">決定事項</label>
                  {form.decisions.map((decision, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={decision}
                        onChange={(e) => updateItem('decisions', index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-[#e8e8ed] rounded-xl bg-white text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#00BFFF] focus:border-transparent"
                        placeholder={`決定事項 ${index + 1}`}
                      />
                      {form.decisions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem('decisions', index)}
                          className="px-4 py-2 text-[#ff3b30] hover:bg-[#ff3b30]/10 rounded-xl transition-colors"
                        >
                          削除
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addItem('decisions')}
                    className="text-sm text-[#00BFFF] hover:text-[#0099CC]"
                  >
                    + 決定事項を追加
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1d1d1f] mb-2">TODO</label>
                  {form.action_items.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={item.task}
                        onChange={(e) => updateActionItem(index, 'task', e.target.value)}
                        className="flex-1 px-4 py-2 border border-[#e8e8ed] rounded-xl bg-white text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#00BFFF] focus:border-transparent"
                        placeholder="タスク"
                      />
                      <select
                        value={item.assignee}
                        onChange={(e) => updateActionItem(index, 'assignee', e.target.value)}
                        className="px-4 py-2 border border-[#e8e8ed] rounded-xl bg-white text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#00BFFF] focus:border-transparent"
                      >
                        <option value="">担当者</option>
                        {students.map(s => (
                          <option key={s.student_id} value={s.student_id}>{s.name}</option>
                        ))}
                      </select>
                      <input
                        type="date"
                        value={item.deadline || ''}
                        onChange={(e) => updateActionItem(index, 'deadline', e.target.value)}
                        className="px-4 py-2 border border-[#e8e8ed] rounded-xl bg-white text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#00BFFF] focus:border-transparent"
                      />
                      {form.action_items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem('action_items', index)}
                          className="px-4 py-2 text-[#ff3b30] hover:bg-[#ff3b30]/10 rounded-xl transition-colors"
                        >
                          削除
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addItem('action_items')}
                    className="text-sm text-[#00BFFF] hover:text-[#0099CC]"
                  >
                    + TODOを追加
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1d1d1f] mb-2">議題</label>
                  {form.agenda.map((agenda, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={agenda}
                        onChange={(e) => updateItem('agenda', index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-[#e8e8ed] rounded-xl bg-white text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#00BFFF] focus:border-transparent"
                        placeholder={`議題 ${index + 1}`}
                      />
                      {form.agenda.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem('agenda', index)}
                          className="px-4 py-2 text-[#ff3b30] hover:bg-[#ff3b30]/10 rounded-xl transition-colors"
                        >
                          削除
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addItem('agenda')}
                    className="text-sm text-[#00BFFF] hover:text-[#0099CC]"
                  >
                    + 議題を追加
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1d1d1f] mb-2">内容</label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
                    rows={6}
                    className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl bg-white text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#00BFFF] focus:border-transparent resize-none"
                    placeholder="会議の内容を記録..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-6 py-4 bg-[#00BFFF] text-white rounded-xl font-medium hover:bg-[#0099CC] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? '保存中...' : '議事録を保存'}
                </button>
              </form>
            </Card>
          ) : (
            <>
              {loading ? (
                <div className="text-center py-12 text-[#86868b]">読み込み中...</div>
              ) : meetings.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-[#86868b] text-lg mb-2">議事録がありません</p>
                  <p className="text-sm text-[#86868b]">新しい議事録を作成してください</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {meetings.map((meeting) => (
                    <Card key={meeting.meeting_id} className="p-6 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">
                            {meeting.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-[#86868b]">
                            <span>{new Date(meeting.date).toLocaleDateString('ja-JP')}</span>
                            <span>作成者: {getStudentName(meeting.created_by)}</span>
                            <span>参加者: {meeting.participants.length}名</span>
                          </div>
                        </div>
                      </div>

                      {meeting.decisions.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-[#1d1d1f] mb-2">決定事項</h4>
                          <ul className="space-y-1">
                            {meeting.decisions.map((decision, idx) => (
                              <li key={idx} className="text-sm text-[#86868b] flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00BFFF] mt-2"></span>
                                {decision}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {meeting.action_items.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-[#1d1d1f] mb-2">TODO</h4>
                          <ul className="space-y-2">
                            {meeting.action_items.map((item, idx) => (
                              <li key={idx} className="text-sm text-[#86868b]">
                                <span className="font-medium text-[#1d1d1f]">{item.task}</span>
                                {item.assignee && (
                                  <span className="ml-2">担当: {getStudentName(item.assignee)}</span>
                                )}
                                {item.deadline && (
                                  <span className="ml-2">期限: {new Date(item.deadline).toLocaleDateString('ja-JP')}</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {meeting.agenda.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-[#1d1d1f] mb-2">議題</h4>
                          <ul className="space-y-1">
                            {meeting.agenda.map((agenda, idx) => (
                              <li key={idx} className="text-sm text-[#86868b] flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#86868b] mt-2"></span>
                                {agenda}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {meeting.content && (
                        <div>
                          <h4 className="text-sm font-medium text-[#1d1d1f] mb-2">内容</h4>
                          <p className="text-sm text-[#86868b] whitespace-pre-wrap">{meeting.content}</p>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
