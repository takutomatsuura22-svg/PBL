/**
 * Airtable連携サービス（サーバーサイド用）
 * Next.js APIルートから使用
 */

// @ts-ignore
const Airtable = require('airtable')

interface AirtableConfig {
  apiKey: string
  baseId: string
  studentsTable: string
  tasksTable: string
  teamsTable: string
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
    studentsTable: process.env.AIRTABLE_STUDENTS_TABLE || 'Students',
    tasksTable: process.env.AIRTABLE_TASKS_TABLE || 'Tasks',
    teamsTable: process.env.AIRTABLE_TEAMS_TABLE || 'Teams',
    wbsTable: process.env.AIRTABLE_WBS_TABLE || 'WBS',
    meetingsTable: process.env.AIRTABLE_MEETINGS_TABLE || 'Meetings'
  }
}

/**
 * Airtableから学生データを取得
 */
export async function fetchStudentsFromAirtable(): Promise<any[]> {
  const config = getAirtableConfig()
  if (!config) {
    throw new Error('Airtable credentials not configured')
  }

  const base = new Airtable({ apiKey: config.apiKey }).base(config.baseId)

  return new Promise((resolve, reject) => {
    const records: any[] = []
    base(config.studentsTable)
      .select({
        view: 'Grid view'
      })
      .eachPage(
        (pageRecords: any[], fetchNextPage: () => void) => {
          pageRecords.forEach((record) => {
            const fields = record.fields
            
            // AirtableのフィールドをStudent型に変換
            // 数値フィールドの処理を改善
            const parseNumber = (value: any, defaultValue: number = 3): number => {
              if (typeof value === 'number') return value
              if (typeof value === 'string') {
                const parsed = parseFloat(value)
                return isNaN(parsed) ? defaultValue : parsed
              }
              return defaultValue
            }

            // 配列フィールドの処理を改善
            const parseArray = (value: any): string[] => {
              if (Array.isArray(value)) return value.filter(v => v != null && v !== '')
              if (typeof value === 'string' && value.trim()) return [value.trim()]
              return []
            }

            const student = {
              student_id: fields.student_id || fields['Student ID'] || fields['student_id'] || record.id,
              name: fields.name || fields['Name'] || fields['name'] || '',
              MBTI: fields.MBTI || fields['MBTI'] || fields['mbti'] || '',
              animal_type: fields.animal_type || fields['Animal Type'] || fields['animal_type'] || '',
              strengths: parseArray(fields.strengths || fields['Strengths'] || fields['strengths']),
              weaknesses: parseArray(fields.weaknesses || fields['Weaknesses'] || fields['weaknesses']),
              skill_企画: parseNumber(fields.skill_企画 || fields['Skill 企画'] || fields['Skill Planning'] || fields['skill_planning'], 3),
              skill_実行: parseNumber(fields.skill_実行 || fields['Skill 実行'] || fields['Skill Execution'] || fields['skill_execution'], 3),
              skill_調整: parseNumber(fields.skill_調整 || fields['Skill 調整'] || fields['Skill Coordination'] || fields['skill_coordination'], 3),
              skill_探索: parseNumber(fields.skill_探索 || fields['Skill 探索'] || fields['Skill Exploration'] || fields['skill_exploration'], 3),
              skill_デザイン: parseNumber(fields.skill_デザイン || fields['Skill デザイン'] || fields['Skill Design'] || fields['skill_design'], 3),
              skill_開発: parseNumber(fields.skill_開発 || fields['Skill 開発'] || fields['Skill Development'] || fields['skill_development'], 3),
              skill_分析: parseNumber(fields.skill_分析 || fields['Skill 分析'] || fields['Skill Analysis'] || fields['skill_analysis'], 3),
              skill_ドキュメント作成: parseNumber(fields.skill_ドキュメント作成 || fields['Skill ドキュメント作成'] || fields['Skill Documentation'] || fields['skill_documentation'], 3),
              skill_コミュニケーション: parseNumber(fields.skill_コミュニケーション || fields['Skill コミュニケーション'] || fields['Skill Communication'] || fields['skill_communication'], 3),
              skill_リーダーシップ: parseNumber(fields.skill_リーダーシップ || fields['Skill リーダーシップ'] || fields['Skill Leadership'] || fields['skill_leadership'], 3),
              skill_プレゼンテーション: parseNumber(fields.skill_プレゼンテーション || fields['Skill プレゼンテーション'] || fields['Skill Presentation'] || fields['skill_presentation'], 3),
              skill_問題解決: parseNumber(fields.skill_問題解決 || fields['Skill 問題解決'] || fields['Skill Problem Solving'] || fields['skill_problem_solving'], 3),
              preferred_partners: parseArray(fields.preferred_partners || fields['Preferred Partners'] || fields['preferred_partners']),
              avoided_partners: parseArray(fields.avoided_partners || fields['Avoided Partners'] || fields['avoided_partners']),
              team_id: fields.team_id || fields['Team ID'] || fields['team_id'] || '',
              motivation_score: parseNumber(fields.motivation_score || fields['Motivation Score'] || fields['motivation_score'], 3),
              load_score: parseNumber(fields.load_score || fields['Load Score'] || fields['Task Load'] || fields['load_score'], 3)
            }
            records.push(student)
          })
          fetchNextPage()
        },
        (err: Error) => {
          if (err) {
            console.error('Error fetching students from Airtable:', err)
            reject(err)
          } else {
            resolve(records)
          }
        }
      )
  })
}

