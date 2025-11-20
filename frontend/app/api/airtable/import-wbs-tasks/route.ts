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
  
  console.log('📂 パス情報:');
  console.log('  process.cwd():', process.cwd());
  console.log('  dataDir:', dataDir);
  console.log('  configPath:', configPath);
  console.log('  wbsDir:', wbsDir);
  console.log('  configPath exists:', existsSync(configPath));
  
  // 現在のWBS IDを取得
  let currentWbsId: string | null = null;
  if (existsSync(configPath)) {
    try {
      const config = JSON.parse(readFileSync(configPath, 'utf8'));
      currentWbsId = config.current_wbs_id || null;
      console.log('✅ WBS設定を読み込み:', currentWbsId);
    } catch (error) {
      console.error('❌ Error reading WBS config:', error);
    }
  } else {
    console.error('❌ WBS設定ファイルが見つかりません:', configPath);
  }
  
  if (!currentWbsId) {
    throw new Error('WBSが選択されていません。まずWBSをアップロードして選択してください。');
  }
  
  const wbsPath = join(wbsDir, `${currentWbsId}.json`);
  console.log('  wbsPath:', wbsPath);
  console.log('  wbsPath exists:', existsSync(wbsPath));
  
  if (!existsSync(wbsPath)) {
    throw new Error(`WBSファイルが見つかりません: ${currentWbsId} (パス: ${wbsPath})`);
  }
  
  const wbsData = JSON.parse(readFileSync(wbsPath, 'utf8'));
  const taskCount = wbsData.tasks ? wbsData.tasks.length : 0;
  console.log(`✅ WBSファイルを読み込み: ${taskCount}件のタスク`);
  return wbsData.tasks || [];
}

async function createRecords(tableName: string, records: any[]) {
  if (!base) {
    throw new Error('Airtable not configured');
  }

  // テーブルが存在するか確認
  try {
    await base(tableName).select({ maxRecords: 1 }).firstPage();
  } catch (error: any) {
    if (error.message && error.message.includes('Could not find table')) {
      throw new Error(`Airtableのテーブル "${tableName}" が見つかりません。テーブルが削除されている可能性があります。Airtableでテーブルを復元するか、新しく作成してください。`);
    }
    throw error;
  }

  // 既存のレコードを確認
  let existingRecords: any[] = [];
  try {
    existingRecords = Array.from(await base(tableName).select().all());
  } catch (error: any) {
    console.error(`既存レコードの取得に失敗:`, error.message);
    // 続行（新規作成のみ）
  }
  
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
    console.log(`📋 すべてのタスクが既に存在します（${records.length}件スキップ）`);
    return { created: 0, skipped: records.length, updated: 0 };
  }

  console.log(`📝 新規作成: ${newRecords.length}件 / 既存スキップ: ${records.length - newRecords.length}件`);

  // 1件ずつ作成してエラーを特定
  let created = 0;
  const errors: string[] = [];
  
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
      const errorMsg = `❌ [${tableName}] ${record.task_id || record.title} の作成に失敗: ${error.message}`;
      console.error(errorMsg);
      errors.push(errorMsg);
      // エラーがあっても続行
    }
  }

  if (errors.length > 0) {
    console.error(`⚠️ ${errors.length}件のエラーが発生しました:`, errors.slice(0, 5));
  }

  return { 
    created, 
    skipped: records.length - newRecords.length,
    errors: errors.length > 0 ? errors.slice(0, 10) : undefined
  };
}

export async function POST(): Promise<Response> {
  console.log('🚀 WBSタスクインポートAPIが呼び出されました');
  console.log('🔑 API Key exists:', !!apiKey);
  console.log('🔑 Base ID exists:', !!baseId);
  
  if (!apiKey || !baseId) {
    console.error('❌ Airtable認証情報が設定されていません');
    return NextResponse.json(
      { error: 'Airtable credentials not configured' },
      { status: 500 }
    ) as Response;
  }

  try {
    // WBSからタスクデータを読み込む
    console.log('📖 WBSタスクデータの読み込みを開始...');
    const tasksData = loadWBSTasks();
    console.log(`📚 ${tasksData.length}件のタスクデータを読み込みました`);

    const results = {
      tasks: await createRecords('Tasks', tasksData)
    };

    const message = results.tasks.errors && results.tasks.errors.length > 0
      ? `WBSのタスクデータ（${results.tasks.created}件作成、${results.tasks.skipped}件スキップ）の投入が完了しました。ただし、${results.tasks.errors.length}件のエラーが発生しました。`
      : `WBSのタスクデータ（${results.tasks.created}件作成、${results.tasks.skipped}件スキップ）の投入が完了しました`;

    return NextResponse.json({
      success: true,
      message,
      results,
      warnings: results.tasks.errors
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

