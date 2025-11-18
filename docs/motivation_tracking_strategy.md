# モチベーション追跡戦略

## 現状の課題

現在のシステムは以下の問題を抱えています：

1. **静的な情報への依存**: MBTIや動物診断などの静的なプロフィール情報に依存
2. **動的な変化の検知不足**: モチベーションは日々変動するが、その変化を捉える仕組みが不十分
3. **推測ベースの評価**: 現状は「想像や仮説」でモチベーションを推定している
4. **データソースの限界**: タスク完了率などの限られた指標のみで判断

## 改善戦略

### 1. 多角的なデータ収集

モチベーションを正確に把握するため、以下のデータソースを活用します：

#### A. 自己申告データ（最重要）
- **日次チェックイン**: 学生が毎日モチベーションを1-5で自己申告
- **週次振り返り**: 週1回、より詳細な振り返りとコメント
- **イベント記録**: 重要な出来事（成功体験、挫折、チーム内の変化など）を記録

#### B. 行動データ（客観的指標）
- **タスク活動**: 
  - タスク更新頻度
  - タスク完了までの平均時間
  - 期限遵守率
  - タスクの難易度と完了率の関係
- **コミュニケーション活動**:
  - Slack/チャットでの発言頻度
  - 会議への参加率
  - 質問・相談の頻度
  - チームメンバーとの協働頻度
- **コード/成果物活動**:
  - GitHub等でのコミット頻度
  - ドキュメント更新頻度
  - レビューへの参加頻度

#### C. 関係性データ
- **チームメンバーからのフィードバック**: 匿名または非匿名での相互評価
- **リーダー/メンターからの観察**: 定期的な1on1での観察記録
- **自己評価との乖離**: 自己申告と行動データの比較

#### D. 時系列データ
- **過去のデータとの比較**: 
  - 過去1週間の平均との比較
  - 過去1ヶ月のトレンド
  - 季節性・周期性の検出
- **変化の検知**:
  - 急激な変化（±1.0以上）の検知
  - 継続的な低下傾向の検知
  - 回復の兆しの検知

### 2. データ収集の実装方法

#### Phase 1: チェックイン機能（即座に実装可能）

```typescript
interface DailyCheckIn {
  student_id: string
  date: string // YYYY-MM-DD
  motivation_score: number // 1-5 (自己申告)
  energy_level: number // 1-5 (エネルギーレベル)
  stress_level: number // 1-5 (ストレスレベル)
  comments?: string // 自由記述
  factors: {
    task_progress: 'positive' | 'neutral' | 'negative'
    team_communication: 'positive' | 'neutral' | 'negative'
    personal_issues: 'none' | 'minor' | 'major'
    achievements: string[] // 今日の達成事項
    challenges: string[] // 今日の課題
  }
}
```

**実装方針**:
- 毎朝または毎晩、学生に通知を送信
- 1分程度で完了できる簡単なフォーム
- 未回答の場合は前日の値を維持（ただし信頼度を下げる）
- 回答率を追跡し、低い場合はリマインダーを送信

#### Phase 2: 活動ログの自動収集

```typescript
interface ActivityLog {
  student_id: string
  timestamp: Date
  activity_type: 'task_update' | 'commit' | 'message' | 'meeting' | 'document_update'
  activity_data: {
    task_id?: string
    repository?: string
    channel?: string
    duration?: number // 分
    // ... その他の活動固有のデータ
  }
  inferred_motivation_signal: 'positive' | 'neutral' | 'negative'
}
```

**実装方針**:
- GitHub API、Slack API、タスク管理システムAPIと連携
- 活動の頻度、タイミング、質を分析
- 異常検知: 通常の活動パターンからの逸脱を検出

#### Phase 3: フィードバック機能

```typescript
interface PeerFeedback {
  from_student_id: string
  to_student_id: string
  date: string
  observation: {
    engagement_level: number // 1-5
    collaboration_quality: number // 1-5
    communication_quality: number // 1-5
    overall_impression: 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative'
  }
  comments?: string
}
```

**実装方針**:
- 週次または2週間に1回、チームメンバー間で相互評価
- 匿名オプションを提供
- 集計して個人のモチベーション推定に活用

