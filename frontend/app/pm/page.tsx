'use client'

import { useEffect, useState } from 'react'
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
  from_student_name: string
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
  const [dangerRanking, setDangerRanking] = useState<Student[]>([])
  const [interventions, setInterventions] = useState<InterventionRecommendation[]>([])
  const [reassignments, setReassignments] = useState<TaskReassignment[]>([])
  const [leaderSupportNeeds, setLeaderSupportNeeds] = useState<LeaderSupportNeed[]>([])
  const [delayedTasks, setDelayedTasks] = useState<DelayedTaskAlert[]>([])

  const fetchWithTimeout = (url: string, timeout = 5000) => {
    return Promise.race([
      fetch(url).then(res => res.json()),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), timeout)
      )
    ])
  }

  useEffect(() => {
    Promise.allSettled([
      fetchWithTimeout('/api/pm/danger-ranking', 5000),
      fetchWithTimeout('/api/pm/interventions', 5000),
      fetchWithTimeout('/api/pm/task-reassignments', 5000),
      fetchWithTimeout('/api/pm/leader-support', 5000),
      fetchWithTimeout('/api/pm/delayed-tasks', 5000),
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
    })
  }, [])

  const priorityColors = {
    high: 'bg-[#ff3b30]/10 text-[#ff3b30]',
    medium: 'bg-[#ff9500]/10 text-[#ff9500]',
    low: 'bg-[#007aff]/10 text-[#007aff]',
    critical: 'bg-[#ff3b30]/10 text-[#ff3b30]',
  }

  return (
    <>
      <div className="min-h-screen bg-[#f5f5f7] p-8">
        <div className="max-w-7xl mx-auto">
          {/* ヘッダー */}
          <div className="mb-8">
            <h1 className="text-4xl font-semibold text-[#1d1d1f] mb-2 tracking-tight">
              PMページ
            </h1>
            <p className="text-[#86868b]">プロジェクト管理と介入推奨</p>
          </div>

          {/* 統計カード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatCard
              label="危険メンバー"
              value={dangerRanking.filter(s => s.danger_score && s.danger_score >= 4).length}
              icon="⚠️"
              color="red"
            />
            <StatCard
              label="介入推奨"
              value={interventions.length}
              icon="🔔"
              color="orange"
            />
            <StatCard
              label="リーダー支援"
              value={leaderSupportNeeds.length}
              subtitle="名"
              icon="👤"
              color="blue"
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

          {/* 危険メンバーランキング */}
          {dangerRanking.length > 0 && (
            <Card className="p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-2 tracking-tight">
                    危険メンバーランキング
                  </h2>
                  <p className="text-sm text-[#86868b]">上位5名を表示</p>
                </div>
                <Link
                  href="/pm/danger-ranking"
                  className="text-sm font-medium text-[#007aff] hover:text-[#0051d5]"
                >
                  すべて見る →
                </Link>
              </div>
              
              <div className="space-y-2">
                {dangerRanking.map((student, index) => (
                  <Link
                    key={student.student_id}
                    href={`/student/${student.student_id}`}
                    className="flex items-center justify-between p-4 rounded-xl border border-[#e8e8ed] hover:bg-[#fafafa] transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#ff3b30]/10 flex items-center justify-center text-[#ff3b30] font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-[#1d1d1f]">{student.name}</p>
                        <p className="text-sm text-[#86868b]">
                          危険度: {(student.danger_score || 0).toFixed(1)} / 
                          モチベーション: {student.motivation_score.toFixed(1)} / 
                          負荷: {student.load_score.toFixed(1)}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      (student.danger_score || 0) >= 4.5 ? priorityColors.critical :
                      (student.danger_score || 0) >= 4 ? priorityColors.high :
                      priorityColors.medium
                    }`}>
                      {(student.danger_score || 0) >= 4.5 ? '緊急' : '高'}
                    </span>
                  </Link>
                ))}
              </div>
            </Card>
          )}

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
                  className="text-sm font-medium text-[#007aff] hover:text-[#0051d5]"
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
                            <span className="w-1.5 h-1.5 rounded-full bg-[#007aff]"></span>
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
                  <p className="text-sm text-[#86868b]">上位5件を表示</p>
                </div>
                <Link
                  href="/pm/task-reassignments"
                  className="text-sm font-medium text-[#007aff] hover:text-[#0051d5]"
                >
                  すべて見る →
                </Link>
              </div>
              
              <div className="space-y-3">
                {reassignments.map((reassignment) => (
                  <div
                    key={reassignment.task_id}
                    className="p-4 rounded-xl border border-[#e8e8ed]"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-[#1d1d1f]">{reassignment.task_title}</p>
                        <p className="text-sm text-[#86868b] mt-1">
                          {reassignment.from_student_name} → {reassignment.to_student_name}
                        </p>
                        <p className="text-sm text-[#86868b] mt-1">{reassignment.reason}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${priorityColors[reassignment.priority]}`}>
                        {reassignment.priority === 'high' ? '高' : reassignment.priority === 'medium' ? '中' : '低'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* リーダー支援 */}
          {leaderSupportNeeds.length > 0 && (
            <Card className="p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-2 tracking-tight">
                    リーダー支援が必要
                  </h2>
                  <p className="text-sm text-[#86868b]">{leaderSupportNeeds.length}名のリーダーが支援を必要としています</p>
                </div>
                <Link
                  href="/pm/leader-support"
                  className="text-sm font-medium text-[#007aff] hover:text-[#0051d5]"
                >
                  詳細を見る →
                </Link>
              </div>
              
              <div className="space-y-3">
                {leaderSupportNeeds.slice(0, 5).map((need) => (
                  <Link
                    key={need.leader_id}
                    href={`/student/${need.leader_id}`}
                    className="block p-4 rounded-xl border border-[#e8e8ed] hover:bg-[#fafafa] transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-[#1d1d1f]">{need.leader_name}</p>
                        <p className="text-sm text-[#86868b] mt-1">{need.team_name} - {need.project_name}</p>
                        <p className="text-sm text-[#86868b] mt-1">
                          モチベーション: {need.leader_motivation.toFixed(1)} / 
                          負荷: {need.leader_load.toFixed(1)}
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${priorityColors[need.priority]}`}>
                        {need.priority === 'high' ? '高' : need.priority === 'medium' ? '中' : '低'}
                      </span>
                    </div>
                  </Link>
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
                  className="text-sm font-medium text-[#007aff] hover:text-[#0051d5]"
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
          {dangerRanking.length === 0 && interventions.length === 0 && 
           reassignments.length === 0 && leaderSupportNeeds.length === 0 && 
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
