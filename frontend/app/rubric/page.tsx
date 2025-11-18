'use client'

import Link from 'next/link'

export default function RubricPage() {
  return (
    <>
      <div className="min-h-screen bg-[#f5f5f7] p-8">
        <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">📊 スコア評価ルーブリック</h1>
        <p className="text-gray-600">タスク量とモチベーションのスコア評価基準を明確化したルーブリックです</p>
      </div>

      {/* タスク量スコア */}
      <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">📋 1. タスク量スコア（Load Score）</h2>
        <p className="text-gray-700 mb-4">
          タスク量スコアは、学生が現在抱えているタスクの負荷を1〜5で評価します。
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-3 text-left font-semibold">スコア</th>
                <th className="border p-3 text-left font-semibold">レベル</th>
                <th className="border p-3 text-left font-semibold">定義</th>
                <th className="border p-3 text-left font-semibold">具体的な状態</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50">
                <td className="border p-3 font-bold text-center text-lg">1</td>
                <td className="border p-3"><span className="px-2 py-1 bg-green-100 text-green-800 rounded">非常に低い</span></td>
                <td className="border p-3">タスクがほとんどない、または非常に軽いタスクのみ</td>
                <td className="border p-3 text-sm">
                  • アクティブなタスクが0〜1件<br/>
                  • すべてのタスクが完了済み<br/>
                  • 難易度が低い（1〜2）タスクのみ<br/>
                  • 締切まで余裕がある（1週間以上）
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border p-3 font-bold text-center text-lg">2</td>
                <td className="border p-3"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">低い</span></td>
                <td className="border p-3">タスクはあるが、余裕を持って対応可能</td>
                <td className="border p-3 text-sm">
                  • アクティブなタスクが2〜3件<br/>
                  • 難易度が中程度（2〜3）のタスク<br/>
                  • 締切まで十分な時間がある（3日以上）<br/>
                  • タスクの合計負荷が基準値の50%以下
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border p-3 font-bold text-center text-lg">3</td>
                <td className="border p-3"><span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">標準</span></td>
                <td className="border p-3">適切な量のタスクを抱えている</td>
                <td className="border p-3 text-sm">
                  • アクティブなタスクが3〜5件<br/>
                  • 難易度が中程度（3）のタスクが中心<br/>
                  • 一部のタスクが締切に近い（1週間以内）<br/>
                  • タスクの合計負荷が基準値の50〜100%
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border p-3 font-bold text-center text-lg">4</td>
                <td className="border p-3"><span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">高い</span></td>
                <td className="border p-3">タスクが多く、負荷が高い状態</td>
                <td className="border p-3 text-sm">
                  • アクティブなタスクが5〜8件<br/>
                  • 難易度が高い（4〜5）のタスクを含む<br/>
                  • 複数のタスクが締切に近い（3日以内）<br/>
                  • 期限超過のタスクがある<br/>
                  • タスクの合計負荷が基準値の100〜150%
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border p-3 font-bold text-center text-lg">5</td>
                <td className="border p-3"><span className="px-2 py-1 bg-red-100 text-red-800 rounded">非常に高い</span></td>
                <td className="border p-3">過剰なタスク負荷で、対応が困難な状態</td>
                <td className="border p-3 text-sm">
                  • アクティブなタスクが8件以上<br/>
                  • 難易度が高い（4〜5）のタスクが複数<br/>
                  • 多くのタスクが締切直前または期限超過<br/>
                  • 緊急度の高いタスクが複数ある<br/>
                  • タスクの合計負荷が基準値の150%以上
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">計算要素</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li><strong>基本負荷</strong>: タスクの難易度（1-5）× 推定時間の重み</li>
            <li><strong>緊急度マルチプライヤ</strong>: 期限超過(2.0倍), 1日以内(1.8倍), 3日以内(1.5倍), 1週間以内(1.2倍)</li>
            <li><strong>タスク数マルチプライヤ</strong>: 3タスクを基準に最大1.5倍</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold mb-2">推奨アクション</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li><strong>スコア1-2</strong>: 新しいタスクを割り当てることを検討</li>
            <li><strong>スコア3</strong>: 現状維持、定期的なモニタリング</li>
            <li><strong>スコア4</strong>: タスクの優先順位付け、期限の調整、支援の提供を検討</li>
            <li><strong>スコア5</strong>: 緊急の介入が必要。タスクの再分配、期限の延長、追加リソースの提供を検討</li>
          </ul>
        </div>
      </div>

      {/* モチベーションスコア */}
      <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">💪 2. モチベーションスコア（Motivation Score）</h2>
        <p className="text-gray-700 mb-4">
          モチベーションスコアは、学生のプロジェクトへの意欲・関心度を1〜5で評価します。
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-3 text-left font-semibold">スコア</th>
                <th className="border p-3 text-left font-semibold">レベル</th>
                <th className="border p-3 text-left font-semibold">定義</th>
                <th className="border p-3 text-left font-semibold">具体的な状態</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50">
                <td className="border p-3 font-bold text-center text-lg">1</td>
                <td className="border p-3"><span className="px-2 py-1 bg-red-100 text-red-800 rounded">非常に低い</span></td>
                <td className="border p-3">プロジェクトへの意欲が極めて低い状態</td>
                <td className="border p-3 text-sm">
                  • タスク完了率が20%未満<br/>
                  • 進行中のタスクがない、または停滞している<br/>
                  • 自分の強みを活かせるタスクが少ない<br/>
                  • チームメンバーとの相性が悪い<br/>
                  • 活動の記録がほとんどない
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border p-3 font-bold text-center text-lg">2</td>
                <td className="border p-3"><span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">低い</span></td>
                <td className="border p-3">意欲が低く、積極的な参加が見られない</td>
                <td className="border p-3 text-sm">
                  • タスク完了率が20〜40%<br/>
                  • 進行中のタスクが少ない（1〜2件）<br/>
                  • 自分の強みを活かせるタスクが一部のみ<br/>
                  • チームメンバーとの相性がやや悪い<br/>
                  • 活動の記録が少ない
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border p-3 font-bold text-center text-lg">3</td>
                <td className="border p-3"><span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">標準</span></td>
                <td className="border p-3">適切な意欲を持ち、通常通り活動している</td>
                <td className="border p-3 text-sm">
                  • タスク完了率が40〜70%<br/>
                  • 進行中のタスクが適切な数（2〜4件）<br/>
                  • 自分の強みを活かせるタスクが一部ある<br/>
                  • チームメンバーとの相性が普通<br/>
                  • 活動の記録が標準的
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border p-3 font-bold text-center text-lg">4</td>
                <td className="border p-3"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">高い</span></td>
                <td className="border p-3">意欲が高く、積極的に活動している</td>
                <td className="border p-3 text-sm">
                  • タスク完了率が70〜90%<br/>
                  • 進行中のタスクが複数ある（3〜5件）<br/>
                  • 自分の強みを活かせるタスクが多い<br/>
                  • チームメンバーとの相性が良い<br/>
                  • 活動の記録が多く、積極的な参加が見られる
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border p-3 font-bold text-center text-lg">5</td>
                <td className="border p-3"><span className="px-2 py-1 bg-green-100 text-green-800 rounded">非常に高い</span></td>
                <td className="border p-3">極めて高い意欲で、リーダーシップを発揮している</td>
                <td className="border p-3 text-sm">
                  • タスク完了率が90%以上<br/>
                  • 進行中のタスクが多く、自発的に取り組んでいる<br/>
                  • 自分の強みを活かせるタスクが非常に多い<br/>
                  • チームメンバーとの相性が非常に良い<br/>
                  • 活動の記録が多く、他のメンバーをサポートしている
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">計算要素（重み付き平均）</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li><strong>タスク完了率（重み40%）</strong>: 完了タスク数 / 総タスク数</li>
            <li><strong>強みマッチ度（重み25%）</strong>: 自分の強みカテゴリとタスクカテゴリの一致度</li>
            <li><strong>チーム相性（重み20%）</strong>: 好ましいパートナーとの協働、避けたいパートナーとの接触</li>
            <li><strong>MBTI特性（重み15%）</strong>: EN系(4.0), ES系(3.5), IN系(3.0), IS系(2.5)</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold mb-2">推奨アクション</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li><strong>スコア1-2</strong>: 緊急の介入が必要。個別面談、タスクの見直し、チーム編成の検討</li>
            <li><strong>スコア3</strong>: 現状維持、定期的なモニタリング、必要に応じてサポート</li>
            <li><strong>スコア4-5</strong>: 良好な状態。リーダーシップを発揮してもらう、他のメンバーのサポートを依頼</li>
          </ul>
        </div>
      </div>

      {/* 危険度スコア */}
      <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">⚠️ 3. 危険度スコア（Danger Score）</h2>
        <p className="text-gray-700 mb-4">
          危険度スコアは、学生がプロジェクトから離脱するリスクを1〜5で評価します。
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-3 text-left font-semibold">スコア</th>
                <th className="border p-3 text-left font-semibold">レベル</th>
                <th className="border p-3 text-left font-semibold">定義</th>
                <th className="border p-3 text-left font-semibold">推奨アクション</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50">
                <td className="border p-3 font-bold text-center text-lg">1</td>
                <td className="border p-3"><span className="px-2 py-1 bg-green-100 text-green-800 rounded">安全</span></td>
                <td className="border p-3">リスクが低く、良好な状態</td>
                <td className="border p-3 text-sm">定期的なモニタリングで十分</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border p-3 font-bold text-center text-lg">2</td>
                <td className="border p-3"><span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">注意</span></td>
                <td className="border p-3">軽微なリスクがある</td>
                <td className="border p-3 text-sm">状況を観察し、必要に応じてサポート</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border p-3 font-bold text-center text-lg">3</td>
                <td className="border p-3"><span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">警告</span></td>
                <td className="border p-3">中程度のリスクがある</td>
                <td className="border p-3 text-sm">個別面談、タスクの見直しを検討</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border p-3 font-bold text-center text-lg">4</td>
                <td className="border p-3"><span className="px-2 py-1 bg-red-100 text-red-800 rounded">危険</span></td>
                <td className="border p-3">高いリスクがある</td>
                <td className="border p-3 text-sm">緊急の介入が必要。タスクの再分配、支援の提供</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border p-3 font-bold text-center text-lg">5</td>
                <td className="border p-3"><span className="px-2 py-1 bg-red-200 text-red-900 rounded font-bold">極めて危険</span></td>
                <td className="border p-3">極めて高いリスクがある</td>
                <td className="border p-3 text-sm">即座の介入が必要。プロジェクトマネージャーと相談</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">計算要素（重み付き平均）</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li><strong>モチベーションリスク（重み30%）</strong>: モチベーションスコアが低いほど危険度が高い</li>
            <li><strong>負荷リスク（重み25%）</strong>: タスク量スコアが高いほど危険度が高い</li>
            <li><strong>期限超過タスク（重み20%）</strong>: 期限超過タスクが多いほど危険度が高い</li>
            <li><strong>スキルギャップ（重み10%）</strong>: 必要なスキルが不足しているほど危険度が高い</li>
            <li><strong>活動度の低下（重み10%）</strong>: 最近の活動が少ないほど危険度が高い</li>
            <li><strong>コミュニケーションギャップ（重み5%）</strong>: チーム内のコミュニケーションが減少しているほど危険度が高い</li>
          </ul>
        </div>
      </div>

      {/* スコアの組み合わせ */}
      <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">🔍 4. スコアの組み合わせによる判断</h2>
        <div className="space-y-3">
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <h3 className="font-semibold text-red-800 mb-2">⚠️ タスク量高（4-5）× モチベーション低（1-2）</h3>
            <p className="text-sm text-gray-700">最も危険な状態。即座の介入が必要</p>
          </div>
          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
            <h3 className="font-semibold text-yellow-800 mb-2">📊 タスク量高（4-5）× モチベーション高（4-5）</h3>
            <p className="text-sm text-gray-700">負荷は高いが意欲がある。期限調整や支援で対応可能</p>
          </div>
          <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded">
            <h3 className="font-semibold text-orange-800 mb-2">🔍 タスク量低（1-2）× モチベーション低（1-2）</h3>
            <p className="text-sm text-gray-700">タスクが少ないのに意欲も低い。タスクの見直しや動機付けが必要</p>
          </div>
          <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
            <h3 className="font-semibold text-green-800 mb-2">✅ タスク量標準（3）× モチベーション標準（3）</h3>
            <p className="text-sm text-gray-700">理想的な状態。現状維持</p>
          </div>
        </div>
      </div>

      {/* 注意事項 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-3">📌 注意事項</h2>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
          <li>スコアは自動計算されるため、常に最新の状態を反映します</li>
          <li>スコアは目安であり、個別の状況を考慮した判断も重要です</li>
          <li>スコアが急激に変化した場合は、背景を確認してください</li>
          <li>スコアの更新タイミング: タスクの追加・完了・更新時、定期的な再計算（推奨: 1日1回）</li>
        </ul>
      </div>
        </div>
      </div>
    </>
  )
}

