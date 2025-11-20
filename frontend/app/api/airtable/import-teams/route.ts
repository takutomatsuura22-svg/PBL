/**
 * チーム情報をAirtableに投入するAPIエンドポイント
 * backend/data/teams.json を読み込む
 */

import { NextResponse } from 'next/server';
import Airtable from 'airtable';
import { readFileSync } from 'fs';
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

// チームデータを読み込む
function loadTeamData() {
  const teamsPath = join(process.cwd(), '..', 'backend', 'data', 'teams.json');
  const content = readFileSync(teamsPath, 'utf8');
  const data = JSON.parse(content);
  return data.teams || [];
}

async function createRecords(tableName: string, records: any[]) {
  if (!base) {
    throw new Error('Airtable not configured');
  }

  // 既存のレコードを確認
  const existingRecords = Array.from(await base(tableName).select().all());
  const existingIds = new Set<string>();
  
  existingRecords.forEach(r => {
    const fields = r.fields as any;
    const id = fields.team_id;
    if (id) existingIds.add(id);
  });

  const newRecords = records.filter(r => {
    const id = r.team_id;
    return !existingIds.has(id);
  });

  if (newRecords.length === 0) {
    return { created: 0, skipped: records.length };
  }

  // 1件ずつ作成してエラーを特定
  let created = 0;
  
  for (const record of newRecords) {
    const cleaned: any = {};
    Object.keys(record).forEach(key => {
      const value = record[key];
      
      // Multiple selectフィールドのみ除外
      if (key === 'student_ids') {
        console.log(`⚠️  [${tableName}][${record.team_id || record.name}] Multiple selectフィールド "${key}" を除外します（後で手動で設定）`);
        return;
      }
      
      // 空の配列は除外
      if (Array.isArray(value) && value.length === 0) {
        return;
      }
      
      cleaned[key] = value;
    });
    
    console.log(`📤 [${tableName}][${record.team_id || record.name}] 送信するフィールド:`, Object.keys(cleaned).join(', '));
    
    try {
      await base(tableName).create([{ fields: cleaned }]);
      created += 1;
      console.log(`✅ [${tableName}] ${record.team_id || record.name} を作成しました`);
    } catch (error: any) {
      console.error(`❌ [${tableName}] ${record.team_id || record.name} の作成に失敗:`, error.message);
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
    // チームデータを読み込む
    const teamsData = loadTeamData();
    console.log(`📚 ${teamsData.length}件のチームデータを読み込みました`);

    const results = {
      teams: await createRecords('Teams', teamsData)
    };

    return NextResponse.json({
      success: true,
      message: `チーム情報（${results.teams.created}件）の投入が完了しました`,
      results
    }) as Response;
  } catch (error: any) {
    console.error('Error importing team data:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to import team data',
        details: error.toString()
      },
      { status: 500 }
    ) as Response;
  }
}

