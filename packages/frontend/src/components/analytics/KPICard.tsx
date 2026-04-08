import { Tile } from '@carbon/react'
import type { ReactNode } from 'react'

interface Props { title: string; value: string | number; icon: ReactNode }

export function KPICard({ title, value, icon }: Props) {
  return (
    <Tile data-testid="kpi-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 12, color: 'var(--cds-text-secondary)', marginBottom: 4 }}>{title}</p>
          <p style={{ fontSize: 28, fontWeight: 600 }}>{value}</p>
        </div>
        <span style={{ fontSize: 24 }}>{icon}</span>
      </div>
    </Tile>
  )
}
