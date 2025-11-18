import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, resolve } from 'path'
import { fetchStudentsFromAirtable, fetchTasksFromAirtable, fetchTeamsFromAirtable } from './airtable-server'

// プロジェクトルートからの相対パス
// frontendディレクトリから見て、1階層上がpbl-ai-dashboardルート
// パス解決を改善（list/route.tsと同じロジック）

let _dataDir: string | null = null
let _studentsDir: string | null = null

function getDataDir(): string {
  if (_dataDir) return _dataDir
  
  const cwd = process.cwd()
  const frontendPath = resolve(cwd, '..', 'backend', 'data')
  const rootPath = resolve(cwd, 'backend', 'data')
  
  if (existsSync(frontendPath)) {
    _dataDir = frontendPath
  } else if (existsSync(rootPath)) {
    _dataDir = rootPath
  } else {
    _dataDir = frontendPath
  }
  
  return _dataDir
}

function getStudentsDir(): string {
  if (_studentsDir) return _studentsDir
  _studentsDir = join(getDataDir(), 'students')
  return _studentsDir
}

// Airtableが有効かどうかをチェック
function isAirtableEnabled(): boolean {
  return !!(process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID)
}

/**
 * 学生データの型定義
 */
export interface Student {
  student_id: string
  name: string
  MBTI: string
  animal_type: string
  // スキル評価（1-5スケール、自動計算または手動設定）
  skill_企画: number
  skill_実行: number
  skill_調整: number
  skill_探索: number
  skill_デザイン?: number
  skill_開発?: number
  skill_分析?: number
  skill_ドキュメント作成?: number
  skill_コミュニケーション?: number
  skill_リーダーシップ?: number
  skill_プレゼンテーション?: number
  skill_問題解決?: number
  // 後方互換性のため、strengths/weaknessesはオプショナル（段階的移行）
  strengths?: string[]
  weaknesses?: string[]
  preferred_partners: string[]
  avoided_partners: string[]
  team_id: string
  motivation_score: number
  load_score: number
}

/**
 * ファイル名を安全な形式に変換（スペース削除、禁止文字処理）
 */
function sanitizeFileName(name: string): string {
  return name
    .replace(/\s+/g, '') // スペース削除
    .replace(/[\/\\:*?"<>|]/g, '') // 禁止文字削除
    .trim()
}

/**
 * students/フォルダ配下のすべてのJSONファイルを読み込んで配列として返す
 * loadAllStudents() のエイリアスとして getStudents() を提供
 * Airtableが有効な場合はAirtableから取得、そうでなければファイルから取得
 */
export async function getStudents(): Promise<Student[]> {
  // Airtableが有効な場合はAirtableから取得（タイムアウト付き）
  if (isAirtableEnabled()) {
    try {
      const timeoutPromise = new Promise<Student[]>((_, reject) => 
        setTimeout(() => reject(new Error('Airtable timeout')), 2000)
      )
      const airtablePromise = fetchStudentsFromAirtable()
      return await Promise.race([airtablePromise, timeoutPromise])
    } catch (error) {
      console.error('Error fetching students from Airtable, falling back to files:', error)
      // エラー時はファイルから読み込む
    }
  }

  // ファイルから読み込む
  try {
    const studentsDir = getStudentsDir()
    const dataDir = getDataDir()
    
    if (!existsSync(studentsDir)) {
      // フォールバック: 古い形式（students.json）を試す
      const filePath = join(dataDir, 'students.json')
      if (existsSync(filePath)) {
        const fileContents = readFileSync(filePath, 'utf8')
        const data = JSON.parse(fileContents)
        return data.students || []
      }
      return []
    }

    const files = readdirSync(studentsDir)
    const students: Student[] = []

    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
        const filePath = join(studentsDir, file)
        const fileContents = readFileSync(filePath, 'utf8')
        const student = JSON.parse(fileContents) as Student
          // データの検証
          if (student && student.student_id && student.name) {
        students.push(student)
          } else {
            console.warn(`Invalid student data in ${file}:`, student)
          }
        } catch (fileError) {
          console.error(`Error reading file ${file}:`, fileError)
        }
      }
    }
    
    console.log(`Loaded ${students.length} students from ${studentsDir}`)

    return students
  } catch (error) {
    console.error('Error loading students:', error)
    // フォールバック: 古い形式を試す
    try {
      const filePath = join(dataDir, 'students.json')
      const fileContents = readFileSync(filePath, 'utf8')
      const data = JSON.parse(fileContents)
      return data.students || []
    } catch (fallbackError) {
      console.error('Error reading students.json:', fallbackError)
      return []
    }
  }
}

/**
 * loadAllStudents() - getStudents() のエイリアス
 */
export async function loadAllStudents(): Promise<Student[]> {
  return getStudents()
}

/**
 * 指定されたIDの学生データを読み込む（student_idで検索）
 */
export async function getStudentById(id: string): Promise<(Student & { tasks: any[] }) | null> {
  try {
    // まずIDで検索（全学生を読み込んでstudent_idで検索）
    const students = await getStudents()
    const student = students.find((s) => s.student_id === id)
    
    if (!student) return null
    
    // タスクデータを取得して追加
    const tasks = await getTasks()
    const studentTasks = tasks
      .filter((t: any) => t.assignee_id === id)
      .map((t: any) => ({
        task_id: t.task_id,
        title: t.title,
        category: t.category,
        status: t.status === 'completed' ? '完了' : 
                t.status === 'in_progress' ? '進行中' : '未着手',
        difficulty: t.difficulty,
        deadline: t.deadline
      }))
    
    return {
      ...student,
      tasks: studentTasks.length > 0 ? studentTasks : []
    }
  } catch (error) {
    console.error(`Error loading student ${id}:`, error)
    return null
  }
}

