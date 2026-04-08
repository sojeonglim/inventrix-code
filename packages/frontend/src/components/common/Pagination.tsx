import { Pagination as CarbonPagination } from '@carbon/react'

interface Props { page: number; totalItems: number; pageSize: number; onPageChange: (page: number) => void }

export function Pagination({ page, totalItems, pageSize, onPageChange }: Props) {
  if (totalItems <= pageSize) return null
  return (
    <CarbonPagination page={page} totalItems={totalItems} pageSize={pageSize} pageSizes={[10, 20, 50]}
      onChange={({ page: p }: { page: number }) => onPageChange(p)} data-testid="pagination" />
  )
}
