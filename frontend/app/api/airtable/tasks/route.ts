import { NextResponse } from 'next/server'
import { fetchTasksFromAirtable } from '@/lib/airtable-server'

export async function GET(): Promise<Response> {
  try {
    const tasks = await fetchTasksFromAirtable()
    return NextResponse.json({ tasks }) as Response
  } catch (error) {
    console.error('Error fetching tasks from Airtable:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks from Airtable' },
      { status: 500 }
    ) as Response
  }
}

