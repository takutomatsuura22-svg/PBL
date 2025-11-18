# Airtableテーブル手動作成ガイド（APIエラー回避版）

APIキーの認証エラーが発生した場合、手動でテーブルを作成する方法です。

## 🎯 現在の状況

- ✅ ベースは作成済み（Base ID: `appmrazv5xBSDMt3J`）
- ❌ APIキーの認証エラー（HTTP 401）

## 📋 手動でテーブルを作成する方法

### ステップ1: Studentsテーブルを作成

1. **Airtableでベースを開く**
2. **左下の「+ Add a table」をクリック**
3. **テーブル名を「Students」に変更**
4. **以下のフィールドを追加**（右側の「+ Add a field」から）：

| フィールド名 | 型 | オプション |
|------------|-----|----------|
| student_id | Single line text | - |
| name | Single line text | - |
| MBTI | Single line text | - |
| animal_type | Single line text | - |
| strengths | Multiple select | オプション: 企画, 実行, 調整, 探索, デザイン, 開発, 分析 |
| weaknesses | Multiple select | オプション: 企画, 実行, 調整, 探索 |
| skill_企画 | Number | - |
| skill_実行 | Number | - |
| skill_調整 | Number | - |
| skill_探索 | Number | - |
| preferred_partners | Multiple select | オプション: （後で学生を追加したら更新） |
| avoided_partners | Multiple select | オプション: （後で学生を追加したら更新） |
| team_id | Single line text | - |
| motivation_score | Number | - |
| load_score | Number | - |

### ステップ2: Tasksテーブルを作成

1. **左下の「+ Add a table」をクリック**
2. **テーブル名を「Tasks」に変更**
3. **以下のフィールドを追加**：

| フィールド名 | 型 | オプション |
|------------|-----|----------|
| task_id | Single line text | - |
| title | Single line text | - |
| description | Long text | - |
| category | Single select | オプション: 企画, 実行, 調整, 探索 |
| difficulty | Number | - |
| estimated_hours | Number | - |
| deadline | Date | - |
| start_date | Date | - |
| end_date | Date | - |
| status | Single select | オプション: pending, in_progress, completed |
| assignee_id | Single line text | - |
| required_skills | Multiple select | オプション: 企画, 実行, 調整, 探索 |
| ai_usage | Long text | - |

### ステップ3: Teamsテーブルを作成

1. **左下の「+ Add a table」をクリック**
2. **テーブル名を「Teams」に変更**
3. **以下のフィールドを追加**：

| フィールド名 | 型 | オプション |
|------------|-----|----------|
| team_id | Single line text | - |
| name | Single line text | - |
| description | Long text | - |
| student_ids | Multiple select | オプション: （後で学生を追加したら更新） |
| project_name | Single line text | - |

---

## 🔧 APIキーの問題を解決する方法

### 方法1: APIキーを再確認

1. **Airtableのアカウントアイコン → Developer hub**
2. **Personal access tokens** を開く
3. **既存のトークンを確認**または**新しいトークンを作成**
4. **スコープを確認**:
   - ✅ `data.records:read`
   - ✅ `data.records:write`
   - ✅ `schema.bases:write` ← **重要！**
5. **Baseへのアクセス権限を確認**

### 方法2: 新しいAPIキーを作成

1. **Personal access tokens** で「**Create new token**」をクリック
2. **トークン名**: "PBL Dashboard v2"
3. **スコープ**:
   - ✅ `data.records:read`
   - ✅ `data.records:write`
   - ✅ `schema.bases:write` ← **必須！**
4. **アクセス可能なベース**: 「Untitled Base」（または「PBL AI Dashboard」）を選択
5. **トークンをコピー**
6. **`.env.local` ファイルを更新**:
   ```env
   AIRTABLE_API_KEY=新しいトークン
   AIRTABLE_BASE_ID=appmrazv5xBSDMt3J
   ```

---

## ✅ 手動作成のメリット

- ✅ APIキーの問題を回避できる
- ✅ フィールドの設定を確認しながら作成できる
- ✅ エラーが発生しない

---

## 🚀 次のステップ

テーブルを作成したら：

1. **サンプルデータを入力**（`AIRTABLE_SAMPLE_DATA.md`を参照）
2. **開発サーバーを再起動**: `npm run dev`
3. **ブラウザで確認**: [http://localhost:3000](http://localhost:3000)

---

## 📚 参考資料

- [AIRTABLE_CREATE_GUIDE.md](./AIRTABLE_CREATE_GUIDE.md) - 詳細な手動作成ガイド
- [AIRTABLE_SAMPLE_DATA.md](./AIRTABLE_SAMPLE_DATA.md) - サンプルデータ

