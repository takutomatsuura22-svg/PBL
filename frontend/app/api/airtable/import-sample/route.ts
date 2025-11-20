/**
 * Airtableにサンプルデータを投入するAPIエンドポイント
 * Next.jsの環境変数を使用するため、より確実に動作する
 */

import { NextResponse } from 'next/server';
import Airtable from 'airtable';

// 環境変数から取得し、余分な文字を削除
const rawApiKey = process.env.AIRTABLE_API_KEY;
const rawBaseId = process.env.AIRTABLE_BASE_ID;

// 改行文字、キャリッジリターン、スペースを削除
const apiKey = rawApiKey ? rawApiKey.trim().replace(/[\r\n\s]/g, '') : null;
const baseId = rawBaseId ? rawBaseId.trim().replace(/[\r\n\s]/g, '') : null;

if (!apiKey || !baseId) {
  console.error('Airtable credentials not configured');
  console.error('API Key exists:', !!rawApiKey, 'Length:', rawApiKey?.length);
  console.error('Base ID exists:', !!rawBaseId, 'Value:', rawBaseId);
}

const base = apiKey && baseId ? new Airtable({ apiKey }).base(baseId) : null;

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
    preferred_partners: [], // 後で手動で設定
    avoided_partners: [], // 後で手動で設定
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
    preferred_partners: [], // 後で手動で設定
    avoided_partners: [], // 後で手動で設定
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
    preferred_partners: [], // 後で手動で設定
    avoided_partners: [], // 後で手動で設定
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
    preferred_partners: [], // 後で手動で設定
    avoided_partners: [], // 後で手動で設定
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
    preferred_partners: [], // 後で手動で設定
    avoided_partners: [], // 後で手動で設定
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
    student_ids: [], // 後で手動で設定（学生データ投入後に設定）
    project_name: 'PBL管理システム'
  },
  {
    team_id: 'T002',
    name: 'チームB',
    description: 'サブ開発チーム',
    student_ids: [], // 後で手動で設定（学生データ投入後に設定）
    project_name: 'PBL管理システム'
  }
];

async function createRecords(tableName: string, records: any[]) {
  if (!base) {
    throw new Error('Airtable not configured');
  }

  // 既存のレコードを確認
  const existingRecords = await base(tableName).select().all();
  const existingIds = new Set<string>();
  
  existingRecords.forEach(r => {
    const fields = r.fields as any;
    const id = fields.student_id || fields.task_id || fields.team_id;
    if (id) existingIds.add(id);
  });

  const newRecords = records.filter(r => {
    const id = r.student_id || r.task_id || r.team_id;
    return !existingIds.has(id);
  });

  if (newRecords.length === 0) {
    return { created: 0, skipped: records.length };
  }

  // バッチで作成（最大10レコードずつ）
  const batchSize = 10;
  let created = 0;
  
  for (let i = 0; i < newRecords.length; i += batchSize) {
    const batch = newRecords.slice(i, i + batchSize);
    
    // 空の配列フィールドを除外（Airtableのエラーを回避）
    const cleanedBatch = batch.map((r, index) => {
      const cleaned: any = {};
      Object.keys(r).forEach(key => {
        const value = r[key];
        
        // Multiple selectやSelectフィールドの可能性がある配列フィールドをすべて除外
        if (key === 'preferred_partners' || key === 'avoided_partners' || key === 'student_ids' || 
            key === 'strengths' || key === 'weaknesses') {
          console.log(`⚠️  [${tableName}][レコード${index + 1}] Selectフィールド "${key}" を除外します`);
          return;
        }
        
        // 配列フィールドはすべて除外（selectタイプの可能性があるため）
        if (Array.isArray(value)) {
          console.log(`⚠️  [${tableName}][レコード${index + 1}] 配列フィールド "${key}" を除外します:`, value);
          return;
        }
        
        // undefinedやnullは除外
        if (value === undefined || value === null || value === '') {
          return;
        }
        
        // その他のフィールド（文字列、数値）のみ送信する
        cleaned[key] = value;
      });
      
      // デバッグ: 送信するフィールドを確認
      console.log(`📤 [${tableName}][レコード${index + 1}] 送信するフィールド:`, Object.keys(cleaned).join(', '));
      console.log(`📤 [${tableName}][レコード${index + 1}] 送信する値:`, JSON.stringify(cleaned, null, 2).substring(0, 200));
      
      return { fields: cleaned };
    });
    
    console.log(`📝 ${tableName}テーブル: ${cleanedBatch.length}件のレコードを作成中...`);
    
    try {
      await base(tableName).create(cleanedBatch);
      created += batch.length;
    } catch (error: any) {
      console.error(`❌ [${tableName}] エラー詳細:`, error);
      console.error(`❌ [${tableName}] エラーメッセージ:`, error.message);
      console.error(`❌ [${tableName}] 送信しようとしたデータ:`, JSON.stringify(cleanedBatch, null, 2).substring(0, 500));
      throw error;
    }
  }

  return { created, skipped: records.length - newRecords.length };
}

export async function POST(): Promise<Response> {
  // デバッグ情報を出力
  console.log('API Key exists:', !!apiKey);
  console.log('API Key length:', apiKey?.length || 0);
  console.log('API Key prefix:', apiKey ? apiKey.substring(0, 10) + '...' : 'N/A');
  console.log('API Key suffix:', apiKey ? '...' + apiKey.substring(apiKey.length - 5) : 'N/A');
  console.log('Base ID exists:', !!baseId);
  console.log('Base ID:', baseId || 'N/A');

  if (!apiKey || !baseId) {
    return NextResponse.json(
      { 
        error: 'Airtable credentials not configured',
        debug: {
          hasApiKey: !!apiKey,
          hasBaseId: !!baseId,
          envKeys: Object.keys(process.env).filter(key => key.includes('AIRTABLE'))
        }
      },
      { status: 500 }
    ) as Response;
  }

  try {
    // APIキーの詳細をログに出力
    console.log('=== Airtable API Key Debug ===');
    console.log('Raw API Key length:', rawApiKey?.length || 0);
    console.log('Cleaned API Key length:', apiKey?.length || 0);
    console.log('API Key starts with "pat":', apiKey?.startsWith('pat'));
    console.log('Base ID:', baseId);
    console.log('==============================');

    // データ投入の順序: Students → Tasks → Teams（Teamsは最後、student_idsフィールドがあるため）
    const results = {
      students: await createRecords('Students', studentsData),
      tasks: await createRecords('Tasks', tasksData),
      teams: await createRecords('Teams', teamsData)
    };

    return NextResponse.json({
      success: true,
      message: 'サンプルデータの投入が完了しました',
      results
    }) as Response;
  } catch (error: any) {
    console.error('Error importing sample data:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to import sample data',
        details: error.toString()
      },
      { status: 500 }
    ) as Response;
  }
}

