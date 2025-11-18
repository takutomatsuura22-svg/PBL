import { NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs'
import { join } from 'path'

/**
 * WBSを削除
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    const wbsId = params.id
    const dataDir = join(process.cwd(), '..', 'backend', 'data')
    const wbsDir = join(dataDir, 'wbs')
    const wbsPath = join(wbsDir, `${wbsId}.json`)
    const configPath = join(dataDir, 'wbs_config.json')

    // WBSファイルが存在するか確認
    if (!existsSync(wbsPath)) {
      return NextResponse.json(
        { error: 'WBS not found' },
        { status: 404 }
      ) as Response
    }

    // 現在使用中のWBSか確認
    let currentWbsId: string | null = null
    if (existsSync(configPath)) {
      try {
        const config = JSON.parse(readFileSync(configPath, 'utf8'))
        currentWbsId = config.current_wbs_id || null
      } catch (error) {
        console.error('Error reading WBS config:', error)
      }
    }

    if (wbsId === currentWbsId) {
      return NextResponse.json(
        { error: '現在使用中のWBSは削除できません。先に別のWBSを選択してください。' },
        { status: 400 }
      ) as Response
    }

    // WBSファイルを削除
    unlinkSync(wbsPath)

    return NextResponse.json({
      success: true,
      message: `WBS「${wbsId}」を削除しました。`
    }) as Response
  } catch (error) {
    console.error('Error deleting WBS:', error)
    return NextResponse.json(
      { error: 'Failed to delete WBS' },
      { status: 500 }
    ) as Response
  }
}

