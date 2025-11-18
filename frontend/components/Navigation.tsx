'use client'

import Link from 'next/link'

export default function Navigation() {
  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm mt-8">
      <h2 className="text-xl font-semibold mb-4">📌 ナビゲーション</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Link
          href="/dashboard"
          className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <p className="font-semibold text-blue-700">マネジメント</p>
              <p className="text-sm text-gray-600">学生のモチベーションとタスク量を可視化</p>
            </div>
          </div>
        </Link>
        <Link
          href="/pm"
          className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 hover:border-purple-400 transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">👥</span>
            <div>
              <p className="font-semibold text-purple-700">PMページ</p>
              <p className="text-sm text-gray-600">統括ダッシュボード</p>
            </div>
          </div>
        </Link>
        <Link
          href="/wbs/view"
          className="p-4 border-2 border-teal-200 rounded-lg hover:bg-teal-50 hover:border-teal-400 transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <p className="font-semibold text-teal-700">WBS一覧</p>
              <p className="text-sm text-gray-600">タスク一覧を表示・検索</p>
            </div>
          </div>
        </Link>
        <Link
          href="/wbs"
          className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 hover:border-green-400 transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📤</span>
            <div>
              <p className="font-semibold text-green-700">WBS読み込み</p>
              <p className="text-sm text-gray-600">WBSファイルをアップロード</p>
            </div>
          </div>
        </Link>
        <Link
          href="/checkin"
          className="p-4 border-2 border-pink-200 rounded-lg hover:bg-pink-50 hover:border-pink-400 transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📝</span>
            <div>
              <p className="font-semibold text-pink-700">日次チェックイン</p>
              <p className="text-sm text-gray-600">モチベーションの記録</p>
            </div>
          </div>
        </Link>
        <Link
          href="/rubric"
          className="p-4 border-2 border-indigo-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-400 transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <p className="font-semibold text-indigo-700">スコア評価ルーブリック</p>
              <p className="text-sm text-gray-600">タスク量・モチベーションの評価基準</p>
            </div>
          </div>
        </Link>
        <Link
          href="/rubric-skills"
          className="p-4 border-2 border-cyan-200 rounded-lg hover:bg-cyan-50 hover:border-cyan-400 transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="font-semibold text-cyan-700">スキル評価ルーブリック</p>
              <p className="text-sm text-gray-600">12のスキル項目の評価基準</p>
            </div>
          </div>
        </Link>
        <Link
          href="/setup/skills"
          className="p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 hover:border-orange-400 transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📝</span>
            <div>
              <p className="font-semibold text-orange-700">スキル自己評価</p>
              <p className="text-sm text-gray-600">初期セットアップ・定期更新</p>
            </div>
          </div>
        </Link>
        <Link
          href="/meetings"
          className="p-4 border-2 border-emerald-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-400 transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <p className="font-semibold text-emerald-700">議事録</p>
              <p className="text-sm text-gray-600">会議の記録・共有</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}

