'use client'

import { useState, useEffect } from 'react'
import {
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Divider,
  ListItemButton,
  useTheme,
  alpha,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Link from 'next/link'
import { createAnchorId } from '@/utils'

interface DocNavigationProps {
  markdownContent: string
  title: string
  roleName: string
}

// 提取 Markdown 标题的函数
const extractHeadings = (content: string) => {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm
  const headings: { level: number; text: string; anchor: string }[] = []

  let match
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const anchor = createAnchorId(text)

    if (level <= 3) {
      headings.push({ level, text, anchor })
    }
  }

  return headings
}

export default function DocNavigation({
  markdownContent,
  title,
  roleName,
}: DocNavigationProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const theme = useTheme()

  // 添加滚动处理状态 (可选，用于实现滚动时的阴影效果)
  const [scrolled, setScrolled] = useState(false)

  // 监听滚动事件 (可选)
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const headings = extractHeadings(markdownContent)

  return (
    <>
      {/* 顶部导航 */}
      <Box
        sx={{
          position: 'fixed', // 固定在页面顶部
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1100, // 确保在其他内容之上
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: 56,
          px: { xs: 1, sm: 2 },
          backgroundColor: 'white', // 添加背景色
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: scrolled ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', // 滚动时添加阴影
          transition: 'box-shadow 0.3s ease',
        }}
      >
        {/* 左侧返回按钮 */}
        <Link
          href="/"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <IconButton
            size="small"
            sx={{
              color: theme.palette.primary.main,
              mr: 1,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 500,
              display: { xs: 'none', sm: 'block' },
            }}
          >
            返回
          </Typography>
        </Link>

        {/* 右侧菜单按钮 */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* 显示角色和文档名 */}
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mr: 2,
              display: { xs: 'none', sm: 'block' },
            }}
          >
            {roleName} / {title}
          </Typography>

          <IconButton
            onClick={() => setDrawerOpen(true)}
            sx={{
              color: theme.palette.primary.main,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      </Box>

      {/* 右侧抽屉菜单 */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 280, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
            目录
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {headings.length > 0 ? (
            <List dense disablePadding>
              {headings.map((heading, index) => (
                <ListItem
                  key={index}
                  disablePadding
                  sx={{
                    pl: (heading.level - 1) * 2,
                    mb: 0.5,
                  }}
                >
                  <ListItemButton
                    component="a"
                    href={`#${heading.anchor}`}
                    onClick={event => {
                      event.preventDefault()
                      setDrawerOpen(false)

                      // 查找目标元素
                      const targetElement = document.getElementById(
                        heading.anchor
                      )
                      if (targetElement) {
                        // 计算滚动位置，考虑顶部导航栏高度
                        const topOffset = 80 // 导航栏高度 + 一些额外空间
                        const elementPosition =
                          targetElement.getBoundingClientRect().top
                        const offsetPosition =
                          elementPosition + window.pageYOffset - topOffset

                        // 平滑滚动
                        window.scrollTo({
                          top: offsetPosition,
                          behavior: 'smooth',
                        })
                      }
                    }}
                    dense
                    sx={{
                      borderRadius: 1,
                      py: 0.5,
                    }}
                  >
                    <ListItemText
                      primary={heading.text}
                      primaryTypographyProps={{
                        variant: heading.level === 1 ? 'body1' : 'body2',
                        fontWeight: heading.level === 1 ? 500 : 400,
                        sx: {
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', fontStyle: 'italic' }}
            >
              此文档没有章节标题
            </Typography>
          )}
        </Box>
      </Drawer>
    </>
  )
}
