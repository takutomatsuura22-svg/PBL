/**
 * WBS一覧APIをテストするスクリプト
 */

const fs = require('fs');
const path = require('path');
const { join } = require('path');

// WBSディレクトリのパス
const dataDir = join(__dirname, '..', 'backend', 'data');
const wbsDir = join(dataDir, 'wbs');
const configPath = join(dataDir, 'wbs_config.json');

console.log('📂 WBS一覧取得テスト開始');
console.log('  dataDir:', dataDir);
console.log('  wbsDir:', wbsDir);
console.log('  wbsDir exists:', fs.existsSync(wbsDir));

if (!fs.existsSync(wbsDir)) {
  console.log('⚠️ WBSディレクトリが存在しません');
  process.exit(1);
}

// 現在使用中のWBS IDを取得
let currentWbsId = null;
if (fs.existsSync(configPath)) {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    currentWbsId = config.current_wbs_id || null;
    console.log('  currentWbsId:', currentWbsId);
  } catch (error) {
    console.error('Error reading WBS config:', error);
  }
}

// WBSファイル一覧を取得
const files = fs.readdirSync(wbsDir).filter(f => f.endsWith('.json'));
console.log('  found files:', files.length, files);

const wbsList = files.map(file => {
  const filePath = join(wbsDir, file);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    const wbsId = file.replace('.json', '');
    
    const wbsItem = {
      wbs_id: wbsId,
      name: data.name || wbsId,
      description: data.description || '',
      created_at: data.created_at || '',
      task_count: Array.isArray(data.tasks) ? data.tasks.length : 0,
      is_current: wbsId === currentWbsId
    };
    
    console.log(`  ✅ WBS読み込み成功: ${wbsItem.name} (${wbsItem.task_count}件のタスク)`);
    return wbsItem;
  } catch (error) {
    console.error(`❌ Error reading WBS file ${file}:`, error);
    return null;
  }
}).filter(wbs => wbs !== null);

console.log(`\n📊 合計 ${wbsList.length}件のWBSが見つかりました`);
console.log('\n📋 WBS一覧:');
wbsList.forEach(wbs => {
  console.log(`  - ${wbs.name} (${wbs.wbs_id})`);
  console.log(`    タスク数: ${wbs.task_count}件`);
  console.log(`    作成日: ${wbs.created_at}`);
  console.log(`    使用中: ${wbs.is_current ? 'はい' : 'いいえ'}`);
  console.log('');
});

