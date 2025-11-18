import { NextResponse } from 'next/server'
import { readdirSync, readFileSync, existsSync } from 'fs'
import { join, resolve } from 'path'

/**
 * WBS一覧を取得
 */
export async function GET(): Promise<Response> {
  try {
    // パス解決: より確実な方法
    // Next.jsのAPIルートは通常プロジェクトルートから実行されるが、frontendディレクトリから実行される場合もある
    const cwd = process.cwd()
    let dataDir: string
    
    // まず、frontendディレクトリから見たパスを試す
    const frontendPath = resolve(cwd, '..', 'backend', 'data')
    const rootPath = resolve(cwd, 'backend', 'data')
    
    // どちらが存在するか確認
    if (existsSync(frontendPath)) {
      dataDir = frontendPath
    } else if (existsSync(rootPath)) {
      dataDir = rootPath
    } else {
      // デフォルト: frontendディレクトリから見たパス
      dataDir = frontendPath
    }
    
    const wbsDir = join(dataDir, 'wbs')
    const configPath = join(dataDir, 'wbs_config.json')

    console.log('📂 WBS一覧取得開始')
    console.log('  process.cwd():', cwd)
    console.log('  dataDir:', dataDir)
    console.log('  wbsDir:', wbsDir)
    console.log('  wbsDir exists:', existsSync(wbsDir))

    // WBSディレクトリが存在しない場合は作成
    if (!existsSync(wbsDir)) {
      console.log('⚠️ WBSディレクトリが存在しません')
      return NextResponse.json([]) as Response
    }

    // 現在使用中のWBS IDを取得
    let currentWbsId: string | null = null
    if (existsSync(configPath)) {
      try {
        const config = JSON.parse(readFileSync(configPath, 'utf8'))
        currentWbsId = config.current_wbs_id || null
        console.log('  currentWbsId:', currentWbsId)
      } catch (error) {
        console.error('Error reading WBS config:', error)
      }
    }

    // WBSファイル一覧を取得
    const files = readdirSync(wbsDir).filter(f => f.endsWith('.json'))
    console.log('  found files:', files.length, files)
    
    const wbsList = files.map(file => {
      const filePath = join(wbsDir, file)
      try {
        const content = readFileSync(filePath, 'utf8')
        const data = JSON.parse(content)
        const wbsId = file.replace('.json', '')
        
        const wbsItem = {
          wbs_id: wbsId,
          name: data.name || wbsId,
          description: data.description || '',
          created_at: data.created_at || '',
          task_count: Array.isArray(data.tasks) ? data.tasks.length : 0,
          is_current: wbsId === currentWbsId
        }
        
        console.log(`  ✅ WBS読み込み成功: ${wbsItem.name} (${wbsItem.task_count}件のタスク)`)
        return wbsItem
      } catch (error) {
        console.error(`❌ Error reading WBS file ${file}:`, error)
        return null
      }
    }).filter(wbs => wbs !== null)

    console.log(`📊 合計 ${wbsList.length}件のWBSを返します`)
    return NextResponse.json(wbsList) as Response
  } catch (error) {
    console.error('❌ Error fetching WBS list:', error)
    return NextResponse.json(
      { error: 'Failed to fetch WBS list', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    ) as Response
  }
}

