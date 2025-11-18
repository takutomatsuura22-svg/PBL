/**
 * WBS更新機能
 * 選択中のWBSファイルのタスク担当者を更新
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, resolve } from 'path'

/**
 * 選択中のWBSファイルのパスを取得
 */
function getCurrentWBSPath(): string | null {
  const cwd = process.cwd()
  const frontendPath = resolve(cwd, '..', 'backend', 'data')
  const rootPath = resolve(cwd, 'backend', 'data')
  
  const dataDir = existsSync(frontendPath) ? frontendPath : 
                  existsSync(rootPath) ? rootPath : frontendPath
  
  const configPath = join(dataDir, 'wbs_config.json')
  
  if (!existsSync(configPath)) {
    return null
  }
  
  try {
    const config = JSON.parse(readFileSync(configPath, 'utf8'))
    const wbsId = config.current_wbs_id
    
    if (!wbsId) {
      return null
    }
    
    const wbsDir = join(dataDir, 'wbs')
    const wbsPath = join(wbsDir, `${wbsId}.json`)
    
    return existsSync(wbsPath) ? wbsPath : null
  } catch (error) {
    console.error('Error reading WBS config:', error)
    return null
  }
}

/**
 * WBSのタスク担当者を更新
 */
export async function updateTaskAssigneeInWBS(
  taskId: string,
  assigneeId: string
): Promise<boolean> {
  const wbsPath = getCurrentWBSPath()
  
  if (!wbsPath) {
    console.log('No WBS selected, skipping WBS update')
    return false
  }
  
  try {
    // WBSデータを読み込む
    const wbsData = JSON.parse(readFileSync(wbsPath, 'utf8'))
    const tasks = wbsData.tasks || []
    
    // タスクを検索して更新
    let updated = false
    const updatedTasks = tasks.map((task: any) => {
      if (task.task_id === taskId) {
        updated = true
        return {
          ...task,
          assignee_id: assigneeId,
          status: task.status === 'completed' ? 'completed' : 'in_progress'
        }
      }
      return task
    })
    
    if (!updated) {
      console.log(`Task ${taskId} not found in WBS`)
      return false
    }
    
    // WBSファイルを更新
    wbsData.tasks = updatedTasks
    writeFileSync(wbsPath, JSON.stringify(wbsData, null, 2), 'utf8')
    
    console.log(`Updated task ${taskId} assignee to ${assigneeId} in WBS`)
    return true
  } catch (error) {
    console.error('Error updating task in WBS:', error)
    return false
  }
}

