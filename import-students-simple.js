// 10人の学生データをAirtableにインポート
const https = require('https');
const fs = require('fs');
const path = require('path');

// 環境変数を読み込む
const envPath = path.join(__dirname, 'frontend', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const apiKey = env.AIRTABLE_API_KEY;
const baseId = env.AIRTABLE_BASE_ID;

console.log('API Key:', apiKey ? apiKey.substring(0, 15) + '...' : 'Not found');
console.log('Base ID:', baseId);

// students.jsonを読み込む
const studentsPath = path.join(__dirname, 'backend', 'data', 'students.json');
const studentsData = JSON.parse(fs.readFileSync(studentsPath, 'utf8'));
const students = studentsData.students;

console.log(`\n📚 ${students.length}人の学生データを読み込みました\n`);

function makeRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.airtable.com',
      path: `/v0/${baseId}/${path}`,
      method: method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject({ status: res.statusCode, error: parsed });
          }
        } catch (e) {
          reject({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function importStudents() {
  try {
    // 既存のレコードを確認して削除
    console.log('🗑️  既存データを確認中...');
    const existing = await makeRequest('GET', 'Students?maxRecords=100');
    
    if (existing.records && existing.records.length > 0) {
      console.log(`既存の${existing.records.length}件を削除中...`);
      const ids = existing.records.map(r => r.id);
      
      // 10件ずつ削除
      for (let i = 0; i < ids.length; i += 10) {
        const chunk = ids.slice(i, i + 10);
        await makeRequest('DELETE', `Students?records[]=${chunk.join('&records[]=')}`);
      }
      console.log('✅ 既存データを削除しました\n');
    } else {
      console.log('既存データなし\n');
    }

    // 新しいデータを投入
    console.log('📤 新しい学生データを投入中...\n');
    
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const record = {
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
      };

      await makeRequest('POST', 'Students', { records: [record] });
      console.log(`✅ ${i + 1}/${students.length}: ${student.name} (${student.student_id})`);
      
      // 少し待機してレート制限を回避
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`\n🎉 ${students.length}人の学生データをAirtableに投入完了！`);

  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

importStudents();

