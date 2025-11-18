# AIロジック仕様書

## 概要
PBL AI Dashboardで使用するAI計算ロジックの仕様を定義します。
すべてのスコアは1-5スケールで統一されています。

## モジュール一覧

### 1. motivation.ts - モチベーション推定

**機能**: 生徒のプロフィール・タスク・相性からモチベーションを1〜5で返す

**主要関数**:
- `calculateMotivation(profile, tasks, compatibility): number (1-5)`
  - 重み付け平均でモチベーションを計算
  - 重み: タスク完了率(40%), 強みマッチ度(25%), チーム相性(20%), MBTI特性(15%)

- `estimateMotivationFromProgress(completed, inProgress, pending): number (1-5)`
  - タスクの進捗状況からモチベーションを推定

**MBTI特性による補正**:
- EN系（外向的・直感的）: ベーススコア 4.0
- ES系（外向的・感覚的）: ベーススコア 3.5
- IN系（内向的・直感的）: ベーススコア 3.0
- IS系（内向的・感覚的）: ベーススコア 2.5

### 2. load.ts - 稼働負荷計算

**機能**: タスクの重み×数×締切で負荷スコアを1-5で計算

**主要関数**:
- `calculateLoad(params): number (1-5)`
  - アクティブなタスクから負荷を計算
  - 基本負荷 = 難易度 × 時間重み
  - 緊急度マルチプライヤ: 期限超過(2.0), 1日以内(1.8), 3日以内(1.5), 1週間以内(1.2)
  - タスク数マルチプライヤ: 3タスクを基準に最大1.5倍

- `getLoadLevel(load): 'low' | 'medium' | 'high' | 'critical'`
  - 負荷レベルを判定（<2: low, <3: medium, <4: high, >=4: critical）

- `calculateLoadByCategory(tasks): Record<string, number>`
  - カテゴリ別の負荷を計算

### 3. skill.ts - スキル適性推定

**機能**: MBTIと活動実績からスキルを1-5で推定

**主要関数**:
- `estimateSkill(profile, taskPerformances): Record<string, number>`
  - MBTI特性による補正と活動実績から各カテゴリのスキルを推定
  - 完了タスクの難易度からスキルを逆算

**MBTI特性によるスキル補正**:
- EN系: 企画+0.3, 探索+0.3, 実行-0.2, 調整+0.1
- ES系: 実行+0.3, 調整+0.3, 企画-0.1, 探索-0.1
- IN系: 企画+0.2, 探索+0.2, 調整-0.3, 実行+0.1
- IS系: 実行+0.2, 企画-0.2, 探索-0.2, 調整+0.1
- J型: 実行+0.1, 調整+0.1
- P型: 探索+0.1, 企画+0.1

- `estimateSkillForCategory(category, profile, taskPerformances): number (1-5)`
  - 特定カテゴリのスキルを推定

### 4. task_reassign.ts - タスク移動AI

**機能**: 「負荷高」「モチベ低」なら誰に移すべきかを返す

**主要関数**:
- `suggestTaskReassignments(students, tasks): ReassignmentSuggestion[]`
  - タスク再割り当ての提案を生成
  - 再割り当て条件: 負荷>=4 OR モチベ<=2 OR スキル不足
  - スコアリング: 負荷差(30点), スキル適性(30点), モチベーション(20点), 相性(10点), 負荷バランス(10点)

**判定ロジック**:
- 同じチーム内のメンバーを候補として検討
- スコア50以上の場合のみ提案
- 優先度: 負荷>=4.5 OR モチベ<=1.5 → high, 負荷>=4 OR モチベ<=2 → medium, その他 → low

### 5. danger_score.ts - 危険度スコア計算

**機能**: 総合危険度スコアを1-5で算出

**主要関数**:
- `calculateDangerScore(factors): number (1-5)`
  - 複数のリスク要因から危険度を計算
  - 重み: モチベーション(30%), 負荷(25%), 期限超過(20%), スキルギャップ(10%), 活動度(10%), コミュニケーション(5%)

- `getDangerLevel(score): 'safe' | 'caution' | 'warning' | 'critical'`
  - 危険度レベルを判定（<2: safe, <3: caution, <4: warning, >=4: critical）

- `getDangerRecommendations(score, factors): string[]`
  - 危険度に基づいた推奨アクションを生成

- `getDangerScoreBreakdown(factors): object`
  - 危険度スコアの詳細内訳を取得

## 計算フロー

1. **データ取得**: 生徒データ、タスクデータを取得
2. **指標計算**: 各AIモジュールで指標を計算（1-5スケール）
3. **統合**: 計算結果を統合してダッシュボードに表示
4. **提案生成**: 必要に応じてタスク再割り当てや推奨アクションを生成

## パラメータ調整

各モジュールの重みや閾値は、実際の運用データに基づいて調整可能です。
設定値は各モジュールファイル内で定義されています。

## MBTI特性の活用

MBTIタイプを活用して：
- モチベーションのベーススコアを設定
- スキルカテゴリへの適性を補正
- チーム編成の参考情報として利用
