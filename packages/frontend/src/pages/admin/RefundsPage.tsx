import { useState } from 'react'
import { DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell, Button, Tag } from '@carbon/react'
import { useRefunds, useUpdateRefund } from '@/hooks/use-refunds'
import { Pagination } from '@/components/common/Pagination'
import { useToast } from '@/contexts/ToastContext'
import type { RefundStatus } from '@/types'

export default function RefundsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useRefunds({ page, pageSize: 20 })
  const updateRefund = useUpdateRefund()
  const { addToast } = useToast()

  const handleProcess = async (id: string) => {
    try { await updateRefund.mutateAsync({ id, status: 'refunded' as RefundStatus }); addToast('success', '환불 처리됨') }
    catch { addToast('error', '처리 실패') }
  }

  const headers = [
    { key: 'id', header: 'ID' }, { key: 'orderId', header: 'Order' }, { key: 'amount', header: 'Amount' },
    { key: 'status', header: 'Status' }, { key: 'actions', header: 'Actions' },
  ]
  const rows = data?.data.map(r => ({ id: r.id, orderId: `#${r.orderId}`, amount: `$${r.amount.toFixed(2)}`, status: r.status, actions: r })) ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h1>Refunds</h1>
      <DataTable rows={rows} headers={headers} data-testid="refunds-table">
        {({ rows: r, headers: h, getTableProps, getHeaderProps, getRowProps }) => (
          <Table {...getTableProps()}>
            <TableHead><TableRow>{h.map(header => <TableHeader {...getHeaderProps({ header })} key={header.key}>{header.header}</TableHeader>)}</TableRow></TableHead>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={5}>로딩 중...</TableCell></TableRow>
              : r.map(row => (
                <TableRow {...getRowProps({ row })} key={row.id}>
                  {row.cells.map(cell => (
                    <TableCell key={cell.id}>
                      {cell.info.header === 'status' ? <Tag type={cell.value === 'refunded' ? 'green' : 'warm-gray'} size="sm">{cell.value}</Tag>
                      : cell.info.header === 'actions' ? (
                        cell.value.status === 'pending_refund' ? <Button size="sm" kind="primary" data-testid={`process-refund-${row.id}`} onClick={() => handleProcess(row.id)}>Process</Button> : null
                      ) : cell.info.header === 'id' ? `#${cell.value}` : cell.value}
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
