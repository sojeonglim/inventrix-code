import { useState } from 'react'
import { DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell, Select, SelectItem } from '@carbon/react'
import { useUsers, useUpdateUserRole } from '@/hooks/use-users'
import { useToast } from '@/contexts/ToastContext'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import type { Role } from '@/types'

export default function UsersPage() {
  const { data: users, isLoading } = useUsers()
  const updateRole = useUpdateUserRole()
  const { addToast } = useToast()
  const [confirm, setConfirm] = useState<{ id: string; role: Role } | null>(null)

  const handleConfirm = async () => {
    if (!confirm) return
    try { await updateRole.mutateAsync(confirm); addToast('success', '역할 변경됨') }
    catch { addToast('error', '변경 실패') }
    setConfirm(null)
  }

  const headers = [
    { key: 'name', header: 'Name' }, { key: 'email', header: 'Email' }, { key: 'role', header: 'Role' },
  ]
  const rows = users?.map(u => ({ id: u.id, name: u.name, email: u.email, role: u })) ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h1>User Management</h1>
      <DataTable rows={rows} headers={headers} data-testid="users-table">
        {({ rows: r, headers: h, getTableProps, getHeaderProps, getRowProps }) => (
          <Table {...getTableProps()}>
            <TableHead><TableRow>{h.map(header => <TableHeader {...getHeaderProps({ header })} key={header.key}>{header.header}</TableHeader>)}</TableRow></TableHead>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={3}>로딩 중...</TableCell></TableRow>
              : r.map(row => (
                <TableRow {...getRowProps({ row })} key={row.id}>
                  {row.cells.map(cell => (
                    <TableCell key={cell.id}>
                      {cell.info.header === 'role' ? (
                        <Select id={`role-${row.id}`} labelText="" hideLabel size="sm" value={cell.value.role}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setConfirm({ id: row.id, role: e.target.value as Role })}
                          data-testid={`role-select-${row.id}`}>
                          <SelectItem value="admin" text="Admin" />
                          <SelectItem value="staff" text="Staff" />
                          <SelectItem value="customer" text="Customer" />
                        </Select>
                      ) : cell.value}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTable>
      <ConfirmDialog open={!!confirm} onConfirm={handleConfirm} onCancel={() => setConfirm(null)}
        title="역할 변경" description={`이 사용자의 역할을 ${confirm?.role}로 변경하시겠습니까?`} confirmLabel="변경" />
    </div>
  )
}
