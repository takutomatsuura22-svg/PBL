// Type definitions for Next.js (temporary until npm install)
declare module 'next/link' {
  import React from 'react'
  interface LinkProps {
    href: string
    className?: string
    children?: React.ReactNode
  }
  const Link: React.ComponentType<LinkProps>
  export default Link
}

declare module 'next/navigation' {
  export function useParams(): { [key: string]: string | string[] | undefined }
}

declare module 'next/server' {
  export class NextResponse {
    static json(body: any, init?: { status?: number }): NextResponse
  }
}





