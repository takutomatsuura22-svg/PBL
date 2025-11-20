'use client'

import React from 'react'
import Link from 'next/link'
import StatCard from '@/components/StatCard'
import Card from '@/components/Card'

interface Student {
  student_id: string
  name: string
  motivation_score: number
  load_score: number
  danger_score?: number
}

interface InterventionRecommendation {
  student_id: string
  student_name: string
  reason: string
  priority: 'high' | 'medium' | 'low'
  actions: string[]
}

interface TaskReassignment {
  task_id: string
  task_title: string
  from_student_id: string
  from_student_name: string
  to_student_id: string
  to_student_name: string
  reason: string
  priority: 'high' | 'medium' | 'low'
}

interface LeaderSupportNeed {
  leader_id: string
  leader_name: string
  team_name: string
  project_name: string
  support_score: number
  priority: 'high' | 'medium' | 'low'
  reasons: string[]
  leader_motivation: number
  leader_load: number
}

interface DelayedTaskAlert {
  task_id: string
  task_title: string
  assignee_name: string
  delay_days: number
  priority: 'critical' | 'high' | 'medium' | 'low'
}

export default function PMPage() {
  const [dangerRanking, setDangerRanking] = React.useState<Student[]>([])
  const [interventions, setInterventions] = React.useState<InterventionRecommendation[]>([])
  const [reassignments, setReassignments] = React.useState<TaskReassignment[]>([])
  const [leaderSupportNeeds, setLeaderSupportNeeds] = React.useState<LeaderSupportNeed[]>([])
  const [delayedTasks, setDelayedTasks] = React.useState<DelayedTaskAlert[]>([])
  const [processingReassignment, setProcessingReassignment] = React.useState<string | null>(null)

  const fetchWithTimeout = (url: string, timeout = 5000) => {
    return Promise.race([
      fetch(url).then(res => res.json()),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), timeout)
      )
    ])
  }

  React.useEffect(() => {
    // クライアント側でのみ実行
    if (typeof window === 'undefined') return

    Promise.allSettled([
      fetchWithTimeout('/api/pm/danger-ranking', 5000).catch(() => []),
      fetchWithTimeout('/api/pm/interventions', 5000).catch(() => []),
      fetchWithTimeout('/api/pm/task-reassignments', 5000).catch(() => []),
      fetchWithTimeout('/api/pm/leader-support', 5000).catch(() => []),
      fetchWithTimeout('/api/pm/delayed-tasks', 5000).catch(() => []),
    ]).then(([dangerData, interventionData, reassignmentData, leaderSupportData, delayedTaskData]) => {
      if (dangerData.status === 'fulfilled') {
        setDangerRanking(Array.isArray(dangerData.value) ? dangerData.value.slice(0, 5) : [])
      }
      if (interventionData.status === 'fulfilled') {
        setInterventions(Array.isArray(interventionData.value) ? interventionData.value.slice(0, 5) : [])
      }
      if (reassignmentData.status === 'fulfilled') {
        setReassignments(Array.isArray(reassignmentData.value) ? reassignmentData.value.slice(0, 5) : [])
      }
      if (leaderSupportData.status === 'fulfilled') {
        setLeaderSupportNeeds(Array.isArray(leaderSupportData.value) ? leaderSupportData.value : [])
      }
      if (delayedTaskData.status === 'fulfilled') {
        setDelayedTasks(Array.isArray(delayedTaskData.value) ? delayedTaskData.value.slice(0, 5) : [])
      }
    }).catch(error => {
      console.error('Error loading PM data:', error)
    })
  }, [])

  const priorityColors = {
    high: 'bg-[#ff3b30]/10 text-[#ff3b30]',
    medium: 'bg-[#ff9500]/10 text-[#ff9500]',
    low: 'bg-[#00BFFF]/10 text-[#00BFFF]',
    critical: 'bg-[#ff3b30]/10 text-[#ff3b30]',
  }

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
        setReassignments(prev => prev.filter(r => r.task_id !== taskId))
        
        // データを再取得
        const reassignmentsRes = await fetch('/api/pm/task-reassignments')
        if (reassignmentsRes.ok) {
          const reassignmentsData = await reassignmentsRes.json()
          setReassignments(Array.isArray(reassignmentsData) ? reassignmentsData.slice(0, 5) : [])
        }
        
        alert(result.message || 'タスクの再割り当てが完了しました。AirtableとWBSの担当者も更新されました。')
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
        body: JSON.stringify({ reason: 'PMページから拒否' })
      })

      if (response.ok) {
        // 成功したら提案リストから削除
        setReassignments(prev => prev.filter(r => r.task_id !== taskId))
        alert('タスク再割り当て提案を拒否しました')
      } else {
        const error = await response.json()
        alert(`エラー: ${error.error || '提案の拒否に失敗しました'}`)
      }
    } catch (error) {
      console.error('Error rejecting reassignment:', error)
      alert('提案の拒否中にエラーが発生しました')
    } finally {
      setProcessingReassignment(null)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-[#f5f5f7] p-8">
        <div className="max-w-7xl mx-auto">
          {/* ヘッダー */}
          <div className="mb-8">
            <h1 className="text-4xl font-semibold text-[#1d1d1f] mb-2 tracking-tight">
              AI提案・介入
            </h1>
            <p className="text-[#86868b]">プロジェクト管理と介入推奨</p>
          </div>

          {/* 統計カード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <StatCard
              label="介入推奨"
              value={interventions.length}
              icon="🔔"
              color="orange"
            />
            <StatCard
              label="タスク再割当"
              value={reassignments.length}
              icon="🔄"
              color="purple"
            />
            <StatCard
              label="遅延タスク"
              value={delayedTasks.length}
              icon="⏰"
              color="red"
            />
          </div>

          {/* 介入推奨 */}
          {interventions.length > 0 && (
            <Card className="p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-2 tracking-tight">
                    今週の介入推奨
                  </h2>
                  <p className="text-sm text-[#86868b]">上位5件を表示</p>
                </div>
                <Link
                  href="/pm/interventions"
                  className="text-sm font-medium text-[#00BFFF] hover:text-[#0099CC]"
                >
                  すべて見る →
                </Link>
              </div>
              
              <div className="space-y-3">
                {interventions.map((intervention) => (
                  <div
                    key={intervention.student_id}
                    className="p-4 rounded-xl border border-[#e8e8ed]"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-[#1d1d1f]">{intervention.student_name}</p>
                        <p className="text-sm text-[#86868b] mt-1">{intervention.reason}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${priorityColors[intervention.priority]}`}>
                        {intervention.priority === 'high' ? '高' : intervention.priority === 'medium' ? '中' : '低'}
                      </span>
                    </div>
                    {intervention.actions.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {intervention.actions.slice(0, 2).map((action, idx) => (
                          <li key={idx} className="text-sm text-[#86868b] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00BFFF]"></span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* タスク再割当提案 */}
          {reassignments.length > 0 && (
            <Card className="p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-2 tracking-tight">
                    AIタスク再割当提案
                  </h2>
                  <p className="text-sm text-[#86868b]">上位5件を表示（許可/拒否で判断できます）</p>
                </div>
                <Link
                  href="/pm/task-reassignments"
                  className="text-sm font-medium text-[#00BFFF] hover:text-[#0099CC]"
                >
                  すべて見る →
                </Link>
              </div>
              
              <div className="space-y-3">
                {reassignments.map((reassignment) => (
                  <div
                    key={reassignment.task_id}
                    className="p-4 rounded-xl border border-[#e8e8ed] hover:border-[#00BFFF]/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="font-medium text-[#1d1d1f] mb-1">{reassignment.task_title}</p>
                        <p className="text-sm text-[#86868b] mb-1">
                          <span className="font-medium">{reassignment.from_student_name}</span>
                          <span className="mx-2">→</span>
                          <span className="font-medium text-[#00BFFF]">{reassignment.to_student_name}</span>
                        </p>
                        <p className="text-sm text-[#86868b] mt-2">{reassignment.reason}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ml-4 ${priorityColors[reassignment.priority]}`}>
                        {reassignment.priority === 'high' ? '高' : reassignment.priority === 'medium' ? '中' : '低'}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleExecuteReassignment(reassignment.task_id, reassignment.to_student_id)}
                        disabled={processingReassignment === reassignment.task_id}
                        className="flex-1 px-4 py-2 bg-[#00BFFF] text-white text-sm font-medium rounded-lg hover:bg-[#0099CC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {processingReassignment === reassignment.task_id ? '処理中...' : '✅ 許可'}
                      </button>
                      <button
                        onClick={() => handleRejectReassignment(reassignment.task_id)}
                        disabled={processingReassignment === reassignment.task_id}
                        className="flex-1 px-4 py-2 bg-[#e8e8ed] text-[#1d1d1f] text-sm font-medium rounded-lg hover:bg-[#d1d1d6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {processingReassignment === reassignment.task_id ? '処理中...' : '❌ 拒否'}
                      </button>
                    </div>
                    <p className="text-xs text-[#86868b] mt-2">
                      💡 許可すると、AirtableとWBSの担当者も自動で更新されます
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 遅延タスク */}
          {delayedTasks.length > 0 && (
            <Card className="p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-2 tracking-tight">
                    WBS遅延アラート
                  </h2>
                  <p className="text-sm text-[#86868b]">上位5件を表示</p>
                </div>
                <Link
                  href="/pm/delayed-tasks"
                  className="text-sm font-medium text-[#00BFFF] hover:text-[#0099CC]"
                >
                  すべて見る →
                </Link>
              </div>
              
              <div className="space-y-3">
                {delayedTasks.map((task) => (
                  <div
                    key={task.task_id}
                    className="p-4 rounded-xl border border-[#e8e8ed]"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-[#1d1d1f]">{task.task_title}</p>
                        <p className="text-sm text-[#86868b] mt-1">
                          担当: {task.assignee_name} / 遅延: {task.delay_days}日
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${priorityColors[task.priority]}`}>
                        {task.priority === 'critical' ? '緊急' : task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 空状態 */}
          {interventions.length === 0 && 
           reassignments.length === 0 && 
           delayedTasks.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-[#86868b] text-lg">すべて順調です</p>
              <p className="text-sm text-[#86868b] mt-2">現在、特別な対応が必要な項目はありません</p>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
