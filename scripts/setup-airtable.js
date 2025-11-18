/**
 * Airtableセットアップスクリプト（簡易版）
 * 
 * このスクリプトは、AirtableのAPIを使ってテーブルとフィールドを自動作成します。
 * ただし、Base自体は手動で作成する必要があります。
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
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
          reject(new Error(`Parse error: ${body}`));
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

async function createTable(apiKey, baseId, tableName, fields) {
  console.log(`\n📋 ${tableName}テーブルを作成中...`);

  const options = {
    hostname: 'api.airtable.com',
    path: `/v0/meta/bases/${baseId}/tables`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    const result = await makeRequest(options, {
      name: tableName,
      fields: fields
    });
    console.log(`✅ ${tableName}テーブルを作成しました！`);
    return result;
  } catch (error) {
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      console.log(`⚠️  ${tableName}テーブルは既に存在します。スキップします。`);
      return null;
    }
    throw error;
  }
}

async function main() {
  console.log('🚀 Airtableセットアップスクリプト\n');
  console.log('⚠️  注意: このスクリプトを実行する前に、AirtableでBaseを手動で作成してください。\n');

  // APIキーとBase IDの取得
  let apiKey = await question('Airtable APIキー（Personal Access Token）を入力してください: ');
  let baseId = await question('Airtable Base IDを入力してください: ');

  if (!apiKey || !baseId) {
    console.error('❌ APIキーとBase IDが必要です。');
    process.exit(1);
  }

  console.log(`\n📝 設定情報:`);
  console.log(`   APIキー: ${apiKey.substring(0, 10)}...`);
  console.log(`   Base ID: ${baseId}\n`);

  // テーブル定義
  const tables = {
    Students: [
      { name: 'student_id', type: 'singleLineText' },
      { name: 'name', type: 'singleLineText' },
      { name: 'MBTI', type: 'singleLineText' },
      { name: 'animal_type', type: 'singleLineText' },
      { 
        name: 'strengths', 
        type: 'multipleSelects',
        options: {
          choices: [
            { name: '企画' },
            { name: '実行' },
            { name: '調整' },
            { name: '探索' },
            { name: 'デザイン' },
            { name: '開発' },
            { name: '分析' }
          ]
        }
      },
      { 
        name: 'weaknesses', 
        type: 'multipleSelects',
        options: {
          choices: [
            { name: '企画' },
            { name: '実行' },
            { name: '調整' },
            { name: '探索' }
          ]
        }
      },
      { name: 'skill_企画', type: 'number' },
      { name: 'skill_実行', type: 'number' },
      { name: 'skill_調整', type: 'number' },
      { name: 'skill_探索', type: 'number' },
      { 
        name: 'preferred_partners', 
        type: 'multipleSelects',
        options: { choices: [] }
      },
      { 
        name: 'avoided_partners', 
        type: 'multipleSelects',
        options: { choices: [] }
      },
      { name: 'team_id', type: 'singleLineText' },
      { name: 'motivation_score', type: 'number' },
      { name: 'load_score', type: 'number' }
    ],
    Tasks: [
      { name: 'task_id', type: 'singleLineText' },
      { name: 'title', type: 'singleLineText' },
      { name: 'description', type: 'multilineText' },
      { 
        name: 'category', 
        type: 'singleSelect',
        options: {
          choices: [
            { name: '企画' },
            { name: '実行' },
            { name: '調整' },
            { name: '探索' }
          ]
        }
      },
      { name: 'difficulty', type: 'number' },
      { name: 'estimated_hours', type: 'number' },
      { name: 'deadline', type: 'date' },
      { name: 'start_date', type: 'date' },
      { name: 'end_date', type: 'date' },
      { 
        name: 'status', 
        type: 'singleSelect',
        options: {
          choices: [
            { name: 'pending' },
            { name: 'in_progress' },
            { name: 'completed' }
          ]
        }
      },
      { name: 'assignee_id', type: 'singleLineText' },
      { 
        name: 'required_skills', 
        type: 'multipleSelects',
        options: {
          choices: [
            { name: '企画' },
            { name: '実行' },
            { name: '調整' },
            { name: '探索' }
          ]
        }
      },
      { name: 'ai_usage', type: 'multilineText' }
    ],
    Teams: [
      { name: 'team_id', type: 'singleLineText' },
      { name: 'name', type: 'singleLineText' },
      { name: 'description', type: 'multilineText' },
      { 
        name: 'student_ids', 
        type: 'multipleSelects',
        options: { choices: [] }
      },
      { name: 'project_name', type: 'singleLineText' }
    ]
  };

  try {
    // 各テーブルを作成
    for (const [tableName, fields] of Object.entries(tables)) {
      await createTable(apiKey, baseId, tableName, fields);
    }

    console.log('\n✅ すべてのテーブルとフィールドの作成が完了しました！\n');

    // .env.localファイルを作成/更新
    const envPath = path.join(__dirname, '..', 'frontend', '.env.local');
    const envContent = `AIRTABLE_API_KEY=${apiKey}
AIRTABLE_BASE_ID=${baseId}

# オプション: テーブル名をカスタマイズする場合
# AIRTABLE_STUDENTS_TABLE=Students
# AIRTABLE_TASKS_TABLE=Tasks
# AIRTABLE_TEAMS_TABLE=Teams
`;

    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log(`✅ .env.localファイルを作成しました: ${envPath}\n`);

    console.log('🎉 セットアップが完了しました！');
    console.log('\n次のステップ:');
    console.log('1. Airtableでベースを確認してください');
    console.log('2. サンプルデータを入力してください（AIRTABLE_SAMPLE_DATA.mdを参照）');
    console.log('3. 開発サーバーを再起動してください: npm run dev');

  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error.message);
    console.error('\nトラブルシューティング:');
    console.error('1. APIキーが正しいか確認してください');
    console.error('2. Base IDが正しいか確認してください');
    console.error('3. APIキーに適切な権限があるか確認してください（data.records:read, data.records:write, schema.bases:write）');
    console.error('4. Baseが存在するか確認してください');
    console.error('5. AirtableのAPI制限に達していないか確認してください');
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();

