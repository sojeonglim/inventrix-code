import { useState } from 'react'
import { Button, Tile, DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from '@carbon/react'
import { Add } from '@carbon/icons-react'
import { useProducts, useDeleteProduct } from '@/hooks/use-products'
import { ProductForm } from '@/components/products/ProductForm'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useToast } from '@/contexts/ToastContext'
import type { Product } from '@/types'

export default function ProductsPage() {
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { data, isLoading } = useProducts({ page, pageSize: 20 })
  const deleteMut = useDeleteProduct()
  const { addToast } = useToast()

  const handleDelete = async () => {
    if (!deleteId) return
    try { await deleteMut.mutateAsync(deleteId); addToast('success', '상품 삭제됨') } catch { addToast('error', '삭제 실패') }
    setDeleteId(null)
  }

  const headers = [
    { key: 'name', header: 'Name' }, { key: 'price', header: 'Price' }, { key: 'stock', header: 'Stock' }, { key: 'actions', header: 'Actions' },
  ]
  const rows = data?.data.map(p => ({ id: p.id, name: p.name, price: `$${p.price.toFixed(2)}`, stock: p.stock, actions: p })) ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Products</h1>
        <Button renderIcon={Add} size="md" onClick={() => { setEditing(null); setShowForm(true) }} data-testid="add-product-button">상품 추가</Button>
      </div>
      {showForm && (
        <Tile>
          <ProductForm product={editing ?? undefined} onSuccess={() => { setShowForm(false); setEditing(null) }} />
          <Button kind="ghost" size="sm" onClick={() => { setShowForm(false); setEditing(null) }} style={{ marginTop: 8 }}>취소</Button>
        </Tile>
      )}
      <DataTable rows={rows} headers={headers} data-testid="products-table">
        {({ rows: r, headers: h, getTableProps, getHeaderProps, getRowProps }) => (
          <Table {...getTableProps()}>
            <TableHead><TableRow>{h.map(header => <TableHeader {...getHeaderProps({ header })} key={header.key}>{header.header}</TableHeader>)}</TableRow></TableHead>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={4}>로딩 중...</TableCell></TableRow>
              : r.map(row => (
                <TableRow {...getRowProps({ row })} key={row.id}>
                  {row.cells.map(cell => (
                    <TableCell key={cell.id}>
                      {cell.info.header === 'actions' ? (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <Button size="sm" kind="ghost" data-testid={`edit-product-${row.id}`} onClick={() => { setEditing(cell.value); setShowForm(true) }}>Edit</Button>
                          <Button size="sm" kind="danger--ghost" data-testid={`delete-product-${row.id}`} onClick={() => setDeleteId(row.id)}>Delete</Button>
                        </div>
                      ) : cell.value}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTable>
      {data && <Pagination page={page} totalItems={data.total} pageSize={20} onPageChange={setPage} />}
      <ConfirmDialog open={!!deleteId} onConfirm={handleDelete} onCancel={() => setDeleteId(null)} title="상품 삭제" description="이 상품을 삭제하시겠습니까?" confirmLabel="삭제" />
    </div>
  )
}
