# Airtableベースを開くスクリプト

$envFile = Join-Path $PSScriptRoot "frontend\.env.local"

if (Test-Path $envFile) {
    $content = Get-Content $envFile
    $baseId = $null
    
    foreach ($line in $content) {
        if ($line -match "^AIRTABLE_BASE_ID=(.+)$") {
            $baseId = $matches[1].Trim()
            break
        }
    }
    
    if ($baseId) {
        $url = "https://airtable.com/$baseId"
        Write-Host "Airtableベースを開きます: $url"
        Start-Process $url
    } else {
        Write-Host "エラー: .env.localファイルにAIRTABLE_BASE_IDが見つかりませんでした。"
        Write-Host ""
        Write-Host "以下の手順で設定してください:"
        Write-Host "1. frontend\.env.local ファイルを開く"
        Write-Host "2. AIRTABLE_BASE_ID=your_base_id_here を追加"
        Write-Host ""
        Write-Host "または、AirtableのベースIDを直接入力してください:"
        $manualBaseId = Read-Host "Base ID"
        if ($manualBaseId) {
            $url = "https://airtable.com/$manualBaseId"
            Write-Host "Airtableベースを開きます: $url"
            Start-Process $url
        }
    }
} else {
    Write-Host "エラー: .env.localファイルが見つかりませんでした。"
    Write-Host "場所: $envFile"
    Write-Host ""
    Write-Host "以下の手順で設定してください:"
    Write-Host "1. frontend\.env.local ファイルを作成"
    Write-Host "2. 以下の内容を記述:"
    Write-Host "   AIRTABLE_API_KEY=your_api_key"
    Write-Host "   AIRTABLE_BASE_ID=your_base_id"
    Write-Host ""
    Write-Host "または、AirtableのベースIDを直接入力してください:"
    $manualBaseId = Read-Host "Base ID"
    if ($manualBaseId) {
        $url = "https://airtable.com/$manualBaseId"
        Write-Host "Airtableベースを開きます: $url"
        Start-Process $url
    }
}

