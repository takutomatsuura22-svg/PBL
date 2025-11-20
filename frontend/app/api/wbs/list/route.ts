import { NextResponse } from 'next/server'
import { fetchWBSFromAirtable } from '@/lib/airtable-server'

/**
 * WBS一覧を取得
 */
export async function GET(): Promise<Response> {
  try {
    console.log('📂 WBS一覧取得開始（Airtable）')
    
    const wbsList = await fetchWBSFromAirtable()
    
    // リスト形式に変換（tasksは除外）
    const wbsListFormatted = wbsList.map(wbs => ({
      wbs_id: wbs.wbs_id,
      name: wbs.name,
      description: wbs.description,
      created_at: wbs.created_at,
      task_count: wbs.task_count,
      is_current: wbs.is_current
    }))

    console.log(`📊 合計 ${wbsListFormatted.length}件のWBSを返します`)
    return NextResponse.json(wbsListFormatted) as Response
  } catch (error) {
    console.error('❌ Error fetching WBS list:', error)
    // Airtableが設定されていない場合は空配列を返す
    if (error instanceof Error && error.message.includes('not configured')) {
      return NextResponse.json([]) as Response
    }
    return NextResponse.json(
      { error: 'Failed to fetch WBS list', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    ) as Response
  }
}

