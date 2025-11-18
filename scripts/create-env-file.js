/**
 * .env.localファイルを対話的に作成するスクリプト
 * PowerShellの入力問題を回避するため、ファイルに直接書き込む方式
 */

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

async function main() {
  console.log('🚀 Airtable環境変数ファイル作成スクリプト\n');

  const envPath = path.join(__dirname, '..', 'frontend', '.env.local');

  // 既存のファイルを確認
  let existingContent = '';
  if (fs.existsSync(envPath)) {
    existingContent = fs.readFileSync(envPath, 'utf8');
    console.log('⚠️  既存の.env.localファイルが見つかりました。\n');
  }

  // APIキーとBase IDを取得
  console.log('以下の情報を入力してください：\n');
  console.log('1. Airtable APIキー（Personal Access Token）');
  console.log('   形式: patXXXXXXXXXXXXXX');
  console.log('   取得方法: Airtable → アカウントアイコン → Developer hub → Personal access tokens\n');
  
  const apiKey = await question('APIキーを入力してください: ');
  
  console.log('\n2. Airtable Base ID');
  console.log('   形式: appXXXXXXXXXXXXXX');
  console.log('   取得方法: AirtableのURLから app で始まる部分をコピー\n');
  
  const baseId = await question('Base IDを入力してください: ');

  if (!apiKey || !baseId) {
    console.error('\n❌ APIキーとBase IDが必要です。');
    process.exit(1);
  }

  // .env.localファイルを作成
  const envContent = `AIRTABLE_API_KEY=${apiKey}
AIRTABLE_BASE_ID=${baseId}

# オプション: テーブル名をカスタマイズする場合
# AIRTABLE_STUDENTS_TABLE=Students
# AIRTABLE_TASKS_TABLE=Tasks
# AIRTABLE_TEAMS_TABLE=Teams
`;

  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log(`\n✅ .env.localファイルを作成しました: ${envPath}\n`);

  console.log('📋 次のステップ:');
  console.log('1. 自動セットアップスクリプトを実行してテーブルを作成:');
  console.log('   node scripts/setup-airtable-noninteractive.js');
  console.log('\n2. または、手動でAirtableにテーブルを作成:');
  console.log('   AIRTABLE_CREATE_GUIDE.md を参照してください\n');

  rl.close();
}

main().catch(error => {
  console.error('\n❌ エラーが発生しました:', error.message);
  process.exit(1);
});

