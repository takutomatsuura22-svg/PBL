/**
 * スキル自動計算のテストスクリプト
 */

const fs = require('fs')
const path = require('path')

// .env.localから環境変数を読み込む
const envPath1 = path.join(__dirname, '..', '.env.local')
const envPath2 = path.join(__dirname, '..', 'frontend', '.env.local')
const envPath = fs.existsSync(envPath1) ? envPath1 : (fs.existsSync(envPath2) ? envPath2 : null)

if (!envPath || !fs.existsSync(envPath)) {
  console.error('❌ .env.localファイルが見つかりません')
  console.error(`   探したパス: ${envPath1}`)
  console.error(`   探したパス: ${envPath2}`)
  process.exit(1)
}

const envContent = fs.readFileSync(envPath, 'utf-8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const trimmed = line.trim()
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=')
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim()
    }
  }
})

const AIRTABLE_API_KEY = envVars.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = envVars.AIRTABLE_BASE_ID
const AIRTABLE_STUDENTS_TABLE = envVars.AIRTABLE_STUDENTS_TABLE || 'Students'
const AIRTABLE_TASKS_TABLE = envVars.AIRTABLE_TASKS_TABLE || 'Tasks'

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('❌ AIRTABLE_API_KEY または AIRTABLE_BASE_ID が設定されていません')
  process.exit(1)
}

// @ts-ignore
const Airtable = require('airtable')
const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID)

// スキル計算ロジックをインポート（簡易版を実装）
function calculateSkillsFromTasks(studentId, tasks) {
  const allCategories = [
    '企画', '実行', '調整', '探索',
    'デザイン', '開発', '分析', 'ドキュメント作成',
    'コミュニケーション', 'リーダーシップ', 'プレゼンテーション', '問題解決'
  ]

  const skills = {}
  
  for (const category of allCategories) {
    const categoryTasks = tasks.filter(t => {
      const taskCategory = t.category || t['Category'] || ''
      return taskCategory === category
    })

    if (categoryTasks.length === 0) {
      skills[category] = { score: 3.0, confidence: 0.0, dataPoints: 0 }
      continue
    }

    // 方法1: タスク完了率ベース（30%）
    const completed = categoryTasks.filter(t => {
      const status = t.status || t['Status'] || 'pending'
      return status === 'completed'
    }).length
    const completionRate = completed / categoryTasks.length
    const completionScore = 1 + (completionRate * 4)

    // 方法2: 難易度適応度ベース（30%）
    const completedTasks = categoryTasks.filter(t => {
      const status = t.status || t['Status'] || 'pending'
      return status === 'completed'
    })
    let difficultyScore = 3.0
    if (completedTasks.length > 0) {
      const avgDifficulty = completedTasks.reduce((sum, t) => {
        const diff = t.difficulty || t['Difficulty'] || 3
        return sum + diff
      }, 0) / completedTasks.length
      difficultyScore = Math.max(1, Math.min(5, Math.round(avgDifficulty * 10) / 10))
    }

    // 方法3: 完了速度ベース（20%）
    let speedScore = 3.0
    const tasksWithDates = completedTasks.filter(t => {
      return (t.start_date || t['Start Date']) && (t.end_date || t['End Date'])
    })
    if (tasksWithDates.length > 0) {
      const efficiencies = tasksWithDates.map(t => {
        const startDate = new Date(t.start_date || t['Start Date'])
        const endDate = new Date(t.end_date || t['End Date'])
        const actualDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        const actualHours = actualDays * 8
        const estimatedHours = t.estimated_hours || t['Estimated Hours'] || actualHours
        return estimatedHours / Math.max(actualHours, 0.1)
      })
      const avgEfficiency = efficiencies.reduce((sum, e) => sum + e, 0) / efficiencies.length
      if (avgEfficiency >= 1.2) {
        speedScore = 3.0 + (avgEfficiency - 1.2) * 5
      } else if (avgEfficiency >= 1.0) {
        speedScore = 3.0 + (avgEfficiency - 1.0) * 5
      } else {
        speedScore = 3.0 - (1.0 - avgEfficiency) * 10
      }
      speedScore = Math.max(1, Math.min(5, Math.round(speedScore * 10) / 10))
    }

    // 方法4: MBTIベース（20%）
    // これは学生データから取得する必要があるため、ここでは3.0をデフォルトとする
    const mbtiBase = 3.0

    // 重み付け平均
    const finalScore = (
      completionScore * 0.3 +
      difficultyScore * 0.3 +
      speedScore * 0.2 +
      mbtiBase * 0.2
    )

    const confidence = Math.min(1.0, completedTasks.length / 10)

    skills[category] = {
      score: Math.max(1, Math.min(5, Math.round(finalScore * 10) / 10)),
      confidence: confidence,
      dataPoints: categoryTasks.length,
      breakdown: {
        completionRate: completionScore,
        difficultyAdaptation: difficultyScore,
        speed: speedScore,
        mbtiBase: mbtiBase
      }
    }
  }

  return skills
}

