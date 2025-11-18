/**
 * 実際の学生データをAirtableに投入するAPIエンドポイント
 * backend/data/students フォルダのJSONファイルを読み込む
 */

import { NextResponse } from 'next/server';
import Airtable from 'airtable';
import { readdirSync, readFileSync } from 'fs';
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

// 学生データを読み込む
function loadStudentData() {
  const studentsDir = join(process.cwd(), '..', 'backend', 'data', 'students');
  const files = readdirSync(studentsDir).filter(f => f.endsWith('.json'));
  
  const students = files.map(file => {
    const filePath = join(studentsDir, file);
    const content = readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  });
  
  return students;
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
    const cleanedBatch = batch.map((r, recordIndex) => {
      const globalIndex = i + recordIndex;
      const cleaned: any = {};
      Object.keys(r).forEach(key => {
        const value = r[key];
        
        // Multiple selectフィールドのみ除外（オプションが存在しない可能性があるため）
        // strengthsとweaknessesも除外（Airtableに存在しないオプションが含まれている可能性があるため）
        if (key === 'preferred_partners' || key === 'avoided_partners' || key === 'student_ids' || 
            key === 'strengths' || key === 'weaknesses') {
          console.log(`⚠️  [${tableName}][${r.student_id || r.name || `レコード${globalIndex + 1}`}] Multiple selectフィールド "${key}" を除外します（後で手動で設定）`);
          return;
        }
        
        // 空の配列は除外
        if (Array.isArray(value) && value.length === 0) {
          return;
        }
        
        // 配列で、値がS001-S999で始まるものも除外（student_id形式の値、Multiple selectの場合のみ）
        if (Array.isArray(value) && value.some((v: any) => typeof v === 'string' && /^S\d+$/.test(v))) {
          console.log(`⚠️  [${tableName}][${r.student_id || r.name || `レコード${globalIndex + 1}`}] Multiple selectフィールド "${key}" に student_id形式の値が含まれています。除外します:`, value);
          return;
        }
        
        // 配列で、値がT001-T999で始まるものも除外（team_id形式の値、Multiple selectの場合のみ）
        if (Array.isArray(value) && value.some((v: any) => typeof v === 'string' && /^T\d+$/.test(v))) {
          console.log(`⚠️  [${tableName}][${r.student_id || r.name || `レコード${globalIndex + 1}`}] Multiple selectフィールド "${key}" に team_id形式の値が含まれています。除外します:`, value);
          return;
        }
        
        // その他のフィールドは送信する
        cleaned[key] = value;
      });
      
      console.log(`📤 [${tableName}][${r.student_id || r.name || `レコード${globalIndex + 1}`}] 送信するフィールド:`, Object.keys(cleaned).join(', '));
      
      return { fields: cleaned, student_id: r.student_id, name: r.name };
    });
    
    console.log(`📝 ${tableName}テーブル: ${cleanedBatch.length}件のレコードを作成中...`);
    
    try {
      // 1件ずつ作成してエラーを特定
      for (const record of cleanedBatch) {
        try {
          const { student_id, name, ...fieldsOnly } = record;
          await base(tableName).create([{ fields: fieldsOnly.fields }]);
          created += 1;
          console.log(`✅ [${tableName}] ${student_id || name || 'レコード'} を作成しました`);
        } catch (error: any) {
          const studentId = record.student_id || record.name || 'レコード';
          console.error(`❌ [${tableName}] ${studentId} の作成に失敗:`, error.message);
          console.error(`❌ [${tableName}] ${studentId} のエラー詳細:`, error);
          // エラーがあっても続行（他のレコードは作成を試みる）
        }
      }
    } catch (error: any) {
      console.error(`❌ [${tableName}] バッチ処理エラー:`, error);
      throw error;
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
    // 実際の学生データを読み込む
    const studentsData = loadStudentData() as Response;
    console.log(`📚 ${studentsData.length}件の学生データを読み込みました`);

    const results = {
      students: await createRecords('Students', studentsData)
    };

    return NextResponse.json({
      success: true,
      message: `実際の学生データ（${results.students.created}件）の投入が完了しました`,
      results
    }) as Response;
  } catch (error: any) {
    console.error('Error importing real student data:', error) as Response;
    return NextResponse.json(
      { 
        error: error.message || 'Failed to import real student data',
        details: error.toString()
      },
      { status: 500 }
    ) as Response;
  }
}

