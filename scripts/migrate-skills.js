/**
 * 既存のstrengths/weaknessesデータからスキル値を推定して移行するスクリプト
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

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('❌ AIRTABLE_API_KEY または AIRTABLE_BASE_ID が設定されていません')
  process.exit(1)
}

// @ts-ignore
const Airtable = require('airtable')
const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID)

/**
 * strengths/weaknessesからスキル値を推定
 */
function estimateSkillFromStrengthsWeaknesses(category, strengths = [], weaknesses = []) {
  // カテゴリマッピング
  const categoryMap = {
    '企画': '企画',
    '実行': '実行',
    '調整': '調整',
    '探索': '探索',
    'デザイン': 'デザイン',
    '開発': '開発',
    '分析': '分析',
    'ドキュメント作成': 'ドキュメント作成',
    'コミュニケーション': 'コミュニケーション',
    'リーダーシップ': 'リーダーシップ',
    'プレゼンテーション': 'プレゼンテーション',
    '問題解決': '問題解決'
  }

  const normalizedCategory = categoryMap[category] || category

  // strengthsに含まれている場合
  if (strengths.includes(normalizedCategory)) {
    return 4.0 // 得意 = 4.0
  }

  // weaknessesに含まれている場合
  if (weaknesses.includes(normalizedCategory)) {
    return 2.0 // 不得意 = 2.0
  }

  // どちらにも含まれていない場合
  return 3.0 // 標準 = 3.0
}

/**
 * MBTIからスキル値を推定
 */
function estimateSkillFromMBTI(category, mbti = '') {
  if (!mbti || mbti.length < 4) return 3.0

  let base = 3.0

  // カテゴリマッピング
  const categoryMap = {
    '企画': 'planning',
    '実行': 'execution',
    '調整': 'coordination',
    '探索': 'exploration',
    'デザイン': 'design',
    '開発': 'development',
    '分析': 'analysis',
    'ドキュメント作成': 'documentation',
    'コミュニケーション': 'communication',
    'リーダーシップ': 'leadership',
    'プレゼンテーション': 'presentation',
    '問題解決': 'problem_solving'
  }

  const catKey = categoryMap[category] || category

  // E/I（外向/内向）
  if (mbti[0] === 'E') {
    if (catKey === 'coordination' || catKey === 'communication' || catKey === 'leadership' || catKey === 'presentation') {
      base += 0.3
    }
  } else {
    if (catKey === 'planning' || catKey === 'analysis' || catKey === 'documentation') {
      base += 0.2
    }
  }

  // S/N（感覚/直感）
  if (mbti[1] === 'S') {
    if (catKey === 'execution' || catKey === 'coordination' || catKey === 'development') {
      base += 0.3
    }
    if (catKey === 'planning' || catKey === 'exploration') {
      base -= 0.1
    }
  } else {
    if (catKey === 'planning' || catKey === 'exploration' || catKey === 'analysis') {
      base += 0.3
    }
    if (catKey === 'execution') {
      base -= 0.2
    }
  }

  // T/F（思考/感情）
  if (mbti[2] === 'T') {
    if (catKey === 'execution' || catKey === 'development' || catKey === 'analysis' || catKey === 'problem_solving') {
      base += 0.2
    }
  } else {
    if (catKey === 'coordination' || catKey === 'communication' || catKey === 'design') {
      base += 0.2
    }
  }

  // J/P（判断/知覚）
  if (mbti[3] === 'J') {
    if (catKey === 'execution' || catKey === 'coordination' || catKey === 'documentation' || catKey === 'problem_solving') {
      base += 0.1
    }
  } else {
    if (catKey === 'exploration' || catKey === 'planning' || catKey === 'design') {
      base += 0.1
    }
  }

  return Math.max(1, Math.min(5, Math.round(base * 10) / 10))
}

/**
 * スキル値を計算（strengths/weaknesses + MBTI）
 */
function calculateSkillValue(category, strengths = [], weaknesses = [], mbti = '') {
  // strengths/weaknessesから推定（重み: 60%）
  const fromStrengths = estimateSkillFromStrengthsWeaknesses(category, strengths, weaknesses)
  
  // MBTIから推定（重み: 40%）
  const fromMBTI = estimateSkillFromMBTI(category, mbti)
  
  // 重み付け平均
  const finalValue = (fromStrengths * 0.6) + (fromMBTI * 0.4)
  
  return Math.max(1, Math.min(5, Math.round(finalValue * 10) / 10))
}

