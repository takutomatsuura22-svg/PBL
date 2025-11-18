# API仕様書

## 概要
PBL AI DashboardのAPIエンドポイント仕様を定義します。

## エンドポイント一覧

### GET /api/students
全生徒データを取得

**レスポンス**:
```json
[
  {
    "student_id": "S001",
    "name": "山田太郎",
    "MBTI": "ENFP",
    "animal_type": "コアラ",
    "strengths": ["企画", "調整"],
    "weaknesses": ["実行"],
    "skill_企画": 4,
    "skill_実行": 2,
    "skill_調整": 3,
    "skill_探索": 2,
    "preferred_partners": ["S002"],
    "avoided_partners": [],
    "team_id": "T-A",
    "motivation_score": 3,
    "load_score": 2
  }
]
```

### GET /api/students/[id]
特定の生徒データを取得

**パラメータ**:
- `id`: 生徒ID (例: S001)

**レスポンス**:
```json
{
  "student_id": "S001",
  "name": "山田太郎",
  "MBTI": "ENFP",
  "animal_type": "コアラ",
  "strengths": ["企画", "調整"],
  "weaknesses": ["実行"],
  "skill_企画": 4,
  "skill_実行": 2,
  "skill_調整": 3,
  "skill_探索": 2,
  "preferred_partners": ["S002"],
  "avoided_partners": [],
  "team_id": "T-A",
  "motivation_score": 3,
  "load_score": 2,
  "tasks": [
    {
      "task_id": "T001",
      "title": "プロジェクト企画書の作成",
      "category": "企画",
      "status": "進行中",
      "difficulty": 3,
      "deadline": "2024-02-15T00:00:00Z"
    }
  ]
}
```

**エラー**:
- `404`: 生徒が見つからない場合
- `500`: サーバーエラー

### GET /api/students/[id]/suggestions
生徒へのAI提案を取得

**パラメータ**:
- `id`: 生徒ID

**レスポンス**:
```json
[
  {
    "type": "danger_recommendation",
    "message": "モチベーション向上のためのサポートを検討してください。",
    "priority": "high"
  }
]
```

### GET /api/teams
全チームデータを取得

**レスポンス**:
```json
[
  {
    "team_id": "T-A",
    "name": "チームA",
    "description": "プロジェクトAを担当するチーム",
    "student_ids": ["S001", "S002", "S003"],
    "project_name": "地域活性化アプリ開発",
    "students": [
      {
        "student_id": "S001",
        "name": "山田太郎",
        "motivation_score": 3,
        "load_score": 2
      }
    ]
  }
]
```

### GET /api/pm/danger-ranking
危険メンバーランキングを取得

**レスポンス**:
```json
[
  {
    "student_id": "S003",
    "name": "鈴木一郎",
    "motivation_score": 2,
    "load_score": 4,
    "danger_score": 4.2
  }
]
```
危険度スコアの高い順にソートされています。

### GET /api/pm/interventions
介入推奨一覧を取得

**レスポンス**:
```json
[
  {
    "student_id": "S003",
    "student_name": "鈴木一郎",
    "reason": "危険度スコア: 4.2/5",
    "priority": "high",
    "actions": [
      "🔴 緊急対応が必要です。PMに即座に連絡してください。",
      "💡 モチベーション向上のためのサポートを検討してください。"
    ]
  }
]
```

### GET /api/pm/task-reassignments
AIタスク再割り当て提案を取得

**レスポンス**:
```json
[
  {
    "task_id": "T003",
    "task_title": "プロトタイプ開発",
    "from_student_name": "山田太郎",
    "to_student_name": "佐藤花子",
    "reason": "負荷が山田太郎より低い、実行スキルが高い",
    "priority": "high"
  }
]
```

## 実装場所

- `frontend/app/api/students/route.ts`: 生徒一覧API
- `frontend/app/api/students/[id]/route.ts`: 個別生徒API
- `frontend/app/api/students/[id]/suggestions/route.ts`: AI提案API
- `frontend/app/api/teams/route.ts`: チーム一覧API
- `frontend/app/api/pm/danger-ranking/route.ts`: 危険度ランキングAPI
- `frontend/app/api/pm/interventions/route.ts`: 介入推奨API
- `frontend/app/api/pm/task-reassignments/route.ts`: タスク再割り当て提案API

## データソース

APIは `frontend/lib/datastore.ts` を通じて `backend/data/` のJSONファイルからデータを取得し、
`backend/ai/` のモジュールでAI計算を実行します。

## エラーハンドリング

すべてのAPIエンドポイントは以下の形式でエラーを返します:

```json
{
  "error": "string (エラーメッセージ)"
}
```

HTTPステータスコード:
- `200`: 成功
- `404`: リソースが見つからない
- `500`: サーバーエラー

## スコア体系

すべてのスコアは1-5スケールで統一されています：
- `motivation_score`: 1（低い）〜 5（高い）
- `load_score`: 1（低い）〜 5（高い）
- `skill_*`: 1（低い）〜 5（高い）
- `danger_score`: 1（安全）〜 5（危険）
