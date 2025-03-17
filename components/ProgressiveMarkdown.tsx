'use client'

import { useState, useEffect } from 'react'
import { Box, Skeleton } from '@mui/material'
import MarkdownContent from '@/components/MarkdownContent'
import MarkdownSkeleton from './MarkdownSkeleton'

// 渐进式 Markdown 加载组件
export default function ProgressiveMarkdown({ content }: { content: string }) {
  const [isLoading, setIsLoading] = useState(true)
  const [renderedContent, setRenderedContent] = useState('')

  useEffect(() => {
    // 显示加载状态
    setIsLoading(true)

    // 模拟处理时间，这样用户能看到加载状态
    const timer = setTimeout(() => {
      setRenderedContent(content)
      setIsLoading(false)
    }, 500) // 添加少量延迟以确保加载状态可见

    return () => clearTimeout(timer)
  }, [content])

  return (
    <Box>
      {isLoading ? (
        <MarkdownSkeleton />
      ) : (
        <MarkdownContent content={renderedContent} />
      )}
    </Box>
  )
}
