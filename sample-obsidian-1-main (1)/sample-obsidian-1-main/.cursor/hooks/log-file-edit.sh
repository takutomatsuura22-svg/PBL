#!/bin/bash

# afterFileEdit用のログ記録スクリプト
# ファイル編集を記録し、学びとパターンを抽出

set -e

# 共通関数を読み込み
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

# JSON入力を読み込む
input=$(read_json_input)

# エラーハンドリング: 入力が空の場合
if [ -z "$input" ]; then
    log_error "log-file-edit.sh: Empty input"
    exit 0
fi

# jqでJSONを解析
file_path=$(echo "$input" | jq -r '.file_path // ""')
edits=$(echo "$input" | jq -r '.edits // []')
conversation_id=$(echo "$input" | jq -r '.conversation_id // ""')
generation_id=$(echo "$input" | jq -r '.generation_id // ""')
workspace_roots=$(echo "$input" | jq -r '.workspace_roots // []')

# エラーハンドリング: 必須フィールドのチェック
if [ -z "$file_path" ]; then
    log_error "log-file-edit.sh: Missing file_path field"
    exit 0
fi

# マークダウンファイルのみを処理
if [[ ! "$file_path" =~ \.(md|markdown)$ ]]; then
    exit 0
fi

# ファイル名を取得
filename=$(basename "$file_path")
wikilink=$(to_wikilink "$file_path")
category=$(get_category "$file_path")

# 編集内容を要約
edit_count=$(echo "$edits" | jq 'length')
edit_summary="${edit_count}箇所を編集"

# 編集内容から学習キーワードを抽出
all_edits=$(echo "$edits" | jq -r '.[] | "\(.old_string // "") \(.new_string // "")"')
learning_keywords=$(extract_learning_keywords "$all_edits")

# ファイル名を使用（日本語を含む）
safe_filename=$(basename "$filename" .md)

# ログファイルを作成
log_file=$(get_log_file_path "編集_${safe_filename}")
timestamp=$(get_timestamp)
date=$(date +"%Y-%m-%d")

# フロントマターを生成
cat > "$log_file" << EOF
---
type: cursor-session
event: afterFileEdit
date: ${date}
tags: [cursor, ai-conversation, file-edit, ${category}]
conversation_id: ${conversation_id}
generation_id: ${generation_id}
status: completed
learning_keywords: [${learning_keywords}]
---

# ✏️ ${timestamp}_編集記録_${filename}

## 🔧 編集ファイル
${wikilink}
\`${file_path}\`

## 📊 編集概要
- **編集箇所**: ${edit_summary}
- **カテゴリ**: ${category}

$(if [ "$edit_count" -lt 10 ]; then
    echo "## 📝 編集詳細"
    echo "$edits" | jq -r '.[] | "- **変更**: \(.old_string // "追加") → \(.new_string // "削除")"'
    echo ""
fi)

## 💡 学んだ概念・パターン
<!-- この編集で理解したこと -->
<!-- 例: 「useEffectの依存配列に注意」→ 新規Zettel作成候補 -->
$(if [ -n "$learning_keywords" ]; then
    echo "- 技術キーワード: ${learning_keywords}"
    echo "- TODO: この知識を独立したZettelとして抽出する"
fi)

## 🤔 意思決定・選択理由
<!-- なぜこの実装を選んだか -->
<!-- TODO: 他の選択肢と比較した理由を記録 -->

## 🐛 遭遇した問題
<!-- エラーや詰まったポイント -->
<!-- TODO: エラーメッセージや解決策を記録 -->

## 🔗 関連ノート
<!-- 関連する知識ノートへのリンク -->
$(if [ -n "$learning_keywords" ]; then
    echo "$learning_keywords" | tr ',' '\n' | sed 's/^/- [[/g' | sed 's/$/]]/g'
fi)
- ${wikilink}

## 📋 次回のアクション
<!-- この編集後にやること -->
- [ ] TODO: リファクタリングが必要か確認
- [ ] TODO: テスト追加
- [ ] TODO: ドキュメント更新

## 📁 ワークスペース
$(echo "$workspace_roots" | jq -r '.[] | "- \(.)"')

## 📝 メモ
- セッションID: ${conversation_id}
- 編集時刻: ${timestamp}
EOF

# エラーハンドリング: ファイル作成失敗
if [ $? -ne 0 ]; then
    log_error "log-file-edit.sh: Failed to create log file"
    exit 0
fi

# 出力: 処理を継続
exit 0
