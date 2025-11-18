/**
 * 単一の学生データをAirtableに投入するAPIエンドポイント
 * UIから直接入力した学生データを投入
 */

import { NextResponse } from 'next/server';
import Airtable from 'airtable';

// 環境変数から取得し、余分な文字を削除
const rawApiKey = process.env.AIRTABLE_API_KEY;
const rawBaseId = process.env.AIRTABLE_BASE_ID;

const apiKey = rawApiKey ? rawApiKey.trim().replace(/[\r\n\s]/g, '') : null;
const baseId = rawBaseId ? rawBaseId.trim().replace(/[\r\n\s]/g, '') : null;

if (!apiKey || !baseId) {
  console.error('Airtable credentials not configured');
}

const base = apiKey && baseId ? new Airtable({ apiKey }).base(baseId) : null;

export async function POST(request: Request): Promise<Response> {
  if (!apiKey || !baseId) {
    return NextResponse.json(
      { error: 'Airtable credentials not configured' },
      { status: 500 }
    ) as Response;
  }

  if (!base) {
    return NextResponse.json(
      { error: 'Airtable not configured' },
      { status: 500 }
    ) as Response;
  }

  try {
    const studentData = await request.json();

    // 必須フィールドのチェック
    if (!studentData.student_id || !studentData.name) {
      return NextResponse.json(
        { error: 'student_idとnameは必須です' },
        { status: 400 }
      ) as Response;
    }

    // 既存のレコードを確認
    const existingRecords = await base('Students')
      .select({
        filterByFormula: `{student_id} = "${studentData.student_id}"`
      })
      .all() as Response;

    if (existingRecords.length > 0) {
      return NextResponse.json(
        { error: `Student ID "${studentData.student_id}" は既に存在します` },
        { status: 400 }
      ) as Response;
    }

    // データをクリーンアップ（Multiple selectフィールドを除外）
    const cleaned: any = {};
    Object.keys(studentData).forEach(key => {
      const value = studentData[key];
      
      // Multiple selectフィールドは除外
      if (key === 'preferred_partners' || key === 'avoided_partners' || 
          key === 'strengths' || key === 'weaknesses') {
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
    }) as Response;

    console.log(`📤 送信するフィールド:`, Object.keys(cleaned).join(', '));

    // レコードを作成
    await base('Students').create([{ fields: cleaned }]);

    return NextResponse.json({
      success: true,
      message: `学生「${studentData.name}」を追加しました`,
      student_id: studentData.student_id
    }) as Response;
  } catch (error: any) {
    console.error('Error importing student:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to import student',
        details: error.toString()
      },
      { status: 500 }
    ) as Response;
  }
}

