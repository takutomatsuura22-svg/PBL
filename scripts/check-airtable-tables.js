/**
 * Airtableのテーブル一覧を確認するスクリプト
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
const apiKey = process.env.AIRTABLE_API_KEY || env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID || env.AIRTABLE_BASE_ID;

function makeRequest(options) {
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
    req.end();
  });
}

async function main() {
  console.log('🔍 Airtableテーブル確認スクリプト\n');

  if (!apiKey || !baseId) {
    console.error('❌ エラー: .env.localファイルにAIRTABLE_API_KEYとAIRTABLE_BASE_IDが設定されていません。\n');
    process.exit(1);
  }

  console.log(`📝 設定情報:`);
  console.log(`   APIキー: ${apiKey.substring(0, 10)}...`);
  console.log(`   Base ID: ${baseId}\n`);

  // Airtable API v0のメタエンドポイントを使用してテーブル一覧を取得
  const options = {
    hostname: 'api.airtable.com',
    path: `/v0/meta/bases/${baseId}/tables`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    console.log('📋 テーブル一覧を取得中...\n');
    const result = await makeRequest(options);
    
    if (result.tables && result.tables.length > 0) {
      console.log(`✅ ${result.tables.length}個のテーブルが見つかりました:\n`);
      
      result.tables.forEach((table, index) => {
        console.log(`${index + 1}. ${table.name}`);
        console.log(`   ID: ${table.id}`);
        console.log(`   フィールド数: ${table.fields?.length || 0}`);
        if (table.fields && table.fields.length > 0) {
          console.log(`   フィールド: ${table.fields.map(f => f.name).join(', ')}`);
        }
        console.log('');
      });

      // 必要なテーブルをチェック
      const requiredTables = ['Students', 'Tasks', 'Teams'];
      const existingTableNames = result.tables.map(t => t.name);
      
      console.log('📊 必要なテーブルの確認:\n');
      requiredTables.forEach(tableName => {
        if (existingTableNames.includes(tableName)) {
          console.log(`✅ ${tableName} - 存在します`);
        } else {
          console.log(`❌ ${tableName} - 見つかりません`);
        }
      });

      const missingTables = requiredTables.filter(t => !existingTableNames.includes(t));
      if (missingTables.length > 0) {
        console.log(`\n⚠️  以下のテーブルが不足しています: ${missingTables.join(', ')}`);
        console.log(`   手動で作成する場合は、AIRTABLE_MANUAL_TABLE_CREATE.md を参照してください。\n`);
      } else {
        console.log(`\n🎉 すべての必要なテーブルが存在します！\n`);
      }
    } else {
      console.log('⚠️  テーブルが見つかりませんでした。');
      console.log('   手動でテーブルを作成してください（AIRTABLE_MANUAL_TABLE_CREATE.md を参照）。\n');
    }

  } catch (error) {
    if (error.message.includes('401') || error.message.includes('Authentication')) {
      console.error('\n❌ 認証エラー: APIキーが無効か、権限が不足しています。');
      console.error('   確認事項:');
      console.error('   1. APIキーが正しくコピーされているか確認');
      console.error('   2. APIキーに data.records:read 権限があるか確認');
      console.error('   3. APIキーがこのBaseにアクセスできるか確認\n');
    } else {
      console.error('\n❌ エラーが発生しました:', error.message);
    }
    process.exit(1);
  }
}

main();

