# Airtable認証エラー（HTTP 401）の解決方法

## 🔍 問題

APIキーを使用してテーブルを作成しようとすると、HTTP 401エラーが発生します。

## 🎯 解決方法

### 方法1: APIキーの権限を確認

1. **Airtableのアカウントアイコン → Developer hub**
2. **Personal access tokens** を開く
3. **既存のトークンを確認**または**新しいトークンを作成**

#### 必要なスコープ

- ✅ `data.records:read` - データ読み取り
- ✅ `data.records:write` - データ書き込み
- ✅ `schema.bases:write` - **テーブル作成に必須！** ← これがないと401エラーになります

#### アクセス可能なベース

- ✅ 作成したベース（Base ID: `appmrazv5xBSDMt3J`）を選択

### 方法2: 新しいAPIキーを作成

既存のAPIキーに問題がある場合：

1. **Personal access tokens** で「**Create new token**」をクリック
2. **トークン名**: "PBL Dashboard"
3. **スコープをすべて選択**:
   - ✅ `data.records:read`
   - ✅ `data.records:write`
   - ✅ `schema.bases:write` ← **重要！**
4. **アクセス可能なベース**: 作成したベースを選択
5. **「Create token」をクリック**
6. **トークンをコピー**（`patXXXXXXXXXXXXXX`）

### 方法3: .env.localファイルを更新

新しいAPIキーを取得したら、`.env.local`ファイルを更新：

```env
AIRTABLE_API_KEY=新しいトークン
AIRTABLE_BASE_ID=appmrazv5xBSDMt3J
```

### 方法4: 手動でテーブルを作成（推奨）

APIキーの問題を回避するため、手動でテーブルを作成する方法：

1. **Airtableでベースを開く**
2. **左下の「+ Add a table」をクリック**
3. **テーブル名を「Students」に変更**
4. **フィールドを追加**（`AIRTABLE_MANUAL_TABLE_CREATE.md`を参照）
5. **同様に「Tasks」と「Teams」テーブルを作成**

---

## 🔍 確認チェックリスト

- [ ] APIキーが正しくコピーされているか（`pat`で始まる）
- [ ] APIキーに `schema.bases:write` 権限があるか
- [ ] APIキーがこのBaseにアクセスできるか
- [ ] Base IDが正しいか（`appmrazv5xBSDMt3J`）
- [ ] `.env.local` ファイルが正しい場所にあるか（`frontend/`ディレクトリ内）

---

## 💡 推奨：手動作成

APIキーの問題が解決しない場合、**手動でテーブルを作成することを推奨**します：

1. **時間**: 約10分
2. **エラーなし**: APIキーの問題を回避
3. **確認しながら作成**: フィールドの設定を確認できる

詳細は `AIRTABLE_MANUAL_TABLE_CREATE.md` を参照してください。

---

## 🆘 それでも解決しない場合

1. **Airtableのサポートに問い合わせ**
2. **別のAirtableアカウントで試す**
3. **手動でテーブルを作成**（最も確実な方法）

