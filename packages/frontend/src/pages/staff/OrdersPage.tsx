import { useState } from 'react'
import { DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from '@carbon/react'
import { useOrders } from '@/hooks/use-orders'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { OrderActions } from '@/components/orders/OrderActions'
import { Pagination } from '@/components/common/Pagination'

export default function StaffOrdersPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useOrders({ page, pageSize: 20 })

  const headers = [
    { key: 'id', header: 'ID' }, { key: 'total', header: 'Total' }, { key: 'status', header: 'Status' },
    { key: 'date', header: 'Date' }, { key: 'actions', header: 'Actions' },
  ]
  const rows = data?.data.map(o => ({ id: o.id, total: `$${o.total.toFixed(2)}`, status: o.status, date: new Date(o.createdAt).toLocaleDateString(), actions: o })) ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h1>Orders</h1>
      <DataTable rows={rows} headers={headers} data-testid="staff-orders-table">
        {({ rows: r, headers: h, getTableProps, getHeaderProps, getRowProps }) => (
          <Table {...getTableProps()}>
            <TableHead><TableRow>{h.map(header => <TableHeader {...getHeaderProps({ header })} key={header.key}>{header.header}</TableHeader>)}</TableRow></TableHead>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={5}>로딩 중...</TableCell></TableRow>
              : r.map(row => (
                <TableRow {...getRowProps({ row })} key={row.id}>
                  {row.cells.map(cell => (
                    <TableCell key={cell.id}>
                      {cell.info.header === 'status' ? <OrderStatusBadge status={cell.value} />
                      : cell.info.header === 'actions' ? <OrderActions order={cell.value} role="staff" />
                      : cell.info.header === 'id' ? `#${cell.value}` : cell.value}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTable>
      {data && <Pagination page={page} totalItems={data.total} pageSize={20} onPageChange={setPage} />}
    </div>
  )
}
