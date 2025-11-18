/**
 * Airtable連携サービス（フロントエンド用）
 * Next.js APIルート経由でAirtableからデータを取得
 */

import type { Student } from './datastore'

/**
 * Airtableから学生データを取得
 */
export async function fetchStudentsFromAirtable(): Promise<Student[]> {
  try {
    const response = await fetch('/api/airtable/students')
    if (!response.ok) {
      throw new Error('Failed to fetch students from Airtable')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching students from Airtable:', error)
    return []
  }
}

/**
 * Airtableからタスクデータを取得
 */
export async function fetchTasksFromAirtable(): Promise<any[]> {
  try {
    const response = await fetch('/api/airtable/tasks')
    if (!response.ok) {
      throw new Error('Failed to fetch tasks from Airtable')
    }
    const data = await response.json()
    return data.tasks || []
  } catch (error) {
    console.error('Error fetching tasks from Airtable:', error)
    return []
  }
}

/**
 * Airtableからチームデータを取得
 */
export async function fetchTeamsFromAirtable(): Promise<any[]> {
  try {
    const response = await fetch('/api/airtable/teams')
    if (!response.ok) {
      throw new Error('Failed to fetch teams from Airtable')
    }
    const data = await response.json()
    return data.teams || []
  } catch (error) {
    console.error('Error fetching teams from Airtable:', error)
    return []
  }
}

