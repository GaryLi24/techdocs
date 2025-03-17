'use client'

import { Typography, useTheme } from '@mui/material'

export default function DocumentTitle({ title }: { title: string }) {
  const theme = useTheme()

  return (
    <Typography
      variant="h4"
      component="h1"
      sx={{
        mb: 3,
        pb: 2,
        borderBottom: 'none', // 移除原灰色边线
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%', // 全宽
          height: '1px', // 细线
          background: `linear-gradient(to right, ${theme.palette.primary.main}, rgba(0,0,0,0.05))`,
        },
      }}
    >
      {title}
    </Typography>
  )
}
