# OpenAI API設定ガイド

このアプリのAI機能を有効にするために、OpenAI APIキーを設定してください。

## 🔑 APIキーの設定

### ローカル開発環境

`frontend/.env.local` ファイルを作成または編集して、以下の内容を追加してください：

```env
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
OPENAI_MODEL=gpt-4o
```

**重要：**
- `.env.local` ファイルは `.gitignore` に含まれているため、Gitにコミットされません
- APIキーは機密情報なので、絶対に公開リポジトリにコミットしないでください

### Vercelデプロイ時

Vercelのプロジェクト設定で以下の環境変数を追加してください：

1. Vercelダッシュボード → プロジェクト → Settings → Environment Variables
2. 以下の変数を追加：

```
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
OPENAI_MODEL=gpt-4o
```

**環境：** Production, Preview, Development すべてに設定してください

## 🤖 使用モデル

現在の設定では **`gpt-4o`** を使用します。これは最新の高性能モデルです。

### 利用可能なモデル

- `gpt-4o` - 最新の高性能モデル（推奨、デフォルト）
- `gpt-4-turbo` - 高性能モデル
- `gpt-4o-mini` - コスト効率の良いモデル（コスト削減が必要な場合）

モデルを変更する場合は、`OPENAI_MODEL` 環境変数を変更してください。

## 📋 AI機能一覧

このアプリで使用されるAI機能：

1. **学生への個別AIアドバイス**
   - エンドポイント: `/api/students/[id]/ai-advice`
   - 学生の状況に応じたカスタマイズされたアドバイスを生成

2. **タスクの詳細分析**
   - エンドポイント: `/api/tasks/[id]/ai-analysis`
   - 最適なAIツールの活用方法と具体的なアクションプランを提案

3. **AI活用方法の自動生成**
   - WBSアップロード時に各タスクのAI活用方法を自動生成

## ✅ 動作確認

APIキーを設定した後、以下の手順で動作確認してください：

1. 開発サーバーを再起動
   ```powershell
   cd frontend
   npm run dev
   ```

2. 学生詳細ページでAIアドバイスを確認
   - `/student/[id]` ページにアクセス
   - AIアドバイスセクションが表示されることを確認

3. タスク分析機能を確認
   - `/wbs/view` ページでタスクのAI活用方法が表示されることを確認

## 🆘 トラブルシューティング

### エラー: "OPENAI_API_KEY is not configured"

- `.env.local` ファイルが `frontend/` ディレクトリに存在するか確認
- 環境変数名が `OPENAI_API_KEY` であることを確認
- 開発サーバーを再起動

### エラー: "Invalid API key"

- APIキーが正しく設定されているか確認
- APIキーに余分なスペースや改行が含まれていないか確認
- OpenAIのアカウントでAPIキーが有効か確認

### エラー: "Model not found"

- `OPENAI_MODEL` 環境変数が正しいモデル名か確認
- 利用可能なモデル名を確認（`gpt-4o`, `gpt-4-turbo`, `gpt-4o-mini` など）

## 💰 コスト管理

OpenAI APIの使用量を監視する方法：

1. **開発環境でのログ**
   - 開発環境では、API使用量がコンソールに表示されます
   - 例: `📊 OpenAI API使用量: 150トークン (入力: 100, 出力: 50)`

2. **OpenAIダッシュボード**
   - [OpenAI Dashboard](https://platform.openai.com/usage) で使用量を確認
   - 使用量の上限を設定できます

3. **コスト削減のヒント**
   - `gpt-4o-mini` モデルを使用するとコストを削減できます
   - `max_tokens` パラメータで出力長を制限できます

## 🔒 セキュリティ注意事項

- **APIキーは絶対に公開しないでください**
- `.env.local` は `.gitignore` に含まれていますが、念のため確認してください
- Vercelにデプロイする場合は、環境変数として設定してください（コードに直接書かない）
- APIキーが漏洩した場合は、すぐにOpenAIでキーを無効化してください

