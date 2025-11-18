# 次のステップ：ベース名の変更とテーブル作成

## ✅ 現在の状態

- ✅ ベースが作成されています（"Untitled Base"）
- ✅ Base ID: `appmrazv5xBSDMt3J`
- ✅ デフォルトの「Table 1」が存在

## 📋 次のステップ

### ステップ1: ベース名を変更（オプション）

1. 画面の左上の「**Untitled Base**」をクリック
2. 「**PBL AI Dashboard**」に変更
3. Enterキーを押す

### ステップ2: 既存の「Table 1」を削除（オプション）

自動セットアップスクリプトが新しいテーブルを作成するので、既存のテーブルは削除してもOKです。

1. 「**Table 1**」の横の「**...**」（三点リーダー）をクリック
2. 「**Delete table**」を選択
3. 確認ダイアログで「**Delete**」をクリック

**または、そのまま残しておいても問題ありません。** スクリプトが新しいテーブルを追加します。

### ステップ3: 自動セットアップスクリプトを実行

ターミナル（PowerShell）で以下を実行：

```powershell
cd C:\Users\USER\.cursor\pbl-ai-dashboard
npm run setup-airtable
```

スクリプトが2つの質問をします：

1. **Airtable APIキー（Personal Access Token）を入力してください:**
   - まだ取得していない場合は、先にAPIキーを取得してください（下記参照）

2. **Airtable Base IDを入力してください:**
   - `appmrazv5xBSDMt3J` を入力（既に分かっています！）

スクリプトが以下を自動作成します：
- ✅ Studentsテーブル
- ✅ Tasksテーブル
- ✅ Teamsテーブル
- ✅ すべてのフィールド

---

## 🔑 APIキーの取得方法（まだの場合）

### ステップ1: Developer Hubを開く

1. Airtableの画面の右上の**アカウントアイコン**（「拓」のアイコンの横）をクリック
2. 「**Developer hub**」を選択

### ステップ2: Personal Access Tokenを作成

1. 「**Personal access tokens**」タブを開く
2. 「**Create new token**」をクリック
3. トークン名を入力（例: "PBL Dashboard"）
4. **スコープを設定**:
   - ✅ `data.records:read`
   - ✅ `data.records:write`
   - ✅ `schema.bases:write` ← **重要！**
5. **アクセス可能なベースを選択**:
   - 「Untitled Base」（または「PBL AI Dashboard」）を選択
6. 「**Create token**」をクリック
7. **⚠️ 重要: 表示されたトークンをコピー**
   - 形式: `patXXXXXXXXXXXXXX`
   - この画面を閉じると二度と見れません！

---

## 🚀 実行手順まとめ

1. **APIキーを取得**（まだの場合）
   - アカウントアイコン → Developer hub → Personal access tokens → Create new token

2. **スクリプトを実行**
   ```powershell
   cd C:\Users\USER\.cursor\pbl-ai-dashboard
   npm run setup-airtable
   ```

3. **入力**
   - APIキー: `patXXXXXXXXXXXXXX`（取得したトークン）
   - Base ID: `appmrazv5xBSDMt3J`（既に分かっています）

4. **完了を確認**
   - Airtableで3つのテーブル（Students, Tasks, Teams）が作成されていることを確認

---

## ✅ 完了チェックリスト

- [ ] ベース名を「PBL AI Dashboard」に変更した（オプション）
- [ ] APIキーを取得した
- [ ] スクリプトを実行した
- [ ] Students、Tasks、Teamsテーブルが作成されたことを確認した
- [ ] `.env.local` ファイルが作成されたことを確認した

---

## 🆘 トラブルシューティング

### スクリプトがエラーになる

**エラー: "HTTP 403: Forbidden"**
- APIキーに `schema.bases:write` 権限があるか確認
- ベースへのアクセス権限があるか確認

**エラー: "HTTP 404: Not Found"**
- Base IDが正しいか確認（`appmrazv5xBSDMt3J`）

### テーブルが作成されない

1. AirtableでBaseを確認
2. スクリプトのエラーメッセージを確認
3. APIキーの権限を確認

