/**
 * 画像から取得した学生データをAirtableに投入するAPIエンドポイント
 * backend/data/students_from_image.json ファイルを読み込む
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

// 学生データを読み込む
function loadStudentData() {
  const studentsPath = join(process.cwd(), '..', 'backend', 'data', 'students_from_image.json');
  const content = readFileSync(studentsPath, 'utf8');
  return JSON.parse(content);
}

async function createRecords(tableName: string, records: any[]) {
  if (!base) {
    throw new Error('Airtable not configured');
  }

  const results = [];
  const errors = [];

  // 1件ずつ処理してエラーを詳細に記録
  for (const record of records) {
    try {
      // Multiple selectフィールドを除外
      const cleaned: any = {};
      Object.keys(record).forEach(key => {
        const value = record[key];
        
        // Multiple selectフィールド（preferred_partners, avoided_partners）は除外（後で手動で設定）
        if (key === 'preferred_partners' || key === 'avoided_partners') {
          return;
        }
        
        // strengthsとweaknessesは配列として送信（空配列の場合は除外）
        if (key === 'strengths' || key === 'weaknesses') {
          if (Array.isArray(value) && value.length > 0) {
            cleaned[key] = value;
          }
          return;
        }
        
        // 空の配列は除外
        if (Array.isArray(value) && value.length === 0) {
          return;
        }
        
        // undefinedやnullは除外
        if (value === undefined || value === null || value === '') {
          return;
        }
        
        cleaned[key] = value;
      });

      console.log(`📤 ${record.name} をインポート中...`);
      console.log(`   フィールド: ${Object.keys(cleaned).join(', ')}`);

      const created = await base(tableName).create([{ fields: cleaned }]);
      results.push({
        student_id: record.student_id,
        name: record.name,
        success: true,
        record_id: created[0].id
      });
      
      console.log(`✅ ${record.name} をインポート成功`);
    } catch (error: any) {
      console.error(`❌ ${record.name} のインポートエラー:`, error);
      errors.push({
        student_id: record.student_id,
        name: record.name,
        error: error.message || error.toString()
      });
    }
  }

  return { results, errors };
}

export async function POST() {
  if (!apiKey || !baseId) {
    return NextResponse.json(
      { error: 'Airtable credentials not configured' },
      { status: 500 }
    );
  }

  if (!base) {
    return NextResponse.json(
      { error: 'Airtable not configured' },
      { status: 500 }
    );
  }

  try {
    const students = loadStudentData();
    console.log(`📚 ${students.length}件の学生データを読み込みました`);

    const { results, errors } = await createRecords('Students', students);

    return NextResponse.json({
      success: true,
      message: `画像から取得した学生データの投入が完了しました`,
      total: students.length,
      succeeded: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    console.error('Error importing students from image:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to import students from image',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}

