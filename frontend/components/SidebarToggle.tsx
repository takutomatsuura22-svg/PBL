'use client'

import { useSidebar } from './SidebarContext'

export default function SidebarToggle() {
  try {
    const { isOpen, toggle } = useSidebar()

    return (
      <button
        onClick={toggle}
        className="fixed top-4 left-4 z-50 p-3 bg-white border border-[#e8e8ed] rounded-xl shadow-lg hover:shadow-xl transition-all lg:hidden"
        aria-label={isOpen ? 'サイドバーを閉じる' : 'サイドバーを開く'}
      >
        <svg className="w-6 h-6 text-[#1d1d1f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
    )
  } catch (error) {
    console.error('SidebarToggle error:', error)
    return null
  }
}
