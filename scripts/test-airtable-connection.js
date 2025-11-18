/**
 * Airtable接続テスト（詳細版）
 * TasksとTeamsテーブルの接続を詳細に確認
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 環境変数を読み込む
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
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return env;
}

const env = loadEnvFile();
const apiKey = env.AIRTABLE_API_KEY;
const baseId = env.AIRTABLE_BASE_ID;

console.log('🔍 Airtable接続テスト（詳細版）\n');

if (!apiKey || !baseId) {
  console.error('❌ 環境変数が設定されていません');
  process.exit(1);
}

console.log(`📝 設定情報:`);
console.log(`   APIキー: ${apiKey.substring(0, 15)}...`);
console.log(`   Base ID: ${baseId}\n`);

// テーブル名の候補
const tableNames = {
  students: ['Students', 'students', 'Student', 'student'],
  tasks: ['Tasks', 'tasks', 'Task', 'task'],
  teams: ['Teams', 'teams', 'Team', 'team']
};

function makeRequest(tableName) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.airtable.com',
      path: `/v0/${baseId}/${encodeURIComponent(tableName)}?maxRecords=5`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(body);
            resolve({ tableName, records: data.records || [], status: res.statusCode });
          } catch (e) {
            reject({ tableName, error: 'Parse error', body: body.substring(0, 200) });
          }
        } else if (res.statusCode === 404) {
          resolve({ tableName, records: [], status: 404, notFound: true });
        } else {
          try {
            const error = JSON.parse(body);
            reject({ tableName, error: error.error?.message || `HTTP ${res.statusCode}`, status: res.statusCode });
          } catch (e) {
            reject({ tableName, error: `HTTP ${res.statusCode}`, body: body.substring(0, 200) });
          }
        }
      });
    });

    req.on('error', (e) => {
      reject({ tableName, error: e.message });
    });

    req.end();
  });
}

async function testTable(category, names) {
  console.log(`\n📋 ${category}テーブルの確認:`);
  
  for (const name of names) {
    try {
      const result = await makeRequest(name);
      if (result.notFound) {
        console.log(`   ❌ "${name}" - テーブルが見つかりません（404）`);
      } else {
        console.log(`   ✅ "${name}" - ${result.records.length}件のレコード`);
        if (result.records.length > 0) {
          const fields = Object.keys(result.records[0].fields || {});
          console.log(`      フィールド: ${fields.slice(0, 5).join(', ')}${fields.length > 5 ? '...' : ''}`);
          return name; // 見つかったテーブル名を返す
        }
      }
    } catch (error) {
      if (error.status === 404) {
        console.log(`   ❌ "${name}" - テーブルが見つかりません（404）`);
      } else if (error.status === 403) {
        console.log(`   ⚠️  "${name}" - 権限エラー（403）: ${error.error}`);
      } else {
        console.log(`   ❌ "${name}" - エラー: ${error.error || error.message}`);
      }
    }
  }
  return null;
}

async function main() {
  console.log('🔍 各テーブル名の候補を順番に確認します...\n');
  
  const foundTables = {
    students: null,
    tasks: null,
    teams: null
  };
  
  foundTables.students = await testTable('Students', tableNames.students);
  foundTables.tasks = await testTable('Tasks', tableNames.tasks);
  foundTables.teams = await testTable('Teams', tableNames.teams);
  
  console.log('\n📊 結果サマリー:');
  console.log(`   Students: ${foundTables.students || '❌ 見つかりません'}`);
  console.log(`   Tasks: ${foundTables.tasks || '❌ 見つかりません'}`);
  console.log(`   Teams: ${foundTables.teams || '❌ 見つかりません'}`);
  
  if (!foundTables.tasks || !foundTables.teams) {
    console.log('\n⚠️  解決方法:');
    if (!foundTables.tasks) {
      console.log('   1. Airtableで「Tasks」テーブルが存在するか確認');
      console.log('   2. テーブル名が異なる場合は、環境変数で指定:');
      console.log('      AIRTABLE_TASKS_TABLE=実際のテーブル名');
    }
    if (!foundTables.teams) {
      console.log('   1. Airtableで「Teams」テーブルが存在するか確認');
      console.log('   2. テーブル名が異なる場合は、環境変数で指定:');
      console.log('      AIRTABLE_TEAMS_TABLE=実際のテーブル名');
    }
    console.log('   3. テーブルにデータが入っているか確認');
    console.log('   4. APIキーに data.records:read 権限があるか確認\n');
  } else {
    console.log('\n✅ すべてのテーブルが見つかりました！\n');
  }
}

main().catch(error => {
  console.error('\n❌ エラー:', error);
  process.exit(1);
});

