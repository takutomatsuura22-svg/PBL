import { NextResponse } from 'next/server'
import { getStudents, getTasks } from '@/lib/datastore'
import { suggestTaskReassignments } from '@/lib/ai/task_reassign'

/**
 * 特定の学生に関連するタスク再割り当て提案を取得
 * その学生がfrom_student_idまたはto_student_idに含まれる提案を返す
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    const studentId = params.id
    const students = await getStudents()
    const tasks = await getTasks()

    // データ形式を変換
    const studentsForAI = students.map((s: any) => ({
      student_id: s.student_id,
      name: s.name,
      load_score: s.load_score,
      motivation_score: s.motivation_score,
      skill_企画: s.skill_企画,
      skill_実行: s.skill_実行,
      skill_調整: s.skill_調整,
      skill_探索: s.skill_探索,
      preferred_partners: s.preferred_partners,
      avoided_partners: s.avoided_partners,
      team_id: s.team_id
    }))

    const tasksForAI = tasks
      .filter((t: any) => t.status !== 'completed')
      .map((t: any) => ({
        task_id: t.task_id,
        title: t.title,
        category: t.category,
        difficulty: t.difficulty,
        estimated_hours: t.estimated_hours,
        assignee_id: t.assignee_id,
        deadline: t.deadline,
        status: t.status
      }))

    const suggestions = suggestTaskReassignments(studentsForAI, tasksForAI)

    // その学生に関連する提案のみをフィルタリング
    const studentReassignments = suggestions
      .filter(s => s.from_student_id === studentId || s.to_student_id === studentId)
      .map(s => {
        const fromStudent = students.find(st => st.student_id === s.from_student_id)
        const toStudent = students.find(st => st.student_id === s.to_student_id)
        const task = tasks.find(t => t.task_id === s.task_id)
        
        return {
          task_id: s.task_id,
          task_title: s.task_title,
          task_category: task?.category || '',
          task_difficulty: task?.difficulty || 0,
          task_estimated_hours: task?.estimated_hours || 0,
          task_deadline: task?.deadline || '',
          from_student_id: s.from_student_id,
          from_student_name: s.from_student_name,
          from_student_load: fromStudent?.load_score || 0,
          from_student_motivation: fromStudent?.motivation_score || 0,
          to_student_id: s.to_student_id,
          to_student_name: s.to_student_name,
          to_student_load: toStudent?.load_score || 0,
          to_student_motivation: toStudent?.motivation_score || 0,
          reason: s.reason,
          priority: s.priority,
          score: s.score,
          detailed_reason: generateDetailedReason(s, fromStudent, toStudent, task),
          impact_score: calculateImpactScore(s, fromStudent, toStudent)
        }
      })

    return NextResponse.json(studentReassignments) as Response
  } catch (error) {
    console.error('Error fetching student task reassignments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch task reassignments' },
      { status: 500 }
    ) as Response
  }
}

function generateDetailedReason(
  suggestion: any,
  fromStudent: any,
  toStudent: any,
  task: any
): string {
  const reasons: string[] = []
  
  if (fromStudent && toStudent && task) {
    // メインの理由（冒頭に配置）
    const loadDiff = fromStudent.load_score - toStudent.load_score
    const motivationDiff = toStudent.motivation_score - fromStudent.motivation_score
    
    if (loadDiff > 1) {
      reasons.push(`【緊急】${fromStudent.name}さんは現在タスク量が${fromStudent.load_score}/5と非常に高く、負荷軽減が急務です。${toStudent.name}さん（タスク量${toStudent.load_score}/5）に移管することで、${loadDiff.toFixed(1)}ポイント（${((loadDiff / 5) * 100).toFixed(0)}%）の負荷軽減が可能です。`)
    } else if (loadDiff > 0.5) {
      reasons.push(`${fromStudent.name}さん（タスク量${fromStudent.load_score}/5）から${toStudent.name}さん（タスク量${toStudent.load_score}/5）への移管により、負荷が${loadDiff.toFixed(1)}ポイント（${((loadDiff / 5) * 100).toFixed(0)}%）軽減されます。`)
    } else if (loadDiff > 0) {
      reasons.push(`負荷分散のため: ${fromStudent.name}さん（タスク量${fromStudent.load_score}/5）→ ${toStudent.name}さん（タスク量${toStudent.load_score}/5）`)
    }
    
    // モチベーションの比較
    if (motivationDiff > 1) {
      reasons.push(`【重要】${toStudent.name}さんはモチベーションが${toStudent.motivation_score}/5と高く（${fromStudent.name}さん: ${fromStudent.motivation_score}/5）、作業効率と品質が${((motivationDiff / 5) * 100).toFixed(0)}%向上する可能性があります。`)
    } else if (motivationDiff > 0.5) {
      reasons.push(`モチベーションが${fromStudent.motivation_score}/5から${toStudent.motivation_score}/5に上がり（${motivationDiff.toFixed(1)}ポイント向上）、作業効率が向上します。`)
    } else if (motivationDiff > 0) {
      reasons.push(`モチベーションの向上: ${fromStudent.name}さん（${fromStudent.motivation_score}/5）→ ${toStudent.name}さん（${toStudent.motivation_score}/5）`)
    }
    
    // スキル適性の詳細比較
    if (task.category) {
      const skillMap: Record<string, string> = {
        '企画': 'skill_企画',
        '実行': 'skill_実行',
        '調整': 'skill_調整',
        '探索': 'skill_探索'
      }
      const skillKey = skillMap[task.category]
      if (skillKey && toStudent[skillKey] !== undefined && fromStudent[skillKey] !== undefined) {
        const skillDiff = toStudent[skillKey] - fromStudent[skillKey]
        if (skillDiff > 1) {
          reasons.push(`【重要】${task.category}スキルが${fromStudent[skillKey]}/5から${toStudent[skillKey]}/5に大幅に向上（${skillDiff.toFixed(1)}ポイント、${((skillDiff / 5) * 100).toFixed(0)}%向上）。タスク「${task.title}」の品質と完了速度が大幅に向上します。`)
        } else if (skillDiff > 0.5) {
          reasons.push(`【推奨】${task.category}スキルが${fromStudent[skillKey]}/5から${toStudent[skillKey]}/5に上がり（${skillDiff.toFixed(1)}ポイント向上）、タスク「${task.title}」の品質が向上します。`)
        } else if (toStudent[skillKey] >= 3 && fromStudent[skillKey] < 3) {
          reasons.push(`${toStudent.name}さんは${task.category}スキルが${toStudent[skillKey]}/5と適性があり、${fromStudent.name}さん（${fromStudent[skillKey]}/5）より適任です。タスク「${task.title}」の品質向上が期待できます。`)
        } else if (toStudent[skillKey] > fromStudent[skillKey]) {
          reasons.push(`スキル適性の向上: ${fromStudent.name}さん（${task.category}スキル${fromStudent[skillKey]}/5）→ ${toStudent.name}さん（${toStudent[skillKey]}/5）`)
        }
      }
    }
    
    // タスクの詳細情報
    if (task.estimated_hours > 0) {
      reasons.push(`タスク情報: 見積もり時間${task.estimated_hours}時間、難易度${task.difficulty}/5`)
    }
    if (task.difficulty >= 4) {
      reasons.push(`【重要】高難易度タスク（${task.difficulty}/5）のため、スキル適性の高い${toStudent.name}さんへの移管が強く推奨されます。`)
    } else if (task.difficulty >= 3.5) {
      reasons.push(`中〜高難易度タスク（${task.difficulty}/5）のため、適切なスキルを持つ${toStudent.name}さんへの移管が推奨されます。`)
    }
    
    // 相性
    if (fromStudent.preferred_partners?.includes(toStudent.student_id)) {
      reasons.push(`${fromStudent.name}さんと${toStudent.name}さんは相性が良く、協働作業がスムーズです。`)
    }
  }
  
  return reasons.length > 0 
    ? reasons.join('\n\n') 
    : `負荷分散とスキル適性の向上のため、${fromStudent?.name || '現在の担当者'}さんから${toStudent?.name || '候補者'}さんへの移管を推奨します。`
}

/**
 * 影響度スコアを計算（0-100）
 */
function calculateImpactScore(
  suggestion: any,
  fromStudent: any,
  toStudent: any
): number {
  if (!fromStudent || !toStudent) return 0

  const loadDiff = fromStudent.load_score - toStudent.load_score
  const motivationDiff = toStudent.motivation_score - fromStudent.motivation_score
  
  // 影響度スコアの計算
  const impactScore = (loadDiff * 20) + (motivationDiff * 15) + (suggestion.score / 100 * 10)
  
  return Math.max(0, Math.min(100, Math.round(impactScore)))
}

