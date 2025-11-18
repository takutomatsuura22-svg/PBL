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
    tasksTable: process.env.AIRTABLE_TASKS_TABLE || 'Tasks'
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

