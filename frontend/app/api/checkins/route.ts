import { NextResponse } from 'next/server'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'

const dataDir = join(process.cwd(), '..', 'backend', 'data')
const checkinsDir = join(dataDir, 'checkins')

// チェックインディレクトリが存在しない場合は作成
if (!existsSync(checkinsDir)) {
  mkdirSync(checkinsDir, { recursive: true })
}

interface DailyCheckIn {
  student_id: string
  date: string // YYYY-MM-DD
  motivation_score: number // 1-5 (自己申告)
  energy_level: number // 1-5
  stress_level: number // 1-5
  comments?: string
  factors: {
    task_progress: 'positive' | 'neutral' | 'negative'
    team_communication: 'positive' | 'neutral' | 'negative'
    personal_issues: 'none' | 'minor' | 'major'
    achievements: string[]
    challenges: string[]
  }
}

/**
 * チェックインを取得
 * GET /api/checkins?student_id=S001&date=2024-01-15
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('student_id')
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const days = parseInt(searchParams.get('days') || '7') // デフォルト7日間

    if (studentId) {
      // 特定の学生のチェックインを取得
      const checkinFile = join(checkinsDir, `${studentId}.json`)
      if (!existsSync(checkinFile)) {
        return NextResponse.json([])
      }

      const allCheckins: DailyCheckIn[] = JSON.parse(readFileSync(checkinFile, 'utf8'))
      
      // 日付でフィルタリング
      const targetDate = new Date(date)
      const startDate = new Date(targetDate)
      startDate.setDate(startDate.getDate() - days)

      const filteredCheckins = allCheckins.filter(checkin => {
        const checkinDate = new Date(checkin.date)
        return checkinDate >= startDate && checkinDate <= targetDate
      })

      return NextResponse.json(filteredCheckins)
    } else {
      // 全学生のチェックインを取得
      const allCheckins: DailyCheckIn[] = []
      
      // チェックインディレクトリ内の全ファイルを読み込む
      const files = require('fs').readdirSync(checkinsDir).filter((f: string) => f.endsWith('.json'))
      
      for (const file of files) {
        const filePath = join(checkinsDir, file)
        const studentCheckins: DailyCheckIn[] = JSON.parse(readFileSync(filePath, 'utf8'))
        allCheckins.push(...studentCheckins)
      }

      return NextResponse.json(allCheckins)
    }
  } catch (error) {
    console.error('Error fetching checkins:', error)
    return NextResponse.json(
      { error: 'Failed to fetch checkins' },
      { status: 500 }
    )
  }
}

/**
 * チェックインを保存
 * POST /api/checkins
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const checkin: DailyCheckIn = await request.json()

    // バリデーション
    if (!checkin.student_id || !checkin.date) {
      return NextResponse.json(
        { error: 'student_id and date are required' },
        { status: 400 }
      )
    }

    if (checkin.motivation_score < 1 || checkin.motivation_score > 5) {
      return NextResponse.json(
        { error: 'motivation_score must be between 1 and 5' },
        { status: 400 }
      )
    }

    const checkinFile = join(checkinsDir, `${checkin.student_id}.json`)
    
    // 既存のチェックインを読み込む
    let allCheckins: DailyCheckIn[] = []
    if (existsSync(checkinFile)) {
      allCheckins = JSON.parse(readFileSync(checkinFile, 'utf8'))
    }

    // 同じ日付のチェックインがある場合は更新、なければ追加
    const existingIndex = allCheckins.findIndex(c => c.date === checkin.date)
    if (existingIndex >= 0) {
      allCheckins[existingIndex] = checkin
    } else {
      allCheckins.push(checkin)
    }

    // 日付でソート
    allCheckins.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // 保存
    writeFileSync(checkinFile, JSON.stringify(allCheckins, null, 2), 'utf8')

    return NextResponse.json({ success: true, checkin })
  } catch (error) {
    console.error('Error saving checkin:', error)
    return NextResponse.json(
      { error: 'Failed to save checkin' },
      { status: 500 }
    )
  }
}

