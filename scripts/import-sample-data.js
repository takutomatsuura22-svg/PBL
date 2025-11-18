/**
 * Airtableにサンプルデータを投入するスクリプト
 * HTTPSリクエストで直接Airtable APIを呼び出す
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

if (!apiKey || !baseId) {
  console.error('❌ エラー: .env.localファイルにAIRTABLE_API_KEYとAIRTABLE_BASE_IDが設定されていません。\n');
  process.exit(1);
}

function makeRequest(options, data = null) {
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
            // より詳細なエラー情報を出力
            const errorMsg = parsed.error?.message || body;
            const errorType = parsed.error?.type || 'Unknown';
            reject(new Error(`HTTP ${res.statusCode} (${errorType}): ${errorMsg}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${body.substring(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function getExistingRecords(tableName) {
  const options = {
    hostname: 'api.airtable.com',
    path: `/v0/${baseId}/${encodeURIComponent(tableName)}?maxRecords=100`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    const result = await makeRequest(options);
    return result.records || [];
  } catch (error) {
    if (error.message.includes('404') || error.message.includes('not found') || error.message.includes('TABLE_NOT_FOUND')) {
      console.log(`   ℹ️  テーブル "${tableName}" はまだ空です（新規作成可能）。`);
      return [];
    }
    // 401エラーの場合は詳細を出力
    if (error.message.includes('401') || error.message.includes('AUTHENTICATION_REQUIRED')) {
      console.error(`   ❌ 認証エラー詳細: ${error.message}`);
      console.error(`   📋 確認事項:`);
      console.error(`      - APIキー: ${apiKey ? apiKey.substring(0, 15) + '...' : '未設定'}`);
      console.error(`      - Base ID: ${baseId}`);
      console.error(`      - テーブル名: ${tableName}`);
    }
    throw error;
  }
}

async function createRecords(tableName, records) {
  console.log(`\n📝 ${tableName}テーブルにデータを投入中...`);
  
  try {
    // 既存のレコードを確認（重複チェック）
    const existingRecords = await getExistingRecords(tableName);
    const existingIds = new Set();
    
    existingRecords.forEach(r => {
      const fields = r.fields;
      const id = fields.student_id || fields.task_id || fields.team_id;
      if (id) existingIds.add(id);
    });

    const newRecords = records.filter(r => {
      const id = r.student_id || r.task_id || r.team_id;
      return !existingIds.has(id);
    });

    if (newRecords.length === 0) {
      console.log(`   ⚠️  すべてのレコードが既に存在します。スキップします。`);
      return;
    }

    // バッチで作成（Airtable APIは最大10レコードずつ）
    const batchSize = 10;
    for (let i = 0; i < newRecords.length; i += batchSize) {
      const batch = newRecords.slice(i, i + batchSize);
      
      const options = {
        hostname: 'api.airtable.com',
        path: `/v0/${baseId}/${encodeURIComponent(tableName)}`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      };

      const data = {
        records: batch.map(r => ({ fields: r }))
      };

      await makeRequest(options, data);
      console.log(`   ✅ ${batch.length}件のレコードを作成しました`);
    }

    console.log(`   ✅ 合計 ${newRecords.length}件のレコードを投入しました`);
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('404')) {
      console.error(`   ❌ テーブル "${tableName}" が見つかりません。`);
      console.error(`      テーブル名が正しいか確認してください。`);
    } else if (error.message.includes('401') || error.message.includes('Authentication')) {
      console.error(`   ❌ 認証エラー: APIキーが無効か、権限が不足しています。`);
    } else {
      console.error(`   ❌ エラー: ${error.message}`);
    }
    throw error;
  }
}

// サンプルデータ
const studentsData = [
  {
    student_id: 'S001',
    name: '山田太郎',
    MBTI: 'ENFP',
    animal_type: 'ライオン',
    strengths: ['企画', '実行'],
    weaknesses: ['調整'],
    'skill_企画': 4,
    'skill_実行': 5,
    'skill_調整': 3,
    'skill_探索': 4,
    preferred_partners: ['S002', 'S003'],
    avoided_partners: ['S005'],
    team_id: 'T001',
    motivation_score: 4.2,
    load_score: 3.5
  },
  {
    student_id: 'S002',
    name: '佐藤花子',
    MBTI: 'ISFJ',
    animal_type: 'コアラ',
    strengths: ['調整', '探索'],
    weaknesses: ['企画'],
    'skill_企画': 3,
    'skill_実行': 3,
    'skill_調整': 5,
    'skill_探索': 4,
    preferred_partners: ['S001', 'S004'],
    avoided_partners: [],
    team_id: 'T001',
    motivation_score: 3.8,
    load_score: 2.8
  },
  {
    student_id: 'S003',
    name: '鈴木一郎',
    MBTI: 'INTJ',
    animal_type: 'オオカミ',
    strengths: ['探索', '企画'],
    weaknesses: ['実行'],
    'skill_企画': 4,
    'skill_実行': 2,
    'skill_調整': 3,
    'skill_探索': 5,
    preferred_partners: ['S001'],
    avoided_partners: [],
    team_id: 'T001',
    motivation_score: 4.0,
    load_score: 3.0
  },
  {
    student_id: 'S004',
    name: '田中さくら',
    MBTI: 'ESFP',
    animal_type: 'イルカ',
    strengths: ['実行', '調整'],
    weaknesses: ['探索'],
    'skill_企画': 3,
    'skill_実行': 5,
    'skill_調整': 4,
    'skill_探索': 2,
    preferred_partners: ['S002', 'S005'],
    avoided_partners: [],
    team_id: 'T002',
    motivation_score: 4.5,
    load_score: 2.5
  },
  {
    student_id: 'S005',
    name: '高橋健太',
    MBTI: 'ISTP',
    animal_type: 'カメ',
    strengths: ['実行', '探索'],
    weaknesses: ['企画', '調整'],
    'skill_企画': 2,
    'skill_実行': 4,
    'skill_調整': 2,
    'skill_探索': 4,
    preferred_partners: ['S004'],
    avoided_partners: ['S001'],
    team_id: 'T002',
    motivation_score: 3.5,
    load_score: 3.2
  }
];

const tasksData = [
  {
    task_id: 'T001',
    title: 'プロジェクト企画書作成',
    description: '新規プロジェクトの企画書を作成する',
    category: '企画',
    difficulty: 4,
    estimated_hours: 8,
    deadline: '2024-12-31',
    start_date: '2024-12-01',
    end_date: '2024-12-31',
    status: 'in_progress',
    assignee_id: 'S001',
    required_skills: ['企画', '実行']
  },
  {
    task_id: 'T002',
    title: '市場調査とデータ分析',
    description: '競合他社の調査と市場データの分析を行う',
    category: '探索',
    difficulty: 3,
    estimated_hours: 6,
    deadline: '2024-12-25',
    start_date: '2024-12-10',
    end_date: '2024-12-25',
    status: 'pending',
    assignee_id: 'S002',
    required_skills: ['探索']
  },
  {
    task_id: 'T003',
    title: 'UIデザイン作成',
    description: 'ダッシュボードのUIデザインを作成する',
    category: '企画',
    difficulty: 3,
    estimated_hours: 10,
    deadline: '2024-12-20',
    start_date: '2024-12-05',
    end_date: '2024-12-20',
    status: 'in_progress',
    assignee_id: 'S003',
    required_skills: ['企画', '実行']
  },
  {
    task_id: 'T004',
    title: 'バックエンドAPI開発',
    description: 'RESTful APIの実装を行う',
    category: '実行',
    difficulty: 5,
    estimated_hours: 20,
    deadline: '2025-01-15',
    start_date: '2024-12-15',
    end_date: '2025-01-15',
    status: 'pending',
    assignee_id: 'S004',
    required_skills: ['実行', '探索']
  },
  {
    task_id: 'T005',
    title: 'チームミーティング調整',
    description: '週次ミーティングの日程調整と議事録作成',
    category: '調整',
    difficulty: 2,
    estimated_hours: 3,
    deadline: '2024-12-15',
    start_date: '2024-12-10',
    end_date: '2024-12-15',
    status: 'completed',
    assignee_id: 'S002',
    required_skills: ['調整']
  }
];

const teamsData = [
  {
    team_id: 'T001',
    name: 'チームA',
    description: 'メイン開発チーム',
    student_ids: ['S001', 'S002', 'S003'],
    project_name: 'PBL管理システム'
  },
  {
    team_id: 'T002',
    name: 'チームB',
    description: 'サブ開発チーム',
    student_ids: ['S004', 'S005'],
    project_name: 'PBL管理システム'
  }
];

async function main() {
  console.log('🚀 Airtableサンプルデータ投入スクリプト\n');
  console.log(`📝 設定情報:`);
  console.log(`   APIキー: ${apiKey ? apiKey.substring(0, 10) + '...' : '❌ 未設定'}`);
  console.log(`   Base ID: ${baseId || '❌ 未設定'}\n`);
  
  if (!apiKey || !baseId) {
    console.error('❌ エラー: APIキーまたはBase IDが設定されていません。');
    console.error('   .env.localファイルを確認してください。\n');
    process.exit(1);
  }

  try {
    // 各テーブルにデータを投入
    await createRecords('Students', studentsData);
    await createRecords('Tasks', tasksData);
    await createRecords('Teams', teamsData);

    console.log('\n🎉 すべてのサンプルデータの投入が完了しました！\n');
    console.log('📋 次のステップ:');
    console.log('1. Airtableでデータを確認してください');
    console.log('2. 開発サーバーを起動: npm run dev');
    console.log('3. ブラウザで http://localhost:3000 を開いて確認\n');

  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error.message);
    console.error('\nトラブルシューティング:');
    console.error('1. テーブル名が正しいか確認（Students, Tasks, Teams）');
    console.error('2. フィールド名が正しいか確認');
    console.error('3. APIキーに data.records:write 権限があるか確認');
    process.exit(1);
  }
}

main();
