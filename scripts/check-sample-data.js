/**
 * サンプルデータが投入されているか確認するスクリプト
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
            reject({ status: res.statusCode, error: parsed });
          }
        } catch (e) {
          reject({ status: res.statusCode, body: body.substring(0, 200) });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function checkTable(tableName) {
  try {
    const options = {
      hostname: 'api.airtable.com',
      path: `/v0/${baseId}/${encodeURIComponent(tableName)}?maxRecords=10`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    };

    const result = await makeRequest(options);
    const records = result.records || [];
    
    console.log(`\n📋 ${tableName}テーブル:`);
    console.log(`   レコード数: ${records.length}`);
    
    if (records.length > 0) {
      const fields = Object.keys(records[0].fields || {});
      console.log(`   フィールド数: ${fields.length}`);
      console.log(`   フィールド名: ${fields.join(', ')}`);
      
      // 最初のレコードの内容を表示
      const firstRecord = records[0];
      console.log(`\n   最初のレコード:`);
      fields.slice(0, 5).forEach(field => {
        const value = firstRecord.fields[field];
        const displayValue = Array.isArray(value) ? value.join(', ') : (typeof value === 'object' ? JSON.stringify(value).substring(0, 50) : String(value).substring(0, 50));
        console.log(`     ${field}: ${displayValue}`);
      });
    } else {
      console.log(`   ⚠️  レコードがありません`);
    }
    
    return { count: records.length, fields: records.length > 0 ? Object.keys(records[0].fields || {}) : [] };
  } catch (error) {
    if (error.status === 404) {
      console.log(`\n📋 ${tableName}テーブル: テーブルが見つかりません`);
    } else {
      console.error(`\n❌ ${tableName}テーブル: エラー - ${error.error?.message || error.body || error.message}`);
    }
    return { count: 0, fields: [] };
  }
}

async function main() {
  console.log('🔍 サンプルデータ投入状況の確認\n');
  console.log(`Base ID: ${baseId}\n`);

  const students = await checkTable('Students');
  const tasks = await checkTable('Tasks');
  const teams = await checkTable('Teams');

  console.log('\n📊 サマリー:');
  console.log(`   Students: ${students.count}件`);
  console.log(`   Tasks: ${tasks.count}件`);
  console.log(`   Teams: ${teams.count}件`);

  if (students.count > 0 && tasks.count > 0 && teams.count > 0) {
    console.log('\n✅ サンプルデータが投入されています！');
    console.log('\n📝 次のステップ:');
    console.log('   1. ブラウザで http://localhost:3000/dashboard にアクセス');
    console.log('   2. Airtableからデータが表示されるか確認\n');
  } else {
    console.log('\n⚠️  まだデータが投入されていないか、一部のテーブルにデータがありません');
    console.log('   サンプルデータ投入ページで再度試してください。\n');
  }
}

main();

