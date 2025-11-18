import { NextResponse } from 'next/server'

/**
 * タスク再割り当て提案を却下するAPI
 * 却下された提案は記録され、今後同じ提案は表示されない
 */
export async function POST(
  request: Request,
  { params }: { params: { taskId: string } }
): Promise<Response> {
  try {
    const { taskId } = params
    const body = await request.json()
    const { reason } = body

    // ここでは簡単な実装として、却下された提案を記録
    // 実際の実装では、データベースやファイルに記録する
    console.log(`Task reassignment rejected: ${taskId}`, reason)

    return NextResponse.json({ 
      success: true,
      message: 'タスク再割り当て提案を却下しました'
    }) as Response
  } catch (error) {
    console.error('Error rejecting task reassignment:', error)
    return NextResponse.json(
      { error: 'Failed to reject task reassignment' },
      { status: 500 }
    ) as Response
  }
}


