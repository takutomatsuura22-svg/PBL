# OpenAI API設定手順

## 📝 手順

### 1. 環境変数ファイルの編集

`frontend/.env.local` ファイルを開いて、以下の行を追加または更新してください：

```env
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
OPENAI_MODEL=gpt-4o
```

**既存のファイルがある場合：**
- 既存の `OPENAI_API_KEY` がある場合は、上記の値に置き換えてください
- `OPENAI_MODEL` がない場合は追加してください

### 2. 開発サーバーの再起動

環境変数を変更した後は、開発サーバーを再起動してください：

```powershell
# 現在のサーバーを停止（Ctrl+C）
# その後、再起動
cd frontend
npm run dev
```

### 3. 動作確認

以下の機能でAIが動作することを確認してください：

1. **学生詳細ページのAIアドバイス**
   - `/student/[id]` ページにアクセス
   - 「AIアドバイス」セクションが表示される

2. **タスクのAI活用方法**
   - `/wbs/view` ページでタスクの「AI活用方法」が表示される

3. **タスク分析**
   - タスク詳細でAI分析が表示される

## ⚠️ 注意事項

### モデル名について

「GPT-5」というモデルは現在存在しません。以下のモデルが利用可能です：

- **`gpt-4o`** - 最新の高性能モデル（推奨、現在の設定）
- `gpt-4-turbo` - 高性能モデル
- `gpt-4o-mini` - コスト効率の良いモデル

現在の設定では **`gpt-4o`** を使用しています。これは最新の高性能モデルです。

### セキュリティ

- APIキーは絶対に公開しないでください
- `.env.local` ファイルは `.gitignore` に含まれています
- Gitにコミットする前に、APIキーが含まれていないか確認してください

## 🔧 トラブルシューティング

### APIキーが認識されない

1. `.env.local` ファイルが `frontend/` ディレクトリにあるか確認
2. ファイル名が正確に `.env.local` であるか確認（`.env.local.txt` などではない）
3. 開発サーバーを再起動

### エラー: "Invalid API key"

- APIキーが正しくコピーされているか確認
- 余分なスペースや改行が含まれていないか確認
- OpenAIのアカウントでAPIキーが有効か確認

### エラー: "Model not found"

- `OPENAI_MODEL` が正しいモデル名か確認（`gpt-4o`, `gpt-4-turbo`, `gpt-4o-mini` など）

## 📊 実装された変更

以下のファイルが更新されました：

1. **`frontend/lib/openai-client.ts`**
   - デフォルトモデルを `gpt-4o` に変更
   - 環境変数 `OPENAI_MODEL` でモデルを指定可能に

2. **`frontend/lib/ai/student_advisor.ts`**
   - モデルを `gpt-4o` に変更
   - トークン数を1000に増加（より詳細なアドバイスのため）

3. **`frontend/lib/ai/task_analyzer.ts`**
   - モデルを `gpt-4o` に変更

## ✅ 完了

環境変数を設定してサーバーを再起動すれば、AI機能が有効になります！

