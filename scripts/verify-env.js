/**
 * .env.localファイルの形式を確認するスクリプト
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', 'frontend', '.env.local');

console.log('🔍 .env.localファイルの確認\n');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env.localファイルが見つかりません。');
  console.error(`   パス: ${envPath}\n`);
  process.exit(1);
}

const content = fs.readFileSync(envPath, 'utf8');
const lines = content.split('\n');

console.log('📄 ファイル内容:\n');
console.log('---');
lines.forEach((line, index) => {
  if (line.trim() && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      // 値の一部をマスク
      const maskedValue = value.length > 10 
        ? value.substring(0, 10) + '...' 
        : value;
      console.log(`${index + 1}: ${key.trim()} = ${maskedValue}`);
    }
  } else if (line.trim()) {
    console.log(`${index + 1}: ${line}`);
  }
});
console.log('---\n');

// 環境変数を解析
const env = {};
lines.forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  }
});

console.log('✅ 検証結果:\n');

const apiKey = env.AIRTABLE_API_KEY;
const baseId = env.AIRTABLE_BASE_ID;

if (!apiKey) {
  console.error('❌ AIRTABLE_API_KEY が設定されていません');
} else {
  if (apiKey.startsWith('pat')) {
    console.log(`✅ AIRTABLE_API_KEY: ${apiKey.substring(0, 10)}... (形式OK)`);
  } else {
    console.warn(`⚠️  AIRTABLE_API_KEY: ${apiKey.substring(0, 10)}... (形式が正しくない可能性があります)`);
  }
  
  // 余分なスペースや引用符をチェック
  if (apiKey !== apiKey.trim()) {
    console.warn('⚠️  APIキーに前後のスペースが含まれています');
  }
  if (apiKey.startsWith('"') || apiKey.startsWith("'")) {
    console.warn('⚠️  APIキーに引用符が含まれています（不要です）');
  }
}

if (!baseId) {
  console.error('❌ AIRTABLE_BASE_ID が設定されていません');
} else {
  if (baseId.startsWith('app')) {
    console.log(`✅ AIRTABLE_BASE_ID: ${baseId} (形式OK)`);
  } else {
    console.warn(`⚠️  AIRTABLE_BASE_ID: ${baseId} (形式が正しくない可能性があります)`);
  }
  
  // 余分なスペースや引用符をチェック
  if (baseId !== baseId.trim()) {
    console.warn('⚠️  Base IDに前後のスペースが含まれています');
  }
  if (baseId.startsWith('"') || baseId.startsWith("'")) {
    console.warn('⚠️  Base IDに引用符が含まれています（不要です）');
  }
}

console.log('\n📋 正しい形式:');
console.log('AIRTABLE_API_KEY=patXXXXXXXXXXXXXX');
console.log('AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX');
console.log('\n⚠️  注意: 値の前後にスペースや引用符は不要です\n');

