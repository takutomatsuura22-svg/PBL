'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { SidebarProvider } from './SidebarContext'
import Sidebar from './Sidebar'
import SidebarToggle from './SidebarToggle'
import ChatBot from './ChatBot'

function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showSidebar = pathname !== '/'

  return (
    <>
      {showSidebar && (
        <>
          <Sidebar />
          <SidebarToggle />
        </>
      )}
      <main className={showSidebar ? 'lg:ml-64 transition-all duration-300' : ''}>
        {children}
      </main>
      {/* チャットボット（全ページで表示） */}
      <ChatBot />
    </>
  )
}

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  try {
    return (
      <SidebarProvider>
        <AppContent>{children}</AppContent>
      </SidebarProvider>
    )
  } catch (error) {
    console.error('AppWrapper error:', error)
    return <div className="min-h-screen bg-[#f5f5f7] p-8">エラーが発生しました: {String(error)}</div>
  }
}
