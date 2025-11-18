/**
 * WBSを選択してタスクデータを更新するスクリプト
 */

const fs = require('fs');
const path = require('path');
const { join, resolve } = require('path');

// WBS ID（最新のWBSを自動検出）
const dataDir = resolve(__dirname, '..', 'backend', 'data');
const wbsDir = join(dataDir, 'wbs');
const configPath = join(dataDir, 'wbs_config.json');
const tasksPath = join(dataDir, 'tasks.json');

// 最新のWBSを取得
function getLatestWBS() {
  if (!fs.existsSync(wbsDir)) {
    console.error('❌ WBSディレクトリが存在しません');
    process.exit(1);
  }

  const files = fs.readdirSync(wbsDir).filter(f => f.endsWith('.json'));
  if (files.length === 0) {
    console.error('❌ WBSファイルが見つかりません');
    process.exit(1);
  }

  // 最新のWBS（作成日が最新のもの、またはファイル名のタイムスタンプが最大のもの）
  let latestFile = files[0];
  let latestTime = 0;
  
  for (const file of files) {
    const filePath = join(wbsDir, file);
    const stats = fs.statSync(filePath);
    const wbsData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const createdTime = wbsData.created_at ? new Date(wbsData.created_at).getTime() : stats.mtime.getTime();
    
    if (createdTime > latestTime) {
      latestTime = createdTime;
      latestFile = file;
    }
  }
  
  const wbsId = latestFile.replace('.json', '');
  
  return { wbsId, filePath: join(wbsDir, latestFile) };
}

// AI活用方法を生成（簡易版）
function generateAIUsage(task) {
  return `🤖 【このタスクに最適なAI活用方法】\n\n📌 推奨AIツール: GitHub Copilot\n💡 活用方法: コード生成とリファクタリング支援\n\n📝 具体的なプロンプト例:\n「${task.title}」の実装コードを生成してください。要件: ${task.description || ''}\n\n【他の選択肢】\n2. Cursor AI: コードレビューと最適化提案\n3. ChatGPT: 技術的な質問やエラーハンドリングの相談`;
}

try {
  console.log('📂 最新のWBSを検索中...');
  const { wbsId, filePath } = getLatestWBS();
  
  console.log(`📋 WBSを読み込み中: ${wbsId}`);
  const wbsData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let tasks = wbsData.tasks || [];
  
  console.log(`📊 ${tasks.length}件のタスクを読み込みました`);
  
  // 各タスクにAI活用方法を生成（既存の値がない場合）
  let updatedCount = 0;
  tasks = tasks.map((task) => {
    if (!task.ai_usage && !task.ai_usage_method) {
      task.ai_usage = generateAIUsage(task);
      updatedCount++;
    }
    return task;
  });
  
  if (updatedCount > 0) {
    console.log(`🤖 ${updatedCount}件のタスクにAI活用方法を追加しました`);
  }
  
  // tasks.jsonに反映
  console.log('💾 tasks.jsonを更新中...');
  fs.writeFileSync(
    tasksPath,
    JSON.stringify({ tasks }, null, 2),
    'utf8'
  );
  console.log(`✅ tasks.jsonを更新しました (${tasks.length}件のタスク)`);
  
  // 設定ファイルを更新
  const config = {
    current_wbs_id: wbsId,
    updated_at: new Date().toISOString()
  };
  fs.writeFileSync(
    configPath,
    JSON.stringify(config, null, 2),
    'utf8'
  );
  console.log(`✅ wbs_config.jsonを更新しました (current_wbs_id: ${wbsId})`);
  
  console.log('\n✅ WBSの選択が完了しました！');
  console.log(`\n📋 次のステップ:`);
  console.log(`   1. http://localhost:3000/wbs/view にアクセス`);
  console.log(`   2. タスク一覧で ${tasks.length}件のタスクが表示されることを確認`);
  
} catch (error) {
  console.error('❌ エラー:', error);
  process.exit(1);
}

