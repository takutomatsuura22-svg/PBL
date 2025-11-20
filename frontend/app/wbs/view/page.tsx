'use client'

import React from 'react'
import Link from 'next/link'

interface Task {
  task_id: string
  title: string
  description?: string
  category: string
  difficulty: number
  start_date?: string
  end_date?: string
  deadline?: string // 後方互換性のため残す
  status: string
  assignee_id?: string | string[] // 複数担当者対応
  assignee_name?: string | string[]
  required_skills?: string[]
  ai_usage?: string // AI活用方法
}

interface Student {
  student_id: string
  name: string
}

export default function WBSViewPage() {
  const [tasks, setTasks] = React.useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = React.useState<Task[]>([])
  const [students, setStudents] = React.useState<Student[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all')
  const [assigneeFilter, setAssigneeFilter] = React.useState<string>('all')
  const [sortBy, setSortBy] = React.useState<string>('deadline')
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc')
  const [editingField, setEditingField] = React.useState<string | null>(null) // "taskId_field"形式で保存
  const [editForm, setEditForm] = React.useState<{ [key: string]: any }>({})
  const [expandedAIUsage, setExpandedAIUsage] = React.useState<Set<string>>(new Set()) // 展開されているAI活用方法

  React.useEffect(() => {
    // クライアント側でのみ実行
    if (typeof window === 'undefined') return

    const fetchData = async () => {
      try {
        // WBSビューページでは、選択中のWBSファイルから直接タスクを取得
        // タスクと学生データを並行取得
        const [tasksResponse, studentsResponse] = await Promise.allSettled([
          fetch('/api/wbs/tasks').catch(() => ({ ok: false, json: async () => [] })),
          fetch('/api/students').catch(() => ({ ok: false, json: async () => [] }))
        ])

        if (tasksResponse.status === 'fulfilled' && tasksResponse.value.ok) {
          const tasksData = await tasksResponse.value.json()
          const tasksArray = Array.isArray(tasksData) ? tasksData : []
          
          // AI活用方法がないタスクをチェック
          const tasksWithoutAI = tasksArray.filter((t: Task) => !t.ai_usage)
          if (tasksWithoutAI.length > 0) {
            // バックグラウンドでAI活用方法を生成
            fetch('/api/tasks/generate-ai-usage', {
              method: 'POST'
            }).then(async (response) => {
              if (response.ok) {
                // 再取得（WBSファイルから）
                const updatedResponse = await fetch('/api/wbs/tasks')
                if (updatedResponse.ok) {
                  const updatedData = await updatedResponse.json()
                  setTasks(Array.isArray(updatedData) ? updatedData : [])
                  setFilteredTasks(Array.isArray(updatedData) ? updatedData : [])
                }
              }
            }).catch(error => {
              console.error('Error generating AI usage:', error)
            })
          }
          
          setTasks(tasksArray)
          setFilteredTasks(tasksArray)
        } else {
          setTasks([])
          setFilteredTasks([])
        }

        if (studentsResponse.status === 'fulfilled' && studentsResponse.value.ok) {
          const studentsData = await studentsResponse.value.json()
          // 学生データを名前順にソート
          const sortedStudents = Array.isArray(studentsData) 
            ? [...studentsData].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ja'))
            : []
          setStudents(sortedStudents)
        } else {
          setStudents([])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setTasks([])
        setFilteredTasks([])
        setStudents([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  React.useEffect(() => {
    let filtered = [...tasks]

    // 検索フィルタ
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.task_id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // ステータスフィルタ
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter)
    }

    // カテゴリフィルタ
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(task => task.category === categoryFilter)
    }

    // 担当者フィルタ
    if (assigneeFilter !== 'all') {
      if (assigneeFilter === 'unassigned') {
        filtered = filtered.filter(task => {
          const assigneeIds = Array.isArray(task.assignee_id) ? task.assignee_id : task.assignee_id ? [task.assignee_id] : []
          return assigneeIds.length === 0
        })
      } else {
        filtered = filtered.filter(task => {
          const assigneeIds = Array.isArray(task.assignee_id) ? task.assignee_id : task.assignee_id ? [task.assignee_id] : []
          return assigneeIds.includes(assigneeFilter)
        })
      }
    }

    // ソート
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy) {
        case 'deadline':
          aValue = new Date(a.deadline || 0).getTime()
          bValue = new Date(b.deadline || 0).getTime()
          break
        case 'difficulty':
          aValue = a.difficulty || 0
          bValue = b.difficulty || 0
          break
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        default:
          aValue = a.task_id
          bValue = b.task_id
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })

    setFilteredTasks(filtered)
  }, [tasks, searchTerm, statusFilter, categoryFilter, assigneeFilter, sortBy, sortOrder])

  // ユニークな値の取得
  const uniqueStatuses: string[] = Array.from(new Set(tasks.map(t => t.status).filter(Boolean) as string[]))
  const uniqueCategories: string[] = Array.from(new Set(tasks.map(t => t.category).filter(Boolean) as string[]))
  const uniqueAssignees: string[] = Array.from(new Set(
    tasks.flatMap(t => {
      const assigneeIds = Array.isArray(t.assignee_id) ? t.assignee_id : t.assignee_id ? [t.assignee_id] : []
      return assigneeIds
    }).filter(Boolean) as string[]
  ))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return '完了'
      case 'in_progress':
        return '進行中'
      case 'pending':
        return '未着手'
      default:
        return status
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '企画':
        return 'bg-blue-100 text-blue-800'
      case '実行':
        return 'bg-green-100 text-green-800'
      case '調整':
        return 'bg-yellow-100 text-yellow-800'
      case '探索':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleEditField = (task: Task, field: string) => {
    // 既存の編集をキャンセル
    if (editingField) {
      handleCancelEdit()
      // 少し遅延させてから新しい編集を開始
      setTimeout(() => {
        const editKey = `${task.task_id}_${field}`
        setEditingField(editKey)
        
        // 現在の値を編集フォームに設定（そのフィールドのみ）
        const currentValue = task[field as keyof Task]
        let formValue: any = ''
        
        if (field === 'start_date' || field === 'end_date' || field === 'deadline') {
          formValue = currentValue ? (currentValue as string).split('T')[0] : ''
        } else if (field === 'assignee_id') {
          // 複数担当者対応
          formValue = Array.isArray(currentValue) ? currentValue : currentValue ? [currentValue] : []
        } else {
          formValue = currentValue || ''
        }
        setEditForm({ [editKey]: formValue })
      }, 50)
    } else {
      const editKey = `${task.task_id}_${field}`
      setEditingField(editKey)
      
      // 現在の値を編集フォームに設定（そのフィールドのみ）
      const currentValue = task[field as keyof Task]
      let formValue: any = ''
      
      if (field === 'start_date' || field === 'end_date' || field === 'deadline') {
        formValue = currentValue ? (currentValue as string).split('T')[0] : ''
      } else if (field === 'assignee_id') {
        // 複数担当者対応
        formValue = Array.isArray(currentValue) ? currentValue : currentValue ? [currentValue] : []
      } else {
        formValue = currentValue || ''
      }
      setEditForm({ [editKey]: formValue })
    }
  }

  const handleSaveEdit = async (taskId: string, field: string) => {
    const editKey = `${taskId}_${field}`
    const value = editForm[editKey]
    
    try {
      const updates: any = {}
      
      if (field === 'status') {
        updates.status = value || 'pending'
      } else if (field === 'assignee_id') {
        // 複数担当者対応
        if (Array.isArray(value) && value.length > 0) {
          updates.assignee_id = value.length === 1 ? value[0] : value
        } else {
          updates.assignee_id = null
        }
      } else if (field === 'start_date') {
        if (value) {
          const date = new Date(value as string)
          updates.start_date = date.toISOString()
        }
      } else if (field === 'end_date') {
        if (value) {
          const date = new Date(value as string)
          updates.end_date = date.toISOString()
          // 後方互換性のためdeadlineも更新
          updates.deadline = date.toISOString()
        }
      } else if (field === 'deadline') {
        if (value) {
          const date = new Date(value as string)
          updates.deadline = date.toISOString()
          updates.end_date = date.toISOString()
        }
      } else if (field === 'difficulty') {
        updates.difficulty = parseInt(value as string) || 3
      } else if (field === 'category') {
        updates.category = value || '実行'
      } else if (field === 'title') {
        updates.title = value || ''
      } else if (field === 'description') {
        updates.description = value || ''
      } else if (field === 'ai_usage') {
        updates.ai_usage = value || ''
      }

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        // タスク一覧を再取得（WBSファイルから）
        const tasksResponse = await fetch('/api/wbs/tasks')
        if (tasksResponse.ok) {
          const data = await tasksResponse.json()
          const tasksArray = Array.isArray(data) ? data : []
          setTasks(tasksArray)
          setFilteredTasks(tasksArray)
        }
        setEditingField(null)
        setEditForm({})
        alert('✅ タスクが更新されました！WBSファイルにも保存されています。')
      } else {
        const error = await response.json()
        alert(`エラー: ${error.error || 'タスクの更新に失敗しました'}`)
      }
    } catch (error) {
      console.error('Error updating task:', error)
      alert('タスクの更新中にエラーが発生しました')
    }
  }

  const handleCancelEdit = () => {
    setEditingField(null)
    setEditForm({})
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-500">データを読み込んでいます...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">タスク一覧</h1>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">総タスク数</p>
          <p className="text-2xl font-bold">{tasks.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">完了</p>
          <p className="text-2xl font-bold text-green-600">
            {tasks.filter(t => t.status === 'completed').length}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">進行中</p>
          <p className="text-2xl font-bold text-yellow-600">
            {tasks.filter(t => t.status === 'in_progress').length}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">未着手</p>
          <p className="text-2xl font-bold text-gray-600">
            {tasks.filter(t => t.status === 'pending' || !t.status).length}
          </p>
        </div>
      </div>

      {/* フィルタと検索 */}
      <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* 検索 */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              検索
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="タスク名、説明、IDで検索..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ステータスフィルタ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ステータス
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべて</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>

          {/* カテゴリフィルタ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリ
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべて</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* 担当者フィルタ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              担当者
            </label>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべて</option>
              <option value="unassigned">未割り当て</option>
              {uniqueAssignees.map(assigneeId => {
                const task = tasks.find(t => t.assignee_id === assigneeId)
                return (
                  <option key={assigneeId} value={assigneeId}>
                    {task?.assignee_name || assigneeId}
                  </option>
                )
              })}
            </select>
          </div>

          {/* ソート */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ソート
            </label>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
              <option value="start_date">開始日</option>
              <option value="end_date">終了日</option>
              <option value="difficulty">難易度</option>
              <option value="title">タイトル</option>
              <option value="status">ステータス</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                title={sortOrder === 'asc' ? '昇順' : '降順'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* タスク一覧 */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  タスクID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  タイトル
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  カテゴリ
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  難易度
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  開始日
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  終了日
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  担当者
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AI活用
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                    タスクが見つかりませんでした
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task.task_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-600">
                      {task.task_id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{task.title || '(タイトルなし)'}</div>
                      {task.description && (
                        <div className="text-xs text-gray-500 mt-1">{task.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${getCategoryColor(task.category)}`}>
                        {task.category || '未設定'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {task.difficulty || 0}/5
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {editingField === `${task.task_id}_start_date` ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            value={editForm[`${task.task_id}_start_date`] || (task.start_date ? task.start_date.split('T')[0] : '')}
                            onChange={(e) => setEditForm({ [`${task.task_id}_start_date`]: e.target.value })}
                            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(task.task_id, 'start_date')}
                            className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                            title="保存"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500"
                            title="キャンセル"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {task.start_date ? new Date(task.start_date).toLocaleDateString('ja-JP') : '未設定'}
                          </span>
                          {editingField === null && (
                            <button
                              onClick={() => handleEditField(task, 'start_date')}
                              className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
                              title="開始日を編集"
                            >
                              ✏️
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {editingField === `${task.task_id}_end_date` ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            value={editForm[`${task.task_id}_end_date`] || (task.end_date || task.deadline ? (task.end_date || task.deadline)!.split('T')[0] : '')}
                            onChange={(e) => setEditForm({ [`${task.task_id}_end_date`]: e.target.value })}
                            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(task.task_id, 'end_date')}
                            className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                            title="保存"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500"
                            title="キャンセル"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {task.end_date || task.deadline ? new Date(task.end_date || task.deadline!).toLocaleDateString('ja-JP') : '未設定'}
                          </span>
                          {editingField === null && (
                            <button
                              onClick={() => handleEditField(task, 'end_date')}
                              className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
                              title="終了日を編集"
                            >
                              ✏️
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {editingField === `${task.task_id}_status` ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={String(editForm[`${task.task_id}_status`] || task.status || 'pending')}
                            onChange={(e) => setEditForm({ [`${task.task_id}_status`]: e.target.value })}
                            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          >
                            <option value="pending">未着手</option>
                            <option value="in_progress">進行中</option>
                            <option value="completed">完了</option>
                          </select>
                          <button
                            onClick={() => handleSaveEdit(task.task_id, 'status')}
                            className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                            title="保存"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500"
                            title="キャンセル"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(task.status)}`}>
                            {getStatusLabel(task.status || 'pending')}
                          </span>
                          {editingField === null && (
                            <button
                              onClick={() => handleEditField(task, 'status')}
                              className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
                              title="ステータスを編集"
                            >
                              ✏️
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {editingField === `${task.task_id}_assignee_id` ? (
                        <div className="flex flex-col gap-2 min-w-[200px]">
                          <select
                            multiple
                            size={Math.min(students.length + 1, 5)}
                            value={Array.isArray(editForm[`${task.task_id}_assignee_id`]) 
                              ? editForm[`${task.task_id}_assignee_id`] 
                              : editForm[`${task.task_id}_assignee_id`] 
                                ? [editForm[`${task.task_id}_assignee_id`]]
                                : []}
                            onChange={(e) => {
                              const selected = Array.from(e.target.selectedOptions, option => option.value)
                              setEditForm({ [`${task.task_id}_assignee_id`]: selected.length > 0 ? selected : undefined })
                            }}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          >
                            {students.length > 0 ? (
                              students.map(student => (
                                <option key={student.student_id} value={student.student_id}>
                                  {student.name || student.student_id}
                                </option>
                              ))
                            ) : (
                              <option disabled>メンバーを読み込み中...</option>
                            )}
                          </select>
                          <p className="text-xs text-gray-500">Ctrl/Cmdキーを押しながらクリックで複数選択</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveEdit(task.task_id, 'assignee_id')}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                              title="保存"
                            >
                              保存
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500"
                              title="キャンセル"
                            >
                              キャンセル
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                          {(() => {
                            const assigneeIds = Array.isArray(task.assignee_id) ? task.assignee_id : task.assignee_id ? [task.assignee_id] : []
                            const assigneeNames = Array.isArray(task.assignee_name) ? task.assignee_name : task.assignee_name ? [task.assignee_name] : []
                            
                            if (assigneeIds.length === 0) {
                              return <span className="text-gray-400 italic">未割り当て</span>
                            }
                            
                            return assigneeIds.map((id, idx) => (
                              <Link
                                key={id || idx}
                                href={`/student/${id}`}
                                className="text-blue-600 hover:underline font-medium"
                              >
                                {assigneeNames[idx] || id}
                              </Link>
                            )).reduce((acc, el, idx) => idx === 0 ? [el] : [...acc, <span key={`sep-${idx}`} className="text-gray-400">,</span>, el], [] as any[])
                          })()}
                          {editingField === null && (
                            <button
                              onClick={() => handleEditField(task, 'assignee_id')}
                              className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
                              title="担当者を編集"
                            >
                              ✏️
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {task.ai_usage ? (
                        <div className="max-w-xs">
                          {expandedAIUsage.has(task.task_id) ? (
                            <div>
                              <div className="max-h-64 overflow-y-auto bg-gray-50 p-2 rounded border border-gray-200 mb-2">
                                <p className="text-xs text-gray-700 whitespace-pre-line">{task.ai_usage}</p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    const newSet = new Set(expandedAIUsage)
                                    newSet.delete(task.task_id)
                                    setExpandedAIUsage(newSet)
                                  }}
                                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                  title="折りたたむ"
                                >
                                  ▲ 折りたたむ
                                </button>
                                <button
                                  onClick={async () => {
                                    try {
                                      const response = await fetch('/api/tasks/generate-ai-usage', {
                                        method: 'PUT',
                                        headers: {
                                          'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({ task_id: task.task_id })
                                      })
                                      if (response.ok) {
                                        const data = await response.json()
                                        // タスク一覧を再取得
                                        const tasksResponse = await fetch('/api/tasks')
                                        if (tasksResponse.ok) {
                                          const tasksData = await tasksResponse.json()
                                          setTasks(Array.isArray(tasksData) ? tasksData : [])
                                          setFilteredTasks(Array.isArray(tasksData) ? tasksData : [])
                                        }
                                        alert('AI活用方法を再生成しました')
                                      } else {
                                        alert('AI活用方法の生成に失敗しました')
                                      }
                                    } catch (error) {
                                      console.error('Error generating AI usage:', error)
                                      alert('エラーが発生しました')
                                    }
                                  }}
                                  className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                  title="AI活用方法を再生成"
                                >
                                  🔄 再生成
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="mb-2">
                                <p className="text-xs text-gray-600" style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {(() => {
                                    const firstLine = task.ai_usage.split('\n')[0]
                                    return firstLine.length > 60 ? firstLine.substring(0, 60) + '...' : firstLine
                                  })()}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    const newSet = new Set(expandedAIUsage)
                                    newSet.add(task.task_id)
                                    setExpandedAIUsage(newSet)
                                  }}
                                  className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                                  title="詳細を表示"
                                >
                                  ▼ 詳細を見る
                                </button>
                                <button
                                  onClick={async () => {
                                    try {
                                      const response = await fetch('/api/tasks/generate-ai-usage', {
                                        method: 'PUT',
                                        headers: {
                                          'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({ task_id: task.task_id })
                                      })
                                      if (response.ok) {
                                        const data = await response.json()
                                        // タスク一覧を再取得
                                        const tasksResponse = await fetch('/api/tasks')
                                        if (tasksResponse.ok) {
                                          const tasksData = await tasksResponse.json()
                                          setTasks(Array.isArray(tasksData) ? tasksData : [])
                                          setFilteredTasks(Array.isArray(tasksData) ? tasksData : [])
                                        }
                                        alert('AI活用方法を再生成しました')
                                      } else {
                                        alert('AI活用方法の生成に失敗しました')
                                      }
                                    } catch (error) {
                                      console.error('Error generating AI usage:', error)
                                      alert('エラーが発生しました')
                                    }
                                  }}
                                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                  title="AI活用方法を再生成"
                                >
                                  🔄
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <span className="text-xs text-gray-400">未設定</span>
                          <button
                            onClick={async () => {
                              try {
                                const response = await fetch('/api/tasks/generate-ai-usage', {
                                  method: 'PUT',
                                  headers: {
                                    'Content-Type': 'application/json'
                                  },
                                  body: JSON.stringify({ task_id: task.task_id })
                                })
                                if (response.ok) {
                                  const data = await response.json()
                                  // タスク一覧を再取得
                                  const tasksResponse = await fetch('/api/tasks')
                                  if (tasksResponse.ok) {
                                    const tasksData = await tasksResponse.json()
                                    setTasks(Array.isArray(tasksData) ? tasksData : [])
                                    setFilteredTasks(Array.isArray(tasksData) ? tasksData : [])
                                  }
                                  alert('AI活用方法を生成しました')
                                } else {
                                  alert('AI活用方法の生成に失敗しました')
                                }
                              } catch (error) {
                                console.error('Error generating AI usage:', error)
                                alert('エラーが発生しました')
                              }
                            }}
                            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                            title="AI活用方法を生成"
                          >
                            ✨ 生成
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs text-gray-500">-</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ページネーション情報 */}
      <div className="mt-4 text-sm text-gray-600 mb-6">
        表示中: {filteredTasks.length} / {tasks.length} タスク
      </div>
    </div>
  )
}

