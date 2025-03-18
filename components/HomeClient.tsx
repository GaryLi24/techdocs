'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  TextField,
  Select,
  MenuItem,
  Box,
  Container,
  SelectChangeEvent,
  FormControl,
  Paper,
  useTheme,
  alpha,
  List,
  ListItem,
  Link as MuiLink,
} from '@mui/material'
import LooksOneIcon from '@mui/icons-material/LooksOne'
import LooksTwoIcon from '@mui/icons-material/LooksTwo'
import LanguageIcon from '@mui/icons-material/Language'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import SailingIcon from '@mui/icons-material/Sailing'
import EngineeringIcon from '@mui/icons-material/Engineering'
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest'
import { useRouter } from 'next/navigation'

// 保持接口定义
interface Category {
  id: string
  title: string
  description: string
  slug: string
  contentPath?: string
}

interface Role {
  id: string
  name: string
  description: string
  icon: string
  categories: Category[]
}

// 定义搜索结果类型
interface SearchResult {
  category: Category
  titleMatch: boolean // 文档标题是否匹配
  headingMatches: {
    // 匹配的Markdown标题
    level: number
    text: string
    index: number
  }[]
}

// 角色图标渲染函数
const getRoleIcon = (roleId: string) => {
  switch (roleId) {
    case 'crew':
      return <SailingIcon sx={{ fontSize: 28 }} />
    case 'maintenance':
      return <EngineeringIcon sx={{ fontSize: 28 }} />
    case 'smart-ship':
      return <SettingsSuggestIcon sx={{ fontSize: 28 }} />
    default:
      return <SailingIcon sx={{ fontSize: 28 }} />
  }
}

