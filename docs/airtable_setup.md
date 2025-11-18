# Airtable連携セットアップガイド

## 概要

PBL AIダッシュボードは、Airtableからデータを取得して使用することができます。環境変数を設定することで、自動的にAirtableからデータを取得します。

## セットアップ手順

### 1. Airtableの準備

1. [Airtable](https://airtable.com/)にアカウントを作成
2. 新しいBaseを作成
3. 以下の3つのテーブルを作成：
   - **Students** (学生データ)
   - **Tasks** (タスクデータ)
   - **Teams** (チームデータ)

### 2. APIキーの取得

1. Airtableのアカウント設定から「Developer hub」を開く
2. 「Personal access tokens」で新しいトークンを作成
3. トークンをコピー（後で使用します）

### 3. Base IDの取得

1. AirtableのBaseを開く
2. [Airtable API Documentation](https://airtable.com/api) にアクセス
3. Baseを選択すると、Base IDが表示されます（例: `appXXXXXXXXXXXXXX`）

### 4. 環境変数の設定

`frontend`ディレクトリに `.env.local` ファイルを作成し、以下の内容を記述：

```env
AIRTABLE_API_KEY=your_airtable_api_key_here
AIRTABLE_BASE_ID=your_airtable_base_id_here
```

### 5. テーブル構造の設定

Airtableのテーブルに以下のフィールドを作成してください。

#### Students テーブル

| フィールド名 | 型 | 説明 |
|------------|-----|------|
| student_id | Single line text | 学生ID（一意） |
| name | Single line text | 名前 |
| MBTI | Single line text | MBTIタイプ |
| animal_type | Single line text | 動物診断タイプ |
| strengths | Multiple select | 強み（複数選択可） |
| weaknesses | Multiple select | 弱み（複数選択可） |
| skill_企画 | Number | 企画スキル（1-5） |
| skill_実行 | Number | 実行スキル（1-5） |
| skill_調整 | Number | 調整スキル（1-5） |
| skill_探索 | Number | 探索スキル（1-5） |
| preferred_partners | Multiple select | 相性の良いパートナー |
| avoided_partners | Multiple select | 相性の悪いパートナー |
| team_id | Single line text | 所属チームID |
| motivation_score | Number | モチベーションスコア（1-5） |
| load_score | Number | 負荷スコア（1-5） |

#### Tasks テーブル

| フィールド名 | Type | 説明 |
|------------|-----|------|
| task_id | Single line text | タスクID（一意） |
| title | Single line text | タスクタイトル |
| description | Long text | タスク説明 |
| category | Single select | カテゴリ |
| difficulty | Number | 難易度（1-5） |
| estimated_hours | Number | 見積もり時間 |
| deadline | Date | 締切日 |
| status | Single select | ステータス（pending/in_progress/completed） |
| assignee_id | Single line text | 担当者ID |
| required_skills | Multiple select | 必要なスキル |

#### Teams テーブル

| フィールド名 | Type | 説明 |
|------------|-----|------|
| team_id | Single line text | チームID（一意） |
| name | Single line text | チーム名 |
| description | Long text | チーム説明 |
| student_ids | Multiple select | 所属学生ID（複数） |
| project_name | Single line text | プロジェクト名 |

### 6. フィールド名のカスタマイズ

フィールド名が異なる場合は、以下の環境変数でテーブル名をカスタマイズできます：

```env
AIRTABLE_STUDENTS_TABLE=Students
AIRTABLE_TASKS_TABLE=Tasks
AIRTABLE_TEAMS_TABLE=Teams
```

また、コードは以下のフィールド名のバリエーションを自動的に認識します：
- `student_id` または `Student ID`
- `name` または `Name`
- など（詳細は `frontend/lib/airtable-server.ts` を参照）

## 動作確認

1. 開発サーバーを起動：
   ```bash
   npm run dev
   ```

2. ブラウザで `http://localhost:3000` を開く

3. ダッシュボードにAirtableのデータが表示されることを確認

## フォールバック動作

- 環境変数が設定されていない場合：ファイル（`backend/data/`）から読み込み
- Airtableへの接続に失敗した場合：ファイルから読み込み
- エラーはコンソールに出力されますが、アプリケーションは継続して動作します

## トラブルシューティング

### データが表示されない

1. 環境変数が正しく設定されているか確認
2. AirtableのAPIキーとBase IDが正しいか確認
3. テーブル名が正しいか確認（デフォルト: Students, Tasks, Teams）
4. ブラウザのコンソールとサーバーのログを確認

### フィールドが見つからないエラー

1. Airtableのテーブルに必要なフィールドがすべて存在するか確認
2. フィールド名がコードで認識できる形式か確認（`frontend/lib/airtable-server.ts` を参照）
3. フィールドの型が正しいか確認（配列フィールドはMultiple selectなど）

### 接続エラー

1. インターネット接続を確認
2. AirtableのAPI制限に達していないか確認
3. APIキーに適切な権限があるか確認

