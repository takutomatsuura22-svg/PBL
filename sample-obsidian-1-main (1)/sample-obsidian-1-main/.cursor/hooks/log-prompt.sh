#!/bin/bash

# beforeSubmitPrompt用のログ記録スクリプト
# プロンプトを記録し、知識資産として価値のある情報を抽出

set -e

# 共通関数を読み込み
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

# JSON入力を読み込む
input=$(read_json_input)

# エラーハンドリング: 入力が空の場合
if [ -z "$input" ]; then
    log_error "log-prompt.sh: Empty input"
    exit 0
fi

# jqでJSONを解析
prompt=$(echo "$input" | jq -r '.prompt // ""')
attachments=$(echo "$input" | jq -r '.attachments // []')
conversation_id=$(echo "$input" | jq -r '.conversation_id // ""')
generation_id=$(echo "$input" | jq -r '.generation_id // ""')
workspace_roots=$(echo "$input" | jq -r '.workspace_roots // []')

# エラーハンドリング: 必須フィールドのチェック
if [ -z "$prompt" ]; then
    log_error "log-prompt.sh: Missing prompt field"
    exit 0
fi

# 機密情報をマスキング
prompt_masked=$(mask_secrets "$prompt")

# 知識抽出
intent=$(extract_intent "$prompt_masked")
learning_keywords=$(extract_learning_keywords "$prompt_masked")
error_hints=$(detect_error "$prompt_masked")

# タイトルを生成（プロンプトの最初の20文字を使用、日本語対応）
# fold -w で文字幅を指定して切り取る
prompt_title=$(echo "$prompt_masked" | fold -w 20 | head -n 1 | sed 's/[[:space:]]*$//')
if [ -z "$prompt_title" ]; then
    prompt_title="プロンプト"
fi

# ログファイルを作成
log_file=$(get_log_file_path "プロンプト_${prompt_title}")
timestamp=$(get_timestamp)
date=$(date +"%Y-%m-%d")

# 添付ファイルから関連ノートを抽出
attached_files=""
if [ "$attachments" != "[]" ]; then
    attached_files=$(echo "$attachments" | jq -r '.[] | select(.type == "rule") | .file_path' | while read -r file; do
        if [ -n "$file" ]; then
            echo "- [[$(basename "$file" .md)]]"
        fi
    done)
fi

# フロントマターを生成
cat > "$log_file" << EOF
---
type: cursor-session
event: beforeSubmitPrompt
date: ${date}
tags: [cursor, ai-conversation, knowledge]
conversation_id: ${conversation_id}
generation_id: ${generation_id}
status: active
learning_keywords: [${learning_keywords}]
---

# 🧠 ${timestamp}_知識記録_プロンプト

## 🎯 目的・意図
<!-- このセッションで達成したかったこと -->
\`\`\`
${prompt_masked:0:500}
\`\`\`

$(if [ -n "$intent" ]; then
    echo "## 🤔 Why（なぜ）"
    echo "<!-- なぜこの実装を選んだか、他の選択肢と比較した理由 -->"
    echo ""
    echo "${intent}"
    echo ""
fi)

## 💬 AIとの対話
<!-- プロンプト履歴 -->
- **プロンプト**: [要約 - 詳細は下記]
- **コンテキスト**: ${#attachments}個の添付ファイル

$(if [ -n "$attached_files" ]; then
    echo "## 📎 参照したノート"
    echo "$attached_files"
    echo ""
fi)

## 📎 添付ファイル
$(if [ "$attachments" != "[]" ]; then
    echo "$attachments" | jq -r '.[] | "- \(.type): \(.file_path)"'
else
    echo "- なし"
fi)

## 📁 ワークスペース
$(echo "$workspace_roots" | jq -r '.[] | "- \(.)"')

## 🔗 関連ノート候補
<!-- TODO: キーワードから自動で関連ノートを提案 -->
<!-- 例: [[関連技術]] [[関連パターン]] -->
$(if [ -n "$learning_keywords" ]; then
    echo "$learning_keywords" | tr ',' '\n' | sed 's/^/- [[/g' | sed 's/$/]]/g'
fi)

## 💡 学び・気づき
<!-- この対話で理解したこと、気づいたパターン -->
<!-- TODO: ここは後で編集して具体的な学びを記録 -->

## ❓ 疑問・未解決
<!-- 作業中に浮かんだ未解決の疑問 -->
<!-- TODO: 疑問を記録 -->

## 📋 次回のアクション
<!-- このセッション後にやること -->
- [ ] TODO: 具体的なアクションを記録

## 📝 メモ
- セッションID: ${conversation_id}
- 開始時刻: ${timestamp}
EOF

# エラーハンドリング: ファイル作成失敗
if [ $? -ne 0 ]; then
    log_error "log-prompt.sh: Failed to create log file"
    exit 0
fi

# 出力: 処理を継続
exit 0
