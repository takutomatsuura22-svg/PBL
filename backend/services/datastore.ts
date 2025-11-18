import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import type { Student } from '../types/student'

const dataDir = join(__dirname, '../data')
const studentsDir = join(dataDir, 'students')

// studentsディレクトリが存在しない場合は作成
if (!existsSync(studentsDir)) {
  mkdirSync(studentsDir, { recursive: true })
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
 */
export function loadAllStudents(): Student[] {
  try {
    if (!existsSync(studentsDir)) {
      return []
    }

    const files = readdirSync(studentsDir)
    const students: Student[] = []

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = join(studentsDir, file)
        const fileContents = readFileSync(filePath, 'utf8')
        const student = JSON.parse(fileContents) as Student
        students.push(student)
      }
    }

    return students
  } catch (error) {
    console.error('Error loading students:', error)
    return []
  }
}

/**
 * 指定されたIDの学生データを読み込む（student_idで検索）
 */
export function getStudentById(id: string): Student | null {
  try {
    const students = loadAllStudents()
    return students.find((s) => s.student_id === id) || null
  } catch (error) {
    console.error(`Error loading student ${id}:`, error)
    return null
  }
}

/**
 * 指定された名前の学生データを読み込む（nameで検索）
 * ファイル名は <name>.json の形式で保存されている
 */
export function getStudentByName(name: string): Student | null {
  try {
    // ファイル名はスペースなしで保存されているので、そのまま使用
    // ただし、安全のため sanitizeFileName を使用
    const sanitizedName = sanitizeFileName(name)
    const filePath = join(studentsDir, `${sanitizedName}.json`)
    
    if (!existsSync(filePath)) {
      // ファイルが見つからない場合、全学生を読み込んでnameで検索
      const students = loadAllStudents()
      return students.find((s) => s.name === name) || null
    }

    const fileContents = readFileSync(filePath, 'utf8')
    return JSON.parse(fileContents) as Student
  } catch (error) {
    console.error(`Error loading student ${name}:`, error)
    return null
  }
}

// 後方互換性のための関数（既存コードとの互換性を保つ）
export function readStudents() {
  // まず新しい形式（students/フォルダ）を試す
  const students = loadAllStudents()
  if (students.length > 0) {
    return { students }
  }

  // フォールバック: 古い形式（students.json）を試す
  try {
    const filePath = join(dataDir, 'students.json')
    if (existsSync(filePath)) {
      const fileContents = readFileSync(filePath, 'utf8')
      return JSON.parse(fileContents)
    }
  } catch (error) {
    console.error('Error reading students.json:', error)
  }

  return { students: [] }
}

export function writeStudents(students: Student[]) {
  const filePath = join(dataDir, 'students.json')
  writeFileSync(filePath, JSON.stringify({ students }, null, 2), 'utf8')
}

export function readTasks() {
  const filePath = join(dataDir, 'tasks.json')
  const fileContents = readFileSync(filePath, 'utf8')
  return JSON.parse(fileContents)
}

export function writeTasks(tasks: any[]) {
  const filePath = join(dataDir, 'tasks.json')
  writeFileSync(filePath, JSON.stringify(tasks, null, 2), 'utf8')
}

export function readTeams() {
  const filePath = join(dataDir, 'teams.json')
  const fileContents = readFileSync(filePath, 'utf8')
  return JSON.parse(fileContents)
}

export function writeTeams(teams: any[]) {
  const filePath = join(dataDir, 'teams.json')
  writeFileSync(filePath, JSON.stringify(teams, null, 2), 'utf8')
}
