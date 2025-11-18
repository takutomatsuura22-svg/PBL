'use client'

import React, { Component } from 'react'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-[#1d1d1f] mb-4">エラーが発生しました</h1>
            <p className="text-[#86868b] mb-4">{this.state.error?.message || '不明なエラー'}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#007aff] text-white rounded-xl hover:bg-[#0051d5] transition-colors"
            >
              ページをリロード
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}


