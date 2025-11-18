import type { Metadata } from 'next'
import './globals.css'
import AppWrapper from '@/components/AppWrapper'

export const metadata: Metadata = {
  title: 'PBL AI Dashboard',
  description: 'Team management and student tracking dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  )
}
