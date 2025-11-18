# Airtableベース作成：超シンプルガイド

## 🎯 最も簡単な方法

### ステップ1: このリンクをクリック

👉 **[https://airtable.com/create](https://airtable.com/create)** を開く

### ステップ2: 「Start from scratch」を選択

画面に表示される「**Start from scratch**」ボタンをクリック

### ステップ3: ベース名を入力

- ベース名: **PBL AI Dashboard**
- 「**Create base**」または「**Continue**」をクリック

### ステップ4: Base IDをコピー

ベースが開いたら、ブラウザのアドレスバーを見る：
```
https://airtable.com/appXXXXXXXXXXXXXX/...
```
この **`appXXXXXXXXXXXXXX`** の部分をコピー（これがBase ID）

---

## 次のステップ

Base IDをコピーしたら、自動セットアップスクリプトを実行：

```powershell
cd C:\Users\USER\.cursor\pbl-ai-dashboard
npm run setup-airtable
```

スクリプトが以下を自動で作成します：
- ✅ Studentsテーブル
- ✅ Tasksテーブル  
- ✅ Teamsテーブル
- ✅ すべてのフィールド

---

## もっと詳しく知りたい場合

- [AIRTABLE_QUICK_SETUP.md](./AIRTABLE_QUICK_SETUP.md) - 完全な手順
- [AIRTABLE_FIND_ADD_BASE.md](./AIRTABLE_FIND_ADD_BASE.md) - 「Add a base」の見つけ方

