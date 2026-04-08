import type { RevenueStats } from '@/types'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function RevenueChart({ data }: { data: RevenueStats['byPeriod'] }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow" data-testid="revenue-chart">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">매출 추이</h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Area type="monotone" dataKey="revenue" stroke="#667eea" fill="#667eea" fillOpacity={0.2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
