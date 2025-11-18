# Airtableベース作成ガイド（ステップバイステップ）

このガイドに従って、PBL AIダッシュボード用のAirtableベースを作成してください。

## 📋 全体の流れ

1. Airtableアカウント作成・ログイン
2. 新しいベースを作成
3. 3つのテーブルを作成（Students, Tasks, Teams）
4. 各テーブルにフィールドを追加
5. APIキーとBase IDを取得
6. 環境変数を設定

---

## ステップ1: Airtableアカウントの準備

1. **Airtableにアクセス**
   - ブラウザで [https://airtable.com/](https://airtable.com/) を開く
   - アカウントがない場合は「Sign up」から作成
   - 既にアカウントがある場合は「Sign in」でログイン

2. **ワークスペースを確認**
   - ログイン後、ダッシュボードが表示されます

---

## ステップ2: 新しいベースを作成

1. **「Add a base」または「+」ボタンをクリック**
   - ダッシュボードの左上または中央に表示されます

2. **「Start from scratch」を選択**
   - テンプレートではなく、空のベースから始めます

3. **ベース名を入力**
   - 例: `PBL AI Dashboard`
   - または: `PBL管理システム`
   - 任意の名前でOKです

4. **「Create base」をクリック**

---

## ステップ3: Studentsテーブルを作成

### 3-1. テーブル名の変更

1. デフォルトの「Table 1」をクリック
2. 「Students」に名前を変更

### 3-2. フィールドの追加

以下のフィールドを順番に追加してください：

| フィールド名 | 型 | オプション | 説明 |
|------------|-----|----------|------|
| **student_id** | Single line text | ✅ 必須 | 学生ID（例: S001） |
| **name** | Single line text | ✅ 必須 | 学生の名前 |
| **MBTI** | Single line text | | MBTIタイプ（例: ENFP） |
| **animal_type** | Single line text | | 動物診断タイプ |
| **strengths** | Multiple select | | 強み（複数選択可）<br>オプション例: 企画, 実行, 調整, 探索 |
| **weaknesses** | Multiple select | | 弱み（複数選択可） |
| **skill_企画** | Number | | 企画スキル（1-5） |
| **skill_実行** | Number | | 実行スキル（1-5） |
| **skill_調整** | Number | | 調整スキル（1-5） |
| **skill_探索** | Number | | 探索スキル（1-5） |
| **preferred_partners** | Multiple select | | 推奨パートナー（学生IDのリスト） |
| **avoided_partners** | Multiple select | | 避けたいパートナー（学生IDのリスト） |
| **team_id** | Single line text | | チームID（例: T001） |
| **motivation_score** | Number | | モチベーションスコア（1-5） |
| **load_score** | Number | | タスク量スコア（1-5） |

### 3-3. フィールド追加の手順

1. **右側の「+ Add a field」をクリック**
2. **フィールド名を入力**（上記の表を参照）
3. **フィールド型を選択**
   - Single line text: テキスト入力
   - Multiple select: 複数選択（オプションを設定）
   - Number: 数値
4. **「Create field」をクリック**

### 3-4. Multiple selectフィールドのオプション設定

`strengths`, `weaknesses`, `preferred_partners`, `avoided_partners` は Multiple select なので、オプションを設定してください：

**strengths のオプション例:**
- 企画
- 実行
- 調整
- 探索
- デザイン
- 開発
- 分析

**weaknesses のオプション例:**
- 企画
- 実行
- 調整
- 探索

**preferred_partners / avoided_partners のオプション:**
- 学生IDを入力（例: S001, S002, S003...）
- 後で学生を追加したら、オプションも追加してください

---

## ステップ4: Tasksテーブルを作成

### 4-1. 新しいテーブルを追加

1. **左下の「+ Add a table」をクリック**
2. **テーブル名を「Tasks」に変更**

### 4-2. フィールドの追加

| フィールド名 | 型 | オプション | 説明 |
|------------|-----|----------|------|
| **task_id** | Single line text | ✅ 必須 | タスクID（例: T001） |
| **title** | Single line text | ✅ 必須 | タスク名 |
| **description** | Long text | | タスクの説明 |
| **category** | Single select | | カテゴリ<br>オプション: 企画, 実行, 調整, 探索 |
| **difficulty** | Number | | 難易度（1-5） |
| **estimated_hours** | Number | | 見積もり時間（時間） |
| **deadline** | Date | | 期限 |
| **start_date** | Date | | 開始日 |
| **end_date** | Date | | 終了日 |
| **status** | Single select | | ステータス<br>オプション: pending, in_progress, completed |
| **assignee_id** | Single line text | | 担当者ID（例: S001）<br>複数担当者の場合はカンマ区切り（例: S001,S002） |
| **required_skills** | Multiple select | | 必要なスキル<br>オプション: 企画, 実行, 調整, 探索 |
| **ai_usage** | Long text | | AI活用方法（自動生成される） |

### 4-3. Single selectフィールドのオプション設定

**category のオプション:**
- 企画
- 実行
- 調整
- 探索

**status のオプション:**
- pending
- in_progress
- completed

---

## ステップ5: Teamsテーブルを作成

### 5-1. 新しいテーブルを追加

1. **左下の「+ Add a table」をクリック**
2. **テーブル名を「Teams」に変更**

### 5-2. フィールドの追加

| フィールド名 | 型 | オプション | 説明 |
|------------|-----|----------|------|
| **team_id** | Single line text | ✅ 必須 | チームID（例: T001） |
| **name** | Single line text | ✅ 必須 | チーム名 |
| **description** | Long text | | チームの説明 |
| **student_ids** | Multiple select | | 学生IDのリスト<br>オプション: S001, S002, S003... |
| **project_name** | Single line text | | プロジェクト名 |

---

## ステップ6: サンプルデータの入力（オプション）

各テーブルにサンプルデータを入力して、動作確認できます。

### Studentsテーブルのサンプル

| student_id | name | MBTI | animal_type | strengths | skill_企画 | skill_実行 | skill_調整 | skill_探索 | motivation_score | load_score |
|-----------|------|------|-------------|-----------|-----------|-----------|-----------|-----------|------------------|------------|
| S001 | 山田太郎 | ENFP | ライオン | 企画,実行 | 4 | 5 | 3 | 4 | 4.2 | 3.5 |
| S002 | 佐藤花子 | ISFJ | コアラ | 調整,探索 | 3 | 3 | 5 | 4 | 3.8 | 2.8 |

### Tasksテーブルのサンプル

| task_id | title | category | difficulty | status | assignee_id | deadline |
|---------|-------|----------|------------|--------|-------------|----------|
| T001 | プロジェクト企画 | 企画 | 4 | in_progress | S001 | 2024-12-31 |
| T002 | データ分析 | 探索 | 3 | pending | S002 | 2024-12-25 |

---

## ステップ7: APIキーとBase IDを取得

### 7-1. APIキー（Personal Access Token）の取得

1. **Airtableの右上のアカウントアイコンをクリック**
2. **「Developer hub」を選択**
3. **「Personal access tokens」タブを開く**
4. **「Create new token」をクリック**
5. **トークン名を入力**（例: "PBL Dashboard"）
6. **スコープを設定:**
   - ✅ `data.records:read` （データ読み取り）
   - ✅ `data.records:write` （データ書き込み、必要に応じて）
7. **アクセス可能なベースを選択**（作成したベースを選択）
8. **「Create token」をクリック**
9. **⚠️ 重要: 表示されたトークンをコピー**（この画面を閉じると二度と見れません）
   - 形式: `patXXXXXXXXXXXXXX`

### 7-2. Base IDの取得

1. **作成したベースを開く**
2. **右上の「Help」アイコン（?）をクリック**
3. **「API documentation」を選択**
   - または直接 [https://airtable.com/api](https://airtable.com/api) にアクセス
4. **作成したベースを選択**
5. **ページ上部に表示されるBase IDをコピー**
   - 形式: `appXXXXXXXXXXXXXX`

---

## ステップ8: 環境変数を設定

1. **`pbl-ai-dashboard/frontend` ディレクトリに移動**

2. **`.env.local` ファイルを作成**

3. **以下の内容を記述**（実際の値に置き換えてください）：

```env
AIRTABLE_API_KEY=patXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX

# オプション: テーブル名をカスタマイズする場合
# AIRTABLE_STUDENTS_TABLE=Students
# AIRTABLE_TASKS_TABLE=Tasks
# AIRTABLE_TEAMS_TABLE=Teams
```

4. **ファイルを保存**

---

## ステップ9: 動作確認

1. **開発サーバーを再起動**
   ```bash
   cd pbl-ai-dashboard
   npm run dev
   ```

2. **ブラウザで `http://localhost:3000` を開く**

3. **ダッシュボードにAirtableのデータが表示されることを確認**

---

## ✅ チェックリスト

作成が完了したら、以下を確認してください：

- [ ] Airtableアカウントを作成・ログインした
- [ ] 新しいベース「PBL AI Dashboard」を作成した
- [ ] Studentsテーブルを作成し、全フィールドを追加した
- [ ] Tasksテーブルを作成し、全フィールドを追加した
- [ ] Teamsテーブルを作成し、全フィールドを追加した
- [ ] APIキー（Personal Access Token）を取得した
- [ ] Base IDを取得した
- [ ] `.env.local` ファイルを作成し、環境変数を設定した
- [ ] 開発サーバーを再起動した
- [ ] ダッシュボードでAirtableのデータが表示されることを確認した

---

## 🆘 トラブルシューティング

### データが表示されない

1. `.env.local` ファイルが正しい場所にあるか確認（`frontend/` ディレクトリ内）
2. APIキーとBase IDが正しいか確認
3. テーブル名が正しいか確認（デフォルト: Students, Tasks, Teams）
4. ブラウザのコンソールとサーバーのログを確認

### フィールドが見つからないエラー

1. フィールド名が正しいか確認（大文字小文字は区別されません）
2. 必須フィールド（student_id, name, task_id, title, team_id）が存在するか確認

### APIキーが無効

1. Personal Access Tokenが正しくコピーされているか確認
2. トークンのスコープに `data.records:read` が含まれているか確認
3. トークンが有効期限内か確認

---

## 📚 参考資料

- [Airtable公式ドキュメント](https://airtable.com/developers/web/api/introduction)
- [AIRTABLE_SETUP_QUICKSTART.md](./AIRTABLE_SETUP_QUICKSTART.md) - クイックスタートガイド
- [docs/airtable_setup.md](./docs/airtable_setup.md) - 詳細なセットアップガイド