async function main() {
  console.log('🚀 既存データを移行します（strengths/weaknesses → スキル値）\n')

  const allSkills = [
    '企画', '実行', '調整', '探索',
    'デザイン', '開発', '分析', 'ドキュメント作成',
    'コミュニケーション', 'リーダーシップ', 'プレゼンテーション', '問題解決'
  ]

  try {
    const records = []
    await base(AIRTABLE_STUDENTS_TABLE)
      .select({
        view: 'Grid view'
      })
      .eachPage((pageRecords, fetchNextPage) => {
        pageRecords.forEach(record => {
          records.push(record)
        })
        fetchNextPage()
      })

    console.log(`📋 ${records.length}件の学生レコードを取得しました\n`)

    let updateCount = 0
    let skipCount = 0

    for (const record of records) {
      const fields = record.fields
      const studentId = fields.student_id || fields['Student ID'] || record.id
      const name = fields.name || fields['Name'] || ''
      const mbti = fields.MBTI || fields['MBTI'] || fields['mbti'] || ''
      const strengths = Array.isArray(fields.strengths) ? fields.strengths : 
                       Array.isArray(fields['Strengths']) ? fields['Strengths'] : []
      const weaknesses = Array.isArray(fields.weaknesses) ? fields.weaknesses : 
                        Array.isArray(fields['Weaknesses']) ? fields['Weaknesses'] : []

      // 既存のスキル値を確認
      const existingSkills = {}
      let hasAllSkills = true
      for (const skill of allSkills) {
        const skillKey = `skill_${skill}`
        const existingValue = fields[skillKey] || fields[`Skill ${skill}`]
        if (existingValue !== undefined && existingValue !== null) {
          existingSkills[skill] = existingValue
        } else {
          hasAllSkills = false
        }
      }

      // すべてのスキル値が既に設定されている場合はスキップ
      if (hasAllSkills && Object.keys(existingSkills).length === allSkills.length) {
        console.log(`  ⏭️  ${name} (${studentId}): 既にすべてのスキル値が設定されています`)
        skipCount++
        continue
      }

      // スキル値を計算
      const updates = {}
      for (const skill of allSkills) {
        const skillKey = `skill_${skill}`
        
        // 既に値が設定されている場合はスキップ
        if (existingSkills[skill] !== undefined) {
          continue
        }

        // 新しいスキル値を計算
        const calculatedValue = calculateSkillValue(skill, strengths, weaknesses, mbti)
        updates[skillKey] = calculatedValue
      }

      // 更新するフィールドがない場合はスキップ
      if (Object.keys(updates).length === 0) {
        skipCount++
        continue
      }

      console.log(`  📝 ${name} (${studentId}): ${Object.keys(updates).length}個のスキル値を更新`)
      for (const [key, value] of Object.entries(updates)) {
        console.log(`     - ${key}: ${value}`)
      }

      try {
        await base(AIRTABLE_STUDENTS_TABLE).update(record.id, updates)
        updateCount++
        console.log(`  ✅ 更新完了\n`)
      } catch (error) {
        if (error.message && error.message.includes('Unknown field name')) {
          console.log(`  ⚠️  フィールドが存在しないため、スキップしました`)
          console.log(`     → 手動でフィールドを追加してください（docs/AIRTABLE_SKILL_FIELDS_MANUAL.md を参照）`)
          console.log(`     計算されたスキル値:`)
          for (const [key, value] of Object.entries(updates)) {
            console.log(`       ${key}: ${value}`)
          }
          console.log('')
          skipCount++
        } else {
          console.error(`  ❌ 更新失敗: ${error.message}\n`)
        }
      }

      // APIレート制限を避けるため、少し待機
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    console.log('\n📊 結果:')
    console.log(`  ✅ 更新: ${updateCount}件`)
    console.log(`  ⏭️  スキップ: ${skipCount}件`)
    console.log('\n✨ 移行が完了しました！')

  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
    process.exit(1)
  }
}

main().catch(error => {
  console.error('❌ エラーが発生しました:', error)
  process.exit(1)
})

