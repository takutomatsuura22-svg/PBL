/**
 * 画像から取得した学生データをAirtableに投入するスクリプト
 */

const Airtable = require('airtable');
const fs = require('fs');
const path = require('path');

// .env.localファイルを直接読み込む
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', 'frontend', '.env.local');
  if (!fs.existsSync(envPath)) {
    return {};
  }
  
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  });
  
  return env;
}

const env = loadEnvFile();

// 環境変数から取得
const rawApiKey = env.AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY;
const rawBaseId = env.AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID;

const apiKey = rawApiKey ? rawApiKey.trim().replace(/[\r\n\s]/g, '') : null;
const baseId = rawBaseId ? rawBaseId.trim().replace(/[\r\n\s]/g, '') : null;

if (!apiKey || !baseId) {
  console.error('❌ Airtable credentials not configured');
  console.error('   AIRTABLE_API_KEY と AIRTABLE_BASE_ID を .env.local に設定してください');
  process.exit(1);
}

const base = new Airtable({ apiKey }).base(baseId);

// 学生データを読み込む
function loadStudentData() {
  const studentsPath = path.join(__dirname, '..', 'backend', 'data', 'students_from_image.json');
  const content = fs.readFileSync(studentsPath, 'utf8');
  return JSON.parse(content);
}

async function importStudents() {
  try {
    const students = loadStudentData();
    console.log(`📚 ${students.length}件の学生データを読み込みました\n`);

    const results = [];
    const errors = [];

    for (const record of students) {
      try {
        // データをクリーンアップ
        const cleaned = {};
        Object.keys(record).forEach(key => {
          const value = record[key];
          
          // Multiple selectフィールド（preferred_partners, avoided_partners）は除外
          if (key === 'preferred_partners' || key === 'avoided_partners') {
            return;
          }
          
          // strengthsとweaknessesは配列として送信（空配列の場合は除外）
          if (key === 'strengths' || key === 'weaknesses') {
            if (Array.isArray(value) && value.length > 0) {
              cleaned[key] = value;
            }
            return;
          }
          
          // 空の配列は除外
          if (Array.isArray(value) && value.length === 0) {
            return;
          }
          
          // undefinedやnullは除外
          if (value === undefined || value === null || value === '') {
            return;
          }
          
          cleaned[key] = value;
        });

        console.log(`📤 ${record.name} をインポート中...`);
        console.log(`   フィールド: ${Object.keys(cleaned).join(', ')}`);

        // 既存のレコードを確認
        const existing = await base('Students')
          .select({
            filterByFormula: `{student_id} = "${record.student_id}"`
          })
          .all();

        if (existing.length > 0) {
          // 既存レコードを更新
          console.log(`   🔄 ${record.name} (${record.student_id}) は既に存在します。更新します...`);
          await base('Students').update([{
            id: existing[0].id,
            fields: cleaned
          }]);
          console.log(`   ✅ ${record.name} を更新成功 (ID: ${existing[0].id})`);
          
          results.push({
            student_id: record.student_id,
            name: record.name,
            success: true,
            updated: true,
            record_id: existing[0].id
          });
        } else {
          // 新規作成
          const created = await base('Students').create([{ fields: cleaned }]);
          console.log(`   ✅ ${record.name} を新規作成成功 (ID: ${created[0].id})`);
          
          results.push({
            student_id: record.student_id,
            name: record.name,
            success: true,
            created: true,
            record_id: created[0].id
          });
        }
      } catch (error) {
        console.error(`   ❌ ${record.name} のインポートエラー:`, error.message);
        errors.push({
          student_id: record.student_id,
          name: record.name,
          error: error.message
        });
      }
    }

    console.log('\n📊 インポート結果:');
    console.log(`   合計: ${students.length}件`);
    console.log(`   成功: ${results.length}件`);
    console.log(`   エラー: ${errors.length}件`);

    if (errors.length > 0) {
      console.log('\n❌ エラー詳細:');
      errors.forEach(err => {
        console.log(`   - ${err.name} (${err.student_id}): ${err.error}`);
      });
    }

    if (results.length > 0) {
      console.log('\n✅ 成功した学生:');
      results.forEach(result => {
        if (result.updated) {
          console.log(`   - ${result.name} (${result.student_id}): 更新成功`);
        } else if (result.created) {
          console.log(`   - ${result.name} (${result.student_id}): 新規作成成功`);
        } else {
          console.log(`   - ${result.name} (${result.student_id}): インポート成功`);
        }
      });
    }

    return { results, errors };
  } catch (error) {
    console.error('❌ エラー:', error);
    throw error;
  }
}

// 実行
importStudents()
  .then(() => {
    console.log('\n✅ インポート処理が完了しました');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ インポート処理でエラーが発生しました:', error);
    process.exit(1);
  });

