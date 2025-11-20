import { NextResponse } from 'next/server'
import { updateCurrentWBSInAirtable } from '@/lib/airtable-update'
import { fetchWBSFromAirtable } from '@/lib/airtable-server'

/**
 * 使用するWBSを選択
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const { wbs_id } = await request.json()

    if (!wbs_id) {
      return NextResponse.json(
        { error: 'wbs_id is required' },
        { status: 400 }
      ) as Response
    }

    // WBSが存在するか確認
    const wbsList = await fetchWBSFromAirtable()
    const wbs = wbsList.find(w => w.wbs_id === wbs_id)
    
    if (!wbs) {
      return NextResponse.json(
        { error: 'WBS not found' },
        { status: 404 }
      ) as Response
    }

    // Airtableでis_currentフラグを更新
    const updated = await updateCurrentWBSInAirtable(wbs_id)
    
    if (!updated) {
      console.warn('Failed to update current WBS in Airtable, but continuing...')
    }

    return NextResponse.json({
      success: true,
      message: `WBS「${wbs.name || wbs_id}」を選択しました。`
    }) as Response
  } catch (error) {
    console.error('Error selecting WBS:', error)
    return NextResponse.json(
      { error: 'Failed to select WBS', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    ) as Response
  }
}


