'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'

export default function SkillRubricPage() {
  return (
    <div className="p-8">
      <Navigation />
      <h1 className="text-3xl font-bold mb-6">スキル評価ルーブリック</h1>
      
      <div className="bg-white border rounded-lg p-6 shadow-sm mb-6">
        <p className="text-gray-600 mb-4">
          PBL AI ダッシュボードでは、12のスキル項目を1-5スケールで評価します。
          各スキルの評価基準を以下に示します。
        </p>
      </div>

      {/* 基本スキル */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">基本スキル</h2>
        
        <SkillRubricSection 
          title="企画（Planning）"
          definition="プロジェクトの方向性を定め、計画を立案する能力"
          rubric={[
            { score: 1, level: "非常に低い", definition: "計画を立てることができない、または計画が現実的でない", details: ["計画を立てることができない", "計画が現実的でない（期限やリソースを考慮していない）", "計画の目的が不明確", "計画を実行に移すことができない"] },
            { score: 2, level: "低い", definition: "基本的な計画は立てられるが、不十分な点が多い", details: ["簡単な計画は立てられる", "期限やリソースを部分的に考慮", "計画に不備がある（抜け漏れが多い）", "計画の修正が困難"] },
            { score: 3, level: "標準", definition: "適切な計画を立てることができる", details: ["期限やリソースを考慮した計画を立てられる", "計画の目的が明確", "基本的なリスクを考慮", "計画を実行に移すことができる"] },
            { score: 4, level: "高い", definition: "詳細で実現可能な計画を立てることができる", details: ["詳細な計画を立てられる（タスク分解、依存関係の考慮）", "リスクを事前に想定し、対策を検討", "複数の選択肢を検討できる", "計画を柔軟に修正できる"] },
            { score: 5, level: "非常に高い", definition: "戦略的で最適な計画を立案できる", details: ["長期的な視点で戦略的な計画を立てられる", "複数のステークホルダーを考慮した計画", "イノベーティブなアプローチを提案できる", "計画の効果を事前に予測できる"] }
          ]}
        />

        <SkillRubricSection 
          title="実行（Execution）"
          definition="計画に基づいて実際に作業を進め、成果物を完成させる能力"
          rubric={[
            { score: 1, level: "非常に低い", definition: "作業を進めることができない、または成果物が完成しない", details: ["作業を開始できない", "作業が途中で止まってしまう", "成果物が完成しない", "期限を守れない"] },
            { score: 2, level: "低い", definition: "基本的な作業はできるが、効率が悪い", details: ["簡単な作業は完了できる", "作業に時間がかかりすぎる", "成果物の品質が低い", "期限を守れないことが多い"] },
            { score: 3, level: "標準", definition: "計画に基づいて作業を進め、成果物を完成させることができる", details: ["計画に基づいて作業を進められる", "期限を守れることが多い", "基本的な品質の成果物を作成できる", "問題が発生したときに助けを求められる"] },
            { score: 4, level: "高い", definition: "効率的に作業を進め、高品質な成果物を完成させることができる", details: ["効率的に作業を進められる", "期限を守れる", "高品質な成果物を作成できる", "問題を自分で解決できることが多い"] },
            { score: 5, level: "非常に高い", definition: "最適な方法で作業を進め、卓越した成果物を完成させることができる", details: ["最適な方法を選択して作業を進められる", "常に期限を守れる", "卓越した品質の成果物を作成できる", "問題を創造的に解決できる"] }
          ]}
        />

        <SkillRubricSection 
          title="調整（Coordination）"
          definition="チームメンバー間の調整を行い、チーム全体の活動を円滑に進める能力"
          rubric={[
            { score: 1, level: "非常に低い", definition: "調整を行うことができない、または調整が機能しない", details: ["調整を行うことができない", "調整が機能しない（メンバーが従わない）", "チーム内の対立を解決できない", "情報共有ができない"] },
            { score: 2, level: "低い", definition: "基本的な調整はできるが、不十分な点が多い", details: ["簡単な調整はできる", "一部のメンバーとの調整が困難", "対立が発生することがある", "情報共有が不十分"] },
            { score: 3, level: "標準", definition: "適切な調整を行い、チーム活動を円滑に進めることができる", details: ["メンバー間の調整を行える", "基本的な対立を解決できる", "情報を共有できる", "チーム活動を円滑に進められる"] },
            { score: 4, level: "高い", definition: "効果的な調整を行い、チームの生産性を高めることができる", details: ["効果的な調整を行える", "対立を迅速に解決できる", "積極的に情報を共有する", "チームの生産性を高められる"] },
            { score: 5, level: "非常に高い", definition: "戦略的な調整を行い、チームの最適化を実現できる", details: ["戦略的な調整を行える", "対立を予防できる", "情報共有の仕組みを構築できる", "チームの最適化を実現できる"] }
          ]}
        />

        <SkillRubricSection 
          title="探索（Exploration）"
          definition="新しい情報やアイデアを探索し、イノベーションを生み出す能力"
          rubric={[
            { score: 1, level: "非常に低い", definition: "探索を行うことができない、または探索が無効", details: ["探索を行うことができない", "探索の方法が分からない", "新しい情報を見つけられない", "アイデアを生み出せない"] },
            { score: 2, level: "低い", definition: "基本的な探索はできるが、効果が低い", details: ["簡単な探索はできる", "探索の範囲が限定的", "新しい情報を見つけにくい", "アイデアが少ない"] },
            { score: 3, level: "標準", definition: "適切な探索を行い、有用な情報やアイデアを見つけることができる", details: ["探索の方法を理解している", "有用な情報を見つけられる", "基本的なアイデアを生み出せる", "探索結果を活用できる"] },
            { score: 4, level: "高い", definition: "効果的な探索を行い、価値のある情報やアイデアを見つけることができる", details: ["効果的な探索方法を選択できる", "価値のある情報を見つけられる", "創造的なアイデアを生み出せる", "探索結果を戦略的に活用できる"] },
            { score: 5, level: "非常に高い", definition: "戦略的な探索を行い、イノベーションを生み出すことができる", details: ["戦略的な探索を行える", "隠れた情報や機会を見つけられる", "イノベーティブなアイデアを生み出せる", "探索結果から新しい価値を創造できる"] }
          ]}
        />
      </div>

      {/* 専門スキル */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-green-700">専門スキル</h2>
        
        <SkillRubricSection 
          title="デザイン（Design）"
          definition="ユーザー体験や視覚的な表現を設計する能力"
          rubric={[
            { score: 1, level: "非常に低い", definition: "デザインを行うことができない、またはデザインが機能しない", details: ["デザインの基本が分からない", "デザインが機能しない", "ユーザーの視点を考慮していない", "視覚的な魅力がない"] },
            { score: 2, level: "低い", definition: "基本的なデザインはできるが、品質が低い", details: ["簡単なデザインはできる", "デザインの品質が低い", "ユーザーの視点を部分的に考慮", "視覚的な魅力が少ない"] },
            { score: 3, level: "標準", definition: "適切なデザインを作成することができる", details: ["デザインの基本を理解している", "ユーザーの視点を考慮できる", "基本的な視覚的な魅力がある", "デザインツールを基本的に使用できる"] },
            { score: 4, level: "高い", definition: "高品質なデザインを作成することができる", details: ["デザインの原則を理解している", "ユーザー体験を考慮したデザインができる", "視覚的に魅力的なデザインができる", "デザインツールを効果的に使用できる"] },
            { score: 5, level: "非常に高い", definition: "卓越したデザインを作成し、ユーザー体験を革新できる", details: ["デザインの原則を創造的に応用できる", "ユーザー体験を革新できる", "視覚的に卓越したデザインができる", "デザインツールを高度に使用できる"] }
          ]}
        />

        <SkillRubricSection 
          title="開発（Development）"
          definition="ソフトウェアやシステムを開発する能力"
          rubric={[
            { score: 1, level: "非常に低い", definition: "開発を行うことができない、またはコードが動作しない", details: ["プログラミングの基本が分からない", "コードが動作しない", "エラーを解決できない", "開発環境を構築できない"] },
            { score: 2, level: "低い", definition: "基本的な開発はできるが、品質が低い", details: ["簡単なコードは書ける", "コードの品質が低い（バグが多い）", "エラーを解決するのに時間がかかる", "開発環境を基本的に使用できる"] },
            { score: 3, level: "標準", definition: "適切な開発を行うことができる", details: ["基本的なプログラミングができる", "コードの品質が標準的", "エラーを解決できる", "開発環境を適切に使用できる"] },
            { score: 4, level: "高い", definition: "高品質な開発を行うことができる", details: ["高度なプログラミングができる", "コードの品質が高い（保守性、可読性）", "エラーを迅速に解決できる", "開発環境を効果的に使用できる"] },
            { score: 5, level: "非常に高い", definition: "卓越した開発を行い、最適なソリューションを実現できる", details: ["複雑なシステムを開発できる", "コードの品質が卓越している", "エラーを創造的に解決できる", "開発環境を高度に使用できる"] }
          ]}
        />

        <SkillRubricSection 
          title="分析（Analysis）"
          definition="データや情報を分析し、洞察を得る能力"
          rubric={[
            { score: 1, level: "非常に低い", definition: "分析を行うことができない、または分析が無効", details: ["分析の方法が分からない", "データを理解できない", "分析結果が無意味", "洞察を得られない"] },
            { score: 2, level: "低い", definition: "基本的な分析はできるが、洞察が浅い", details: ["簡単な分析はできる", "データを部分的に理解できる", "分析結果が表面的", "洞察が少ない"] },
            { score: 3, level: "標準", definition: "適切な分析を行い、有用な洞察を得ることができる", details: ["基本的な分析方法を理解している", "データを理解できる", "分析結果から有用な洞察を得られる", "分析結果を活用できる"] },
            { score: 4, level: "高い", definition: "効果的な分析を行い、価値のある洞察を得ることができる", details: ["効果的な分析方法を選択できる", "データから価値のある洞察を得られる", "分析結果を戦略的に活用できる", "分析ツールを効果的に使用できる"] },
            { score: 5, level: "非常に高い", definition: "戦略的な分析を行い、革新的な洞察を得ることができる", details: ["戦略的な分析を行える", "データから革新的な洞察を得られる", "分析結果から新しい価値を創造できる", "分析ツールを高度に使用できる"] }
          ]}
        />

        <SkillRubricSection 
          title="ドキュメント作成（Documentation）"
          definition="わかりやすいドキュメントを作成する能力"
          rubric={[
            { score: 1, level: "非常に低い", definition: "ドキュメントを作成することができない、または理解できない", details: ["ドキュメントの書き方が分からない", "ドキュメントが理解できない", "重要な情報が抜けている", "構成が不明確"] },
            { score: 2, level: "低い", definition: "基本的なドキュメントは作成できるが、品質が低い", details: ["簡単なドキュメントは作成できる", "ドキュメントの品質が低い", "情報が不十分", "構成が分かりにくい"] },
            { score: 3, level: "標準", definition: "適切なドキュメントを作成することができる", details: ["基本的なドキュメントを作成できる", "ドキュメントの品質が標準的", "必要な情報が含まれている", "構成が分かりやすい"] },
            { score: 4, level: "高い", definition: "高品質なドキュメントを作成することができる", details: ["詳細なドキュメントを作成できる", "ドキュメントの品質が高い", "情報が充実している", "構成が明確で理解しやすい"] },
            { score: 5, level: "非常に高い", definition: "卓越したドキュメントを作成し、知識を効果的に伝達できる", details: ["卓越したドキュメントを作成できる", "ドキュメントの品質が卓越している", "情報が体系的で完全", "構成が最適で理解しやすい"] }
          ]}
        />
      </div>

      {/* ソフトスキル */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-purple-700">ソフトスキル</h2>
        
        <SkillRubricSection 
          title="コミュニケーション（Communication）"
          definition="他者と効果的に意思疎通を行う能力"
          rubric={[
            { score: 1, level: "非常に低い", definition: "コミュニケーションを行うことができない、または意思疎通ができない", details: ["コミュニケーションが取れない", "自分の意見を伝えられない", "他者の意見を理解できない", "対立が発生しやすい"] },
            { score: 2, level: "低い", definition: "基本的なコミュニケーションはできるが、不十分な点が多い", details: ["簡単なコミュニケーションはできる", "自分の意見を部分的に伝えられる", "他者の意見を部分的に理解できる", "対立が発生することがある"] },
            { score: 3, level: "標準", definition: "適切なコミュニケーションを行い、意思疎通を図ることができる", details: ["基本的なコミュニケーションができる", "自分の意見を伝えられる", "他者の意見を理解できる", "基本的な対立を解決できる"] },
            { score: 4, level: "高い", definition: "効果的なコミュニケーションを行い、良好な関係を築くことができる", details: ["効果的なコミュニケーションができる", "自分の意見を明確に伝えられる", "他者の意見を深く理解できる", "対立を迅速に解決できる"] },
            { score: 5, level: "非常に高い", definition: "卓越したコミュニケーションを行い、チームの協力を最大化できる", details: ["卓越したコミュニケーションができる", "自分の意見を説得力を持って伝えられる", "他者の意見を完全に理解できる", "対立を予防し、協力を最大化できる"] }
          ]}
        />

        <SkillRubricSection 
          title="リーダーシップ（Leadership）"
          definition="チームを導き、目標達成に向けて動機づける能力"
          rubric={[
            { score: 1, level: "非常に低い", definition: "リーダーシップを発揮することができない、またはチームが機能しない", details: ["リーダーシップを発揮できない", "チームを導けない", "メンバーの動機づけができない", "チームが機能しない"] },
            { score: 2, level: "低い", definition: "基本的なリーダーシップは発揮できるが、効果が低い", details: ["簡単なリーダーシップは発揮できる", "チームを部分的に導ける", "メンバーの動機づけが不十分", "チームの機能が不十分"] },
            { score: 3, level: "標準", definition: "適切なリーダーシップを発揮し、チームを導くことができる", details: ["基本的なリーダーシップを発揮できる", "チームを導ける", "メンバーの動機づけができる", "チームが機能する"] },
            { score: 4, level: "高い", definition: "効果的なリーダーシップを発揮し、チームの生産性を高めることができる", details: ["効果的なリーダーシップを発揮できる", "チームを効果的に導ける", "メンバーの動機づけが高い", "チームの生産性が高い"] },
            { score: 5, level: "非常に高い", definition: "卓越したリーダーシップを発揮し、チームの最適化を実現できる", details: ["卓越したリーダーシップを発揮できる", "チームを戦略的に導ける", "メンバーの動機づけが最大化される", "チームの最適化を実現できる"] }
          ]}
        />

        <SkillRubricSection 
          title="プレゼンテーション（Presentation）"
          definition="情報を効果的に伝達し、聴衆を説得する能力"
          rubric={[
            { score: 1, level: "非常に低い", definition: "プレゼンテーションを行うことができない、または伝達ができない", details: ["プレゼンテーションができない", "情報を伝達できない", "聴衆を説得できない", "緊張で話せない"] },
            { score: 2, level: "低い", definition: "基本的なプレゼンテーションはできるが、効果が低い", details: ["簡単なプレゼンテーションはできる", "情報を部分的に伝達できる", "聴衆を説得しにくい", "緊張することがある"] },
            { score: 3, level: "標準", definition: "適切なプレゼンテーションを行い、情報を伝達することができる", details: ["基本的なプレゼンテーションができる", "情報を伝達できる", "聴衆を基本的に説得できる", "緊張をコントロールできる"] },
            { score: 4, level: "高い", definition: "効果的なプレゼンテーションを行い、聴衆を説得することができる", details: ["効果的なプレゼンテーションができる", "情報を明確に伝達できる", "聴衆を効果的に説得できる", "緊張を活用できる"] },
            { score: 5, level: "非常に高い", definition: "卓越したプレゼンテーションを行い、聴衆を感動させることができる", details: ["卓越したプレゼンテーションができる", "情報を創造的に伝達できる", "聴衆を強く説得できる", "緊張を完全にコントロールできる"] }
          ]}
        />

        <SkillRubricSection 
          title="問題解決（Problem Solving）"
          definition="問題を特定し、解決策を見つけて実行する能力"
          rubric={[
            { score: 1, level: "非常に低い", definition: "問題を解決することができない、または解決策が無効", details: ["問題を特定できない", "解決策を見つけられない", "解決策が無効", "問題が悪化する"] },
            { score: 2, level: "低い", definition: "基本的な問題は解決できるが、効率が悪い", details: ["簡単な問題は解決できる", "解決に時間がかかる", "解決策が部分的", "問題が再発することがある"] },
            { score: 3, level: "標準", definition: "適切な問題解決を行い、解決策を実行することができる", details: ["問題を特定できる", "基本的な解決策を見つけられる", "解決策を実行できる", "問題を解決できる"] },
            { score: 4, level: "高い", definition: "効果的な問題解決を行い、最適な解決策を見つけることができる", details: ["問題を迅速に特定できる", "効果的な解決策を見つけられる", "解決策を迅速に実行できる", "問題を効果的に解決できる"] },
            { score: 5, level: "非常に高い", definition: "創造的な問題解決を行い、革新的な解決策を実現できる", details: ["問題を戦略的に特定できる", "創造的な解決策を見つけられる", "解決策を戦略的に実行できる", "問題を革新的に解決できる"] }
          ]}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold mb-2 text-blue-800">💡 スキル評価の計算方法</h3>
        <p className="text-blue-700 mb-2">
          各スキルは以下の方法で自動評価されます：
        </p>
        <ul className="list-disc list-inside text-blue-700 space-y-1">
          <li><strong>タスク完了率ベース（30%）</strong>: そのスキルカテゴリのタスク完了率から計算</li>
          <li><strong>難易度適応度ベース（30%）</strong>: どの難易度レベルのタスクを成功させられるかから計算</li>
          <li><strong>MBTI特性による補正（20%）</strong>: MBTIタイプからベース値を設定</li>
          <li><strong>完了速度ベース（20%）</strong>: タスクの完了速度（効率性）から計算</li>
        </ul>
        <p className="text-blue-700 mt-4">
          教育(PM)は、自動評価結果を手動で調整することもできます。
        </p>
      </div>
    </div>
  )
}

interface RubricItem {
  score: number
  level: string
  definition: string
  details: string[]
}

interface SkillRubricSectionProps {
  title: string
  definition: string
  rubric: RubricItem[]
}

function SkillRubricSection({ title, definition, rubric }: SkillRubricSectionProps) {
  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm mb-6">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{definition}</p>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">スコア</th>
              <th className="border p-2 text-left">レベル</th>
              <th className="border p-2 text-left">定義</th>
              <th className="border p-2 text-left">具体的な状態</th>
            </tr>
          </thead>
          <tbody>
            {rubric.map((item) => (
              <tr key={item.score} className="hover:bg-gray-50">
                <td className="border p-2 font-semibold text-center">{item.score}</td>
                <td className="border p-2">{item.level}</td>
                <td className="border p-2">{item.definition}</td>
                <td className="border p-2">
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {item.details.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

