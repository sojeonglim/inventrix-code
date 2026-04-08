import { SkeletonPlaceholder } from '@carbon/react'

export function Skeleton({ width = '100%', height = '1rem' }: { width?: string; height?: string }) {
  return <SkeletonPlaceholder style={{ width, height }} />
}
