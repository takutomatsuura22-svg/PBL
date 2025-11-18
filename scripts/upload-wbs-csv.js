/**
 * CSVファイルからWBSをアップロードするスクリプト
 */

const fs = require('fs');
const path = require('path');
const { join } = require('path');

// CSVファイルのパス（ワークスペースルートから）
const csvPath = path.join(__dirname, '..', '..', '2025沖縄PBL WBS.xlsx - 沖縄PBL.csv');

if (!fs.existsSync(csvPath)) {
  console.error('❌ CSVファイルが見つかりません:', csvPath);
  process.exit(1);
}

// CSVをパースする関数（upload/route.tsと同じロジック）
function parseCSV(csvContent) {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  // ヘッダー行を探す
  let headerIndex = 0;
  let dataStartIndex = 1;
  
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = parseCSVLine(lines[i]);
    const firstCol = line[0]?.toLowerCase() || '';
    if (firstCol.includes('ステータス') || firstCol.includes('status') || 
        firstCol.includes('カテゴリ') || firstCol.includes('category')) {
      headerIndex = i;
      dataStartIndex = i + 1;
      break;
    }
  }

  const headers = parseCSVLine(lines[headerIndex]).map(h => h.replace(/^"|"$/g, '').trim());
  console.log('📋 CSVヘッダー:', headers.join(', '));
  
  const tasks = [];
  
  for (let i = dataStartIndex; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]).map(v => v.replace(/^"|"$/g, '').trim());
    const task = {};
    
    headers.forEach((header, index) => {
      const value = values[index] || '';
      const headerLower = header.toLowerCase();
      
      if (headerLower.includes('ステータス') || headerLower === 'status') {
        if (value.includes('完了')) {
          task.status = 'completed';
        } else if (value.includes('着手中') || value.includes('進行中')) {
          task.status = 'in_progress';
        } else if (value.includes('未着手') || value === '') {
          task.status = 'pending';
        } else {
          task.status = 'pending';
        }
      } else if (headerLower.includes('カテゴリ') || headerLower === 'category') {
        task.category = value || '実行';
      } else if (headerLower.includes('タスク1') || headerLower.includes('タスク2')) {
        if (!task.title) {
          task.title = value;
        } else {
          task.title = `${task.title} ${value}`.trim();
        }
      } else if (headerLower.includes('成果物') || headerLower.includes('deliverable')) {
        task.description = task.description ? `${task.description}\n成果物: ${value}` : `成果物: ${value}`;
      } else if (headerLower.includes('担当者') || headerLower.includes('assignee')) {
        if (value) {
          task.assignee_id = value.trim();
        }
      } else if (headerLower.includes('レビュワー') || headerLower.includes('reviewer')) {
        if (value) {
          task.description = task.description ? `${task.description}\nレビュワー: ${value}` : `レビュワー: ${value}`;
        }
      } else if (headerLower.includes('開始日') || headerLower.includes('start')) {
        if (value) {
          task.start_date = convertDate(value);
        }
      } else if (headerLower.includes('終了日') || headerLower.includes('end')) {
        if (value) {
          task.end_date = convertDate(value);
          task.deadline = convertDate(value);
        }
      }
    });
    
    if (task.title && task.title.trim() && task.title.trim() !== '') {
      if (!task.task_id) {
        task.task_id = `T${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      if (!task.difficulty) {
        task.difficulty = 3;
      }
      tasks.push(task);
    }
  }
  
  console.log(`📊 ${tasks.length}件のタスクをパースしました`);
  return tasks;
}

function convertDate(dateStr) {
  if (!dateStr || dateStr.trim() === '') return '';
  
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return dateStr;
  }
  
  const parts = dateStr.split('/');
  if (parts.length === 2) {
    const month = parts[0].padStart(2, '0');
    const day = parts[1].padStart(2, '0');
    const year = 2025; // 2025年をデフォルト
    return `${year}-${month}-${day}`;
  }
  
  return dateStr;
}

// WBSデータを保存
function saveWBS(tasks, wbsName) {
  const dataDir = join(__dirname, '..', 'backend', 'data');
  const wbsDir = join(dataDir, 'wbs');
  
  if (!fs.existsSync(wbsDir)) {
    fs.mkdirSync(wbsDir, { recursive: true });
  }

  const wbsId = `wbs_${Date.now()}`;
  const wbsPath = join(wbsDir, `${wbsId}.json`);

  const wbsData = {
    wbs_id: wbsId,
    name: wbsName,
    description: '',
    created_at: new Date().toISOString(),
    tasks: tasks
  };

  fs.writeFileSync(wbsPath, JSON.stringify(wbsData, null, 2), 'utf8');
  console.log(`✅ WBSを保存しました: ${wbsPath}`);
  console.log(`   WBS ID: ${wbsId}`);
  console.log(`   タスク数: ${tasks.length}件`);
  
  return wbsId;
}

// 実行
try {
  console.log('📂 CSVファイルを読み込み中...');
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  
  console.log('📋 CSVをパース中...');
  const tasks = parseCSV(csvContent);
  
  if (tasks.length === 0) {
    console.error('❌ タスクが見つかりませんでした');
    process.exit(1);
  }
  
  console.log('💾 WBSを保存中...');
  const wbsId = saveWBS(tasks, '沖縄PBL');
  
  console.log('\n✅ WBSのアップロードが完了しました！');
  console.log(`\n📋 次のステップ:`);
  console.log(`   1. http://localhost:3000/wbs にアクセス`);
  console.log(`   2. WBS一覧で「${wbsId}」を確認`);
  console.log(`   3. 「選択」ボタンをクリックしてWBSを有効化`);
  
} catch (error) {
  console.error('❌ エラー:', error);
  process.exit(1);
}

