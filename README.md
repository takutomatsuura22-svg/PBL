# PBL AI Dashboard

チーム管理と学生追跡のためのAIダッシュボード

## プロジェクト構造

```
pbl-ai-dashboard/
├── frontend/                  # Next.js（App Router）
│   ├── app/
│   │   ├── dashboard/         # チーム全体2軸マップ
│   │   ├── student/[id]/      # 個別ページ
│   │   ├── pm/                # PMページ
│   │   └── api/               # APIエンドポイント
│   ├── components/            # UI部品
│   ├── lib/                   # 共通関数
│   └── styles/                # CSS or Tailwind
├── backend/
│   ├── ai/                    # AI計算モジュール
│   ├── data/                  # データファイル
│   └── services/              # サービス層
└── docs/                      # ドキュメント
```

## 🚀 クイックスタート

**実証実験を開始する場合**: [QUICKSTART.md](./QUICKSTART.md) を参照してください（5分でセットアップ可能）

### 1. 依存関係のインストール

```bash
npm install
cd frontend
npm install
cd ..
```

### 2. 環境変数の設定

`frontend/.env.local` ファイルを作成:

```env
AIRTABLE_API_KEY=patXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
```

### 3. Airtableのセットアップ

```bash
npm run setup-airtable-auto
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

**注意**: 現在、データはAirtableからのみ取得されます。`backend/data/students/` フォルダのJSONファイルは削除済みです。

## 📚 ドキュメント

### 実証実験用

**🚀 [実証実験ガイド](docs/実証実験ガイド.md)** - 実証実験のための包括的なガイド（**新規作成**）

**✅ [実証実験前チェックリスト](docs/実証実験前チェックリスト.md)** - 実証実験開始前の確認項目（**新規作成**）

### 基本ドキュメント

**📖 [アプリ説明書](docs/アプリ説明書.md)** - 機能の詳細説明と使い方ガイド

**💡 [改善提案](docs/改善提案.md)** - アプリをより良くするためのアイデア集

### AI機能

**🤖 [ChatGPT統合ガイド](docs/chatgpt_integration.md)** - ChatGPT API統合の詳細

**📚 [知識ベース統合](docs/knowledge_base_integration.md)** - 4冊の書籍の知識統合

**💰 [コスト管理ガイド](docs/openai_cost_management.md)** - OpenAI APIのコスト管理

**🧠 [AIロジック仕様](docs/ai_logic.md)** - AI計算ロジックの詳細

### セットアップ

**☁️ [Airtableセットアップ](docs/airtable_setup.md)** - Airtable連携のセットアップ

**📊 [API仕様](docs/api_spec.md)** - APIエンドポイントの仕様

**💾 [データ仕様](docs/data_spec.md)** - データ構造の仕様

## 機能

- **ダッシュボード**: チーム全体の2軸マップ（モチベーション vs 稼働負荷）
- **個別ページ**: 各学生の詳細情報とタスク一覧
- **PMページ**: チームごとの危険度スコア表示
- **WBS管理**: WBSファイルのアップロード・管理・タスク一覧表示
- **日次チェックイン**: 学生の自己報告によるモチベーション追跡
- **スコア評価ルーブリック**: タスク量・モチベーション・危険度の評価基準

## AI機能

### ルールベースAI（常時稼働）
- モチベーション推定
- 稼働負荷計算
- スキル適性推定
- タスク再割り当て提案
- 危険度スコア計算
- 介入推奨
- AI活用方法生成

### 🤖 ChatGPT統合（OpenAI API）
- **学生への個別AIアドバイス生成**: 状況に応じたカスタマイズされたアドバイス
- **タスクの詳細分析**: 最適なAIツールの活用方法と具体的なアクションプラン
- **チーム分析レポート**: チーム全体の状況分析と改善提案

**📚 統合された知識ベース:**
- **モチベーション3.0**（ダニエル・ピンク）: 自律性・熟達・目的の3要素
- **ビジネスフレームワーク図鑑**: 70種類のフレームワーク（SWOT、5W1H、PDCAなど）
- **1on1の基本と実践**: 傾聴・質問・フィードバックスキル
- **学び3.0**: 個人からチーム全体の成長へ

詳細は `docs/knowledge_base_integration.md` を参照してください。

**セットアップ:**
1. OpenAI APIキーを取得: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. `.env.local` に追加: `OPENAI_API_KEY=sk-proj-your-key`
3. **重要**: OpenAIダッシュボードで使用制限を設定（予算超過を防ぐ）
4. サーバー再起動: `npm run dev`

**コスト管理:**
- GPT-4o-miniは非常に安価（1,000回で約$1）
- 使用制限の設定を推奨（月次$10程度）
- 詳細は `docs/openai_cost_management.md` を参照

詳細は `docs/chatgpt_integration.md` を参照してください。

その他のAI機能の詳細は `docs/ai_logic.md` を参照してください。

## 🚀 デプロイ

### Vercelデプロイ

このアプリはGitHub経由でVercelにデプロイできます。

詳細な手順は [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) を参照してください。

**クイックスタート:**
1. GitHubリポジトリにプッシュ
2. [Vercel Dashboard](https://vercel.com/dashboard)でプロジェクトをインポート
3. 環境変数（`AIRTABLE_API_KEY`、`AIRTABLE_BASE_ID`）を設定
4. デプロイ

## データ管理

### ファイルベース（デフォルト）

デフォルトでは `backend/data/` のJSONファイルを使用します。

### Airtable連携

Airtableからデータを取得する場合は、環境変数を設定してください。

1. `frontend`ディレクトリに `.env.local` ファイルを作成
2. 以下の環境変数を設定：

```env
AIRTABLE_API_KEY=your_airtable_api_key_here
AIRTABLE_BASE_ID=your_airtable_base_id_here

