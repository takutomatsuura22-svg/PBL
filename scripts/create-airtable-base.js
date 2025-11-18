/**
 * Airtableベース自動作成スクリプト
 * 
 * 使用方法:
 * 1. AirtableのAPIキーとBase IDを取得（まだBaseがない場合は、まず手動でBaseを作成）
 * 2. このスクリプトを実行してテーブルとフィールドを自動作成
 * 
 * または、完全自動化する場合は:
 * 1. AirtableのAPIキーを取得
 * 2. このスクリプトを実行（Baseも自動作成を試みる）
 */

const Airtable = require('airtable');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 環境変数から読み込む
require('dotenv').config({ path: path.join(__dirname, '..', 'frontend', '.env.local') });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// テーブル定義
const tableDefinitions = {
  Students: {
    fields: [
      { name: 'student_id', type: 'singleLineText', options: {} },
      { name: 'name', type: 'singleLineText', options: {} },
      { name: 'MBTI', type: 'singleLineText', options: {} },
      { name: 'animal_type', type: 'singleLineText', options: {} },
      { 
        name: 'strengths', 
        type: 'multipleSelects', 
        options: {
          choices: [
            { name: '企画', color: 'blueLight2' },
            { name: '実行', color: 'greenLight2' },
            { name: '調整', color: 'yellowLight2' },
            { name: '探索', color: 'purpleLight2' },
            { name: 'デザイン', color: 'pinkLight2' },
            { name: '開発', color: 'cyanLight2' },
            { name: '分析', color: 'orangeLight2' }
          ]
        }
      },
      { 
        name: 'weaknesses', 
        type: 'multipleSelects', 
        options: {
          choices: [
            { name: '企画', color: 'blueLight2' },
            { name: '実行', color: 'greenLight2' },
            { name: '調整', color: 'yellowLight2' },
            { name: '探索', color: 'purpleLight2' }
          ]
        }
      },
      { name: 'skill_企画', type: 'number', options: { precision: 1 } },
      { name: 'skill_実行', type: 'number', options: { precision: 1 } },
      { name: 'skill_調整', type: 'number', options: { precision: 1 } },
      { name: 'skill_探索', type: 'number', options: { precision: 1 } },
      { 
        name: 'preferred_partners', 
        type: 'multipleSelects', 
        options: {
          choices: [] // 後で学生を追加したら更新
        }
      },
      { 
        name: 'avoided_partners', 
        type: 'multipleSelects', 
        options: {
          choices: [] // 後で学生を追加したら更新
        }
      },
      { name: 'team_id', type: 'singleLineText', options: {} },
      { name: 'motivation_score', type: 'number', options: { precision: 1 } },
      { name: 'load_score', type: 'number', options: { precision: 1 } }
    ]
  },
  Tasks: {
    fields: [
      { name: 'task_id', type: 'singleLineText', options: {} },
      { name: 'title', type: 'singleLineText', options: {} },
      { name: 'description', type: 'multilineText', options: {} },
      { 
        name: 'category', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: '企画', color: 'blueLight2' },
            { name: '実行', color: 'greenLight2' },
            { name: '調整', color: 'yellowLight2' },
            { name: '探索', color: 'purpleLight2' }
          ]
        }
      },
      { name: 'difficulty', type: 'number', options: { precision: 0 } },
      { name: 'estimated_hours', type: 'number', options: { precision: 1 } },
      { name: 'deadline', type: 'date', options: {} },
      { name: 'start_date', type: 'date', options: {} },
      { name: 'end_date', type: 'date', options: {} },
      { 
        name: 'status', 
        type: 'singleSelect', 
        options: {
          choices: [
            { name: 'pending', color: 'grayLight2' },
            { name: 'in_progress', color: 'yellowLight2' },
            { name: 'completed', color: 'greenLight2' }
          ]
        }
      },
      { name: 'assignee_id', type: 'singleLineText', options: {} },
      { 
        name: 'required_skills', 
        type: 'multipleSelects', 
        options: {
          choices: [
            { name: '企画', color: 'blueLight2' },
            { name: '実行', color: 'greenLight2' },
            { name: '調整', color: 'yellowLight2' },
            { name: '探索', color: 'purpleLight2' }
          ]
        }
      },
      { name: 'ai_usage', type: 'multilineText', options: {} }
    ]
  },
  Teams: {
    fields: [
      { name: 'team_id', type: 'singleLineText', options: {} },
      { name: 'name', type: 'singleLineText', options: {} },
      { name: 'description', type: 'multilineText', options: {} },
      { 
        name: 'student_ids', 
        type: 'multipleSelects', 
        options: {
          choices: [] // 後で学生を追加したら更新
        }
      },
      { name: 'project_name', type: 'singleLineText', options: {} }
    ]
  }
};