### 3. モチベーション推定の改善

#### 現在の計算式（改善前）

```typescript
// 重み付き平均
motivation = 
  task_completion_rate * 0.4 +
  strength_match * 0.25 +
  team_compatibility * 0.2 +
  MBTI_base * 0.15
```

#### 改善後の計算式

```typescript
// 多角的なデータソースを統合
motivation = 
  // 自己申告（最も重要、ただし信頼度を考慮）
  (self_reported_score * self_report_confidence) * 0.35 +
  
  // 行動データ（客観的指標）
  (activity_based_score * activity_confidence) * 0.25 +
  
  // タスク完了率（既存）
  (task_completion_rate) * 0.20 +
  
  // チーム関係性（既存 + フィードバック）
  (team_compatibility + peer_feedback_score) * 0.15 +
  
  // 時系列トレンド（変化の方向性）
  (trend_adjustment) * 0.05

// 信頼度の計算
confidence = 
  (check_in_completion_rate * 0.4) +
  (activity_data_availability * 0.3) +
  (peer_feedback_count * 0.2) +
  (data_freshness * 0.1) // データの新しさ
```

#### 変化検知アルゴリズム

```typescript
interface MotivationChange {
  student_id: string
  change_type: 'sudden_drop' | 'gradual_decline' | 'sudden_rise' | 'gradual_improvement' | 'stable'
  magnitude: number // 変化の大きさ
  duration: number // 変化が続いている日数
  confidence: number // 検知の信頼度
  potential_causes: string[] // 考えられる原因
  recommended_actions: string[] // 推奨アクション
}

function detectMotivationChange(
  recentScores: number[], // 過去7-14日間のスコア
  historicalAverage: number
): MotivationChange {
  // 1. 急激な変化の検知（±1.0以上）
  // 2. 継続的な傾向の検知（線形回帰）
  // 3. パターンの変化（通常の活動パターンからの逸脱）
  // 4. 外部要因との相関（タスク負荷、チーム編成など）
}
```

### 4. 実装の優先順位

#### 短期（1-2週間）
1. ✅ **日次チェックイン機能**: 学生が毎日モチベーションを自己申告
2. ✅ **チェックインデータの保存と可視化**: 時系列グラフで表示
3. ✅ **変化検知アラート**: 急激な変化を検知して通知

#### 中期（1-2ヶ月）
4. **活動ログの自動収集**: GitHub、Slack等との連携
5. **行動データベースのモチベーション推定**: 活動パターンから推定
6. **信頼度スコアの計算**: データの質と量に基づく信頼度

#### 長期（3-6ヶ月）
7. **フィードバック機能**: チームメンバー間の相互評価
8. **機械学習モデル**: 過去のデータから学習した予測モデル
9. **予測機能**: 将来のモチベーション低下を予測

### 5. UI/UXの改善

#### チェックインページ
- シンプルで直感的なインターフェース
- 1分以内で完了できる
- モバイル対応
- リマインダー通知

#### ダッシュボードの改善
- モチベーションの時系列グラフ
- 変化の検知とアラート表示
- データソースごとの信頼度表示
- トレンド分析と予測

#### 学生詳細ページの改善
- モチベーションの推移グラフ
- 最近のチェックイン履歴
- 活動ログの可視化
- 変化の原因分析

### 6. データプライバシーと倫理

- **透明性**: どのデータがどのように使われるかを明示
- **同意**: データ収集への同意を取得
- **匿名化**: 個人を特定できない形での分析
- **データの削除権**: 学生が自分のデータを削除できる権利
- **目的の明確化**: データは学生のサポートのためにのみ使用

### 7. 成功指標（KPI）

- **チェックイン回答率**: 目標80%以上
- **データの信頼度**: 平均0.7以上
- **変化検知の精度**: 実際の変化を80%以上検知
- **学生の満足度**: システムが有用だと感じる学生の割合
- **早期介入の効果**: モチベーション低下の早期検知による離脱率の低下

## 次のステップ

1. **チェックイン機能のプロトタイプ作成**
2. **データモデルの設計**
3. **APIエンドポイントの実装**
4. **UIコンポーネントの作成**
5. **テストとフィードバック収集**

