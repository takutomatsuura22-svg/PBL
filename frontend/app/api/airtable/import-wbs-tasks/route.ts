/**
 * WBSから読み込んだタスクデータをAirtableに投入するAPIエンドポイント
 * 現在選択されているWBSのタスクをAirtableに投入
 */

import { NextResponse } from 'next/server';
import Airtable from 'airtable';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// 環境変数から取得し、余分な文字を削除
const rawApiKey = process.env.AIRTABLE_API_KEY;
const rawBaseId = process.env.AIRTABLE_BASE_ID;

const apiKey = rawApiKey ? rawApiKey.trim().replace(/[\r\n\s]/g, '') : null;
const baseId = rawBaseId ? rawBaseId.trim().replace(/[\r\n\s]/g, '') : null;

if (!apiKey || !baseId) {
  console.error('Airtable credentials not configured');
}

const base = apiKey && baseId ? new Airtable({ apiKey }).base(baseId) : null;

// 現在選択されているWBSのタスクデータを読み込む
function loadWBSTasks() {
  const dataDir = join(process.cwd(), '..', 'backend', 'data');
  const configPath = join(dataDir, 'wbs_config.json');
  const wbsDir = join(dataDir, 'wbs');
  
  // 現在のWBS IDを取得
  let currentWbsId: string | null = null;
  if (existsSync(configPath)) {
    try {
      const config = JSON.parse(readFileSync(configPath, 'utf8'));
      currentWbsId = config.current_wbs_id || null;
    } catch (error) {
      console.error('Error reading WBS config:', error);
    }
  }
  
  if (!currentWbsId) {
    throw new Error('WBSが選択されていません。まずWBSをアップロードして選択してください。');
  }
  
  const wbsPath = join(wbsDir, `${currentWbsId}.json`);
  if (!existsSync(wbsPath)) {
    throw new Error(`WBSファイルが見つかりません: ${currentWbsId}`);
  }
  
  const wbsData = JSON.parse(readFileSync(wbsPath, 'utf8'));
  return wbsData.tasks || [];
}

async function createRecords(tableName: string, records: any[]) {
  if (!base) {
    throw new Error('Airtable not configured');
  }

  // 既存のレコードを確認
  const existingRecords = await base(tableName).select().all();
  const existingIds = new Set<string>();
  
  existingRecords.forEach(r => {
    const fields = r.fields as any;
    const id = fields.task_id;
    if (id) existingIds.add(id);
  });

  const newRecords = records.filter(r => {
    const id = r.task_id;
    return !existingIds.has(id);
  });

  if (newRecords.length === 0) {
    return { created: 0, skipped: records.length, updated: 0 };
  }

  // 1件ずつ作成してエラーを特定
  let created = 0;
  
  for (const record of newRecords) {
    const cleaned: any = {};
    Object.keys(record).forEach(key => {
      const value = record[key];
      
      // Multiple selectフィールドのみ除外
      if (key === 'required_skills') {
        // required_skillsは配列だが、オプションが存在する場合は送信する
        // 空の場合は除外
        if (Array.isArray(value) && value.length > 0) {
          cleaned[key] = value;
        }
        return;
      }
      
      // assignee_idは文字列なので送信する（ただし、空の場合は除外）
      if (key === 'assignee_id') {
        if (value && (typeof value === 'string' || Array.isArray(value))) {
          // 文字列の場合はそのまま、配列の場合は最初の要素を文字列として
          cleaned[key] = Array.isArray(value) ? value[0] : value;
        }
        return;
      }
      
      // 空の配列は除外
      if (Array.isArray(value) && value.length === 0) {
        return;
      }
      
      // undefinedやnullは除外
      if (value === undefined || value === null) {
        return;
      }
      
      cleaned[key] = value;
    });
    
    console.log(`📤 [${tableName}][${record.task_id || record.title}] 送信するフィールド:`, Object.keys(cleaned).join(', '));
    
    try {
      await base(tableName).create([{ fields: cleaned }]);
      created += 1;
      console.log(`✅ [${tableName}] ${record.task_id || record.title} を作成しました`);
    } catch (error: any) {
      console.error(`❌ [${tableName}] ${record.task_id || record.title} の作成に失敗:`, error.message);
      // エラーがあっても続行
    }
  }

  return { created, skipped: records.length - newRecords.length };
}

export async function POST(): Promise<Response> {
  if (!apiKey || !baseId) {
    return NextResponse.json(
      { error: 'Airtable credentials not configured' },
      { status: 500 }
    ) as Response;
  }

  try {
    // WBSからタスクデータを読み込む
    const tasksData = loadWBSTasks();
    console.log(`📚 ${tasksData.length}件のタスクデータを読み込みました`);

    const results = {
      tasks: await createRecords('Tasks', tasksData)
    };

    return NextResponse.json({
      success: true,
      message: `WBSのタスクデータ（${results.tasks.created}件）の投入が完了しました`,
      results
    }) as Response;
  } catch (error: any) {
    console.error('Error importing WBS tasks:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to import WBS tasks',
        details: error.toString()
      },
      { status: 500 }
    ) as Response;
  }
}

