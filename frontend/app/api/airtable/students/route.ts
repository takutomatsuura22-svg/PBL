import { NextResponse } from 'next/server'
import { fetchStudentsFromAirtable } from '@/lib/airtable-server'

export async function GET(): Promise<Response> {
  try {
    const students = await fetchStudentsFromAirtable()
    return NextResponse.json(students) as Response
  } catch (error) {
    console.error('Error fetching students from Airtable:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students from Airtable' },
      { status: 500 }
    ) as Response
  }
}

