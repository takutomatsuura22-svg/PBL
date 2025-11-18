/**
 * APIキーの形式を詳細に確認するスクリプト
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
let baseId = null;

lines.forEach(line => {
  if (line.startsWith('AIRTABLE_API_KEY=')) {
    apiKey = line.split('=')[1];
  }
  if (line.startsWith('AIRTABLE_BASE_ID=')) {
    baseId = line.split('=')[1];
  }
});

console.log('🔍 APIキーの詳細確認\n');

if (!apiKey) {
  console.error('❌ APIキーが見つかりません');
  process.exit(1);
}

console.log('📋 情報:');
console.log(`   長さ: ${apiKey.length}文字`);
console.log(`   先頭10文字: ${apiKey.substring(0, 10)}`);
console.log(`   末尾10文字: ${apiKey.substring(apiKey.length - 10)}`);
console.log(`   先頭が"pat": ${apiKey.startsWith('pat')}`);
console.log(`   改行文字を含む: ${apiKey.includes('\n') || apiKey.includes('\r')}`);
console.log(`   前後の空白: ${apiKey !== apiKey.trim() ? 'あり' : 'なし'}`);
console.log(`   引用符: ${(apiKey.startsWith('"') && apiKey.endsWith('"')) || (apiKey.startsWith("'") && apiKey.endsWith("'")) ? 'あり' : 'なし'}`);

// 実際のAPIキーを表示（マスク）
const masked = apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 5);
console.log(`\n   マスク済みキー: ${masked}`);

// 文字コードを確認
const suspiciousChars = [];
for (let i = 0; i < apiKey.length; i++) {
  const char = apiKey[i];
  const code = char.charCodeAt(0);
  if (code < 32 || code > 126) {
    suspiciousChars.push(`位置${i}: ${char} (コード${code})`);
  }
}

if (suspiciousChars.length > 0) {
  console.log(`\n   ⚠️  不正な文字が見つかりました:`);
  suspiciousChars.forEach(ch => console.log(`      ${ch}`));
} else {
  console.log(`\n   ✅ 文字コードは正常です`);
}

console.log(`\n📋 Base ID: ${baseId || '未設定'}\n`);