// 提取Markdown中的标题
const extractMarkdownHeadings = (content: string) => {
  if (!content) return []

  // 匹配一级和二级标题（# 和 ##）
  const headingRegex = /^(#{1,2})\s+(.+)$/gm
  const headings: { level: number; text: string; index: number }[] = []

  let match
  while ((match = headingRegex.exec(content)) !== null) {
    headings.push({
      level: match[1].length, // # 的数量表示标题级别
      text: match[2].trim(), // 标题内容
      index: match.index, // 标题在文本中的位置
    })
  }

  return headings
}

// 组件接收服务端获取的数据
export default function HomeClient({ initialRoles }: { initialRoles: Role[] }) {
  const router = useRouter()
  const theme = useTheme()
  const [roles] = useState<Role[]>(initialRoles)
  const [selectedRole, setSelectedRole] = useState<Role | null>(
    initialRoles.length > 0 ? initialRoles[0] : null
  )
  const [language, setLanguage] = useState<'zh' | 'en'>('zh')

  // 添加搜索状态
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [markdownContents, setMarkdownContents] = useState<{
    [key: string]: string
  }>({})

  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  // 添加一个标记，确保此 effect 只运行一次
  const didLoad = useRef(false)

  // 使用 useRef 存储进行中请求的映射
  const requestInProgressRef = useRef(new Map())

  // 自动清理机制防止存储溢出
  useEffect(() => {
    // 清理过期缓存，避免移动设备存储溢出
    const cleanupStorage = () => {
      try {
        const MAX_CACHE_ITEMS = 20 // 最多保留项目数
        const keys = Object.keys(localStorage)
          .filter(k => k.startsWith('md_'))
          .sort((a, b) => {
            // 获取上次访问时间
            const timeA = localStorage.getItem(`${a}_access_time`) || '0'
            const timeB = localStorage.getItem(`${b}_access_time`) || '0'
            return Number(timeB) - Number(timeA) // 降序排列
          })

        // 删除超出限制的项目
        if (keys.length > MAX_CACHE_ITEMS) {
          keys.slice(MAX_CACHE_ITEMS).forEach(key => {
            localStorage.removeItem(key)
            localStorage.removeItem(`${key}_access_time`)
          })
          console.log(`已清理 ${keys.length - MAX_CACHE_ITEMS} 个旧缓存项`)
        }
      } catch (e) {
        console.warn('清理缓存失败:', e)
      }
    }

    // 应用启动时执行清理
    cleanupStorage()
  }, [])

  // 加载 Markdown 内容
  const loadMarkdownContent = useCallback(async (path: string) => {
    // 使用唯一键以避免冲突
    const storageKey = `md-${path.replace(/\//g, '_')}`

    // 1. 检查localStorage (持久化缓存)
    try {
      const cachedContent = localStorage.getItem(storageKey)
      if (cachedContent) {
        console.log(`从localStorage加载: ${path}`)
        return cachedContent
      }
    } catch (e) {
      console.warn('无法访问localStorage:', e)
    }

    // 2. 检查会话存储 (备用)
    try {
      const cachedContent = sessionStorage.getItem(`md-cache-${path}`)
      if (cachedContent) {
        return cachedContent
      }
    } catch (e) {
      console.warn('无法访问sessionStorage:', e)
      // 继续执行，不依赖缓存
    }

    // 3. 检查重复请求 - 使用ref而不是组件作用域变量
    const requestInProgress = requestInProgressRef.current
    if (requestInProgress.has(path)) {
      return await requestInProgress.get(path)
    }

    // 4. 创建新请求
    const requestPromise = (async () => {
      try {
        // 设置请求超时，移动环境下避免长时间等待
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时

        const response = await fetch(`/${path}`, {
          cache: 'force-cache',
          headers: {
            'Cache-Control': 'max-age=2592000',
          },
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          const content = await response.text()
          // 移动优化: 大文件处理
          if (content.length > 100000) {
            // 大约100KB
            // 移除不必要的空白行和注释以减小体积
            const optimizedContent = content
              .replace(/\n\s*\n/g, '\n\n') // 合并多余空行
              .replace(/<!--[\s\S]*?-->/g, '') // 移除HTML注释

            try {
              localStorage.setItem(storageKey, optimizedContent)
            } catch (e) {
              console.warn('无法存储到localStorage - 文件可能过大:', e)

              // 尝试使用压缩存储大文件
              try {
                const compressedContent = optimizedContent.substring(0, 500000) // 限制大小
                localStorage.setItem(storageKey, compressedContent)
              } catch (e2) {
                console.error('存储失败:', e2)
              }
            }
            return optimizedContent
          } else {
            // 小文件直接存储
            try {
              localStorage.setItem(storageKey, content)
            } catch (e) {
              console.warn('无法存储到localStorage:', e)
            }
            return content
          }
        }
        console.error(`加载失败: ${path}, 状态: ${response.status}`)
        return ''
      } catch (error: any) {
        if (error?.name === 'AbortError') {
          console.warn(`请求超时: ${path}`)
          // 尝试加载之前的缓存版本作为后备
          try {
            const oldCacheKeys = Object.keys(localStorage).filter(
              key =>
                key.includes(path.replace(/\//g, '_')) && key !== storageKey
            )

            if (oldCacheKeys.length > 0) {
              return localStorage.getItem(oldCacheKeys[0]) || ''
            }
          } catch (e) {}
        }
        console.error(`加载错误: ${path}:`, error)
        return ''
      } finally {
        // 请求完成后从映射中删除
        requestInProgress.delete(path)
      }
    })()

    // 存储请求Promise
    requestInProgress.set(path, requestPromise)
    return requestPromise
  }, [])

  // 处理角色变更
  const handleRoleChange = (event: SelectChangeEvent<string>) => {
    const roleId = event.target.value
    const newRole = roles.find(role => role.id === roleId)
    setSelectedRole(newRole || null)
    // 角色变更时重置搜索
    setSearchQuery('')
  }

  // 处理搜索输入变化 - 新增函数
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value
    setSearchQuery(query)
  }

  // 初始加载所有 Markdown 文件
  useEffect(() => {
    const loadAllMarkdown = async () => {
      if (roles.length === 0 || didLoad.current) return
      didLoad.current = true

      // 先检查已有的内容避免重复加载
      if (Object.keys(markdownContents).length > 0) return

      const contents: { [key: string]: string } = {}
      const loadPromises: Promise<void>[] = []

      // 改为并行请求提高效率
      for (const role of roles) {
        for (const category of role.categories) {
          if (
            category.contentPath &&
            !requestInProgressRef.current.has(category.contentPath)
          ) {
            loadPromises.push(
              loadMarkdownContent(category.contentPath).then(content => {
                contents[category.id] = content
              })
            )
          }
        }
      }

      // 等待所有加载完成
      await Promise.all(loadPromises)
      setMarkdownContents(contents)
    }

    loadAllMarkdown()
  }, [roles]) // 只在 roles 变化时重新加载

  // 使用效果钩子实现实时搜索 - 新增
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (selectedRole) {
        if (searchQuery.trim() === '') {
          setFilteredCategories(selectedRole.categories)
          setSearchResults([])
        } else {
          const results: SearchResult[] = []

          selectedRole.categories.forEach(category => {
            // 检查标题匹配
            const titleMatch = category.title
              .toLowerCase()
              .includes(searchQuery.toLowerCase())

            const descriptionMatch = category.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase())

            // 检查Markdown内容中的标题匹配
            const content = markdownContents[category.id] || ''
            const headings = extractMarkdownHeadings(content)

            const headingMatches = headings.filter(heading =>
              heading.text.toLowerCase().includes(searchQuery.toLowerCase())
            )

            // 如果有任何匹配，添加到结果中
            if (titleMatch || descriptionMatch || headingMatches.length > 0) {
              results.push({
                category,
                titleMatch: titleMatch || descriptionMatch,
                headingMatches,
              })
            }
          })

          setSearchResults(results)
          setFilteredCategories(results.map(r => r.category))
        }
      }
    }, 800)

    return () => clearTimeout(searchTimeout)
  }, [searchQuery, selectedRole, markdownContents])

  // 初始化过滤分类
  useEffect(() => {
    if (selectedRole) {
      setFilteredCategories(selectedRole.categories)
    }
  }, [selectedRole])

  // 切换语言
  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'zh' ? 'en' : 'zh'))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部栏 - 轻微现代化 */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: 'white',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar className="flex justify-between">
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            帮助中心
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: theme.palette.primary.main,
              }}
            >
              {language === 'zh' ? 'EN' : '中文'}
            </Typography>
            <IconButton onClick={toggleLanguage} aria-label="切换语言">
              <LanguageIcon color="primary" />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            mb: 4,
            overflow: 'hidden',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            boxShadow: `0 2px 10px ${alpha(theme.palette.common.black, 0.05)}`,
          }}
        >
          {/* 控制区域头部 - 包含角色选择 */}
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
              bgcolor: alpha(theme.palette.primary.light, 0.05),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              {selectedRole && (
                <>
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      mr: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.9),
                      boxShadow: `0 2px 6px ${alpha(
                        theme.palette.primary.main,
                        0.4
                      )}`,
                    }}
                  >
                    {getRoleIcon(selectedRole.id)}
                  </Avatar>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 500, mr: 2 }}
                  >
                    {selectedRole.name}
                  </Typography>
                </>
              )}

              <FormControl variant="standard" sx={{ minWidth: 90 }}>
                <Select
                  value={selectedRole?.id || ''}
                  onChange={handleRoleChange}
                  displayEmpty
                  renderValue={value => (value ? '切换角色' : '选择角色')}
                  sx={{
                    '& .MuiSelect-select': {
                      color: theme.palette.primary.main,
                      fontWeight: 500,
                      py: 0,
                    },
                    '&:before, &:after': {
                      display: 'none',
                    },
                  }}
                >
                  {roles.map(role => (
                    <MenuItem key={role.id} value={role.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            mr: 1,
                            bgcolor: alpha(theme.palette.primary.main, 0.7),
                          }}
                        >
                          {getRoleIcon(role.id)}
                        </Avatar>
                        <Typography>{role.name}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Typography
              variant="subtitle2"
              sx={{
                color: 'text.secondary',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              {selectedRole?.description || '选择您的角色查看相关文档'}
            </Typography>
          </Box>

          {/* 搜索区域 - 改为实时搜索 */}
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              variant="standard"
              placeholder={'请输入您的问题'}
              label={`在${selectedRole!.name}文档中搜索...`}
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{
                mx: 1,
                '& .MuiInputBase-root': {
                  pr: 2,
                  py: 0,
                  '&:focus-within': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    borderRadius: 1,
                  },
                },
              }}
            />
          </Box>
        </Paper>

        {/* 文档列表区域 - 使用过滤后的分类 */}
        {selectedRole && (
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: 500,
                pl: 1,
                borderLeft: `4px solid ${theme.palette.primary.main}`,
              }}
            >
              {searchQuery ? `搜索结果` : `${selectedRole.name}文档`}
              {searchQuery && (
                <Typography
                  component="span"
                  variant="body2"
                  sx={{ ml: 2, color: 'text.secondary' }}
                >
                  找到 {filteredCategories.length} 个结果
                </Typography>
              )}
            </Typography>

            {/* 修改这里的条件判断逻辑，区分无搜索和有搜索但无结果的情况 */}
            {searchQuery === '' ? (
              // 无搜索时显示所有文档
              filteredCategories.map((category, index) => (
                <Box
                  key={category.id}
                  component="a"
                  href={`/docs/${category.slug}`}
                  onMouseEnter={() => {
                    router.prefetch(`/docs/${category.slug}`)
                  }}
                  sx={{
                    display: 'block',
                    textDecoration: 'none',
                    mb: 2,
                    color: 'inherit',
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      overflow: 'hidden',
                      borderRadius: 2,
                      border: `1px solid ${alpha(
                        theme.palette.primary.main,
                        0.1
                      )}`,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${alpha(
                          theme.palette.common.black,
                          0.08
                        )}`,
                        backgroundColor: alpha(
                          theme.palette.primary.light,
                          0.05
                        ),
                        '& .arrow-icon': {
                          transform: 'translateX(3px)',
                          opacity: 1,
                        },
                      },
                    }}
                  >
                    <Box
                      sx={{
                        px: 3,
                        py: 2,
                        backgroundColor: 'transparent',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          sx={{
                            fontWeight: 500,
                            color: theme.palette.text.primary,
                            mb: 1,
                            '&:hover': {
                              color: theme.palette.primary.main,
                            },
                          }}
                        >
                          {category.title}
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {category.description}
                        </Typography>
                      </Box>

                      <ArrowForwardIcon
                        className="arrow-icon"
                        fontSize="small"
                        sx={{
                          color: theme.palette.primary.main,
                          opacity: 0.6,
                          transition: 'transform 0.3s, opacity 0.2s',
                          ml: 2,
                        }}
                      />
                    </Box>
                  </Paper>
                </Box>
              ))
            ) : searchResults.length > 0 ? (
              // 有搜索，且有结果
              searchResults.map((result, index) => (
                <Box key={result.category.id} sx={{ mb: 2 }}>
                  {/* 如果文档标题匹配，显示完整的文档卡片 */}
                  {result.titleMatch && (
                    <Box
                      component="a"
                      href={`/docs/${result.category.slug}`}
                      sx={{
                        display: 'block',
                        textDecoration: 'none',
                        mb: result.headingMatches.length > 0 ? 1 : 2,
                        color: 'inherit',
                      }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          overflow: 'hidden',
                          borderRadius: 2,
                          border: `1px solid ${alpha(
                            theme.palette.primary.main,
                            0.1
                          )}`,
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 4px 12px ${alpha(
                              theme.palette.common.black,
                              0.08
                            )}`,
                            backgroundColor: alpha(
                              theme.palette.primary.light,
                              0.05
                            ),
                            '& .arrow-icon': {
                              transform: 'translateX(3px)',
                              opacity: 1,
                            },
                          },
                        }}
                      >
                        <Box
                          sx={{
                            px: 3,
                            py: 2,
                            backgroundColor: 'transparent',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              sx={{
                                fontWeight: 500,
                                color: theme.palette.text.primary,
                                mb: 1,
                                '&:hover': {
                                  color: theme.palette.primary.main,
                                },
                              }}
                            >
                              {result.category.title}
                            </Typography>

                            <Typography
                              variant="body2"
                              sx={{
                                color: 'text.secondary',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {result.category.description}
                            </Typography>
                          </Box>

                          <ArrowForwardIcon
                            className="arrow-icon"
                            fontSize="small"
                            sx={{
                              color: theme.palette.primary.main,
                              opacity: 0.6,
                              transition: 'transform 0.3s, opacity 0.2s',
                              ml: 2,
                            }}
                          />
                        </Box>
                      </Paper>
                    </Box>
                  )}

                  {/* 如果有标题匹配，显示匹配的标题列表 */}
                  {result.headingMatches.length > 0 && (
                    <Paper
                      elevation={0}
                      sx={{
                        mt: result.titleMatch ? 1 : 0,
                        mb: 0,
                        overflow: 'hidden',
                        borderRadius: 2,
                        border: `1px solid ${alpha(
                          theme.palette.info.light,
                          0.3
                        )}`,
                        backgroundColor: alpha(theme.palette.info.light, 0.03),
                      }}
                    >
                      <Box sx={{ p: 2 }}>
                        {!result.titleMatch && (
                          <Typography
                            variant="subtitle2"
                            sx={{
                              mb: 1.5,
                              color: theme.palette.text.secondary,
                            }}
                          >
                            在{' '}
                            <MuiLink
                              href={`/docs/${result.category.slug}`}
                              sx={{
                                fontWeight: 500,
                                color: theme.palette.primary.main,
                                textDecoration: 'none',
                                '&:hover': { textDecoration: 'underline' },
                              }}
                            >
                              {result.category.title}
                            </MuiLink>{' '}
                            中找到:
                          </Typography>
                        )}

                        <List dense disablePadding>
                          {result.headingMatches.map((heading, i) => (
                            <ListItem
                              key={i}
                              disablePadding
                              sx={{
                                mb: 0.5,
                                pl: heading.level > 1 ? 2 : 0,
                              }}
                            >
                              <MuiLink
                                href={`/docs/${
                                  result.category.slug
                                }#${heading.text
                                  .replace(/\s+/g, '-')
                                  .toLowerCase()}`}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  color: theme.palette.text.primary,
                                  textDecoration: 'none',
                                  py: 0.5,
                                  '&:hover': {
                                    color: theme.palette.primary.main,
                                  },
                                }}
                              >
                                {heading.level === 1 ? (
                                  <LooksOneIcon
                                    fontSize="small"
                                    sx={{ mr: 1, opacity: 0.7 }}
                                  />
                                ) : (
                                  <LooksTwoIcon
                                    fontSize="small"
                                    sx={{ mr: 1, opacity: 0.7 }}
                                  />
                                )}
                                <Typography variant="body2">
                                  {heading.text}
                                </Typography>
                              </MuiLink>
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </Paper>
                  )}
                </Box>
              ))
            ) : (
              // 有搜索，但无结果时显示提示
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.background.paper, 0.7),
                  border: `1px dashed ${alpha(theme.palette.divider, 0.8)}`,
                }}
              >
                <Typography color="text.secondary" sx={{ mb: 1 }}>
                  没有找到匹配"{searchQuery}"的文档
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  请尝试其他关键词或浏览全部文档
                </Typography>
              </Paper>
            )}
          </Box>
        )}
      </Container>
    </div>
  )
}
