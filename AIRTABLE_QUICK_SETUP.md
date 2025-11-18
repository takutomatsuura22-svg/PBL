# Airtableクイックセットアップ（完全版）

このガイドに従えば、約10分でAirtableのセットアップが完了します。

## 🎯 全体の流れ

1. ✅ AirtableでBaseを作成（手動、2分）
2. ✅ APIキーを取得（手動、3分）
3. ✅ 自動セットアップスクリプトを実行（自動、1分）
4. ✅ サンプルデータを入力（手動、4分）

---

## ステップ1: AirtableでBaseを作成（2分）

### 1-1. Airtableにアクセス

ブラウザで [https://airtable.com/](https://airtable.com/) を開く

### 1-2. 新しいBaseを作成

1. 「Add a base」または「+」ボタンをクリック
2. 「Start from scratch」を選択
3. ベース名を「**PBL AI Dashboard**」に設定
4. 「Create base」をクリック

### 1-3. Base IDをコピー

1. ベースが開いたら、ブラウザのアドレスバーを見る
2. URLは以下のような形式: `https://airtable.com/appXXXXXXXXXXXXXX/...`
3. **`appXXXXXXXXXXXXXX`** の部分をコピー（これがBase ID）

---

## ステップ2: APIキーを取得（3分）

### 2-1. Developer Hubを開く

1. Airtableの右上の**アカウントアイコン**をクリック
2. 「**Developer hub**」を選択

### 2-2. Personal Access Tokenを作成

1. 「**Personal access tokens**」タブを開く
2. 「**Create new token**」をクリック
3. トークン名を入力（例: "PBL Dashboard"）
4. **スコープを設定**:
   - ✅ `data.records:read` （データ読み取り）
   - ✅ `data.records:write` （データ書き込み）
   - ✅ `schema.bases:write` （テーブル作成）← **重要！**
5. **アクセス可能なベースを選択**:
   - 作成した「PBL AI Dashboard」ベースを選択
6. 「**Create token**」をクリック
7. **⚠️ 重要: 表示されたトークンをコピー**
   - 形式: `patXXXXXXXXXXXXXX`
   - この画面を閉じると二度と見れません！

---

## ステップ3: 自動セットアップスクリプトを実行（1分）

### 3-1. スクリプトを実行

ターミナル（PowerShell）で以下を実行：

```powershell
cd C:\Users\USER\.cursor\pbl-ai-dashboard
npm run setup-airtable
```

### 3-2. 入力プロンプトに回答

スクリプトが2つの質問をします：

1. **Airtable APIキー（Personal Access Token）を入力してください:**
   - ステップ2でコピーした `patXXXXXXXXXXXXXX` を貼り付け
   - Enterキーを押す

2. **Airtable Base IDを入力してください:**
   - ステップ1でコピーした `appXXXXXXXXXXXXXX` を貼り付け
   - Enterキーを押す

### 3-3. 完了を確認

スクリプトが以下を自動実行します：
- ✅ Studentsテーブルを作成
- ✅ Tasksテーブルを作成
- ✅ Teamsテーブルを作成
- ✅ 各テーブルに必要なフィールドを追加
- ✅ `.env.local` ファイルを作成/更新

完了メッセージが表示されたら成功です！

---

## ステップ4: サンプルデータを入力（4分、オプション）

### 4-1. Airtableでベースを確認

1. Airtableで「PBL AI Dashboard」ベースを開く
2. 3つのテーブル（Students, Tasks, Teams）が作成されていることを確認

### 4-2. サンプルデータを入力

`AIRTABLE_SAMPLE_DATA.md` を開いて、サンプルデータをコピー&ペーストしてください。

または、既存のJSONファイルからデータをインポートすることもできます。

---

## ✅ 完了チェックリスト

- [ ] AirtableでBase「PBL AI Dashboard」を作成した
- [ ] Base IDをコピーした（`appXXXXXXXXXXXXXX`）
- [ ] APIキー（Personal Access Token）を取得した（`patXXXXXXXXXXXXXX`）
- [ ] スクリプトを実行してテーブルとフィールドを作成した
- [ ] `.env.local` ファイルが作成されたことを確認した
- [ ] Airtableで3つのテーブルが作成されていることを確認した
- [ ] サンプルデータを入力した（オプション）

---

## 🚀 次のステップ

1. **開発サーバーを再起動**
   ```powershell
   npm run dev
   ```

2. **ブラウザで確認**
   - [http://localhost:3000](http://localhost:3000) を開く
   - ダッシュボードにAirtableのデータが表示されることを確認

---

## 🆘 トラブルシューティング

### スクリプトがエラーになる

**エラー: "HTTP 403: Forbidden"**
- APIキーに `schema.bases:write` 権限があるか確認
- ベースへのアクセス権限があるか確認

**エラー: "HTTP 404: Not Found"**
- Base IDが正しいか確認
- Baseが存在するか確認

**エラー: "Cannot find module"**
- 正しいディレクトリにいるか確認: `C:\Users\USER\.cursor\pbl-ai-dashboard`
- `npm install` を実行して依存関係をインストール

### テーブルが作成されない

1. AirtableでBaseを確認
2. スクリプトのエラーメッセージを確認
3. APIキーの権限を確認
4. 手動でテーブルを作成（`AIRTABLE_CREATE_GUIDE.md`を参照）

---

## 📚 関連ドキュメント

- [AIRTABLE_AUTO_SETUP.md](./AIRTABLE_AUTO_SETUP.md) - 自動セットアップの詳細
- [AIRTABLE_CREATE_GUIDE.md](./AIRTABLE_CREATE_GUIDE.md) - 手動セットアップガイド
- [AIRTABLE_SAMPLE_DATA.md](./AIRTABLE_SAMPLE_DATA.md) - サンプルデータ

