'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from './SidebarContext'

interface NavItem {
  href: string
  label: string
  icon: string
  badge?: number
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'ダッシュボード', icon: '📊' },
  { href: '/pm', label: 'PM', icon: '👥' },
  { href: '/wbs/view', label: 'WBS', icon: '📋' },
  { href: '/checkin', label: 'チェックイン', icon: '📝' },
  { href: '/setup/skills', label: 'スキル評価', icon: '🎯' },
  { href: '/meetings', label: '議事録', icon: '📄' },
  { href: '/rubric', label: 'ルーブリック', icon: '📖' },
]

export default function Sidebar() {
  try {
    const pathname = usePathname()
    const { isOpen, close } = useSidebar()

    return (
      <>
        {/* オーバーレイ（モバイル用） */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
            onClick={close}
          />
        )}

        {/* サイドバー */}
        <aside
          className={`
            fixed left-0 top-0 h-full bg-white border-r border-[#e8e8ed] z-50
            transition-all duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0
            ${isOpen ? 'w-64' : 'w-0 lg:w-64'}
          `}
        >
          <div className="h-full flex flex-col overflow-hidden">
            {/* ヘッダー */}
            <div className="p-6 border-b border-[#e8e8ed] flex items-center justify-between">
              <div className={isOpen ? 'block' : 'hidden'}>
                <h1 className="text-xl font-semibold text-[#1d1d1f] tracking-tight">
                  PBL Dashboard
                </h1>
                <p className="text-xs text-[#86868b] mt-1">プロジェクト管理</p>
              </div>
              <button
                onClick={close}
                className="lg:hidden p-2 hover:bg-[#fafafa] rounded-lg transition-colors"
                aria-label="サイドバーを閉じる"
              >
                <svg className="w-6 h-6 text-[#1d1d1f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* ナビゲーション */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl
                      transition-all duration-200
                      ${isOpen ? '' : 'justify-center'}
                      ${
                        isActive
                          ? 'bg-[#007aff] text-white shadow-sm'
                          : 'text-[#1d1d1f] hover:bg-[#fafafa]'
                      }
                    `}
                    title={!isOpen ? item.label : undefined}
                  >
                    <span className="text-lg flex-shrink-0">{item.icon}</span>
                    {isOpen && (
                      <>
                        <span className="font-medium text-sm flex-1">{item.label}</span>
                        {item.badge && (
                          <span className={`
                            px-2 py-0.5 text-xs font-medium rounded-full
                            ${isActive ? 'bg-white/20 text-white' : 'bg-[#007aff]/10 text-[#007aff]'}
                          `}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                )
              })}
            </nav>
            
            {/* フッター */}
            <div className={`p-4 border-t border-[#e8e8ed] ${isOpen ? '' : 'hidden'}`}>
              <div className="text-xs text-[#86868b]">
                <p className="font-medium text-[#1d1d1f] mb-1">PBL AI Dashboard</p>
                <p>Version 1.0</p>
              </div>
            </div>
          </div>
        </aside>
      </>
    )
  } catch (error) {
    console.error('Sidebar error:', error)
    return null
  }
}
