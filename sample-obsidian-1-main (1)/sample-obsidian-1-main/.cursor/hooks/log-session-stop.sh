#!/bin/bash

# stop用のログ記録スクリプト
# セッション終了時の記録と振り返り

set -e

# 共通関数を読み込み
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

# JSON入力を読み込む
input=$(read_json_input)

# エラーハンドリング: 入力が空の場合
if [ -z "$input" ]; then
    log_error "log-session-stop.sh: Empty input"
    exit 0
fi

# jqでJSONを解析
status=$(echo "$input" | jq -r '.status // ""')
conversation_id=$(echo "$input" | jq -r '.conversation_id // ""')
generation_id=$(echo "$input" | jq -r '.generation_id // ""')
workspace_roots=$(echo "$input" | jq -r '.workspace_roots // []')

# エラーハンドリング: 必須フィールドのチェック
if [ -z "$status" ]; then
    log_error "log-session-stop.sh: Missing status field"
    exit 0
fi

# タイトルを生成
case "$status" in
    "completed")
        title="セッション終了_完了"
        ;;
    "aborted")
        title="セッション終了_中断"
        ;;
    "error")
        title="セッション終了_エラー"
        ;;
    *)
        title="セッション終了"
        ;;
esac

# ログファイルを作成
log_file=$(get_log_file_path "$title")
timestamp=$(get_timestamp)
date=$(date +"%Y-%m-%d")

# ステータスに応じた絵文字を設定
case "$status" in
    "completed")
        status_emoji="✅"
        ;;
    "aborted")
        status_emoji="⏹️"
        ;;
    "error")
        status_emoji="❌"
        ;;
    *)
        status_emoji="📌"
        ;;
esac

# フロントマターを生成
cat > "$log_file" << EOF
---
type: cursor-session
event: stop
date: ${date}
tags: [cursor, ai-conversation, session-end, reflection]
conversation_id: ${conversation_id}
generation_id: ${generation_id}
status: ${status}
---

# ${status_emoji} ${timestamp}_セッション終了記録

## 📊 セッション概要
- **ステータス**: ${status}
- **セッションID**: ${conversation_id}
- **終了時刻**: ${timestamp}

## 🎯 達成したこと
<!-- このセッションで完了したタスク -->
- [ ] TODO: 完了したタスクを記録

## 💡 学んだこと・気づき
<!-- 新しい理解、気づいたパターン、一般化できる原則 -->
<!-- 例: 「Reactのクロージャトラップ」→ 新規Zettel作成 -->
- TODO: 学びを記録
- TODO: 独立したZettelとして抽出すべき知識を特定

## 🐛 問題と解決策
<!-- 遭遇したエラーとその解決方法 -->
### 問題
<!-- TODO: 具体的なエラーメッセージ・症状 -->
### 解決策
<!-- TODO: 何をして解決したか -->
### 根本原因
<!-- TODO: なぜこの問題が起きたか -->

## 🤔 意思決定と選択理由
<!-- なぜこの実装を選んだか、他の選択肢と比較 -->
<!-- TODO: 判断基準を記録 -->

## ❌ 試して失敗したこと
<!-- うまくいかなかったアプローチ -->
- TODO: 失敗したアプローチと理由を記録

## 📖 参照したリソース
<!-- 既存ノート、外部記事、ドキュメント -->
- TODO: 参照したリソースを記録
  - [[関連ノート]]
  - [外部URL]

## 📋 次回のアクション
<!-- このセッション後にやること -->
- [ ] TODO: 残タスク
- [ ] TODO: リファクタリング
- [ ] TODO: テスト追加
- [ ] TODO: 調査事項

## 🎭 セッションの質（振り返り）
<!-- メタ認知：自分の作業パターンを理解 -->
- **集中度**: ⭐⭐⭐⭐☆
- **生産性**: TODO: 記録
- **詰まったポイント**: TODO: 記録
- **改善点**: TODO: 次回もっとうまくやるには

## 💭 洞察・疑問
<!-- 作業中のひらめき・発見、未解決の疑問 -->
- TODO: 洞察を記録
- TODO: 疑問を記録（後の研究テーマに）

## 🔗 関連ノート
<!-- このセッションで作成・編集したノート -->
<!-- TODO: 実際に作成したノートへのリンク -->

## 📁 ワークスペース
$(echo "$workspace_roots" | jq -r '.[] | "- \(.)"')

## 📝 メモ
- セッションID: ${conversation_id}
- 終了時刻: ${timestamp}
EOF

# エラーハンドリング: ファイル作成失敗
if [ $? -ne 0 ]; then
    log_error "log-session-stop.sh: Failed to create log file"
    exit 0
fi

# 出力: 処理を継続
exit 0
