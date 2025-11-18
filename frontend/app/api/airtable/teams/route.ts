import { NextResponse } from 'next/server'
import { fetchTeamsFromAirtable } from '@/lib/airtable-server'

export async function GET(): Promise<Response> {
  try {
    const teams = await fetchTeamsFromAirtable()
    return NextResponse.json({ teams }) as Response
  } catch (error) {
    console.error('Error fetching teams from Airtable:', error)
    return NextResponse.json(
      { error: 'Failed to fetch teams from Airtable' },
      { status: 500 }
    ) as Response
  }
}