# オプション: テーブル名をカスタマイズする場合
# AIRTABLE_STUDENTS_TABLE=Students
# AIRTABLE_TASKS_TABLE=Tasks
# AIRTABLE_TEAMS_TABLE=Teams
```

3. 環境変数が設定されている場合、自動的にAirtableからデータを取得します
4. 環境変数が設定されていない場合、またはAirtableへの接続に失敗した場合、ファイルから読み込みます

#### Airtableのテーブル構造

Airtableのテーブルには以下のフィールドが必要です：

**Students テーブル:**
- `student_id` または `Student ID`
- `name` または `Name`
- `MBTI` または `MBTI`
- `animal_type` または `Animal Type`
- `strengths` または `Strengths` (配列)
- `weaknesses` または `Weaknesses` (配列)
- `skill_企画` または `Skill 企画` または `Skill Planning`
- `skill_実行` または `Skill 実行` または `Skill Execution`
- `skill_調整` または `Skill 調整` または `Skill Coordination`
- `skill_探索` または `Skill 探索` または `Skill Exploration`
- `preferred_partners` または `Preferred Partners` (配列)
- `avoided_partners` または `Avoided Partners` (配列)
- `team_id` または `Team ID`
- `motivation_score` または `Motivation Score`
- `load_score` または `Load Score` または `Task Load`

**Tasks テーブル:**
- `task_id` または `Task ID`
- `title` または `Title`
- `description` または `Description`
- `category` または `Category`
- `difficulty` または `Difficulty`
- `estimated_hours` または `Estimated Hours`
- `deadline` または `Deadline`
- `status` または `Status` (pending/in_progress/completed)
- `assignee_id` または `Assignee ID` または `Assignee`
- `required_skills` または `Required Skills` (配列)

**Teams テーブル:**
- `team_id` または `Team ID`
- `name` または `Name`
- `description` または `Description`
- `student_ids` または `Student IDs` (配列)
- `project_name` または `Project Name`