/**
 * Airtableからタスクデータを取得
 */
export async function fetchTasksFromAirtable(): Promise<any[]> {
  const config = getAirtableConfig()
  if (!config) {
    throw new Error('Airtable credentials not configured')
  }

  const base = new Airtable({ apiKey: config.apiKey }).base(config.baseId)

  return new Promise((resolve, reject) => {
    const records: any[] = []
    
    console.log(`📋 Airtableからタスクを取得中: テーブル名="${config.tasksTable}"`)
    
    base(config.tasksTable)
      .select({
        view: 'Grid view'
      })
      .eachPage(
        (pageRecords: any[], fetchNextPage: () => void) => {
          console.log(`📋 タスクレコードを ${pageRecords.length}件取得`)
          pageRecords.forEach((record) => {
            const fields = record.fields
            
            // 数値フィールドの処理
            const parseNumber = (value: any, defaultValue: number = 0): number => {
              if (typeof value === 'number') return value
              if (typeof value === 'string') {
                const parsed = parseFloat(value)
                return isNaN(parsed) ? defaultValue : parsed
              }
              return defaultValue
            }

            // 日付フィールドの処理を改善
            const parseDate = (value: any): string => {
              if (!value) return new Date().toISOString()
              if (value instanceof Date) return value.toISOString()
              if (typeof value === 'string') {
                const date = new Date(value)
                return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
              }
              return new Date().toISOString()
            }

            // 配列フィールドの処理
            const parseArray = (value: any): string[] => {
              if (Array.isArray(value)) return value.filter(v => v != null && v !== '')
              if (typeof value === 'string' && value.trim()) return [value.trim()]
              return []
            }

            // 複数担当者対応
            const parseAssignee = (value: any): string | string[] => {
              if (Array.isArray(value)) return value.filter(v => v != null && v !== '')
              if (typeof value === 'string' && value.trim()) {
                // カンマ区切りの場合は配列に変換
                if (value.includes(',')) {
                  return value.split(',').map(v => v.trim()).filter(v => v !== '')
                }
                return value.trim()
              }
              return ''
            }

            const task = {
              task_id: fields.task_id || fields['Task ID'] || fields['task_id'] || record.id,
              title: fields.title || fields['Title'] || fields['title'] || '',
              description: fields.description || fields['Description'] || fields['description'] || '',
              category: fields.category || fields['Category'] || fields['category'] || '',
              difficulty: parseNumber(fields.difficulty || fields['Difficulty'] || fields['difficulty'], 3),
              estimated_hours: parseNumber(fields.estimated_hours || fields['Estimated Hours'] || fields['estimated_hours'], 0),
              deadline: parseDate(fields.deadline || fields['Deadline'] || fields['deadline']),
              end_date: parseDate(fields.end_date || fields['End Date'] || fields['end_date'] || fields.deadline || fields['Deadline']),
              start_date: parseDate(fields.start_date || fields['Start Date'] || fields['start_date']),
              status: (fields.status || fields['Status'] || fields['status'] || 'pending').toLowerCase(),
              assignee_id: parseAssignee(fields.assignee_id || fields['Assignee ID'] || fields['Assignee'] || fields['assignee_id']),
              required_skills: parseArray(fields.required_skills || fields['Required Skills'] || fields['required_skills']),
              ai_usage: fields.ai_usage || fields['AI Usage'] || fields['ai_usage'] || ''
            }
            records.push(task)
          })
          fetchNextPage()
        },
        (err: Error) => {
          if (err) {
            console.error('❌ Error fetching tasks from Airtable:', err)
            console.error(`   テーブル名: ${config.tasksTable}`)
            console.error(`   Base ID: ${config.baseId}`)
            console.error(`   エラー詳細: ${err.message}`)
            reject(err)
          } else {
            console.log(`✅ タスク取得完了: ${records.length}件`)
            resolve(records)
          }
        }
      )
  })
}

