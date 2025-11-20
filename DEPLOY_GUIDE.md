# 🚀 アプリをVercelにデプロイして共有する手順

## 📋 デプロイ前の準備

### 1. 重要な注意事項

現在のアプリは**ローカルファイルシステム**（`backend/data/`）を使用していますが、Vercelのサーバーレス環境ではファイルシステムへの書き込みができません。

**デプロイ前に必要な作業：**
- ✅ すべてのデータをAirtableに移行済み（既に完了しているはず）
- ⚠️ WBSファイルと議事録もAirtableに保存する必要があります

### 2. 現在の状況

- ✅ 学生データ → Airtable（移行済み）
- ✅ タスクデータ → Airtable（移行済み）
- ⚠️ WBSファイル → まだローカルファイル（要対応）
- ⚠️ 議事録 → まだローカルファイル（要対応）

## 🔧 デプロイ手順

### Step 1: GitHubリポジトリを作成

1. [GitHub](https://github.com)にログイン
2. 右上の「+」→「New repository」をクリック
3. リポジトリ名を入力（例：`pbl-ai-dashboard`）
4. 「Public」または「Private」を選択
5. 「Create repository」をクリック

### Step 2: プロジェクトをGitに初期化

```powershell
# プロジェクトルートで実行
cd C:\Users\USER\OneDrive\デスクトップ\pbl-ai-dashboard

# Gitを初期化（まだの場合）
git init

# .gitignoreを確認（既に存在）
# 必要に応じて追加の除外設定を追加

# すべてのファイルをステージング
git add .

# 初回コミット
git commit -m "Initial commit: PBL AI Dashboard"

# GitHubリポジトリをリモートに追加（YOUR_USERNAMEとYOUR_REPOを置き換え）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# メインブランチを設定
git branch -M main

# GitHubにプッシュ
git push -u origin main
```

### Step 3: Vercelアカウントを作成

1. [Vercel](https://vercel.com)にアクセス
2. 「Sign Up」をクリック
3. 「Continue with GitHub」を選択してGitHubアカウントでログイン

### Step 4: Vercelでプロジェクトをインポート

1. Vercelダッシュボードで「Add New...」→「Project」をクリック
2. GitHubリポジトリを選択
3. 「Import」をクリック

### Step 5: プロジェクト設定

Vercelの設定画面で以下を確認：

**Framework Preset:** Next.js（自動検出されるはず）

**Root Directory:** `frontend` に設定

**Build Command:** `npm run build`（自動設定されるはず）

**Output Directory:** `.next`（自動設定されるはず）

### Step 6: 環境変数を設定

Vercelのプロジェクト設定で「Environment Variables」に以下を追加：

```
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_airtable_base_id
AIRTABLE_WEEKLY_REFLECTIONS_TABLE=WeeklyReflections
OPENAI_API_KEY=your_openai_api_key（オプション）
```

**設定方法：**
1. プロジェクト設定 → 「Environment Variables」
2. 各変数を追加（Production, Preview, Developmentすべてに設定）
3. 「Save」をクリック

### Step 7: デプロイ

1. 「Deploy」をクリック
2. ビルドが完了するまで待つ（通常2-5分）
3. デプロイ完了後、URLが表示されます（例：`https://your-project.vercel.app`）

## 🔄 今後の更新方法

コードを更新したら：

```powershell
# 変更をコミット
git add .
git commit -m "Update: 変更内容の説明"

# GitHubにプッシュ
git push

# Vercelが自動的に再デプロイします
```

## ⚠️ デプロイ前に修正が必要な機能

### 1. WBSファイルの保存先

現在：ローカルファイルシステム（`backend/data/wbs/`）
必要：Airtableに保存するように変更

### 2. 議事録の保存先

現在：ローカルファイルシステム（`backend/data/meetings/`）
必要：Airtableに保存するように変更

### 3. ファイルアップロード機能

WBSファイルのアップロード機能は、Vercelの一時ストレージを使用するか、外部ストレージ（AWS S3、Cloudinary等）に変更が必要です。

## 📝 推奨される対応

### オプション1: 完全にAirtableに移行（推奨）

すべてのデータをAirtableに保存するように変更：
- WBSファイル → Airtableの「WBS」テーブル
- 議事録 → Airtableの「Meetings」テーブル（既存）

### オプション2: 外部ストレージを使用

- AWS S3
- Cloudinary
- Supabase Storage

## 🎯 デプロイ後の確認事項

1. ✅ アプリが正常に表示されるか
2. ✅ 学生データが表示されるか
3. ✅ タスクデータが表示されるか
4. ✅ 週次振り返りが動作するか
5. ⚠️ WBS機能が動作するか（要確認）
6. ⚠️ 議事録機能が動作するか（要確認）

## 🆘 トラブルシューティング

### ビルドエラー

- `npm run build`をローカルで実行してエラーを確認
- TypeScriptの型エラーを修正

### 環境変数エラー

- Vercelの環境変数が正しく設定されているか確認
- `.env.local`の内容をVercelにコピー

### データが表示されない

- AirtableのAPIキーとBase IDが正しいか確認
- Airtableのテーブル名が正しいか確認
- ブラウザのコンソールでエラーを確認

## 📚 参考リンク

- [Vercel公式ドキュメント](https://vercel.com/docs)
- [Next.jsデプロイガイド](https://nextjs.org/docs/deployment)
- [Airtable APIドキュメント](https://airtable.com/api)

