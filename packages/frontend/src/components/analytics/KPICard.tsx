import type { ReactNode } from 'react'

interface Props { title: string; value: string | number; icon: ReactNode; color?: string }

export function KPICard({ title, value, icon, color = 'text-brand-600' }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow" data-testid="kpi-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${color} dark:text-white`}>{value}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  )
}
