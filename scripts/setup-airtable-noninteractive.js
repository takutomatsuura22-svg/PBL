/**
 * Airtableセットアップスクリプト（非対話型）
 * .env.localファイルから設定を読み込む
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 環境変数ファイルを直接読み込む
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
process.env.AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || env.AIRTABLE_API_KEY;
process.env.AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || env.AIRTABLE_BASE_ID;

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

  // Airtable API v0のメタエンドポイントを使用
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
    // フィールド定義をAirtable API形式に変換
    const apiFields = fields.map(field => {
      const apiField = {
        name: field.name,
        type: field.type
      };
      
      // オプションがある場合は追加
      if (field.options) {
        if (field.type === 'multipleSelects' || field.type === 'singleSelect') {
          apiField.options = {
            choices: field.options.choices || []
          };
        } else if (field.type === 'number') {
          apiField.options = field.options || {};
        }
      }
      
      return apiField;
    });

    const result = await makeRequest(options, {
      name: tableName,
      description: `PBL AI Dashboard - ${tableName} table`,
      fields: apiFields
    });
    console.log(`✅ ${tableName}テーブルを作成しました！`);
    return result;
  } catch (error) {
    if (error.message.includes('already exists') || error.message.includes('duplicate') || error.message.includes('422')) {
      console.log(`⚠️  ${tableName}テーブルは既に存在するか、作成に失敗しました。スキップします。`);
      console.log(`   エラー詳細: ${error.message}`);
      return null;
    }
    if (error.message.includes('401') || error.message.includes('Authentication')) {
      console.error(`\n❌ 認証エラー: APIキーが無効か、権限が不足しています。`);
      console.error(`   確認事項:`);
      console.error(`   1. APIキーが正しくコピーされているか確認`);
      console.error(`   2. APIキーに schema.bases:write 権限があるか確認`);
      console.error(`   3. APIキーがこのBaseにアクセスできるか確認`);
    }
    throw error;
  }
}

async function main() {
  console.log('🚀 Airtable自動セットアップスクリプト（非対話型）\n');

  // 環境変数から読み込む
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    console.error('❌ エラー: .env.localファイルにAIRTABLE_API_KEYとAIRTABLE_BASE_IDが設定されていません。\n');
    console.error('まず、以下のコマンドを実行して.env.localファイルを作成してください:');
    console.error('  node scripts/create-env-file.js\n');
    process.exit(1);
  }

  console.log(`📝 設定情報:`);
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
  }
}

main();

