/**
 * Airtableに新しいスキル項目のフィールドを追加するスクリプト
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

// 追加するスキルフィールド
const skillFields = [
  { name: 'skill_デザイン', type: 'number', options: { precision: 1 } },
  { name: 'skill_開発', type: 'number', options: { precision: 1 } },
  { name: 'skill_分析', type: 'number', options: { precision: 1 } },
  { name: 'skill_ドキュメント作成', type: 'number', options: { precision: 1 } },
  { name: 'skill_コミュニケーション', type: 'number', options: { precision: 1 } },
  { name: 'skill_リーダーシップ', type: 'number', options: { precision: 1 } },
  { name: 'skill_プレゼンテーション', type: 'number', options: { precision: 1 } },
  { name: 'skill_問題解決', type: 'number', options: { precision: 1 } }
]

async function fieldExists(tableName, fieldName) {
  try {
    const table = base(tableName)
    const records = await table.select({
      maxRecords: 1,
      fields: [fieldName]
    }).firstPage()
    return true
  } catch (error) {
    if (error.message && error.message.includes('Unknown field name')) {
      return false
    }
    throw error
  }
}

async function getTableId(tableName) {
  try {
    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    const table = data.tables.find(t => t.name === tableName)
    return table ? table.id : null
  } catch (error) {
    console.error(`テーブルIDの取得に失敗しました:`, error.message)
    return null
  }
}

async function createField(tableName, fieldName, fieldType, options = {}) {
  try {
    // フィールドが既に存在するかチェック
    const exists = await fieldExists(tableName, fieldName)
    if (exists) {
      console.log(`  ✓ ${fieldName} は既に存在します（スキップ）`)
      return true
    }

    console.log(`  📝 ${fieldName} を作成中...`)
    
    // テーブルIDを取得
    const tableId = await getTableId(tableName)
    if (!tableId) {
      throw new Error(`テーブル "${tableName}" が見つかりません`)
    }
    
    // AirtableのMeta APIを使用してフィールドを作成
    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables/${tableId}/fields`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: fieldName,
        type: fieldType,
        options: options
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    console.log(`  ✅ ${fieldName} を作成しました`)
    return true
  } catch (error) {
    console.error(`  ❌ ${fieldName} の作成に失敗しました:`, error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Airtableに新しいスキル項目のフィールドを追加します\n')
  console.log(`📋 テーブル: ${AIRTABLE_STUDENTS_TABLE}`)
  console.log(`📦 追加するフィールド数: ${skillFields.length}\n`)

  let successCount = 0
  let skipCount = 0
  let failCount = 0

  for (const field of skillFields) {
    const result = await createField(AIRTABLE_STUDENTS_TABLE, field.name, field.type, field.options)
    if (result) {
      if (await fieldExists(AIRTABLE_STUDENTS_TABLE, field.name)) {
        // 既に存在していた場合
        if (await fieldExists(AIRTABLE_STUDENTS_TABLE, field.name)) {
          skipCount++
        } else {
          successCount++
        }
      } else {
        successCount++
      }
    } else {
      failCount++
    }
    
    // APIレート制限を避けるため、少し待機
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  console.log('\n📊 結果:')
  console.log(`  ✅ 作成成功: ${successCount}`)
  console.log(`  ⏭️  既に存在: ${skipCount}`)
  console.log(`  ❌ 失敗: ${failCount}`)

  if (failCount > 0) {
    console.log('\n⚠️  一部のフィールドの作成に失敗しました。')
    console.log('   手動でAirtableからフィールドを追加するか、APIキーの権限を確認してください。')
    process.exit(1)
  } else {
    console.log('\n✨ すべてのフィールドの追加が完了しました！')
  }
}

main().catch(error => {
  console.error('❌ エラーが発生しました:', error)
  process.exit(1)
})

