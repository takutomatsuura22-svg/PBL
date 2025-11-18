import { NextResponse } from 'next/server'
import { loadAllStudents } from '@/lib/datastore'

export async function GET(): Promise<Response> {
  try {
    // タイムアウト付きで読み込み
    const timeoutPromise = new Promise<Response>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 2000)
    )
    
    const loadPromise = (async () => {
      const students = await loadAllStudents()
      return NextResponse.json(students) as Response
    })()
    
    return await Promise.race([loadPromise, timeoutPromise])
  } catch (error) {
    console.error('Error fetching students:', error)
    // エラー時でも空配列を返す（ページが表示されるように）
    return NextResponse.json([]) as Response
  }
}
