'use client'

import { useState, useEffect } from 'react'
import { Box, Skeleton } from '@mui/material'
import MarkdownContent from '@/components/MarkdownContent'

// 渐进式 Markdown 加载组件
export default function ProgressiveMarkdown({ content }: { content: string }) {
  const [isLoading, setIsLoading] = useState(true)
  const [renderedContent, setRenderedContent] = useState('')
  const [showFullContent, setShowFullContent] = useState(false)

  useEffect(() => {
    // 立即显示骨架屏
    setIsLoading(true)

    // 第一步：立即渲染内容的预览部分（前1000个字符）
    const previewContent = content.substring(0, 1000)
    setRenderedContent(previewContent)

    // 第二步：短暂延迟后渲染完整内容（让UI有时间响应）
    const timer = setTimeout(() => {
      setRenderedContent(content)
      setShowFullContent(true)
      setIsLoading(false)
    }, 50) // 很短的延迟，只为释放主线程

    return () => clearTimeout(timer)
  }, [content])

  return (
    <Box sx={{ position: 'relative', minHeight: 300 }}>
      {/* 加载骨架屏 */}
      {isLoading && (
        <Box
          sx={{
            opacity: showFullContent ? 0.5 : 1,
            transition: 'opacity 0.3s',
          }}
        >
          <Skeleton variant="text" height={40} sx={{ mb: 2 }} />
          <Skeleton variant="text" height={30} width="90%" sx={{ mb: 1 }} />
          <Skeleton variant="text" height={30} width="80%" sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
          <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" height={20} width="70%" />
        </Box>
      )}

      {/* 实际内容，在加载时透明度较低 */}
      <Box
        sx={{
          opacity: isLoading ? 0.3 : 1,
          transition: 'opacity 0.5s',
          position: isLoading ? 'absolute' : 'relative',
          top: 0,
          left: 0,
          width: '100%',
        }}
      >
        <MarkdownContent content={renderedContent} />
      </Box>
    </Box>
  )
}
