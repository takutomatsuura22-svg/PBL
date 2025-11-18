# PBL AI Dashboard クイックスタートガイド

実証実験を開始するための最短手順です。

---

## ⚡ 5分でセットアップ

### ステップ1: 依存関係のインストール（2分）

```bash
npm install
cd frontend
npm install
cd ..
```

### ステップ2: 環境変数の設定（2分）

`frontend/.env.local` ファイルを作成:

```env
AIRTABLE_API_KEY=patXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
```

**Airtable APIキーの取得:**
1. [Airtable](https://airtable.com/) → アカウントアイコン → Developer hub
2. Personal access tokens → Create new token
3. スコープ: `data.records:read`, `data.records:write`, `schema.bases:write`
4. トークンをコピー

**Base IDの取得:**
- AirtableのURLから `appXXXXXXXXXXXXXX` をコピー

### ステップ3: Airtableのセットアップ（1分）

```bash
npm run setup-airtable-auto
```

### ステップ4: サーバー起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) にアクセス

---

## 🎯 次のステップ

1. **データの投入**
   - AirtableのStudentsテーブルに学生データを入力
   - または `/import-sample` ページからサンプルデータを投入

2. **機能の確認**
   - `/dashboard` - ダッシュボードを確認
   - `/pm` - PMページを確認
   - `/student/S003` - 学生個別ページを確認

3. **実証実験の開始**
   - `docs/実証実験ガイド.md` を参照
   - `docs/実証実験前チェックリスト.md` で最終確認

---

## 📚 詳細ドキュメント

- **実証実験ガイド**: `docs/実証実験ガイド.md`
- **アプリ説明書**: `docs/アプリ説明書.md`
- **トラブルシューティング**: `docs/実証実験ガイド.md#トラブルシューティング`

---

## ⚠️ よくある問題

### データが表示されない

→ `.env.local` ファイルを確認  
→ `node scripts/check-sample-data.js` で接続確認

### サーバーが起動しない

→ ポート3000が使用されていないか確認  
→ `npm install` を再実行

---

**🎉 セットアップ完了！実証実験を開始できます！**