/**
 * Airtableからチームデータを取得
 */
export async function fetchTeamsFromAirtable(): Promise<any[]> {
  const config = getAirtableConfig()
  if (!config) {
    throw new Error('Airtable credentials not configured')
  }

  const base = new Airtable({ apiKey: config.apiKey }).base(config.baseId)

  return new Promise((resolve, reject) => {
    const records: any[] = []
    base(config.teamsTable)
      .select({
        view: 'Grid view'
      })
      .eachPage(
        (pageRecords: any[], fetchNextPage: () => void) => {
          pageRecords.forEach((record) => {
            const fields = record.fields
            const team = {
              team_id: fields.team_id || fields['Team ID'] || record.id,
              name: fields.name || fields['Name'] || '',
              description: fields.description || fields['Description'] || '',
              student_ids: Array.isArray(fields.student_ids)
                ? fields.student_ids
                : fields['Student IDs']
                  ? (Array.isArray(fields['Student IDs']) ? fields['Student IDs'] : [fields['Student IDs']])
                  : [],
              project_name: fields.project_name || fields['Project Name'] || ''
            }
            records.push(team)
          })
          fetchNextPage()
        },
        (err: Error) => {
          if (err) {
            console.error('❌ Error fetching teams from Airtable:', err)
            console.error(`   テーブル名: ${config.teamsTable}`)
            console.error(`   Base ID: ${config.baseId}`)
            console.error(`   エラー詳細: ${err.message}`)
            reject(err)
          } else {
            console.log(`✅ チーム取得完了: ${records.length}件`)
            resolve(records)
          }
        }
      )
  })
}

/**
 * AirtableからWBSデータを取得
 */
export async function fetchWBSFromAirtable(): Promise<any[]> {
  const config = getAirtableConfig()
  if (!config) {
    throw new Error('Airtable credentials not configured')
  }

  const base = new Airtable({ apiKey: config.apiKey }).base(config.baseId)

  return new Promise((resolve, reject) => {
    const records: any[] = []
    
    console.log(`📋 AirtableからWBSを取得中: テーブル名="${config.wbsTable}"`)
    
    base(config.wbsTable)
      .select({
        view: 'Grid view',
        sort: [{ field: 'created_at', direction: 'desc' }]
      })
      .eachPage(
        (pageRecords: any[], fetchNextPage: () => void) => {
          pageRecords.forEach((record) => {
            const fields = record.fields
            
            // tasksフィールドをパース（JSON文字列または配列）
            let tasks: any[] = []
            if (fields.tasks) {
              if (typeof fields.tasks === 'string') {
                try {
                  tasks = JSON.parse(fields.tasks)
                } catch (e) {
                  console.warn('Failed to parse tasks JSON:', e)
                  tasks = []
                }
              } else if (Array.isArray(fields.tasks)) {
                tasks = fields.tasks
              }
            }
            
            const wbs = {
              wbs_id: fields.wbs_id || fields['WBS ID'] || fields['wbs_id'] || record.id,
              name: fields.name || fields['Name'] || fields['name'] || '',
              description: fields.description || fields['Description'] || fields['description'] || '',
              created_at: fields.created_at || fields['Created At'] || fields['created_at'] || '',
              task_count: tasks.length,
              tasks: tasks,
              is_current: fields.is_current || fields['Is Current'] || false
            }
            records.push(wbs)
          })
          fetchNextPage()
        },
        (err: Error) => {
          if (err) {
            console.error('❌ Error fetching WBS from Airtable:', err)
            console.error(`   テーブル名: ${config.wbsTable}`)
            console.error(`   Base ID: ${config.baseId}`)
            console.error(`   エラー詳細: ${err.message}`)
            reject(err)
          } else {
            console.log(`✅ WBS取得完了: ${records.length}件`)
            resolve(records)
          }
        }
      )
  })
}

