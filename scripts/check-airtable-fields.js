/**
 * Airtableテーブルのフィールド構造を確認するスクリプト
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 環境変数ファイルを読み込む
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', 'frontend', '.env.local');
  if (!fs.existsSync(envPath)) {
    return {};
  }
  
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim().replace(/[\r\n\s]/g, '');
      }
    }
  });
  
  return env;
}

const env = loadEnvFile();
const apiKey = env.AIRTABLE_API_KEY;
const baseId = env.AIRTABLE_BASE_ID;

if (!apiKey || !baseId) {
  console.error('❌ エラー: .env.localファイルにAPIキーとBase IDが設定されていません');
  process.exit(1);
}

function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${parsed.error?.message || body}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${body.substring(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function checkTableFields(tableName) {
  console.log(`\n📋 ${tableName}テーブルのフィールドを確認中...\n`);
  
  try {
    // まず1レコード取得してフィールド名を確認
    const options = {
      hostname: 'api.airtable.com',
      path: `/v0/${baseId}/${encodeURIComponent(tableName)}?maxRecords=1`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    };

    const result = await makeRequest(options);
    
    if (result.records && result.records.length > 0) {
      const fields = Object.keys(result.records[0].fields);
      console.log(`✅ ${tableName}テーブルに ${fields.length}個のフィールドが見つかりました:\n`);
      fields.forEach((field, i) => {
        console.log(`   ${i + 1}. ${field}`);
      });
      
      // 必要なフィールドをチェック
      const requiredFields = {
        Students: ['student_id', 'name', 'MBTI', 'animal_type', 'strengths', 'weaknesses', 'team_id', 'motivation_score', 'load_score'],
        Tasks: ['task_id', 'title', 'description', 'category', 'difficulty', 'status', 'assignee_id'],
        Teams: ['team_id', 'name', 'description', 'student_ids', 'project_name']
      };
      
      if (requiredFields[tableName]) {
        console.log(`\n📊 必要なフィールドの確認:\n`);
        const missing = [];
        requiredFields[tableName].forEach(reqField => {
          if (fields.includes(reqField)) {
            console.log(`   ✅ ${reqField}`);
          } else {
            console.log(`   ❌ ${reqField} - 見つかりません`);
            missing.push(reqField);
          }
        });
        
        if (missing.length > 0) {
          console.log(`\n⚠️  以下のフィールドが不足しています: ${missing.join(', ')}`);
          console.log(`   AIRTABLE_MANUAL_TABLE_CREATE.md を参照して、手動でフィールドを作成してください。\n`);
        } else {
          console.log(`\n✅ すべての必要なフィールドが存在します！\n`);
        }
      }
    } else {
      console.log(`ℹ️  ${tableName}テーブルは空です。`);
      console.log(`   フィールド構造を確認するには、まずレコードを追加する必要があります。\n`);
    }
  } catch (error) {
    if (error.message.includes('404') || error.message.includes('not found')) {
      console.error(`❌ テーブル "${tableName}" が見つかりません。`);
      console.error(`   Airtableでテーブルが作成されているか確認してください。\n`);
    } else {
      console.error(`❌ エラー: ${error.message}\n`);
    }
  }
}

async function main() {
  console.log('🔍 Airtableテーブルのフィールド構造確認\n');
  console.log(`Base ID: ${baseId}\n`);

  await checkTableFields('Students');
  await checkTableFields('Tasks');
  await checkTableFields('Teams');

  console.log('\n📝 次のステップ:');
  console.log('   不足しているフィールドがある場合は、AIRTABLE_MANUAL_TABLE_CREATE.md を参照して作成してください。\n');
}

main();

