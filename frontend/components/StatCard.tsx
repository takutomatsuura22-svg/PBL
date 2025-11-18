'use client'

interface StatCardProps {
  label: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  icon?: string
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple'
}

const colorClasses = {
  blue: 'bg-[#007aff]/10 text-[#007aff]',
  green: 'bg-[#34c759]/10 text-[#34c759]',
  orange: 'bg-[#ff9500]/10 text-[#ff9500]',
  red: 'bg-[#ff3b30]/10 text-[#ff3b30]',
  purple: 'bg-[#af52de]/10 text-[#af52de]',
}

export default function StatCard({ label, value, subtitle, trend, icon, color = 'blue' }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#e8e8ed] p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-[#86868b] mb-1">{label}</p>
          <p className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-[#86868b] mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
            <span className="text-2xl">{icon}</span>
          </div>
        )}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-medium ${
          trend.isPositive ? 'text-[#34c759]' : 'text-[#ff3b30]'
        }`}>
          <span>{trend.isPositive ? '↑' : '↓'}</span>
          <span>{Math.abs(trend.value)}%</span>
        </div>
      )}
    </div>
  )
}


