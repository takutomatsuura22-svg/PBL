# Airtable連携 クイックスタートガイド

## 🚀 やること（3ステップ）

### ステップ1: AirtableでBaseとテーブルを作成

1. [Airtable](https://airtable.com/)にログイン（アカウントがない場合は作成）
2. 新しいBaseを作成（名前は何でもOK、例: "PBL Dashboard"）
3. 以下の3つのテーブルを作成：
   - **Students** テーブル
   - **Tasks** テーブル  
   - **Teams** テーブル

### ステップ2: APIキーとBase IDを取得

#### APIキーの取得
1. Airtableの右上のアカウントアイコンをクリック
2. 「Developer hub」を選択
3. 「Personal access tokens」タブを開く
4. 「Create new token」をクリック
5. トークン名を入力（例: "PBL Dashboard"）
6. スコープで「data.records:read」を選択
7. 「Create token」をクリック
8. **表示されたトークンをコピー**（⚠️ この画面を閉じると二度と見れません）

#### Base IDの取得
1. [Airtable API Documentation](https://airtable.com/api) にアクセス
2. 作成したBaseを選択
3. ページ上部に表示されるBase IDをコピー（例: `appXXXXXXXXXXXXXX`）

### ステップ3: 環境変数を設定

1. `pbl-ai-dashboard/frontend` ディレクトリに `.env.local` ファイルを作成
2. 以下の内容を記述（実際の値に置き換えてください）：

```env
AIRTABLE_API_KEY=patXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
```

3. ファイルを保存

### ステップ4: テーブルにフィールドを追加

#### Students テーブルに追加するフィールド

| フィールド名 | 型 | 必須 |
|------------|-----|------|
| student_id | Single line text | ✅ |
| name | Single line text | ✅ |
| MBTI | Single line text | |
| animal_type | Single line text | |
| strengths | Multiple select | |
| weaknesses | Multiple select | |
| skill_企画 | Number | |
| skill_実行 | Number | |
| skill_調整 | Number | |
| skill_探索 | Number | |
| preferred_partners | Multiple select | |
| avoided_partners | Multiple select | |
| team_id | Single line text | |
| motivation_score | Number | |
| load_score | Number | |

#### Tasks テーブルに追加するフィールド

| フィールド名 | 型 | 必須 |
|------------|-----|------|
| task_id | Single line text | ✅ |
| title | Single line text | ✅ |
| description | Long text | |
| category | Single select | |
| difficulty | Number | |
| estimated_hours | Number | |
| deadline | Date | |
| status | Single select | |
| assignee_id | Single line text | |
| required_skills | Multiple select | |

#### Teams テーブルに追加するフィールド

| フィールド名 | 型 | 必須 |
|------------|-----|------|
| team_id | Single line text | ✅ |
| name | Single line text | ✅ |
| description | Long text | |
| student_ids | Multiple select | |
| project_name | Single line text | |

### ステップ5: 開発サーバーを再起動

```bash
# 現在実行中のサーバーを停止（Ctrl+C）
# その後、再起動
cd pbl-ai-dashboard
npm run dev
```

## ✅ 動作確認

1. ブラウザで `http://localhost:3000` を開く
2. ダッシュボードにAirtableのデータが表示されれば成功！

## 📝 注意事項

- フィールド名は上記の通りでなくてもOKです（コードが自動的に認識します）
- 必須フィールド（✅）だけでも動作します
- 環境変数を設定しない場合は、従来通り `backend/data/` のファイルから読み込みます
- エラーが発生した場合は、ブラウザのコンソールとターミナルのログを確認してください

## 🆘 困ったときは

- データが表示されない → 環境変数が正しく設定されているか確認
- エラーが出る → `docs/airtable_setup.md` のトラブルシューティングを参照

