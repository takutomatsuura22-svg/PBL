/**
 * APIキーを直接テストするスクリプト
 */

const https = require('https');

const apiKey = 'pat96QxJHPMGYbS7l';
const baseId = 'appmrazv5xBSDMt3J';

console.log('🔍 Airtable APIキーのテスト\n');
console.log(`APIキー: ${apiKey}`);
console.log(`長さ: ${apiKey.length}文字`);
console.log(`Base ID: ${baseId}\n`);

function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data: parsed });
          } else {
            reject({ status: res.statusCode, error: parsed });
          }
        } catch (e) {
          reject({ status: res.statusCode, body: body.substring(0, 200) });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function testApiKey() {
  // まず、Baseのメタ情報を取得してテスト
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
    console.log('📡 Airtable APIに接続中...\n');
    const result = await makeRequest(options);
    console.log('✅ 成功！APIキーは有効です\n');
    console.log(`ステータス: ${result.status}`);
    console.log(`テーブル数: ${result.data.tables?.length || 0}\n`);
    
    if (result.data.tables && result.data.tables.length > 0) {
      console.log('📋 テーブル一覧:');
      result.data.tables.forEach((table, i) => {
        console.log(`   ${i + 1}. ${table.name} (${table.fields?.length || 0}フィールド)`);
      });
    }
  } catch (error) {
    console.error('❌ エラーが発生しました\n');
    console.error(`ステータス: ${error.status || 'Unknown'}`);
    if (error.error) {
      console.error(`エラータイプ: ${error.error.type || 'Unknown'}`);
      console.error(`メッセージ: ${error.error.message || error.body || 'Unknown error'}`);
    } else {
      console.error(`エラー: ${error.body || error.message || 'Unknown error'}`);
    }
    
    if (error.status === 401) {
      console.error('\n📋 考えられる原因:');
      console.error('1. APIキーが無効または期限切れ');
      console.error('2. APIキーにこのBaseへのアクセス権限がない');
      console.error('3. APIキーのスコープが不足している（data.records:read が必要）');
    }
  }
}

testApiKey();

