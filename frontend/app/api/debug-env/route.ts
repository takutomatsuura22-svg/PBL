/**
 * 環境変数のデバッグ用エンドポイント
 * APIキーとBase IDが正しく読み込まれているか確認
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  return NextResponse.json({
    hasApiKey: !!apiKey,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : '未設定',
    hasBaseId: !!baseId,
    baseId: baseId || '未設定',
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('AIRTABLE'))
  });
}

