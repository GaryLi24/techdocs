'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Container,
  SelectChangeEvent,
  InputLabel,
  FormControl,
  Paper,
  useTheme,
  alpha,
  Card,
  CardContent,
  Divider,
  CircularProgress,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import LanguageIcon from '@mui/icons-material/Language'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import SailingIcon from '@mui/icons-material/Sailing'
import EngineeringIcon from '@mui/icons-material/Engineering'
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest'

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

// 组件接收服务端获取的数据
export default function HomeClient({ initialRoles }: { initialRoles: Role[] }) {
  const theme = useTheme()
  const [roles] = useState<Role[]>(initialRoles)
  const [selectedRole, setSelectedRole] = useState<Role | null>(
    initialRoles.length > 0 ? initialRoles[0] : null
  )
  const [language, setLanguage] = useState<'zh' | 'en'>('zh')

  // 添加搜索状态
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [markdownContents, setMarkdownContents] = useState<{
    [key: string]: string
  }>({})

  // 加载 Markdown 内容
  const loadMarkdownContent = useCallback(async (path: string) => {
    try {
      const response = await fetch(`/${path}`)
      if (response.ok) {
        return await response.text()
      }
      return ''
    } catch (error) {
      console.error(`Error loading markdown from ${path}:`, error)
      return ''
    }
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

    // 显示搜索指示器
    if (query) {
      setIsSearching(true)
    }
  }

  // 初始加载所有 Markdown 文件
  useEffect(() => {
    const loadAllMarkdown = async () => {
      if (roles.length === 0) return

      const contents: { [key: string]: string } = {}

      for (const role of roles) {
        for (const category of role.categories) {
          if (category.contentPath) {
            contents[category.id] = await loadMarkdownContent(
              category.contentPath
            )
          }
        }
      }

      setMarkdownContents(contents)
    }

    loadAllMarkdown()
  }, [roles, loadMarkdownContent])

  // 使用效果钩子实现实时搜索 - 新增
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (selectedRole) {
        if (searchQuery.trim() === '') {
          // 无查询时显示全部
          setFilteredCategories(selectedRole.categories)
        } else {
          // 增强搜索 - 包含 Markdown 内容
          const filtered = selectedRole.categories.filter(category => {
            // 搜索标题和描述
            const titleMatch = category.title
              .toLowerCase()
              .includes(searchQuery.toLowerCase())

            const descriptionMatch = category.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase())

            // 搜索 Markdown 内容
            const content = markdownContents[category.id] || ''
            const contentMatch = content
              .toLowerCase()
              .includes(searchQuery.toLowerCase())

            return titleMatch || descriptionMatch || contentMatch
          })

          setFilteredCategories(filtered)
        }
      }
      setIsSearching(false)
    }, 300)

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

  // 创建一个函数获取匹配的内容片段
  const getMatchingSnippet = (
    content: string,
    query: string,
    snippetLength = 100
  ) => {
    if (!content || !query) return ''

    const lowerContent = content.toLowerCase()
    const lowerQuery = query.toLowerCase()
    const index = lowerContent.indexOf(lowerQuery)

    if (index === -1) return ''

    // 计算片段的开始和结束位置
    const start = Math.max(0, index - snippetLength / 2)
    const end = Math.min(
      content.length,
      index + query.length + snippetLength / 2
    )

    let snippet = content.slice(start, end).trim()

    // 添加省略号
    if (start > 0) snippet = '...' + snippet
    if (end < content.length) snippet = snippet + '...'

    return snippet
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

        {/* 手风琴组件 - 使用过滤后的分类 */}
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

            {filteredCategories.length > 0 ? (
              filteredCategories.map((category, index) => (
                <Box
                  key={category.id}
                  component="a"
                  href={`/manual/${category.slug}`}
                  sx={{
                    display: 'block',
                    textDecoration: 'none',
                    mb: 1,
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
                      transition:
                        'transform 0.2s, box-shadow 0.2s background-color 0.2s',
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
                      // 高亮匹配项
                      ...(searchQuery && {
                        border: `1px solid ${alpha(
                          theme.palette.primary.main,
                          0.3
                        )}`,
                      }),
                    }}
                  >
                    <Box
                      sx={{
                        px: 3,
                        py: 1,
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
                            my: 1,
                            display: 'flex',
                            alignItems: 'center',
                            '&:hover': { color: theme.palette.primary.main },
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
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {category.description}
                        </Typography>
                      </Box>

                      <ArrowForwardIcon
                        fontSize="small"
                        className="arrow-icon"
                        sx={{
                          color: theme.palette.primary.main,
                          transition: 'transform 0.3s, opacity 0.2s',
                          opacity: 0.6,
                          ml: 2,
                        }}
                      />
                    </Box>
                  </Paper>
                </Box>
              ))
            ) : (
              // 无结果时显示提示
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
