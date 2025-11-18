import { NextResponse } from 'next/server'
import { getStudents, getTasks } from '@/lib/datastore'
import { calculateDangerScore } from '@/lib/ai/danger_score'

export async function GET(): Promise<Response> {
  try {
    // タイムアウト付きで読み込み
    const timeoutPromise = new Promise<Response>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 2000)
    )
    
    const loadPromise = (async () => {
      const [students, tasks] = await Promise.all([
        getStudents(),
        getTasks()
      ])
      
      const now = new Date()
      const studentsWithDanger = await Promise.all(
        students.map(async (student: any) => {
          const studentTasks = tasks.filter((t: any) => t.assignee_id === student.student_id)
          const overdueTasks = studentTasks.filter((t: any) => {
            if (t.status === 'completed') return false
            const deadline = new Date(t.deadline)
            return deadline < now
          }).length

          const dangerFactors = {
            motivation_score: student.motivation_score,
            load_score: student.load_score,
            overdue_tasks: overdueTasks,
            skill_gap: 0.3,
            recent_activity: 0.7,
            communication_gap: 0.2
          }

          const dangerScore = calculateDangerScore(dangerFactors)
          return {
            ...student,
            danger_score: dangerScore
          }
        })
      )

      // 危険度スコアでソート
      studentsWithDanger.sort((a, b) => (b.danger_score || 0) - (a.danger_score || 0))

      return NextResponse.json(Array.isArray(studentsWithDanger) ? studentsWithDanger : []) as Response
    })()
    
    return await Promise.race([loadPromise, timeoutPromise])
  } catch (error) {
    console.error('Error fetching danger ranking:', error)
    // エラー時でも空配列を返す（ページが表示されるように）
    return NextResponse.json([]) as Response
  }
}

