# Airtableベースを開く方法

## 方法1: Airtableウェブサイトから開く

1. **Airtableにアクセス**
   - ブラウザで [https://airtable.com/](https://airtable.com/) を開く
   - アカウントにログイン

2. **ベースを選択**
   - ダッシュボードから作成したベースをクリック
   - ベース名は任意（例: "PBL Dashboard"）

## 方法2: Base IDから直接開く

Base IDが分かっている場合、以下のURL形式で直接開けます：

```
https://airtable.com/app{YOUR_BASE_ID}
```

例: Base IDが `appXXXXXXXXXXXXXX` の場合
```
https://airtable.com/appXXXXXXXXXXXXXX
```

## Base IDの確認方法

### 方法A: 環境変数ファイルから確認

`pbl-ai-dashboard/frontend/.env.local` ファイルを開いて、`AIRTABLE_BASE_ID` の値を確認してください。

```env
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
```

### 方法B: Airtable API Documentationから確認

1. [Airtable API Documentation](https://airtable.com/api) にアクセス
2. 作成したBaseを選択
3. ページ上部に表示されるBase IDをコピー（例: `appXXXXXXXXXXXXXX`）

### 方法C: AirtableのURLから確認

Airtableのベースを開いている状態で、ブラウザのアドレスバーを見ると：
```
https://airtable.com/appXXXXXXXXXXXXXX/...
```
この `appXXXXXXXXXXXXXX` の部分がBase IDです。

## クイックアクセスリンク

Base IDが設定されている場合、以下のコマンドで直接開くことができます：

### Windows (PowerShell)
```powershell
# Base IDを環境変数から取得して開く
$baseId = (Get-Content .env.local | Select-String "AIRTABLE_BASE_ID").ToString().Split("=")[1].Trim()
Start-Process "https://airtable.com/app$baseId"
```

### ブラウザで直接開く
環境変数ファイルのBase IDをコピーして、以下のURLに貼り付けてください：
```
https://airtable.com/app[ここにBase IDを貼り付け]
```

## トラブルシューティング

### Base IDが見つからない場合

1. `.env.local` ファイルが存在しない → まだAirtable連携を設定していません
2. Base IDが設定されていない → `AIRTABLE_SETUP_QUICKSTART.md` を参照して設定してください

### Airtableにアクセスできない場合

1. インターネット接続を確認
2. Airtableのアカウントにログインしているか確認
3. ベースが削除されていないか確認

