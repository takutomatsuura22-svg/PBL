/**
 * 10人の学生データをAirtableにインポート
 */

require('dotenv').config({ path: './frontend/.env.local' });
const Airtable = require('airtable');
const fs = require('fs');
const path = require('path');

const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

if (!apiKey || !baseId) {
  console.error('❌ Airtable credentials not configured');
  process.exit(1);
}

const base = new Airtable({ apiKey }).base(baseId);

// students.jsonから10人のデータを読み込む
const studentsPath = path.join(__dirname, '..', 'backend', 'data', 'students.json');
const studentsData = JSON.parse(fs.readFileSync(studentsPath, 'utf8'));
const students = studentsData.students;

console.log(`📚 ${students.length}人の学生データを読み込みました`);

async function importStudents() {
  try {
    // 既存のレコードを削除
    console.log('🗑️  既存の学生データを削除中...');
    const existingRecords = await base('Students').select().all();
    
    if (existingRecords.length > 0) {
      const deleteChunks = [];
      for (let i = 0; i < existingRecords.length; i += 10) {
        deleteChunks.push(existingRecords.slice(i, i + 10).map(r => r.id));
      }
      
      for (const chunk of deleteChunks) {
        await base('Students').destroy(chunk);
      }
      console.log(`✅ ${existingRecords.length}件の既存データを削除しました`);
    }

    // 新しいデータを投入
    console.log('📤 新しい学生データを投入中...');
    const records = students.map(student => ({
      fields: {
        student_id: student.student_id,
        name: student.name,
        MBTI: student.MBTI || '',
        animal_type: student.animal_type || '',
        skill_企画: student.skill_企画 || 3,
        skill_実行: student.skill_実行 || 3,
        skill_調整: student.skill_調整 || 3,
        skill_探索: student.skill_探索 || 3,
        team_id: student.team_id || '',
        motivation_score: student.motivation_score || 3,
        load_score: student.load_score || 3
      }
    }));

    // 10件ずつに分割して投入
    for (let i = 0; i < records.length; i += 10) {
      const chunk = records.slice(i, i + 10);
      await base('Students').create(chunk);
      console.log(`✅ ${i + 1}-${Math.min(i + 10, records.length)}件目を投入しました`);
    }

    console.log(`\n🎉 ${students.length}人の学生データをAirtableに投入しました！`);
    
    // 投入結果を確認
    const allRecords = await base('Students').select().all();
    console.log(`\n📊 確認: Airtableに${allRecords.length}件の学生データが存在します`);
    allRecords.forEach((record, index) => {
      console.log(`  ${index + 1}. ${record.fields.name} (${record.fields.student_id})`);
    });

  } catch (error) {
    console.error('❌ エラー:', error);
    process.exit(1);
  }
}

importStudents();

