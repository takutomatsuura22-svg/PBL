/**
 * Airtable更新機能
 * タスクの担当者をAirtableで更新
 */

// @ts-ignore
const Airtable = require('airtable')

interface AirtableConfig {
  apiKey: string
  baseId: string
  tasksTable: string
  wbsTable: string
  meetingsTable: string
}

function getAirtableConfig(): AirtableConfig | null {
  const apiKey = process.env.AIRTABLE_API_KEY
  const baseId = process.env.AIRTABLE_BASE_ID

  if (!apiKey || !baseId) {
    return null
  }

  return {
    apiKey,
    baseId,
    tasksTable: process.env.AIRTABLE_TASKS_TABLE || 'Tasks',
    wbsTable: process.env.AIRTABLE_WBS_TABLE || 'WBS',
    meetingsTable: process.env.AIRTABLE_MEETINGS_TABLE || 'Meetings'
  }
}

/**
 * Airtableのタスク担当者を更新
 */
export async function updateTaskAssigneeInAirtable(
  taskId: string,
  assigneeId: string
): Promise<boolean> {
  const config = getAirtableConfig()
  if (!config) {
    console.log('Airtable not configured, skipping update')
    return false
  }

  try {
    const base = new Airtable({ apiKey: config.apiKey }).base(config.baseId)

    // タスクIDでレコードを検索（複数のフィールド名に対応）
    let records: any[] = []
    
    // task_idフィールドで検索
    try {
      records = await base(config.tasksTable)
        .select({
          filterByFormula: `OR({task_id} = "${taskId}", {Task ID} = "${taskId}", {task_id} = "${taskId}")`,
          maxRecords: 1
        })
        .firstPage()
    } catch (e) {
      // フィールド名が異なる場合、別の方法で検索
      try {
        records = await base(config.tasksTable)
          .select({
            maxRecords: 100
          })
          .firstPage()
        
        records = records.filter((record: any) => {
          const fields = record.fields
          return (fields.task_id === taskId) || 
                 (fields['Task ID'] === taskId) || 
                 (fields['task_id'] === taskId) ||
                 (record.id === taskId)
        })
      } catch (e2) {
        console.error('Error searching for task in Airtable:', e2)
        return false
      }
    }

    if (records.length === 0) {
      console.log(`Task ${taskId} not found in Airtable`)
      return false
    }

    const record = records[0]
    
    // 担当者IDを更新（複数のフィールド名に対応）
    const updateFields: any = {}
    
    // フィールド名を自動検出
    const assigneeField = record.fields['assignee_id'] !== undefined ? 'assignee_id' :
                         record.fields['Assignee ID'] !== undefined ? 'Assignee ID' :
                         record.fields['Assignee'] !== undefined ? 'Assignee' :
                         'assignee_id' // デフォルト
    
    updateFields[assigneeField] = assigneeId

    // ステータスも更新（未完了の場合はin_progressに）
    const currentStatus = record.fields['status'] || record.fields['Status'] || 'pending'
    if (currentStatus !== 'completed' && currentStatus !== 'Completed') {
      const statusField = record.fields['status'] !== undefined ? 'status' :
                         record.fields['Status'] !== undefined ? 'Status' :
                         'status' // デフォルト
      updateFields[statusField] = 'in_progress'
    }

    // レコードを更新
    await record.update(updateFields)
    
    console.log(`✅ Updated task ${taskId} assignee to ${assigneeId} in Airtable`)
    return true
  } catch (error) {
    console.error('Error updating task in Airtable:', error)
    return false
  }
}

/**
 * AirtableにWBSを保存
 */
