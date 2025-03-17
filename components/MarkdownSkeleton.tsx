'use client'

import { Box, Skeleton } from '@mui/material'

export default function MarkdownSkeleton() {
  return (
    <Box sx={{ my: 2 }}>
      <Skeleton variant="text" sx={{ height: 40, mb: 2 }} />
      <Skeleton variant="text" sx={{ height: 20, mb: 1, width: '90%' }} />
      <Skeleton variant="text" sx={{ height: 20, mb: 1, width: '85%' }} />
      <Skeleton variant="text" sx={{ height: 20, mb: 3, width: '70%' }} />

      <Skeleton variant="text" sx={{ height: 30, mb: 1 }} />
      <Skeleton variant="text" sx={{ height: 20, mb: 1, width: '95%' }} />
      <Skeleton variant="text" sx={{ height: 20, mb: 1, width: '92%' }} />
      <Skeleton variant="text" sx={{ height: 20, mb: 3, width: '88%' }} />

      <Skeleton
        variant="rectangular"
        sx={{ height: 100, mb: 2, borderRadius: 1 }}
      />

      <Skeleton variant="text" sx={{ height: 20, mb: 1, width: '91%' }} />
      <Skeleton variant="text" sx={{ height: 20, mb: 1, width: '84%' }} />
      <Skeleton variant="text" sx={{ height: 20, mb: 1, width: '78%' }} />
    </Box>
  )
}
