# Airtableにスキル項目フィールドを手動で追加する手順

## 📋 追加するフィールド一覧

以下の8つのフィールドを`Students`テーブルに追加してください：

1. `skill_デザイン` (Number型、小数点以下1桁)
2. `skill_開発` (Number型、小数点以下1桁)
3. `skill_分析` (Number型、小数点以下1桁)
4. `skill_ドキュメント作成` (Number型、小数点以下1桁)
5. `skill_コミュニケーション` (Number型、小数点以下1桁)
6. `skill_リーダーシップ` (Number型、小数点以下1桁)
7. `skill_プレゼンテーション` (Number型、小数点以下1桁)
8. `skill_問題解決` (Number型、小数点以下1桁)

## 🔧 手順

1. Airtableを開き、`Students`テーブルを選択
2. 右上の「+ Add field」ボタンをクリック
3. フィールド名を入力（例: `skill_デザイン`）
4. フィールドタイプを「Number」に選択
5. 「Precision」を「1 decimal place」に設定
6. 「Save」をクリック
7. 残りの7つのフィールドも同様に追加

## ⚡ クイック追加（推奨）

1. `Students`テーブルを開く
2. 右上の「+ Add field」をクリック
3. 「Add multiple fields」を選択
4. 以下のフィールド名を一度に追加：
   - skill_デザイン
   - skill_開発
   - skill_分析
   - skill_ドキュメント作成
   - skill_コミュニケーション
   - skill_リーダーシップ
   - skill_プレゼンテーション
   - skill_問題解決
5. すべてのフィールドタイプを「Number」に設定
6. 「Precision」を「1 decimal place」に設定
7. 「Save」をクリック

## ✅ 確認

フィールドが正しく追加されたか確認するには、以下のコマンドを実行：

```bash
npm run migrate-skills
```

このコマンドは、既存の`strengths`/`weaknesses`データからスキル値を推定して移行します。