export async function saveWBSToAirtable(wbsData: {
  wbs_id: string
  name: string
  description: string
  created_at: string
  tasks: any[]
  is_current?: boolean
}): Promise<boolean> {
  const config = getAirtableConfig()
  if (!config) {
    console.log('Airtable not configured, skipping WBS save')
    return false
  }

  try {
    const base = new Airtable({ apiKey: config.apiKey }).base(config.baseId)

    // 既存のWBSのis_currentをfalseに更新（新しいWBSをcurrentにする場合）
    if (wbsData.is_current) {
      try {
        const existingWBS = await base(config.wbsTable)
          .select({
            filterByFormula: '{is_current} = 1',
            maxRecords: 100
          })
          .firstPage()
        
        for (const record of existingWBS) {
          await record.update({ is_current: false })
        }
      } catch (e) {
        console.warn('Failed to update existing WBS:', e)
      }
    }

    // WBSを保存
    await base(config.wbsTable).create([
      {
        fields: {
          wbs_id: wbsData.wbs_id,
          name: wbsData.name,
          description: wbsData.description || '',
          created_at: wbsData.created_at,
          tasks: JSON.stringify(wbsData.tasks),
          is_current: wbsData.is_current || false
        }
      }
    ])

    console.log(`✅ Saved WBS ${wbsData.wbs_id} to Airtable`)
    return true
  } catch (error) {
    console.error('Error saving WBS to Airtable:', error)
    return false
  }
}

/**
 * AirtableのWBSのis_currentフラグを更新
 */
export async function updateCurrentWBSInAirtable(wbsId: string): Promise<boolean> {
  const config = getAirtableConfig()
  if (!config) {
    console.log('Airtable not configured, skipping WBS update')
    return false
  }

  try {
    const base = new Airtable({ apiKey: config.apiKey }).base(config.baseId)

    // すべてのWBSのis_currentをfalseに
    try {
      const allWBS = await base(config.wbsTable)
        .select({
          filterByFormula: '{is_current} = 1',
          maxRecords: 100
        })
        .firstPage()
      
      for (const record of allWBS) {
        await record.update({ is_current: false })
      }
    } catch (e) {
      console.warn('Failed to reset current WBS:', e)
    }

    // 指定されたWBSのis_currentをtrueに
    try {
      const wbsRecords = await base(config.wbsTable)
        .select({
          filterByFormula: `{wbs_id} = "${wbsId}"`,
          maxRecords: 1
        })
        .firstPage()
      
      if (wbsRecords.length > 0) {
        await wbsRecords[0].update({ is_current: true })
        console.log(`✅ Updated current WBS to ${wbsId} in Airtable`)
        return true
      } else {
        console.warn(`WBS ${wbsId} not found in Airtable`)
        return false
      }
    } catch (e) {
      console.error('Error updating current WBS:', e)
      return false
    }
  } catch (error) {
    console.error('Error updating WBS in Airtable:', error)
    return false
  }
}

/**
 * Airtableに議事録を保存
 */
export async function saveMeetingToAirtable(meeting: {
  meeting_id: string
  date: string
  title: string
  participants: string[]
  agenda: string[]
  content: string
  decisions: string[]
  action_items: Array<{ task: string; assignee: string; deadline?: string }>
  created_by: string
  created_at: string
}): Promise<boolean> {
  const config = getAirtableConfig()
  if (!config) {
    console.log('Airtable not configured, skipping meeting save')
    return false
  }

  try {
    const base = new Airtable({ apiKey: config.apiKey }).base(config.baseId)

    await base(config.meetingsTable).create([
      {
        fields: {
          meeting_id: meeting.meeting_id,
          date: meeting.date,
          title: meeting.title,
          participants: meeting.participants,
          agenda: meeting.agenda.join('\n'),
          content: meeting.content,
          decisions: meeting.decisions.join('\n'),
          action_items: JSON.stringify(meeting.action_items),
          created_by: meeting.created_by,
          created_at: meeting.created_at
        }
      }
    ])

    console.log(`✅ Saved meeting ${meeting.meeting_id} to Airtable`)
    return true
  } catch (error) {
    console.error('Error saving meeting to Airtable:', error)
    return false
  }
}

