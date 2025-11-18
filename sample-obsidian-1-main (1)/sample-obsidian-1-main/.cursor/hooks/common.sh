#!/bin/bash

# 共通ヘルパー関数
# 機密情報をマスキングする関数
mask_secrets() {
    local text="$1"
    # password, secret, token, api_key などの機密情報をマスキング
    echo "$text" | sed -E 's/(password|secret|token|api_key|passwd|pwd)[[:space:]]*[:=][[:space:]]*[^[:space:]]+/***MASKED***/gi' \
                   | sed -E 's/(password|secret|token|api_key|passwd|pwd)[[:space:]]*:[[:space:]]*"[^"]+"/***MASKED***/gi' \
                   | sed -E 's/(password|secret|token|api_key|passwd|pwd)[[:space:]]*=[[:space:]]*[^[:space:]]+/***MASKED***/gi' \
                   | sed -E 's/(password|secret|token|api_key|passwd|pwd)[[:space:]]*=[[:space:]]*"[^"]+"/***MASKED***/gi' \
                   | sed -E 's/(password|secret|token|api_key|passwd|pwd)[[:space:]]*=[[:space:]]*[^[:space:]]+/***MASKED***/gi'
}

# プロンプトから意図を抽出（Whyを記録）
extract_intent() {
    local prompt="$1"
    # "なぜ"、"どうして"、"理由"などのキーワードを検出
    echo "$prompt" | grep -iE "(なぜ|どうして|理由|選択|比較|選んだ|なぜ.*を)" || echo ""
}

# プロンプトから学習キーワードを抽出
extract_learning_keywords() {
    local prompt="$1"
    # 技術キーワードを抽出
    echo "$prompt" | grep -oE "\b[A-Z][a-zA-Z]+(?:Hook|Provider|Component|Context|Router|Query|Mutation|State|Effect|Ref|Memo|Callback)\b|\b(?:async|await|Promise|Callback|Middleware|Store|Reducer|Action|Selector)\b" | head -5 | tr '\n' ',' | sed 's/,$//'
}

# エラーメッセージを検出
detect_error() {
    local text="$1"
    echo "$text" | grep -iE "(error|warning|failed|exception|undefined|null)" | head -3
}

# ファイルパスからカテゴリを判定
get_category() {
    local file_path="$1"
    if [[ "$file_path" =~ 02_Permanent ]]; then
        echo "permanent-note"
    elif [[ "$file_path" =~ 08_Knowledge ]]; then
        echo "knowledge"
    elif [[ "$file_path" =~ 03_Projects ]]; then
        echo "project"
    elif [[ "$file_path" =~ 01_Inbox ]]; then
        echo "inbox"
    else
        echo "other"
    fi
}

# タイムスタンプを取得
get_timestamp() {
    date +"%Y-%m-%d-%H-%M-%S"
}

# ワークスペースのルートディレクトリを取得
get_workspace_root() {
    # 環境変数が設定されている場合はそれを使用
    if [ -n "$OBSIDIAN_VAULT" ]; then
        echo "$OBSIDIAN_VAULT"
        return
    fi
    
    # スクリプトの場所からワークスペースを逆算
    # スクリプトは .cursor/hooks/ にあるので、親の親がワークスペース
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    local workspace_root="$(dirname "$(dirname "$script_dir")")"
    
    echo "$workspace_root"
}

# ログディレクトリを取得
get_log_dir() {
    local vault_path=$(get_workspace_root)
    local date_dir=$(date +"%Y-%m-%d")
    local log_dir="${vault_path}/.logs/${date_dir}"
    
    # ディレクトリが存在しない場合は作成
    mkdir -p "$log_dir"
    
    echo "$log_dir"
}

# ログファイルパスを生成
get_log_file_path() {
    local log_title="$1"
    local log_dir=$(get_log_dir)
    local timestamp=$(get_timestamp)
    
    # ファイル名に使えない文字だけを置換（日本語は許可）
    # スラッシュ、改行、NULL文字などをアンダースコアに置換
    local safe_title=$(echo "$log_title" | sed 's|[/\n\r\t]|_|g' | sed 's/[[:cntrl:]]/_/g')
    
    # 空の場合はデフォルト値を使用
    if [ -z "$safe_title" ]; then
        safe_title="ログ"
    fi
    
    # 長さを制限（日本語は3バイトなので、ファイル名が長すぎないように）
    # 150バイト = 約50文字（日本語の場合）
    safe_title=$(echo "$safe_title" | head -c 150 | sed 's/[[:space:]]*$//')
    
    echo "${log_dir}/${timestamp}_${safe_title}.md"
}

# エラーログを記録
log_error() {
    local error_msg="$1"
    local log_dir=$(get_log_dir)
    local error_file="${log_dir}/errors.log"
    
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] ERROR: $error_msg" >> "$error_file"
}

# JSONを読み込む
read_json_input() {
    cat
}

# ファイル名からWikiLink形式に変換
to_wikilink() {
    local file_path="$1"
    # 絶対パスから相対パスに変換
    local vault_path=$(get_workspace_root)
    local relative_path="${file_path#$vault_path/}"
    
    # ファイル名のみを抽出
    local filename=$(basename "$relative_path")
    
    # 拡張子を除去
    echo "[[${filename%.md}]]"
}

