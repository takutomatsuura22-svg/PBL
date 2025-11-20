import { NextResponse } from 'next/server'
import { fetchMeetingsFromAirtable } from '@/lib/airtable-server'
import { saveMeetingToAirtable } from '@/lib/airtable-update'

interface MeetingRecord {
  meeting_id: string
  date: string
  title: string
  participants: string[]
  agenda: string[]
  content: string
  decisions: string[]
  action_items: Array<{
    task: string
    assignee: string
    deadline?: string
  }>
  created_by: string
  created_at: string
}

/**
 * 議事録を取得
 * GET /api/meetings
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const studentId = searchParams.get('student_id')

    // Airtableから議事録を取得
    let allMeetings: MeetingRecord[] = []
    try {
      allMeetings = await fetchMeetingsFromAirtable()
    } catch (error) {
      // Airtableが設定されていない場合は空配列を返す
      if (error instanceof Error && error.message.includes('not configured')) {
        return NextResponse.json([]) as Response
      }
      throw error
    }

    // フィルタリング
    let filtered = allMeetings

    if (date) {
      filtered = filtered.filter(m => m.date === date)
    }

    if (studentId) {
      filtered = filtered.filter(m => 
        m.participants.includes(studentId) || m.created_by === studentId
      )
    }

    // 日付でソート（新しい順）
    filtered.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    return NextResponse.json(filtered) as Response
  } catch (error) {
    console.error('Error fetching meetings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch meetings', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    ) as Response
  }
}

/**
 * 議事録を保存
 * POST /api/meetings
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const meetingData = await request.json()

    // バリデーション
    if (!meetingData.date || !meetingData.title || !meetingData.content || !meetingData.created_by) {
      return NextResponse.json(
        { error: 'date, title, content, and created_by are required' },
        { status: 400 }
      ) as Response
    }

    // meeting_idを生成
    const meetingId = `M${Date.now()}`

    const meeting: MeetingRecord = {
      meeting_id: meetingId,
      date: meetingData.date,
      title: meetingData.title,
      participants: meetingData.participants || [],
      agenda: meetingData.agenda || [],
      content: meetingData.content,
      decisions: meetingData.decisions || [],
      action_items: meetingData.action_items || [],
      created_by: meetingData.created_by,
      created_at: new Date().toISOString()
    }

    // Airtableに保存
    const saved = await saveMeetingToAirtable(meeting)
    
    if (!saved) {
      console.warn('Failed to save meeting to Airtable')
      // Airtableが設定されていない場合は警告のみ
    }

    return NextResponse.json({ success: true, meeting }) as Response
  } catch (error) {
    console.error('Error saving meeting:', error)
    return NextResponse.json(
      { error: 'Failed to save meeting' },
      { status: 500 }
    ) as Response
  }
}


