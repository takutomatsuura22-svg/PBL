/**
 * AIが生成する"声かけ例"
 */

interface StudentState {
  name: string
  motivation_score: number
  load_score: number
  MBTI: string
  strengths: string[]
  weaknesses: string[]
  recentTasks: Array<{
    title: string
    status: string
  }>
}

export interface EncouragementExample {
  examples: Array<{
    situation: string
    message: string
    tone: 'supportive' | 'motivational' | 'gentle' | 'energetic'
  }>
}

/**
 * 生徒の状態に応じた声かけ例を生成
 */
export function generateEncouragementExamples(
  student: StudentState
): EncouragementExample {
  const examples: EncouragementExample['examples'] = []
  
  // モチベーションが低い場合
  if (student.motivation_score <= 2) {
    if (student.load_score >= 4) {
      examples.push({
        situation: 'モチベーション低 × 負荷高',
        message: `${student.name}さん、最近忙しそうですね。無理をしすぎていませんか？一度タスクの優先順位を見直して、負担を減らす方法を一緒に考えませんか？`,
        tone: 'supportive'
      })
    } else {
      examples.push({
        situation: 'モチベーション低',
        message: `${student.name}さん、最近調子はどうですか？何か困っていることがあれば、いつでも相談してください。あなたの${student.strengths.join('や')}のスキルはチームにとって大切です。`,
        tone: 'gentle'
      })
    }
    
    // 完了したタスクがある場合
    const completedTasks = student.recentTasks.filter(t => t.status === 'completed')
    if (completedTasks.length > 0) {
      examples.push({
        situation: '達成を認める',
        message: `${student.name}さん、${completedTasks[0].title}のタスク、お疲れ様でした！着実に進められていますね。`,
        tone: 'supportive'
      })
    }
  }
  
  // 負荷が高い場合
  if (student.load_score >= 4 && student.motivation_score > 2) {
    examples.push({
      situation: '負荷高',
      message: `${student.name}さん、頑張りすぎていませんか？チームメンバーに相談して、タスクを分担することもできますよ。あなたの健康が第一です。`,
      tone: 'supportive'
    })
  }
  
  // モチベーションが高い場合
  if (student.motivation_score >= 4) {
    examples.push({
      situation: 'モチベーション高',
      message: `${student.name}さん、いつも積極的に取り組んでくれてありがとうございます！${student.strengths.join('や')}の分野で、さらに活躍してもらえると嬉しいです。`,
      tone: 'energetic'
    })
  }
  
  // MBTIに基づいた声かけ
  if (student.MBTI.startsWith('I')) {
    // 内向的タイプ
    examples.push({
      situation: '性格特性に配慮',
      message: `${student.name}さん、一人で集中して作業できる時間も大切にしてください。必要であれば、静かな環境を確保するお手伝いもできます。`,
      tone: 'gentle'
    })
  } else if (student.MBTI.startsWith('E')) {
    // 外向的タイプ
    examples.push({
      situation: '性格特性に配慮',
      message: `${student.name}さん、チームでの活動が活発ですね。他のメンバーとの協働も大切にしながら、進めていきましょう！`,
      tone: 'energetic'
    })
  }
  
  // 弱みをサポートする声かけ
  if (student.weaknesses.length > 0) {
    examples.push({
      situation: '成長支援',
      message: `${student.name}さん、${student.weaknesses[0]}の分野でサポートが必要でしたら、いつでも声をかけてください。一緒に成長していきましょう。`,
      tone: 'supportive'
    })
  }
  
  // デフォルトの声かけ（上記の条件に当てはまらない場合）
  if (examples.length === 0) {
    examples.push({
      situation: '一般的な声かけ',
      message: `${student.name}さん、お疲れ様です。何か困ったことがあれば、いつでも相談してください。`,
      tone: 'supportive'
    })
  }
  
  return { examples }
}