/**
 * Airtableから議事録データを取得
 */
export async function fetchMeetingsFromAirtable(): Promise<any[]> {
  const config = getAirtableConfig()
  if (!config) {
    throw new Error('Airtable credentials not configured')
  }

  const base = new Airtable({ apiKey: config.apiKey }).base(config.baseId)

  return new Promise((resolve, reject) => {
    const records: any[] = []
    
    console.log(`📋 Airtableから議事録を取得中: テーブル名="${config.meetingsTable}"`)
    
    base(config.meetingsTable)
      .select({
        view: 'Grid view',
        sort: [{ field: 'date', direction: 'desc' }]
      })
      .eachPage(
        (pageRecords: any[], fetchNextPage: () => void) => {
          pageRecords.forEach((record) => {
            const fields = record.fields
            
            // 配列フィールドの処理
            const parseArray = (value: any): string[] => {
              if (Array.isArray(value)) return value.filter(v => v != null && v !== '')
              if (typeof value === 'string' && value.trim()) {
                // 改行区切りの場合は配列に変換
                if (value.includes('\n')) {
                  return value.split('\n').map(v => v.trim()).filter(v => v !== '')
                }
                return [value.trim()]
              }
              return []
            }
            
            // action_itemsをパース（JSON文字列または配列）
            let actionItems: any[] = []
            if (fields.action_items) {
              if (typeof fields.action_items === 'string') {
                try {
                  actionItems = JSON.parse(fields.action_items)
                } catch (e) {
                  console.warn('Failed to parse action_items JSON:', e)
                  actionItems = []
                }
              } else if (Array.isArray(fields.action_items)) {
                actionItems = fields.action_items
              }
            }
            
            const meeting = {
              meeting_id: fields.meeting_id || fields['Meeting ID'] || fields['meeting_id'] || record.id,
              date: fields.date || fields['Date'] || fields['date'] || '',
              title: fields.title || fields['Title'] || fields['title'] || '',
              participants: parseArray(fields.participants || fields['Participants'] || fields['participants']),
              agenda: parseArray(fields.agenda || fields['Agenda'] || fields['agenda']),
              content: fields.content || fields['Content'] || fields['content'] || '',
              decisions: parseArray(fields.decisions || fields['Decisions'] || fields['decisions']),
              action_items: actionItems,
              created_by: fields.created_by || fields['Created By'] || fields['created_by'] || '',
              created_at: fields.created_at || fields['Created At'] || fields['created_at'] || ''
            }
            records.push(meeting)
          })
          fetchNextPage()
        },
        (err: Error) => {
          if (err) {
            console.error('❌ Error fetching meetings from Airtable:', err)
            console.error(`   テーブル名: ${config.meetingsTable}`)
            console.error(`   Base ID: ${config.baseId}`)
            console.error(`   エラー詳細: ${err.message}`)
            reject(err)
          } else {
            console.log(`✅ 議事録取得完了: ${records.length}件`)
            resolve(records)
          }
        }
      )
  })
}

