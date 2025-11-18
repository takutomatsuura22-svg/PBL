/**
 * .env.localファイルの形式を修正するスクリプト
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', 'frontend', '.env.local');

console.log('🔧 .env.localファイルを修正中...\n');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env.localファイルが見つかりません。');
  process.exit(1);
}

const content = fs.readFileSync(envPath, 'utf8');
const lines = content.split('\n');

const fixedLines = lines.map(line => {
  // = の前後のスペースを削除
  if (line.includes('AIRTABLE_API_KEY')) {
    const fixed = line.replace(/\s*=\s*/, '=');
    // 値の部分から改行文字や制御文字を削除
    const [key, ...valueParts] = fixed.split('=');
    if (valueParts.length > 0) {
      const value = valueParts.join('=').trim().replace(/[\r\n]/g, '');
      return `${key}=${value}`;
    }
    return fixed;
  }
  if (line.includes('AIRTABLE_BASE_ID')) {
    const fixed = line.replace(/\s*=\s*/, '=');
    // 値の部分から改行文字や制御文字を削除
    const [key, ...valueParts] = fixed.split('=');
    if (valueParts.length > 0) {
      const value = valueParts.join('=').trim().replace(/[\r\n]/g, '');
      return `${key}=${value}`;
    }
    return fixed;
  }
  return line;
});

const fixedContent = fixedLines.join('\n');

// バックアップを作成
const backupPath = envPath + '.backup';
fs.writeFileSync(backupPath, content, 'utf8');
console.log(`📦 バックアップを作成: ${backupPath}\n`);

// 修正した内容を書き込み
fs.writeFileSync(envPath, fixedContent, 'utf8');
console.log('✅ .env.localファイルを修正しました\n');

// 確認
const env = {};
fixedLines.forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  }
});

console.log('📋 修正後の内容:');
console.log(`AIRTABLE_API_KEY=${env.AIRTABLE_API_KEY ? env.AIRTABLE_API_KEY.substring(0, 10) + '...' : '未設定'}`);
console.log(`AIRTABLE_BASE_ID=${env.AIRTABLE_BASE_ID || '未設定'}\n`);

console.log('⚠️  開発サーバーを再起動してください: npm run dev\n');

