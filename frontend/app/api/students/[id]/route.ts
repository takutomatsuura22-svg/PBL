import { NextResponse } from 'next/server'
import { getStudentById } from '@/lib/datastore'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    const student = await getStudentById(params.id)
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      ) as Response
    }
    return NextResponse.json(student) as Response
  } catch (error) {
    console.error('Error fetching student:', error)
    return NextResponse.json(
      { error: 'Failed to fetch student' },
      { status: 500 }
    ) as Response
  }
}
