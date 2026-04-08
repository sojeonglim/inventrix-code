import { useUsers, useUpdateUserRole } from '@/hooks/use-users'
import { useToast } from '@/contexts/ToastContext'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useState } from 'react'
import type { Role } from '@/types'

export default function UsersPage() {
  const { data: users, isLoading } = useUsers()
  const updateRole = useUpdateUserRole()
  const { addToast } = useToast()
  const [confirm, setConfirm] = useState<{ id: string; role: Role } | null>(null)

  const handleConfirm = async () => {
    if (!confirm) return
    try {
      await updateRole.mutateAsync(confirm)
      addToast('success', '역할이 변경되었습니다')
    } catch { addToast('error', '변경에 실패했습니다') }
    setConfirm(null)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm" data-testid="users-table">
          <thead><tr className="border-b dark:border-gray-700 text-left text-gray-500">
            <th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th>
          </tr></thead>
          <tbody>
            {isLoading ? <tr><td colSpan={3} className="p-4 text-center text-gray-500">로딩 중...</td></tr>
            : users?.map(u => (
              <tr key={u.id} className="border-b dark:border-gray-700">
                <td className="p-3 text-gray-900 dark:text-white">{u.name}</td>
                <td className="p-3 text-gray-500">{u.email}</td>
                <td className="p-3">
                  <select value={u.role} onChange={e => setConfirm({ id: u.id, role: e.target.value as Role })}
                    data-testid={`role-select-${u.id}`} className="px-2 py-1 border rounded text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="admin">Admin</option><option value="staff">Staff</option><option value="customer">Customer</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmDialog open={!!confirm} onConfirm={handleConfirm} onCancel={() => setConfirm(null)}
        title="역할 변경" description={`이 사용자의 역할을 ${confirm?.role}로 변경하시겠습니까?`} confirmLabel="변경" />
    </div>
  )
}
