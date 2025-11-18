/**
 * Airtableテーブルにフィールドを自動作成するスクリプト
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

function makeRequest(options, data = null) {
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
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function getTableId(tableName) {
  // テーブルIDを取得するために、メタAPIを使用
  // ただし、schema.bases:read権限が必要
  try {
    const options = {
      hostname: 'api.airtable.com',
      path: `/v0/meta/bases/${baseId}/tables`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    };

    const result = await makeRequest(options);
    const table = result.tables?.find(t => t.name === tableName);
    return table?.id || null;
  } catch (error) {
    // メタAPIが使えない場合は、テーブル名を直接使用
    console.log(`   ⚠️  メタAPIにアクセスできません。テーブル名を直接使用します。`);
    return tableName;
  }
}

async function createField(tableName, fieldName, fieldType, options = {}) {
  console.log(`   📝 ${fieldName} (${fieldType}) を作成中...`);
  
  try {
    // テーブルIDを取得
    const tableId = await getTableId(tableName);
    
    const fieldDef = {
      name: fieldName,
      type: fieldType
    };
    
    if (options.choices) {
      fieldDef.options = { choices: options.choices };
    }
    
    const requestOptions = {
      hostname: 'api.airtable.com',
      path: `/v0/meta/bases/${baseId}/tables/${tableId}/fields`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    };

    await makeRequest(requestOptions, fieldDef);
    console.log(`   ✅ ${fieldName} を作成しました`);
    return true;
  } catch (error) {
    if (error.message.includes('already exists') || error.message.includes('duplicate') || error.message.includes('422')) {
      console.log(`   ⚠️  ${fieldName} は既に存在するか、作成に失敗しました`);
      return false;
    }
    if (error.message.includes('401') || error.message.includes('403')) {
      console.log(`   ❌ 権限エラー: schema.bases:write 権限が必要です`);
      console.log(`   ⚠️  手動でフィールドを作成してください（AIRTABLE_MANUAL_TABLE_CREATE.md を参照）`);
      return false;
    }
    console.error(`   ❌ エラー: ${error.message}`);
    return false;
  }
}

async function createStudentsFields() {
  console.log('\n📋 Studentsテーブルにフィールドを作成中...\n');
  
  await createField('Students', 'student_id', 'singleLineText');
  await createField('Students', 'name', 'singleLineText');
  await createField('Students', 'MBTI', 'singleLineText');
  await createField('Students', 'animal_type', 'singleLineText');
  await createField('Students', 'strengths', 'multipleSelects', {
    choices: [
      { name: '企画' },
      { name: '実行' },
      { name: '調整' },
      { name: '探索' },
      { name: 'デザイン' },
      { name: '開発' },
      { name: '分析' }
    ]
  });
  await createField('Students', 'weaknesses', 'multipleSelects', {
    choices: [
      { name: '企画' },
      { name: '実行' },
      { name: '調整' },
      { name: '探索' }
    ]
  });
  await createField('Students', 'skill_企画', 'number');
  await createField('Students', 'skill_実行', 'number');
  await createField('Students', 'skill_調整', 'number');
  await createField('Students', 'skill_探索', 'number');
  await createField('Students', 'preferred_partners', 'multipleSelects', { choices: [] });
  await createField('Students', 'avoided_partners', 'multipleSelects', { choices: [] });
  await createField('Students', 'team_id', 'singleLineText');
  await createField('Students', 'motivation_score', 'number');
  await createField('Students', 'load_score', 'number');
}

async function createTasksFields() {
  console.log('\n📋 Tasksテーブルにフィールドを作成中...\n');
  
  await createField('Tasks', 'task_id', 'singleLineText');
  await createField('Tasks', 'title', 'singleLineText');
  await createField('Tasks', 'description', 'multilineText');
  await createField('Tasks', 'category', 'singleSelect', {
    choices: [
      { name: '企画' },
      { name: '実行' },
      { name: '調整' },
      { name: '探索' }
    ]
  });
  await createField('Tasks', 'difficulty', 'number');
  await createField('Tasks', 'estimated_hours', 'number');
  await createField('Tasks', 'deadline', 'date');
  await createField('Tasks', 'start_date', 'date');
  await createField('Tasks', 'end_date', 'date');
  await createField('Tasks', 'status', 'singleSelect', {
    choices: [
      { name: 'pending' },
      { name: 'in_progress' },
      { name: 'completed' }
    ]
  });
  await createField('Tasks', 'assignee_id', 'singleLineText');
  await createField('Tasks', 'required_skills', 'multipleSelects', {
    choices: [
      { name: '企画' },
      { name: '実行' },
      { name: '調整' },
      { name: '探索' }
    ]
  });
  await createField('Tasks', 'ai_usage', 'multilineText');
}

async function createTeamsFields() {
  console.log('\n📋 Teamsテーブルにフィールドを作成中...\n');
  
  await createField('Teams', 'team_id', 'singleLineText');
  await createField('Teams', 'name', 'singleLineText');
  await createField('Teams', 'description', 'multilineText');
  await createField('Teams', 'student_ids', 'multipleSelects', { choices: [] });
  await createField('Teams', 'project_name', 'singleLineText');
}

async function main() {
  console.log('🚀 Airtableフィールド自動作成スクリプト\n');
  console.log(`Base ID: ${baseId}\n`);

  try {
    await createStudentsFields();
    await createTasksFields();
    await createTeamsFields();

    console.log('\n✅ すべてのフィールド作成処理が完了しました！\n');
    console.log('📝 次のステップ:');
    console.log('   1. Airtableでフィールドが作成されたか確認してください');
    console.log('   2. サンプルデータ投入を再度試してください\n');

  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error.message);
    console.error('\n⚠️  APIでフィールドを作成できない場合は、手動で作成してください。');
    console.error('   AIRTABLE_MANUAL_TABLE_CREATE.md を参照してください。\n');
  }
}

main();