async function createTable(base, tableName, definition) {
  console.log(`\n📋 ${tableName}テーブルを作成中...`);
  
  try {
    // テーブルが既に存在するか確認
    const tables = await base.tables.list();
    const existingTable = tables.find(t => t.name === tableName);
    
    if (existingTable) {
      console.log(`⚠️  ${tableName}テーブルは既に存在します。スキップします。`);
      return existingTable;
    }

    // テーブルを作成
    const table = await base.tables.create({
      name: tableName,
      fields: definition.fields.map(field => ({
        name: field.name,
        type: field.type,
        ...field.options
      }))
    });

    console.log(`✅ ${tableName}テーブルを作成しました！`);
    return table;
  } catch (error) {
    console.error(`❌ ${tableName}テーブルの作成に失敗しました:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Airtableベース自動作成スクリプト\n');

  // APIキーとBase IDの取得
  let apiKey = process.env.AIRTABLE_API_KEY;
  let baseId = process.env.AIRTABLE_BASE_ID;

  if (!apiKey) {
    apiKey = await question('Airtable APIキー（Personal Access Token）を入力してください: ');
  }

  if (!baseId) {
    baseId = await question('Airtable Base IDを入力してください（まだBaseがない場合は、まず手動でBaseを作成してください）: ');
  }

  if (!apiKey || !baseId) {
    console.error('❌ APIキーとBase IDが必要です。');
    process.exit(1);
  }

  console.log(`\n📝 設定情報:`);
  console.log(`   APIキー: ${apiKey.substring(0, 10)}...`);
  console.log(`   Base ID: ${baseId}\n`);

  // Airtableクライアントの初期化
  const base = new Airtable({ apiKey }).base(baseId);

  try {
    // 各テーブルを作成
    for (const [tableName, definition] of Object.entries(tableDefinitions)) {
      await createTable(base, tableName, definition);
    }

    console.log('\n✅ すべてのテーブルとフィールドの作成が完了しました！\n');

    // .env.localファイルを更新
    const envPath = path.join(__dirname, '..', 'frontend', '.env.local');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // 環境変数を更新
    if (!envContent.includes('AIRTABLE_API_KEY')) {
      envContent += `\nAIRTABLE_API_KEY=${apiKey}\n`;
    } else {
      envContent = envContent.replace(
        /AIRTABLE_API_KEY=.*/,
        `AIRTABLE_API_KEY=${apiKey}`
      );
    }

    if (!envContent.includes('AIRTABLE_BASE_ID')) {
      envContent += `AIRTABLE_BASE_ID=${baseId}\n`;
    } else {
      envContent = envContent.replace(
        /AIRTABLE_BASE_ID=.*/,
        `AIRTABLE_BASE_ID=${baseId}`
      );
    }

    fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');
    console.log(`✅ .env.localファイルを更新しました: ${envPath}\n`);

    console.log('🎉 セットアップが完了しました！');
    console.log('次のステップ:');
    console.log('1. Airtableでベースを確認してください');
    console.log('2. サンプルデータを入力してください（AIRTABLE_SAMPLE_DATA.mdを参照）');
    console.log('3. 開発サーバーを再起動してください: npm run dev');

  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error.message);
    console.error('\nトラブルシューティング:');
    console.error('1. APIキーが正しいか確認してください');
    console.error('2. Base IDが正しいか確認してください');
    console.error('3. APIキーに適切な権限があるか確認してください（data.records:read, data.records:write）');
    console.error('4. Baseが存在するか確認してください');
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();

