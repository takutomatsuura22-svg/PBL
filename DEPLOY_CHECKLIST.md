# ✅ Vercelデプロイ前チェックリスト

## 📦 必須作業（デプロイ前に完了）

### 1. データの移行状況確認

- [ ] 学生データがAirtableに移行済み
- [ ] タスクデータがAirtableに移行済み
- [ ] 週次振り返りデータがAirtableに保存されている
- [ ] WBSファイルをAirtableに保存する機能を実装（要対応）
- [ ] 議事録をAirtableに保存する機能を実装（要対応）

### 2. 環境変数の準備

以下の環境変数の値を準備：

- [ ] `AIRTABLE_API_KEY` - AirtableのAPIキー
- [ ] `AIRTABLE_BASE_ID` - AirtableのBase ID
- [ ] `AIRTABLE_WEEKLY_REFLECTIONS_TABLE` - 週次振り返りテーブル名（デフォルト: `WeeklyReflections`）
- [ ] `OPENAI_API_KEY` - OpenAI APIキー（オプション、AI機能を使用する場合）

### 3. ローカルビルドテスト

```powershell
cd frontend
npm run build
```

- [ ] ビルドが成功する
- [ ] TypeScriptのエラーがない
- [ ] リンターエラーがない

### 4. Gitリポジトリの準備

- [ ] `.gitignore`が適切に設定されている
- [ ] `.env.local`が`.gitignore`に含まれている（重要！）
- [ ] 機密情報がコミットされていない

### 5. GitHubリポジトリの作成

- [ ] GitHubアカウントがある
- [ ] 新しいリポジトリを作成
- [ ] コードをプッシュ済み

### 6. Vercelアカウントの準備

- [ ] Vercelアカウントを作成
- [ ] GitHubアカウントと連携済み

## 🚀 デプロイ手順

### Step 1: Vercelでプロジェクトをインポート

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. 「Add New...」→「Project」をクリック
3. GitHubリポジトリを選択
4. 「Import」をクリック

### Step 2: プロジェクト設定

- [ ] Framework Preset: `Next.js`
- [ ] Root Directory: `frontend`
- [ ] Build Command: `npm run build`（自動設定）
- [ ] Output Directory: `.next`（自動設定）

### Step 3: 環境変数の設定

Vercelのプロジェクト設定 → Environment Variables で以下を追加：

- [ ] `AIRTABLE_API_KEY`
- [ ] `AIRTABLE_BASE_ID`
- [ ] `AIRTABLE_WEEKLY_REFLECTIONS_TABLE`（オプション）
- [ ] `OPENAI_API_KEY`（オプション）

**重要：** Production, Preview, Developmentすべての環境に設定

### Step 4: デプロイ実行

- [ ] 「Deploy」をクリック
- [ ] ビルドが成功するまで待つ
- [ ] デプロイURLを確認

### Step 5: 動作確認

デプロイ後のURLで以下を確認：

- [ ] ホームページが表示される
- [ ] ダッシュボード（二軸マップ）が表示される
- [ ] 学生データが表示される
- [ ] タスク一覧が表示される
- [ ] 週次振り返りが動作する
- [ ] PMページ（AI提案・介入）が表示される

## ⚠️ 既知の問題と対応

### 問題1: WBSファイルのアップロード

**現状：** ローカルファイルシステムに保存

**対応方法：**
1. Airtableに「WBS」テーブルを作成
2. WBSアップロードAPIをAirtableに保存するように変更
3. WBS取得APIをAirtableから読み込むように変更

### 問題2: 議事録の保存

**現状：** ローカルファイルシステムに保存

**対応方法：**
1. Airtableに「Meetings」テーブルが既にあるか確認
2. 議事録APIをAirtableに保存するように変更（既に実装済みの可能性あり）

### 問題3: ファイルアップロードの制限

**Vercelの制限：**
- サーバーレス関数の実行時間: 最大10秒（Hobbyプラン）
- ファイルサイズ: 4.5MB（リクエストボディ）

**対応方法：**
- 大きなファイルは外部ストレージ（S3、Cloudinary等）を使用

## 🔍 デプロイ後のトラブルシューティング

### エラー: "Airtable credentials not configured"

**原因：** 環境変数が設定されていない

**解決方法：**
1. VercelのEnvironment Variablesを確認
2. 変数名が正しいか確認（大文字小文字に注意）
3. 再デプロイ

### エラー: "Cannot find module"

**原因：** 依存関係がインストールされていない

**解決方法：**
1. `package.json`を確認
2. `npm install`が実行されているか確認
3. Vercelのビルドログを確認

### データが表示されない

**原因：** Airtableの接続エラー

**解決方法：**
1. ブラウザのコンソールでエラーを確認
2. AirtableのAPIキーとBase IDを確認
3. Airtableのテーブル名が正しいか確認

## 📞 サポート

問題が解決しない場合：

1. Vercelのビルドログを確認
2. ブラウザの開発者ツール（F12）でエラーを確認
3. GitHubのIssuesに報告

## 🎉 デプロイ完了後

- [ ] デプロイURLを共有可能な状態にする
- [ ] ドメインをカスタマイズ（オプション）
- [ ] アクセス制限を設定（オプション）
- [ ] 監視とログを設定（オプション）

