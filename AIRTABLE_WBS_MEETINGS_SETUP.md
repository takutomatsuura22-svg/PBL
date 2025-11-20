# Airtableテーブル設定: WBSと議事録

Vercelデプロイのために、WBSと議事録をAirtableに保存するように変更しました。以下のテーブルをAirtableに作成する必要があります。

## 📋 必要なテーブル

### 1. WBSテーブル

**テーブル名:** `WBS`（環境変数 `AIRTABLE_WBS_TABLE` で変更可能）

**フィールド:**

| フィールド名 | タイプ | 説明 |
|------------|--------|------|
| `wbs_id` | Single line text | WBSの一意ID（例: `wbs_1234567890`） |
| `name` | Single line text | WBS名（例: `Phase 1 WBS`） |
| `description` | Long text | WBSの説明 |
| `created_at` | Date | 作成日時 |
| `tasks` | Long text | タスクの配列（JSON形式で保存） |
| `is_current` | Checkbox | 現在選択中のWBSかどうか |

**作成手順:**

1. AirtableでBaseを開く
2. 「Add a table」をクリック
3. テーブル名を「WBS」に設定
4. 上記のフィールドを追加

### 2. Meetingsテーブル

**テーブル名:** `Meetings`（環境変数 `AIRTABLE_MEETINGS_TABLE` で変更可能）

**フィールド:**

| フィールド名 | タイプ | 説明 |
|------------|--------|------|
| `meeting_id` | Single line text | 議事録の一意ID（例: `M1234567890`） |
| `date` | Date | 議事録の日付 |
| `title` | Single line text | 議事録のタイトル |
| `participants` | Multiple select | 参加者（学生IDの配列） |
| `agenda` | Long text | アジェンダ（改行区切り） |
| `content` | Long text | 議事録の内容 |
| `decisions` | Long text | 決定事項（改行区切り） |
| `action_items` | Long text | アクションアイテム（JSON形式） |
| `created_by` | Single line text | 作成者の学生ID |
| `created_at` | Date | 作成日時 |

**作成手順:**

1. AirtableでBaseを開く
2. 「Add a table」をクリック
3. テーブル名を「Meetings」に設定
4. 上記のフィールドを追加

## 🔧 環境変数の設定

Vercelで以下の環境変数を設定してください：

```
AIRTABLE_API_KEY=your_api_key
AIRTABLE_BASE_ID=your_base_id
AIRTABLE_WBS_TABLE=WBS
AIRTABLE_MEETINGS_TABLE=Meetings
```

## 📝 注意事項

### WBSテーブルの`tasks`フィールド

- **タイプ:** Long text
- **形式:** JSON文字列
- **例:**
  ```json
  [
    {
      "task_id": "T123",
      "title": "タスク1",
      "description": "説明",
      "category": "実行",
      "difficulty": 3,
      "status": "pending",
      "assignee_id": "S001",
      ...
    }
  ]
  ```

### Meetingsテーブルの`action_items`フィールド

- **タイプ:** Long text
- **形式:** JSON文字列
- **例:**
  ```json
  [
    {
      "task": "アクション1",
      "assignee": "S001",
      "deadline": "2025-01-31"
    }
  ]
  ```

## ✅ 動作確認

1. WBSアップロード機能をテスト
2. WBS一覧表示をテスト
3. WBS選択機能をテスト
4. 議事録の作成をテスト
5. 議事録の一覧表示をテスト

## 🆘 トラブルシューティング

### エラー: "Table not found"

- Airtableでテーブル名が正しいか確認
- 環境変数 `AIRTABLE_WBS_TABLE` と `AIRTABLE_MEETINGS_TABLE` を確認

### エラー: "Field not found"

- フィールド名が正確に一致しているか確認（大文字小文字に注意）
- フィールドタイプが正しいか確認

### データが保存されない

- AirtableのAPIキーに書き込み権限があるか確認
- Base IDが正しいか確認
- ブラウザのコンソールでエラーを確認

