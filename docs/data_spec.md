# データ仕様書

## 概要
PBL AI Dashboardで使用するデータ構造の仕様を定義します。

## データファイル

### students.json
生徒データの構造

```json
{
  "students": [
    {
      "student_id": "string (一意のID, 例: S001)",
      "name": "string (氏名)",
      "MBTI": "string (MBTIタイプ, 例: ENFP)",
      "animal_type": "string (アニマルタイプ, 例: コアラ)",
      "strengths": ["string[] (強みの配列, 例: [\"企画\", \"調整\"])"],
      "weaknesses": ["string[] (弱みの配列, 例: [\"実行\"])"],
      "skill_企画": "number (1-5, 企画スキル)",
      "skill_実行": "number (1-5, 実行スキル)",
      "skill_調整": "number (1-5, 調整スキル)",
      "skill_探索": "number (1-5, 探索スキル)",
      "preferred_partners": ["string[] (相性の良いパートナーのID配列)"],
      "avoided_partners": ["string[] (相性の悪いパートナーのID配列)"],
      "team_id": "string (所属チームID, 例: T-A)",
      "motivation_score": "number (1-5, モチベーションスコア)",
      "load_score": "number (1-5, 稼働負荷スコア)"
    }
  ]
}
```

### tasks.json
タスクデータの構造

```json
{
  "tasks": [
    {
      "task_id": "string (一意のID, 例: T001)",
      "title": "string (タスク名)",
      "description": "string (説明)",
      "category": "string (カテゴリ: 企画|実行|調整|探索)",
      "difficulty": "number (1-5, 難易度)",
      "estimated_hours": "number (推定時間)",
      "deadline": "string (ISO 8601形式の日時)",
      "status": "string (pending|in_progress|completed)",
      "assignee_id": "string (担当者ID)",
      "required_skills": ["string[] (必要なスキルカテゴリの配列)"]
    }
  ]
}
```

### teams.json
チームデータの構造

```json
{
  "teams": [
    {
      "team_id": "string (一意のID, 例: T-A)",
      "name": "string (チーム名)",
      "description": "string (説明)",
      "student_ids": ["string[] (所属生徒IDの配列)"],
      "project_name": "string (プロジェクト名)"
    }
  ]
}
```

## スコア体系

すべてのスコアは1-5スケールで統一されています：

- **motivation_score**: 1（低い）〜 5（高い）
- **load_score**: 1（低い）〜 5（高い）
- **skill_***: 1（低い）〜 5（高い）
- **danger_score**: 1（安全）〜 5（危険）

## データフロー

1. **データ読み込み**: `backend/services/datastore.ts` からJSONファイルを読み込み
2. **AI計算**: `backend/ai/` の各モジュールで指標を計算（1-5スケール）
3. **API提供**: Next.js APIルートからフロントエンドに提供
4. **表示**: フロントエンドで可視化

## Airtable連携

`backend/services/airtable.ts` を使用してAirtableと連携可能。
環境変数に以下を設定:
- `AIRTABLE_API_KEY`: Airtable APIキー
- `AIRTABLE_BASE_ID`: Airtable Base ID
