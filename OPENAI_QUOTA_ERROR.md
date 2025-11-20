# OpenAI API クォータエラー（429）の解決方法

## 🔴 エラーメッセージ

```
429 You exceeded your current quota, please check your plan and billing details.
```

## 📋 原因

このエラーは、OpenAI APIの使用量が上限に達したか、支払い情報が設定されていないことを示しています。

## ✅ 解決方法

### 1. OpenAIダッシュボードで確認

1. [OpenAI Platform](https://platform.openai.com/) にログイン
2. [Billing](https://platform.openai.com/account/billing) ページにアクセス
3. 以下を確認：
   - **クレジット残高** - 残高が不足していないか
   - **支払い方法** - クレジットカードなどの支払い方法が登録されているか
   - **使用量** - 現在の使用量と制限

### 2. 支払い方法を追加

1. [Billing](https://platform.openai.com/account/billing) ページで「Add payment method」をクリック
2. クレジットカード情報を入力
3. 必要に応じてクレジットを追加

### 3. 使用量を確認

1. [Usage](https://platform.openai.com/usage) ページで使用量を確認
2. 必要に応じて使用量の上限を調整

### 4. 無料クレジットの確認

- 新規アカウントには通常、無料クレジットが付与されます
- 無料クレジットを使い切った場合は、支払い方法を追加する必要があります

## 💡 一時的な対処法

### コスト効率の良いモデルに変更

`frontend/.env.local` でモデルを変更：

```env
OPENAI_MODEL=gpt-4o-mini
```

`gpt-4o-mini` は `gpt-4o` よりコストが低いです。

### 使用量を制限

- チャットの使用頻度を減らす
- `max_tokens` を減らす（既に設定済み）

## 🔍 確認事項

- [ ] OpenAIアカウントにログインできるか
- [ ] 支払い方法が登録されているか
- [ ] クレジット残高があるか
- [ ] 使用量制限に達していないか

## 📞 サポート

問題が解決しない場合：

1. [OpenAI Support](https://help.openai.com/) に問い合わせ
2. エラーメッセージのスクリーンショットを添付
3. APIキーとアカウント情報を提供

## ⚠️ 注意事項

- APIキーは絶対に公開しないでください
- 使用量を定期的に確認してください
- 予期しない高額請求を防ぐため、使用量の上限を設定することを推奨します

