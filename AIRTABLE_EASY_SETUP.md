# Airtable簡単セットアップ（PowerShell問題回避版）

PowerShellで対話入力が難しい場合の簡単なセットアップ方法です。

## 🎯 方法1: 環境変数ファイルを直接作成（推奨）

### ステップ1: .env.localファイルを手動で作成

1. `pbl-ai-dashboard/frontend/` ディレクトリに `.env.local` ファイルを作成
2. 以下の内容を記述（実際の値に置き換えてください）：

```env
AIRTABLE_API_KEY=pat96QxJHPMGYbS7l
AIRTABLE_BASE_ID=appmrazv5xBSDMt3J

# オプション: テーブル名をカスタマイズする場合
# AIRTABLE_STUDENTS_TABLE=Students
# AIRTABLE_TASKS_TABLE=Tasks
# AIRTABLE_TEAMS_TABLE=Teams
```

3. ファイルを保存

### ステップ2: 自動セットアップスクリプトを実行

```powershell
cd C:\Users\USER\.cursor\pbl-ai-dashboard
node scripts/setup-airtable-noninteractive.js
```

このスクリプトは `.env.local` ファイルから自動的に設定を読み込みます。

---

## 🎯 方法2: 対話型スクリプトを使用（別の方法）

もし対話型スクリプトを使いたい場合：

```powershell
cd C:\Users\USER\.cursor\pbl-ai-dashboard
node scripts/create-env-file.js
```

このスクリプトが `.env.local` ファイルを作成します。

---

## 📝 現在の情報

- **Base ID**: `appmrazv5xBSDMt3J` ✅
- **APIキー**: `pat96QxJHPMGYbS7l` ✅（取得済み）

## 🚀 すぐに実行

以下のコマンドで `.env.local` ファイルを作成して、自動セットアップを実行します：

```powershell
cd C:\Users\USER\.cursor\pbl-ai-dashboard
```

その後、`.env.local` ファイルを手動で作成するか、以下のコマンドで作成：

```powershell
@"
AIRTABLE_API_KEY=pat96QxJHPMGYbS7l
AIRTABLE_BASE_ID=appmrazv5xBSDMt3J
"@ | Out-File -FilePath "frontend\.env.local" -Encoding utf8
```

そして、自動セットアップを実行：

```powershell
node scripts/setup-airtable-noninteractive.js
```

---

## ✅ 完了チェックリスト

- [ ] `.env.local` ファイルを作成した
- [ ] APIキーとBase IDを設定した
- [ ] 自動セットアップスクリプトを実行した
- [ ] Students、Tasks、Teamsテーブルが作成されたことを確認した

