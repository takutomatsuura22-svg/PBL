'use client'

import React from 'react'
import Link from 'next/link'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

// Recharts型定義の問題を回避
const XAxisAny = XAxis as any
const YAxisAny = YAxis as any
const CartesianGridAny = CartesianGrid as any
const TooltipAny = Tooltip as any
const ScatterAny = Scatter as any
import Card from '@/components/Card'

interface Student {
  student_id: string
  name: string
  motivation_score: number
  load_score: number
  danger_score?: number
  team_id?: string
}

export default function DashboardPage() {
  const [students, setStudents] = React.useState<Student[]>([])
  const [teams, setTeams] = React.useState<any[]>([])
  const [tasks, setTasks] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [mounted, setMounted] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    // クライアント側でのみ実行
    if (typeof window === 'undefined') return
    
    try {
      setMounted(true)
      
      const fetchData = async () => {
        try {
          const [studentsRes, teamsRes, tasksRes] = await Promise.all([
            fetch('/api/students').catch(err => {
              console.error('Students API error:', err)
              return { ok: false, json: async () => [] }
            }),
            fetch('/api/teams').catch(err => {
              console.error('Teams API error:', err)
              return { ok: false, json: async () => [] }
            }),
            fetch('/api/tasks').catch(err => {
              console.error('Tasks API error:', err)
              return { ok: false, json: async () => [] }
            })
          ])
          
          const studentsData = studentsRes.ok ? await studentsRes.json() : []
          const teamsData = teamsRes.ok ? await teamsRes.json() : []
          const tasksData = tasksRes.ok ? await tasksRes.json() : []
          
          console.log('📊 学生数:', Array.isArray(studentsData) ? studentsData.length : 0, '名')
          
          setStudents(Array.isArray(studentsData) ? studentsData : [])
          setTeams(Array.isArray(teamsData) ? teamsData : [])
          setTasks(Array.isArray(tasksData) ? tasksData : [])
        } catch (error: any) {
          console.error('データ取得エラー:', error)
          setError(error.message || 'データの取得に失敗しました')
          setStudents([])
          setTeams([])
          setTasks([])
        } finally {
          setLoading(false)
        }
      }
      
      fetchData()
    } catch (error: any) {
      console.error('初期化エラー:', error)
      setError(error.message || 'ページの初期化に失敗しました')
      setLoading(false)
    }
  }, [])

  // 2軸マップ用のデータ準備
  const scatterData = students.map(student => ({
    x: student.motivation_score || 3,
    y: student.load_score || 3,
    name: student.name,
    student_id: student.student_id,
    danger_score: student.danger_score || 0
  }))

  // 危険領域の学生（モチベーション低・タスク量高）
  const dangerStudents = students.filter(s => 
    (s.motivation_score <= 2 && s.load_score >= 4) || 
    (s.danger_score && s.danger_score >= 4)
  )

  // 注意領域の学生（モチベーション低またはタスク量高）
  const warningStudents = students.filter(s => 
    !dangerStudents.includes(s) && 
    (s.motivation_score <= 2 || s.load_score >= 4)
  )

  // 良好な学生
  const goodStudents = students.filter(s => 
    !dangerStudents.includes(s) && !warningStudents.includes(s)
  )

  // 完了タスク数
  const completedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'done').length
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

  // 色の決定関数
  const getColor = (student: any) => {
    if (student.danger_score >= 4 || (student.x <= 2 && student.y >= 4)) {
      return '#ff3b30' // 危険: 赤
    } else if (student.x <= 2 || student.y >= 4) {
      return '#ff9500' // 注意: オレンジ
    } else {
      return '#34c759' // 良好: 緑
    }
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] p-8">
        <div className="max-w-7xl mx-auto">
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
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-4">エラーが発生しました</h2>
            <p className="text-[#86868b] mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#00BFFF] text-white rounded-xl hover:bg-[#0099CC] transition-colors"
            >
              ページをリロード
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-[#f5f5f7] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-semibold text-[#1d1d1f] mb-2">二軸マップ</h1>
            <p className="text-[#86868b]">プロジェクトの概要を確認できます</p>
          </div>
          
          {/* 統計カード */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-medium text-[#86868b] mb-2">総生徒数</h3>
              <p className="text-3xl font-semibold text-[#1d1d1f]">{students.length}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-medium text-[#86868b] mb-2">総タスク数</h3>
              <p className="text-3xl font-semibold text-[#1d1d1f]">{tasks.length}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-medium text-[#86868b] mb-2">完了率</h3>
              <p className="text-3xl font-semibold text-[#1d1d1f]">{completionRate}%</p>
            </div>
          </div>

          {/* 2軸マップ */}
          {scatterData.length > 0 && (
            <Card className="p-6 mb-8">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-2">2軸マップ（モチベーション × タスク量）</h2>
                <p className="text-sm text-[#86868b]">各学生の状態を可視化しています</p>
              </div>
              
              <ResponsiveContainer width="100%" height={600}>
                <ScatterChart
                  margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                >
                  <CartesianGridAny strokeDasharray="3 3" stroke="#e8e8ed" />
                  <XAxisAny 
                    type="number" 
                    dataKey="x" 
                    name="モチベーション"
                    domain={[0.5, 5.5]}
                    label={{ value: 'モチベーション', position: 'insideBottom', offset: -15, style: { textAnchor: 'middle', fontSize: 14, fontWeight: 600 } }}
                    ticks={[1, 2, 3, 4, 5]}
                  />
                  <YAxisAny 
                    type="number" 
                    dataKey="y" 
                    name="タスク量"
                    domain={[0.5, 5.5]}
                    label={{ value: 'タスク量', angle: -90, position: 'insideLeft', offset: 10, style: { textAnchor: 'middle', fontSize: 14, fontWeight: 600 } }}
                    ticks={[1, 2, 3, 4, 5]}
                  />
                  <TooltipAny 
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white border border-[#e8e8ed] rounded-lg p-3 shadow-lg">
                            <p className="font-semibold text-[#1d1d1f]">{data.name}</p>
                            <p className="text-sm text-[#86868b]">モチベーション: {data.x.toFixed(1)}</p>
                            <p className="text-sm text-[#86868b]">タスク量: {data.y.toFixed(1)}</p>
                            {data.danger_score > 0 && (
                              <p className="text-sm text-[#ff3b30]">危険度: {data.danger_score.toFixed(1)}</p>
                            )}
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <ScatterAny 
                    name="学生" 
                    data={scatterData} 
                    fill="#00BFFF"
                    shape="circle"
                    r={8}
                  >
                    {scatterData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getColor(entry)} />
                    ))}
                  </ScatterAny>
                </ScatterChart>
              </ResponsiveContainer>
              
              {/* 学生名のリスト表示 */}
              <div className="mt-6 pt-6 border-t border-[#e8e8ed]">
                <p className="text-sm font-semibold text-[#1d1d1f] mb-3">表示中の学生 ({scatterData.length}名):</p>
                <div className="flex flex-wrap gap-2">
                  {scatterData.map((student, index) => (
                    <Link
                      key={student.student_id}
                      href={`/student/${student.student_id}`}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-white hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: getColor(student) }}
                    >
                      {student.name}
                      <span className="text-xs opacity-90">
                        (M:{student.x.toFixed(1)} / L:{student.y.toFixed(1)})
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* 凡例 */}
              <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-[#e8e8ed]">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#ff3b30]"></div>
                  <span className="text-sm text-[#1d1d1f]">危険</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#ff9500]"></div>
                  <span className="text-sm text-[#1d1d1f]">注意</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#34c759]"></div>
                  <span className="text-sm text-[#1d1d1f]">良好</span>
                </div>
              </div>
            </Card>
          )}

          {/* 学生一覧（ステータス別） */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* 危険領域 */}
            {dangerStudents.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-[#ff3b30] mb-4">⚠️ 危険領域 ({dangerStudents.length}名)</h3>
                <div className="space-y-2">
                  {dangerStudents.map(student => (
                    <Link
                      key={student.student_id}
                      href={`/student/${student.student_id}`}
                      className="block p-3 rounded-xl border border-[#ff3b30]/20 bg-[#ff3b30]/5 hover:bg-[#ff3b30]/10 transition-colors"
                    >
                      <p className="font-medium text-[#1d1d1f]">{student.name}</p>
                      <p className="text-xs text-[#86868b] mt-1">
                        モチベーション: {student.motivation_score.toFixed(1)} / タスク量: {student.load_score.toFixed(1)}
                      </p>
                    </Link>
                  ))}
                </div>
              </Card>
            )}

            {/* 注意領域 */}
            {warningStudents.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-[#ff9500] mb-4">⚠️ 注意領域 ({warningStudents.length}名)</h3>
                <div className="space-y-2">
                  {warningStudents.map(student => (
                    <Link
                      key={student.student_id}
                      href={`/student/${student.student_id}`}
                      className="block p-3 rounded-xl border border-[#ff9500]/20 bg-[#ff9500]/5 hover:bg-[#ff9500]/10 transition-colors"
                    >
                      <p className="font-medium text-[#1d1d1f]">{student.name}</p>
                      <p className="text-xs text-[#86868b] mt-1">
                        モチベーション: {student.motivation_score.toFixed(1)} / タスク量: {student.load_score.toFixed(1)}
                      </p>
                    </Link>
                  ))}
                </div>
              </Card>
            )}

            {/* 良好 */}
            {goodStudents.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-[#34c759] mb-4">✅ 良好 ({goodStudents.length}名)</h3>
                <div className="space-y-2">
                  {goodStudents.map(student => (
                    <Link
                      key={student.student_id}
                      href={`/student/${student.student_id}`}
                      className="block p-3 rounded-xl border border-[#34c759]/20 bg-[#34c759]/5 hover:bg-[#34c759]/10 transition-colors"
                    >
                      <p className="font-medium text-[#1d1d1f]">{student.name}</p>
                      <p className="text-xs text-[#86868b] mt-1">
                        モチベーション: {student.motivation_score.toFixed(1)} / タスク量: {student.load_score.toFixed(1)}
                      </p>
                    </Link>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