/**
 * 指定された名前の学生データを読み込む（nameで検索）
 * ファイル名は <name>.json の形式で保存されている
 */
export async function getStudentByName(name: string): Promise<(Student & { tasks: any[] }) | null> {
  try {
    const studentsDir = getStudentsDir()
    
    // ファイル名はスペースなしで保存されているので、そのまま使用
    // ただし、安全のため sanitizeFileName を使用
    const sanitizedName = sanitizeFileName(name)
    const filePath = join(studentsDir, `${sanitizedName}.json`)
    
    if (!existsSync(filePath)) {
      // ファイルが見つからない場合、全学生を読み込んでnameで検索
      const students = await getStudents()
      const student = students.find((s) => s.name === name)
      if (!student) return null
      
      // タスクデータを取得して追加
      const tasks = await getTasks()
      const studentTasks = tasks
        .filter((t: any) => t.assignee_id === student.student_id)
        .map((t: any) => ({
          task_id: t.task_id,
          title: t.title,
          category: t.category,
          status: t.status === 'completed' ? '完了' : 
                  t.status === 'in_progress' ? '進行中' : '未着手',
          difficulty: t.difficulty,
          deadline: t.deadline
        }))
      
      return {
        ...student,
        tasks: studentTasks.length > 0 ? studentTasks : []
      }
    }

    const fileContents = readFileSync(filePath, 'utf8')
    const student = JSON.parse(fileContents) as Student
    
    // タスクデータを取得して追加
    const tasks = await getTasks()
    const studentTasks = tasks
      .filter((t: any) => t.assignee_id === student.student_id)
      .map((t: any) => ({
        task_id: t.task_id,
        title: t.title,
        category: t.category,
        status: t.status === 'completed' ? '完了' : 
                t.status === 'in_progress' ? '進行中' : '未着手',
        difficulty: t.difficulty,
        deadline: t.deadline
      }))
    
    return {
      ...student,
      tasks: studentTasks.length > 0 ? studentTasks : []
    }
  } catch (error) {
    console.error(`Error loading student ${name}:`, error)
    return null
  }
}

export async function getTasks() {
  // Airtableが有効な場合はAirtableから取得（タイムアウト付き）
  if (isAirtableEnabled()) {
    try {
      const timeoutPromise = new Promise<any[]>((_, reject) => 
        setTimeout(() => reject(new Error('Airtable timeout')), 2000)
      )
      const airtablePromise = fetchTasksFromAirtable()
      const tasks = await Promise.race([airtablePromise, timeoutPromise])
      if (tasks && tasks.length > 0) {
        console.log(`📋 Airtableから ${tasks.length}件のタスクを取得しました`)
        return tasks
      }
    } catch (error) {
      console.error('Error fetching tasks from Airtable, falling back to files:', error)
      // エラー時はファイルから読み込む
    }
  }

  // ファイルから読み込む
  try {
    const dataDir = getDataDir()
    const filePath = join(dataDir, 'tasks.json')
    console.log('📂 タスクファイルを読み込み中:', filePath)
    
    if (!existsSync(filePath)) {
      console.warn('⚠️ tasks.jsonが見つかりません:', filePath)
      return []
    }
    
    const fileContents = readFileSync(filePath, 'utf8')
    const data = JSON.parse(fileContents)
    const tasks = data.tasks || []
    console.log(`📋 ファイルから ${tasks.length}件のタスクを読み込みました`)
    return tasks
  } catch (error) {
    console.error('❌ Error reading tasks.json:', error)
    return []
  }
}

export async function getTeams() {
  let teams: any[] = []

  // Airtableが有効な場合はAirtableから取得（タイムアウト付き）
  if (isAirtableEnabled()) {
    try {
      const timeoutPromise = new Promise<any[]>((_, reject) => 
        setTimeout(() => reject(new Error('Airtable timeout')), 2000)
      )
      const airtablePromise = fetchTeamsFromAirtable()
      teams = await Promise.race([airtablePromise, timeoutPromise])
    } catch (error) {
      console.error('Error fetching teams from Airtable, falling back to files:', error)
      // エラー時はファイルから読み込む
    }
  }

  // ファイルから読み込む（Airtableが無効な場合、またはエラー時）
  if (teams.length === 0) {
    const dataDir = getDataDir()
    const filePath = join(dataDir, 'teams.json')
  const fileContents = readFileSync(filePath, 'utf8')
  const data = JSON.parse(fileContents)
    teams = data.teams || []
  }

  const students = await getStudents()
  
  // チームに学生データを追加
  return teams.map((team: any) => ({
    ...team,
    students: team.student_ids
      .map((id: string) => {
        const student = students.find((s) => s.student_id === id)
        return student ? {
          student_id: student.student_id,
          name: student.name,
          motivation_score: student.motivation_score,
          load_score: student.load_score
        } : null
      })
      .filter((s: any) => s !== null)
  }))
}
