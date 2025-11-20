'use client';

import React from 'react';

export default function ImportSamplePage() {
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [showStudentForm, setShowStudentForm] = React.useState(false);
  const [studentForm, setStudentForm] = React.useState({
    student_id: '',
    name: '',
    MBTI: '',
    animal_type: '',
    skill_企画: 3,
    skill_実行: 3,
    skill_調整: 3,
    skill_探索: 3,
    team_id: '',
    motivation_score: 3,
    load_score: 3
  });

  const handleImport = async (useRealData = false, useImageData = false) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let endpoint = '/api/airtable/import-sample';
      if (useImageData) {
        endpoint = '/api/airtable/import-image-students';
      } else if (useRealData) {
        endpoint = '/api/airtable/import-real-students';
      }
      
      const dataType = useImageData ? '画像から取得した' : (useRealData ? '実際の' : 'サンプル');
      console.log(`${dataType}データ投入を開始...`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('レスポンス受信:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('エラーレスポンス:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('成功:', data);
      setResult(data);
    } catch (err: any) {
      console.error('エラー:', err);
      const errorMessage = err.message || 'エラーが発生しました';
      setError(errorMessage);
      
      // ネットワークエラーの場合
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('ネットワークエラー: サーバーに接続できませんでした。開発サーバーが起動しているか確認してください。');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSubmit = async () => {
    if (!studentForm.student_id || !studentForm.name) {
      setError('student_idとnameは必須です');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/airtable/import-single-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(studentForm)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import student');
      }

      setResult(data);
      setShowStudentForm(false);
      // フォームをリセット
      setStudentForm({
        student_id: '',
        name: '',
        MBTI: '',
        animal_type: '',
        skill_企画: 3,
        skill_実行: 3,
        skill_調整: 3,
        skill_探索: 3,
        team_id: '',
        motivation_score: 3,
        load_score: 3
      });
    } catch (err: any) {
      setError(err.message || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">データ投入</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <p className="mb-4">
            Airtableにデータを投入します。既に存在するレコードはスキップされます。
          </p>

          <div className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => handleImport(false)}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                {loading ? '投入中...' : 'サンプルデータを投入'}
              </button>
              <button
                onClick={() => handleImport(true)}
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                {loading ? '投入中...' : '実際の学生データを投入'}
              </button>
              <button
                onClick={() => handleImport(false, true)}
                disabled={loading}
                className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                {loading ? '投入中...' : '📸 画像から取得した学生データを投入'}
              </button>
              <button
                onClick={() => setShowStudentForm(!showStudentForm)}
                disabled={loading}
                className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                {showStudentForm ? 'フォームを閉じる' : '新しい学生を追加'}
              </button>
            </div>
            
            {showStudentForm && (
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-4">新しい学生を追加</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Student ID *</label>
                    <input
                      type="text"
                      value={studentForm.student_id}
                      onChange={(e) => setStudentForm({...studentForm, student_id: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                      placeholder="S001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">名前 *</label>
                    <input
                      type="text"
                      value={studentForm.name}
                      onChange={(e) => setStudentForm({...studentForm, name: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                      placeholder="山田太郎"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">MBTI</label>
                    <input
                      type="text"
                      value={studentForm.MBTI}
                      onChange={(e) => setStudentForm({...studentForm, MBTI: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                      placeholder="ENFP"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">動物タイプ</label>
                    <input
                      type="text"
                      value={studentForm.animal_type}
                      onChange={(e) => setStudentForm({...studentForm, animal_type: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                      placeholder="ライオン"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">スキル: 企画</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={studentForm.skill_企画}
                      onChange={(e) => setStudentForm({...studentForm, skill_企画: parseInt(e.target.value) || 3})}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">スキル: 実行</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={studentForm.skill_実行}
                      onChange={(e) => setStudentForm({...studentForm, skill_実行: parseInt(e.target.value) || 3})}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">スキル: 調整</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={studentForm.skill_調整}
                      onChange={(e) => setStudentForm({...studentForm, skill_調整: parseInt(e.target.value) || 3})}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">スキル: 探索</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={studentForm.skill_探索}
                      onChange={(e) => setStudentForm({...studentForm, skill_探索: parseInt(e.target.value) || 3})}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Team ID</label>
                    <input
                      type="text"
                      value={studentForm.team_id}
                      onChange={(e) => setStudentForm({...studentForm, team_id: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                      placeholder="T-A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">モチベーションスコア</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      value={studentForm.motivation_score}
                      onChange={(e) => setStudentForm({...studentForm, motivation_score: parseFloat(e.target.value) || 3})}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">タスク量スコア</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      value={studentForm.load_score}
                      onChange={(e) => setStudentForm({...studentForm, load_score: parseFloat(e.target.value) || 3})}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>
                <button
                  onClick={handleStudentSubmit}
                  disabled={loading}
                  className="mt-4 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                  type="button"
                >
                  {loading ? '投入中...' : '学生を追加'}
                </button>
              </div>
            )}
            
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">PBLプロジェクト用データ投入</h3>
              <div className="flex gap-4">
                <button
                  onClick={async () => {
                    setLoading(true);
                    setError(null);
                    setResult(null);
                    try {
                      const response = await fetch('/api/airtable/import-teams', { method: 'POST' });
                      const data = await response.json();
                      if (!response.ok) throw new Error(data.error || 'Failed to import teams');
                      setResult(data);
                    } catch (err: any) {
                      setError(err.message || 'エラーが発生しました');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  {loading ? '投入中...' : 'チーム情報を投入'}
                </button>
                <button
                  onClick={async () => {
                    setLoading(true);
                    setError(null);
                    setResult(null);
                    try {
                      const response = await fetch('/api/airtable/import-wbs-tasks', { method: 'POST' });
                      const data = await response.json();
                      if (!response.ok) throw new Error(data.error || 'Failed to import WBS tasks');
                      setResult(data);
                    } catch (err: any) {
                      setError(err.message || 'エラーが発生しました');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  {loading ? '投入中...' : 'WBSタスクを投入'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            <strong>処理中...</strong> データを投入しています。しばらくお待ちください。
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>❌ エラー:</strong>
            <div className="mt-2">{error}</div>
            <div className="mt-2 text-sm">
              <p>ブラウザの開発者ツール（F12）のコンソールタブで詳細なエラー情報を確認できます。</p>
            </div>
          </div>
        )}

        {result && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <strong>✅ 成功:</strong> {result.message}
            <div className="mt-2">
              <details className="mt-2">
                <summary className="cursor-pointer font-semibold">詳細を表示</summary>
                <pre className="text-xs mt-2 p-2 bg-white rounded overflow-auto max-h-96">{JSON.stringify(result.results, null, 2)}</pre>
              </details>
            </div>
            <div className="mt-4">
              <p className="font-semibold">次のステップ:</p>
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>Airtableでデータを確認してください</li>
                <li><a href="/dashboard" className="underline">ダッシュボード</a>でデータが表示されるか確認してください</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
