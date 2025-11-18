# Airtableデータインポートガイド

AirtableのTasksとTeamsテーブルにデータをインポートする方法を説明します。

---

## 🔍 現在の状況確認

まず、Airtableのデータ状況を確認してください：

```bash
node scripts/test-airtable-connection.js
```

または、ブラウザで以下にアクセス：
- `/import-sample` - サンプルデータインポートページ

---

## 📥 データインポート方法

### 方法1: サンプルデータのインポート（推奨）

1. **ブラウザで `/import-sample` にアクセス**

2. **「サンプルデータを投入」ボタンをクリック**

3. **結果を確認**:
   - Students: 5件
   - Tasks: 5件
   - Teams: 2件

### 方法2: WBSからタスクをインポート

1. **WBSをアップロード** (`/wbs` ページ)
2. **WBSを選択**
3. **「WBSのタスクをAirtableに投入」ボタンをクリック**

### 方法3: 手動でAirtableに入力

AirtableのWebインターフェースで直接入力することも可能です。

---

## 📋 必要なフィールド

### Tasksテーブル

必須フィールド:
- `task_id` (Single line text) - タスクID（例: T001）
- `title` (Single line text) - タスク名
- `status` (Single select) - ステータス（pending, in_progress, completed）
- `assignee_id` (Single line text) - 担当者ID（例: S001）

推奨フィールド:
- `description` (Long text) - 説明
- `category` (Single select) - カテゴリ（企画, 実行, 調整, 探索）
- `difficulty` (Number) - 難易度（1-5）
- `deadline` (Date) - 締切
- `start_date` (Date) - 開始日
- `end_date` (Date) - 終了日

### Teamsテーブル

必須フィールド:
- `team_id` (Single line text) - チームID（例: T001）
- `name` (Single line text) - チーム名

推奨フィールド:
- `description` (Long text) - 説明
- `project_name` (Single line text) - プロジェクト名
- `student_ids` (Multiple select) - 学生IDのリスト

---

## ⚠️ よくある問題

### 問題1: データが0件で表示されない

**原因**: Airtableのテーブルにデータが入っていない

**解決方法**:
1. `/import-sample` でサンプルデータをインポート
2. または、Airtableで直接データを入力

### 問題2: インポートが失敗する

**原因**: 
- APIキーの権限不足
- フィールド名が異なる
- 必須フィールドが不足

**解決方法**:
1. APIキーに `data.records:write` 権限があるか確認
2. テーブル名が正しいか確認（`Tasks`, `Teams`）
3. 必須フィールドが存在するか確認

### 問題3: データが反映されない

**原因**: 
- キャッシュの問題
- データ取得のタイムアウト

**解決方法**:
1. ブラウザをリロード（Ctrl+F5）
2. 開発サーバーを再起動
3. Airtableでデータが正しく保存されているか確認

---

## 🔧 トラブルシューティング

### データ取得の確認

```bash
# Airtable接続テスト
node scripts/test-airtable-connection.js

# サンプルデータ確認
node scripts/check-sample-data.js
```

### ログの確認

開発サーバーのコンソールで以下を確認：
- `📋 Airtableからタスクを取得中: テーブル名="Tasks"`
- `📋 タスクレコードを X件取得`
- `✅ タスク取得完了: X件`

エラーの場合：
- `❌ Error fetching tasks from Airtable: ...`
- `テーブル名: Tasks`
- `エラー詳細: ...`

---

## 📝 データインポート後の確認

1. **Airtableで確認**:
   - Tasksテーブルにデータが入っているか
   - Teamsテーブルにデータが入っているか

2. **アプリで確認**:
   - `/dashboard` - タスクが表示されるか
   - `/pm` - タスク再割り当て提案が表示されるか
   - `/wbs/view` - タスクが表示されるか

---

## 🎯 次のステップ

データインポート後：
1. ダッシュボードでタスクを確認
2. PMページでタスク再割り当て提案を確認
3. WBSページでタスクを確認

---

**💡 ヒント**: サンプルデータをインポートすると、すぐにアプリを試すことができます！

