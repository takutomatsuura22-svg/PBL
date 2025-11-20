import { NextRequest, NextResponse } from 'next/server'
import Airtable from 'airtable'

const reflectionsTable = process.env.AIRTABLE_WEEKLY_REFLECTIONS_TABLE?.trim() || 'WeeklyReflections'

const getBase = () => {
  const apiKey = process.env.AIRTABLE_API_KEY?.trim()
  const baseId = process.env.AIRTABLE_BASE_ID?.trim()

  if (!apiKey || !baseId) {
    throw new Error('Airtable credentials not configured')
  }

  return new Airtable({ apiKey }).base(baseId)
}

type WeeklyReflectionRecord = {
  id: string
  student_id: string
  student_name: string
  week_of: string
  achievements: string
  challenges: string
  next_focus: string
  support_needed: string
  confidence_level: number
  notes?: string
  submitted_at?: string
}

const mapRecord = (record: any): WeeklyReflectionRecord => {
  const fields = record.fields || {}
  const toNumber = (value: any, fallback = 3) => {
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
      const parsed = parseFloat(value)
      return Number.isNaN(parsed) ? fallback : parsed
    }
    return fallback
  }

  return {
    id: record.id,
    student_id: fields.student_id || '',
    student_name: fields.student_name || '',
    week_of: fields.week_of || fields.week || '',
    achievements: fields.achievements || '',
    challenges: fields.challenges || '',
    next_focus: fields.next_focus || '',
    support_needed: fields.support_needed || '',
    confidence_level: toNumber(fields.confidence_level, 3),
    notes: fields.notes || fields.additional_notes || '',
    submitted_at: fields.submitted_at || record._rawJson?.createdTime
  }
}

const escapeFormulaValue = (value: string) => value.replace(/'/g, "\\'")

export async function GET(request: NextRequest): Promise<Response> {
  try {
    let base
    try {
      base = getBase()
    } catch (configError: any) {
      console.error('Airtable configuration error:', configError)
      return NextResponse.json(
        {
          error: 'Airtable credentials not configured',
          details: configError.message || 'Please check AIRTABLE_API_KEY and AIRTABLE_BASE_ID in .env.local'
        },
        { status: 500 }
      ) as Response
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('student_id')

    const selectOptions: { sort: { field: string; direction: 'asc' | 'desc' }[]; filterByFormula?: string } = {
      sort: [{ field: 'week_of', direction: 'desc' }]
    }

    if (studentId) {
      selectOptions.filterByFormula = `{student_id} = '${escapeFormulaValue(studentId)}'`
    }

    try {
      const records = await base(reflectionsTable).select(selectOptions).all()
      const reflections = records.map(mapRecord)
      return NextResponse.json(reflections) as Response
    } catch (tableError: any) {
      console.error('Airtable table access error:', tableError)
      // テーブルが存在しない場合は空配列を返す
      if (tableError.message?.includes('not found') || tableError.message?.includes('does not exist')) {
        console.warn(`Table "${reflectionsTable}" not found, returning empty array`)
        return NextResponse.json([]) as Response
      }
      throw tableError
    }
  } catch (error: any) {
    console.error('Error fetching weekly reflections:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch weekly reflections',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    ) as Response
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    let base
    try {
      base = getBase()
    } catch (configError: any) {
      console.error('Airtable configuration error:', configError)
      return NextResponse.json(
        {
          error: 'Airtable credentials not configured',
          details: configError.message || 'Please check AIRTABLE_API_KEY and AIRTABLE_BASE_ID in .env.local'
        },
        { status: 500 }
      ) as Response
    }

    const payload = await request.json()

    const requiredFields = ['student_id', 'student_name', 'week_of', 'achievements', 'challenges']
    for (const field of requiredFields) {
      if (!payload[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        ) as Response
      }
    }

    const reflectionFields = {
      student_id: payload.student_id,
      student_name: payload.student_name,
      week_of: payload.week_of,
      achievements: payload.achievements,
      challenges: payload.challenges,
      next_focus: payload.next_focus || '',
      support_needed: payload.support_needed || '',
      confidence_level: payload.confidence_level || 3,
      notes: payload.notes || '',
      submitted_at: new Date().toISOString()
    }

    try {
      const [record] = await base(reflectionsTable).create([{ fields: reflectionFields }])
      return NextResponse.json({
        success: true,
        reflection: mapRecord(record)
      }) as Response
    } catch (tableError: any) {
      console.error('Airtable table access error:', tableError)
      return NextResponse.json(
        {
          error: 'Failed to save reflection',
          details: tableError.message || `Table "${reflectionsTable}" may not exist or you may not have permission`
        },
        { status: 500 }
      ) as Response
    }
  } catch (error: any) {
    console.error('Error saving weekly reflection:', error)
    return NextResponse.json(
      {
        error: 'Failed to save reflection',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    ) as Response
  }
}

