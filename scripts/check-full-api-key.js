/**
 * APIキーの完全性を確認するスクリプト
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', 'frontend', '.env.local');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env.localファイルが見つかりません');
  process.exit(1);
}

const content = fs.readFileSync(envPath, 'utf8');
const lines = content.split('\n');

let apiKey = null;

lines.forEach(line => {
  if (line.startsWith('AIRTABLE_API_KEY=')) {
    apiKey = line.split('=')[1];
  }
});

console.log('🔍 APIキーの完全性チェック\n');

if (!apiKey) {
  console.error('❌ APIキーが見つかりません');
  process.exit(1);
}

// 改行文字やスペースを削除
const cleaned = apiKey.trim().replace(/[\r\n\s]/g, '');

console.log('📋 情報:');
console.log(`   元の長さ: ${apiKey.length}文字`);
console.log(`   クリーン後の長さ: ${cleaned.length}文字`);
console.log(`   先頭: ${cleaned.substring(0, 10)}`);
console.log(`   末尾: ${cleaned.substring(cleaned.length - 10)}`);
console.log(`   完全なキー: ${cleaned}\n`);

if (cleaned.length < 20) {
  console.warn('⚠️  警告: APIキーが短すぎます（通常20文字以上）');
  console.warn('   AirtableのDeveloper HubでAPIキーを再確認してください。\n');
} else {
  console.log('✅ APIキーの長さは正常です\n');
}

console.log('📝 次のステップ:');
console.log('1. Airtable → アカウントアイコン → Developer hub → Personal access tokens');
console.log('2. 「PBL Dashboard」トークンを確認');
console.log('3. トークンを完全にコピー（最初から最後まで）');
console.log('4. .env.localファイルのAIRTABLE_API_KEYに貼り付け\n');