async function main() {
  console.log('🧪 スキル自動計算のテストを開始します\n')

  try {
    // 学生データを取得
    const students = []
    await base(AIRTABLE_STUDENTS_TABLE)
      .select({
        view: 'Grid view',
        maxRecords: 10 // テスト用に10件のみ
      })
      .eachPage((pageRecords, fetchNextPage) => {
        pageRecords.forEach(record => {
          students.push({
            id: record.id,
            student_id: record.fields.student_id || record.fields['Student ID'] || record.id,
            name: record.fields.name || record.fields['Name'] || '',
            MBTI: record.fields.MBTI || record.fields['MBTI'] || ''
          })
        })
        fetchNextPage()
      })

    console.log(`📋 ${students.length}件の学生を取得しました\n`)

    // タスクデータを取得
    const allTasks = []
    await base(AIRTABLE_TASKS_TABLE)
      .select({
        view: 'Grid view'
      })
      .eachPage((pageRecords, fetchNextPage) => {
        pageRecords.forEach(record => {
          const assigneeId = record.fields.assignee_id || record.fields['Assignee ID'] || ''
          const assigneeIds = Array.isArray(assigneeId) ? assigneeId : [assigneeId]
          
          allTasks.push({
            task_id: record.fields.task_id || record.fields['Task ID'] || record.id,
            category: record.fields.category || record.fields['Category'] || '',
            difficulty: record.fields.difficulty || record.fields['Difficulty'] || 3,
            status: record.fields.status || record.fields['Status'] || 'pending',
            assignee_id: assigneeIds,
            estimated_hours: record.fields.estimated_hours || record.fields['Estimated Hours'],
            start_date: record.fields.start_date || record.fields['Start Date'],
            end_date: record.fields.end_date || record.fields['End Date']
          })
        })
        fetchNextPage()
      })

    console.log(`📋 ${allTasks.length}件のタスクを取得しました\n`)

    // 各学生のスキルを計算
    for (const student of students) {
      console.log(`\n👤 ${student.name} (${student.student_id})`)
      console.log('─'.repeat(50))

      // 学生のタスクを抽出
      const studentTasks = allTasks.filter(t => {
        return t.assignee_id.includes(student.student_id)
      })

      console.log(`📊 タスク数: ${studentTasks.length}件`)

      if (studentTasks.length === 0) {
        console.log('  ⚠️  タスクがないため、スキル計算をスキップします')
        continue
      }

      // スキルを計算
      const skills = calculateSkillsFromTasks(student.student_id, studentTasks)

      // 結果を表示
      console.log('\n📈 計算されたスキル値:')
      for (const [category, data] of Object.entries(skills)) {
        const confidenceEmoji = data.confidence >= 0.7 ? '🟢' : data.confidence >= 0.4 ? '🟡' : '🔴'
        console.log(`  ${category}: ${data.score.toFixed(1)}/5.0 ${confidenceEmoji} (信頼度: ${(data.confidence * 100).toFixed(0)}%, データポイント: ${data.dataPoints})`)
        
        if (data.dataPoints > 0) {
          console.log(`    - 完了率: ${data.breakdown.completionRate.toFixed(1)}`)
          console.log(`    - 難易度適応: ${data.breakdown.difficultyAdaptation.toFixed(1)}`)
          console.log(`    - 速度: ${data.breakdown.speed.toFixed(1)}`)
          console.log(`    - MBTIベース: ${data.breakdown.mbtiBase.toFixed(1)}`)
        }
      }

      // 信頼度が高いスキルを推奨更新
      const recommendedUpdates = {}
      for (const [category, data] of Object.entries(skills)) {
        if (data.confidence >= 0.5 && data.dataPoints >= 3) {
          recommendedUpdates[`skill_${category}`] = data.score
        }
      }

      if (Object.keys(recommendedUpdates).length > 0) {
        console.log('\n💡 推奨更新（信頼度50%以上、データポイント3以上）:')
        for (const [key, value] of Object.entries(recommendedUpdates)) {
          console.log(`  - ${key}: ${value}`)
        }
      }
    }

    console.log('\n✨ テストが完了しました！')

  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
    process.exit(1)
  }
}

main().catch(error => {
  console.error('❌ エラーが発生しました:', error)
  process.exit(1)
})

