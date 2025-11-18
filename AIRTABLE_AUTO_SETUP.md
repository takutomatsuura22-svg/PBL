# Airtable自動セットアップガイド

このガイドでは、スクリプトを使ってAirtableのテーブルとフィールドを自動作成する方法を説明します。

## 🚀 クイックスタート

### ステップ1: AirtableでBaseを作成（手動）

1. [Airtable](https://airtable.com/)にログイン
2. 「Add a base」→「Start from scratch」を選択
3. ベース名を「PBL AI Dashboard」に設定
4. Base IDをコピー（URLから `appXXXXXXXXXXXXXX` の部分）

### ステップ2: APIキーを取得（手動）

1. Airtableの右上のアカウントアイコンをクリック
2. 「Developer hub」を選択
3. 「Personal access tokens」タブを開く
4. 「Create new token」をクリック
5. トークン名を入力（例: "PBL Dashboard"）
6. スコープを設定:
   - ✅ `data.records:read`
   - ✅ `data.records:write`
   - ✅ `schema.bases:write` （テーブル作成に必要）
7. アクセス可能なベースを選択
8. 「Create token」をクリック
9. **トークンをコピー**（形式: `patXXXXXXXXXXXXXX`）

### ステップ3: 自動セットアップスクリプトを実行

```bash
cd pbl-ai-dashboard
npm run setup-airtable
```

スクリプトが以下を実行します：
1. APIキーとBase IDの入力プロンプトを表示
2. 3つのテーブル（Students, Tasks, Teams）を自動作成
3. 各テーブルに必要なフィールドを自動追加
4. `.env.local` ファイルを自動作成/更新

### ステップ4: 確認

1. Airtableでベースを開いて、テーブルとフィールドが作成されているか確認
2. サンプルデータを入力（`AIRTABLE_SAMPLE_DATA.md`を参照）
3. 開発サーバーを再起動: `npm run dev`

---

## 📋 スクリプトの詳細

### 作成されるテーブル

#### Students テーブル
- student_id, name, MBTI, animal_type
- strengths, weaknesses (Multiple select)
- skill_企画, skill_実行, skill_調整, skill_探索 (Number)
- preferred_partners, avoided_partners (Multiple select)
- team_id, motivation_score, load_score

#### Tasks テーブル
- task_id, title, description
- category, difficulty, estimated_hours
- deadline, start_date, end_date
- status (Single select: pending, in_progress, completed)
- assignee_id, required_skills, ai_usage

#### Teams テーブル
- team_id, name, description
- student_ids (Multiple select)
- project_name

---

## 🆘 トラブルシューティング

### エラー: "HTTP 403: Forbidden"

**原因**: APIキーに適切な権限がない

**解決方法**:
1. Personal Access Tokenの設定を確認
2. `schema.bases:write` 権限が有効になっているか確認
3. ベースへのアクセス権限があるか確認

### エラー: "HTTP 404: Not Found"

**原因**: Base IDが間違っている、またはBaseが存在しない

**解決方法**:
1. Base IDが正しいか確認（URLから `appXXXXXXXXXXXXXX` の部分）
2. Baseが存在するか確認
3. APIキーがそのBaseにアクセスできるか確認

### エラー: "Table already exists"

**原因**: テーブルが既に存在する

**解決方法**:
- これは警告のみで、処理は続行されます
- 既存のテーブルはスキップされ、新しいフィールドのみ追加されます

### テーブルは作成されたが、フィールドが不足している

**原因**: 一部のフィールド作成に失敗した可能性

**解決方法**:
1. Airtableでテーブルを確認
2. 不足しているフィールドを手動で追加（`AIRTABLE_CREATE_GUIDE.md`を参照）
3. または、スクリプトを再実行（既存のテーブルはスキップされます）

---

## 🔄 手動セットアップとの比較

| 項目 | 自動セットアップ | 手動セットアップ |
|------|----------------|----------------|
| Base作成 | 手動 | 手動 |
| テーブル作成 | 自動 | 手動 |
| フィールド追加 | 自動 | 手動 |
| 時間 | 約5分 | 約30分 |
| エラー対応 | スクリプトで確認 | 手動で確認 |

---

## 📚 関連ドキュメント

- [AIRTABLE_CREATE_GUIDE.md](./AIRTABLE_CREATE_GUIDE.md) - 手動セットアップガイド
- [AIRTABLE_SAMPLE_DATA.md](./AIRTABLE_SAMPLE_DATA.md) - サンプルデータ
- [AIRTABLE_SETUP_QUICKSTART.md](./AIRTABLE_SETUP_QUICKSTART.md) - クイックスタート

---

## 💡 ヒント

- スクリプトは何度でも実行できます（既存のテーブルはスキップされます）
- `.env.local` ファイルが既に存在する場合、APIキーとBase IDの入力プロンプトが表示されます
- 環境変数が既に設定されている場合、それを使用します

