$content = @"
AIRTABLE_API_KEY=YOUR_AIRTABLE_API_KEY_HERE
AIRTABLE_BASE_ID=YOUR_AIRTABLE_BASE_ID_HERE
"@

Set-Content -Path "frontend\.env.local" -Value $content -Encoding UTF8
Write-Host "✅ 環境変数を更新しました！"

