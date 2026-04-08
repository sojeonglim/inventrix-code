import { useState } from 'react'
import { DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell, Button, NumberInput, Tag } from '@carbon/react'
import { useInventory, useUpdateStock } from '@/hooks/use-inventory'
import { Pagination } from '@/components/common/Pagination'
import { useToast } from '@/contexts/ToastContext'

export default function StaffInventoryPage() {
  const [page, setPage] = useState(1)
  const [editId, setEditId] = useState<string | null>(null)
  const [editVal, setEditVal] = useState(0)
  const { data, isLoading } = useInventory({ page, pageSize: 20 })
  const updateStock = useUpdateStock()
  const { addToast } = useToast()

  const handleSave = async (productId: string) => {
    try { await updateStock.mutateAsync({ productId, stock: editVal }); addToast('success', '재고 수정됨'); setEditId(null) }
    catch { addToast('error', '수정 실패') }
  }

  const headers = [
    { key: 'productName', header: 'Product' }, { key: 'stock', header: 'Stock' },
    { key: 'availableStock', header: 'Available' }, { key: 'reservedStock', header: 'Reserved' }, { key: 'actions', header: 'Actions' },
  ]
  const rows = data?.data.map(item => ({ id: item.productId, ...item, actions: item })) ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h1>Inventory</h1>
      <DataTable rows={rows} headers={headers} data-testid="staff-inventory-table">
        {({ rows: r, headers: h, getTableProps, getHeaderProps, getRowProps }) => (
          <Table {...getTableProps()}>
            <TableHead><TableRow>{h.map(header => <TableHeader {...getHeaderProps({ header })} key={header.key}>{header.header}</TableHeader>)}</TableRow></TableHead>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={5}>로딩 중...</TableCell></TableRow>
              : r.map(row => {
                const item = row.cells.find(c => c.info.header === 'actions')?.value
                return (
                  <TableRow {...getRowProps({ row })} key={row.id}>
                    {row.cells.map(cell => (
                      <TableCell key={cell.id}>
                        {cell.info.header === 'availableStock' ? (
                          <>{cell.value} {cell.value === 0 && <Tag type="red" size="sm">품절</Tag>}{cell.value > 0 && cell.value <= 10 && <Tag type="warm-gray" size="sm">부족</Tag>}</>
                        ) : cell.info.header === 'actions' ? (
                          editId === row.id ? (
                            <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end' }}>
                              <NumberInput id={`stock-${row.id}`} label="" min={0} value={editVal} onChange={(_e: unknown, state: { value: string | number }) => setEditVal(Number(state.value))} size="sm" hideSteppers style={{ width: 80 }} />
                              <Button size="sm" kind="primary" onClick={() => handleSave(row.id)}>Save</Button>
                              <Button size="sm" kind="ghost" onClick={() => setEditId(null)}>Cancel</Button>
                            </div>
                          ) : (
                            <Button size="sm" kind="ghost" data-testid={`staff-edit-stock-${row.id}`} onClick={() => { setEditId(row.id); setEditVal(item?.stock ?? 0) }}>Edit</Button>
                          )
                        ) : cell.value}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </DataTable>
      {data && <Pagination page={page} totalItems={data.total} pageSize={20} onPageChange={setPage} />}
    </div>
  )
}
