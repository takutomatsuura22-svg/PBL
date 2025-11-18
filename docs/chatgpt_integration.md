# ChatGPT API統合ガイド

PBL AI DashboardにChatGPT APIを統合しました！

## 🎉 新機能

### 1. **学生への個別AIアドバイス生成**

学生の状況を総合的に分析し、カスタマイズされたアドバイスを自動生成します。

**APIエンドポイント:**
```
GET /api/students/{student_id}/ai-advice
```

**例:**
```bash
curl http://localhost:3000/api/students/S003/ai-advice
```

**レスポンス例:**
```json
{
  "success": true,
  "student_id": "S003",
  "student_name": "土屋天音",
  "advice": {
    "summary": "高いモチベーションで順調に進んでいます。",
    "detailed_advice": "素晴らしい状態です！企画の強みを活かして、さらに挑戦的なタスクにも取り組んでみましょう。",
    "action_items": [
      "新しいスキルを習得する機会を探す",
      "チームメンバーのメンタリングをする",
      "プロジェクトの改善提案をする"
    ],
    "encouragement": "あなたの積極的な姿勢がチームを引っ張っています。",
    "ai_generated": true
  }
}
```

---

### 2. **タスクの詳細分析とAI活用提案**

タスクを分析し、最適なAIツールの活用方法と具体的なアクションプランを提案します。

**APIエンドポイント:**
```
GET /api/tasks/{task_id}/ai-analysis
```

**例:**
```bash
curl http://localhost:3000/api/tasks/T001/ai-analysis
```

**レスポンス例:**
```json
{
  "success": true,
  "task_id": "T001",
  "task_title": "ユーザーインタビュー設計",
  "analysis": {
    "optimal_ai_tools": [
      {
        "tool": "ChatGPT",
        "usage": "ユーザーインタビューの質問設計",
        "prompt": "「ユーザーインタビュー設計」に関するインタビューの質問リストを作成してください",
        "priority": "high"
      }
    ],
    "breakdown": {
      "subtasks": [
        "インタビュー対象者の選定",
        "質問項目の作成",
        "インタビューの実施"
      ],
      "estimated_hours": 6
    },
    "tips": [
      "AIツールを活用して効率化を図りましょう",
      "定期的に進捗を共有しましょう"
    ],
    "ai_generated": true
  }
}
```

---

### 3. **チーム全体の分析レポート生成**

チームの状況を総合的に分析し、課題と改善提案を自動生成します。

**APIエンドポイント:**
```
GET /api/teams/{team_id}/ai-analysis
```

**例:**
```bash
curl http://localhost:3000/api/teams/TEAM001/ai-analysis
```

**レスポンス例:**
```json
{
  "success": true,
  "team_id": "TEAM001",
  "member_count": 5,
  "report": "# チーム分析レポート\n\n## 現状評価\n- メンバー数: 5人\n- 平均モチベーション: 3.4/5\n..."
}
```

---

## 🔧 セットアップ

### 1. 環境変数の設定

`.env.local` ファイルに以下を追加：

```env
OPENAI_API_KEY=sk-proj-your-api-key-here
```

### 2. サーバーの再起動

```bash
npm run dev
```

---

## 💡 使い方

### フロントエンドから呼び出す例

#### 学生ページでAIアドバイスを表示

```typescript
// 学生詳細ページ
const fetchAIAdvice = async (studentId: string) => {
  const response = await fetch(`/api/students/${studentId}/ai-advice`)
  const data = await response.json()
  
  if (data.success) {
    console.log('AI アドバイス:', data.advice)
    // UIに表示
  }
}
```

#### タスクページでAI分析を表示

```typescript
// タスク詳細ページ
const fetchTaskAnalysis = async (taskId: string) => {
  const response = await fetch(`/api/tasks/${taskId}/ai-analysis`)
  const data = await response.json()
  
  if (data.success) {
    console.log('タスク分析:', data.analysis)
    // 最適なAIツールを表示
  }
}
```

#### PMページでチーム分析を表示

```typescript
// PMダッシュボード
const fetchTeamAnalysis = async (teamId: string) => {
  const response = await fetch(`/api/teams/${teamId}/ai-analysis`)
  const data = await response.json()
  
  if (data.success) {
    console.log('チーム分析:', data.report)
    // レポートを表示（Markdown形式）
  }
}
```

---

## 🎯 AI機能の特徴

### 1. **インテリジェントフォールバック**

- OpenAI APIが利用できない場合、ルールベースの分析に自動切り替え
- `ai_generated: true/false` フラグで判別可能

### 2. **コスト効率**

- GPT-4o-miniモデルを使用（高品質・低コスト）
- 入力: $0.15/1M トークン
- 出力: $0.60/1M トークン

### 3. **カスタマイズ可能**

- プロンプトは `frontend/lib/ai/` 内で編集可能
- モデルや温度パラメータも調整可能

---

## 📊 使用例

### ケース1: 学生が行き詰まっている

```
GET /api/students/S001/ai-advice

→ モチベーション低下と高負荷を検出
→ 具体的なアクションプラン（1on1設定、タスク再分配など）を提案
```

### ケース2: 新しいタスクの計画

```
GET /api/tasks/T005/ai-analysis

→ タスクを分析
→ 最適なAIツール（Copilot、ChatGPTなど）を提案
→ サブタスクに分解して推定時間を算出
```

### ケース3: チームの健全性チェック

```
GET /api/teams/TEAM001/ai-analysis

→ チーム全体の状況を分析
→ 課題（モチベーション低下、負荷不均衡など）を特定
→ 具体的な改善提案を生成
```

---

## 🚀 今後の拡張案

1. **対話型AIアシスタント**
   - PMが質問すると、データに基づいて回答

2. **予測分析**
   - プロジェクトのリスク予測
   - タスク完了時期の予測

3. **自動通知**
   - 危険度が高まったら自動でSlack通知

4. **音声アシスタント**
   - 音声でAIに相談できる機能

---

## 🔒 セキュリティとプライバシー

- APIキーは環境変数で管理（Git管理外）
- 学生データはOpenAIに送信されますが、学習には使用されません
- OpenAI APIのデータ保持ポリシーに準拠

---

## 📝 トラブルシューティング

### エラー: "OPENAI_API_KEY is not configured"

→ `.env.local` にAPIキーが設定されているか確認
→ サーバーを再起動

### AIが応答しない

→ OpenAI APIの利用制限を確認
→ インターネット接続を確認
→ APIキーの有効性を確認

### コストが心配

→ GPT-4o-miniは非常に安価（1000リクエストで約$0.10程度）
→ OpenAIダッシュボードで使用量を監視可能

---

## 📚 参考リンク

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [GPT-4o-mini Pricing](https://openai.com/api/pricing/)
- [Best Practices for Prompts](https://platform.openai.com/docs/guides/prompt-engineering)

---

**🎉 ChatGPT統合完了！これで、より高度なAI支援が可能になりました！**

