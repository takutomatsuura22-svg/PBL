# Airtableサンプルデータ

このファイルには、Airtableの各テーブルに入力するサンプルデータが含まれています。
コピー&ペーストして使用してください。

---

## Studentsテーブルのサンプルデータ

### レコード1
- **student_id**: `S001`
- **name**: `山田太郎`
- **MBTI**: `ENFP`
- **animal_type**: `ライオン`
- **strengths**: `企画`, `実行`
- **weaknesses**: `調整`
- **skill_企画**: `4`
- **skill_実行**: `5`
- **skill_調整**: `3`
- **skill_探索**: `4`
- **preferred_partners**: `S002`, `S003`
- **avoided_partners**: `S005`
- **team_id**: `T001`
- **motivation_score**: `4.2`
- **load_score**: `3.5`

### レコード2
- **student_id**: `S002`
- **name**: `佐藤花子`
- **MBTI**: `ISFJ`
- **animal_type**: `コアラ`
- **strengths**: `調整`, `探索`
- **weaknesses**: `企画`
- **skill_企画**: `3`
- **skill_実行**: `3`
- **skill_調整**: `5`
- **skill_探索**: `4`
- **preferred_partners**: `S001`, `S004`
- **avoided_partners**: (空)
- **team_id**: `T001`
- **motivation_score**: `3.8`
- **load_score**: `2.8`

### レコード3
- **student_id**: `S003`
- **name**: `鈴木一郎`
- **MBTI**: `INTJ`
- **animal_type**: `オオカミ`
- **strengths**: `探索`, `企画`
- **weaknesses**: `実行`
- **skill_企画**: `4`
- **skill_実行**: `2`
- **skill_調整**: `3`
- **skill_探索**: `5`
- **preferred_partners**: `S001`
- **avoided_partners**: (空)
- **team_id**: `T001`
- **motivation_score**: `4.0`
- **load_score**: `3.0`

### レコード4
- **student_id**: `S004`
- **name**: `田中さくら`
- **MBTI**: `ESFP`
- **animal_type**: `イルカ`
- **strengths**: `実行`, `調整`
- **weaknesses**: `探索`
- **skill_企画**: `3`
- **skill_実行**: `5`
- **skill_調整**: `4`
- **skill_探索**: `2`
- **preferred_partners**: `S002`, `S005`
- **avoided_partners**: (空)
- **team_id**: `T002`
- **motivation_score**: `4.5`
- **load_score**: `2.5`

### レコード5
- **student_id**: `S005`
- **name**: `高橋健太`
- **MBTI**: `ISTP`
- **animal_type**: `カメ`
- **strengths**: `実行`, `探索`
- **weaknesses**: `企画`, `調整`
- **skill_企画**: `2`
- **skill_実行**: `4`
- **skill_調整**: `2`
- **skill_探索**: `4`
- **preferred_partners**: `S004`
- **avoided_partners**: `S001`
- **team_id**: `T002`
- **motivation_score**: `3.5`
- **load_score**: `3.2`

---

## Tasksテーブルのサンプルデータ

### レコード1
- **task_id**: `T001`
- **title**: `プロジェクト企画書作成`
- **description**: `新規プロジェクトの企画書を作成する`
- **category**: `企画`
- **difficulty**: `4`
- **estimated_hours**: `8`
- **deadline**: `2024-12-31`
- **start_date**: `2024-12-01`
- **end_date**: `2024-12-31`
- **status**: `in_progress`
- **assignee_id**: `S001`
- **required_skills**: `企画`, `実行`

### レコード2
- **task_id**: `T002`
- **title**: `市場調査とデータ分析`
- **description**: `競合他社の調査と市場データの分析を行う`
- **category**: `探索`
- **difficulty**: `3`
- **estimated_hours**: `6`
- **deadline**: `2024-12-25`
- **start_date**: `2024-12-10`
- **end_date**: `2024-12-25`
- **status**: `pending`
- **assignee_id**: `S002`
- **required_skills**: `探索`

### レコード3
- **task_id**: `T003`
- **title**: `UIデザイン作成`
- **description**: `ダッシュボードのUIデザインを作成する`
- **category**: `企画`
- **difficulty**: `3`
- **estimated_hours**: `10`
- **deadline**: `2024-12-20`
- **start_date**: `2024-12-05`
- **end_date**: `2024-12-20`
- **status**: `in_progress`
- **assignee_id**: `S003`
- **required_skills**: `企画`, `実行`

### レコード4
- **task_id**: `T004`
- **title**: `バックエンドAPI開発`
- **description**: `RESTful APIの実装を行う`
- **category**: `実行`
- **difficulty**: `5`
- **estimated_hours**: `20`
- **deadline**: `2025-01-15`
- **start_date**: `2024-12-15`
- **end_date**: `2025-01-15`
- **status**: `pending`
- **assignee_id**: `S004`
- **required_skills**: `実行`, `探索`

### レコード5
- **task_id**: `T005`
- **title**: `チームミーティング調整`
- **description**: `週次ミーティングの日程調整と議事録作成`
- **category**: `調整`
- **difficulty**: `2`
- **estimated_hours**: `3`
- **deadline**: `2024-12-15`
- **start_date**: `2024-12-10`
- **end_date**: `2024-12-15`
- **status**: `completed`
- **assignee_id**: `S002`
- **required_skills**: `調整`

---

## Teamsテーブルのサンプルデータ

### レコード1
- **team_id**: `T001`
- **name**: `チームA`
- **description**: `メイン開発チーム`
- **student_ids**: `S001`, `S002`, `S003`
- **project_name**: `PBL管理システム`

### レコード2
- **team_id**: `T002`
- **name**: `チームB`
- **description**: `サブ開発チーム`
- **student_ids**: `S004`, `S005`
- **project_name**: `PBL管理システム`

---

## データ入力のコツ

1. **複数選択フィールド（Multiple select）**:
   - フィールドをクリックして、オプションを選択
   - 複数のオプションを選択可能

2. **日付フィールド（Date）**:
   - カレンダーから選択するか、直接入力（YYYY-MM-DD形式）

3. **数値フィールド（Number）**:
   - 直接数値を入力

4. **テキストフィールド（Single line text / Long text）**:
   - 直接テキストを入力

---

## 注意事項

- **student_id**, **task_id**, **team_id** は一意である必要があります
- **assignee_id** は Studentsテーブルの **student_id** と一致させる必要があります
- **team_id** は Teamsテーブルの **team_id** と一致させる必要があります
- **preferred_partners** と **avoided_partners** は Studentsテーブルの **student_id** のリストです
- **student_ids** (Teamsテーブル) は Studentsテーブルの **student_id** のリストです

