import { promises as fs } from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import { Metadata, ResolvingMetadata } from 'next'
import Link from 'next/link'
import { Container, Typography, Box, Paper, Breadcrumbs } from '@mui/material'
import DocumentTitle from '@/components/DocumentTitle'
import dynamic from 'next/dynamic'

// 使用动态导入渐进式渲染组件
const ProgressiveMarkdown = dynamic(
  () => import('@/components/ProgressiveMarkdown'),
  {
    loading: () => (
      <Box sx={{ my: 4 }}>
        <Typography>加载文档中...</Typography>
      </Box>
    ),
    ssr: true, // 允许服务器端渲染初始版本
  }
)

// 动态生成元数据
export async function generateMetadata(
  { params }: { params: any },
  parent: ResolvingMetadata
): Promise<Metadata> {
  // 读取数据文件
  const filePath = path.join(process.cwd(), 'public', 'data.json')
  const fileContents = await fs.readFile(filePath, 'utf8')
  const data = JSON.parse(fileContents)

  // 找到当前文档
  const resolvedParams = await params
  const slugString = Array.isArray(resolvedParams.slug)
  let documentTitle = '文档详情'

  // 查找匹配的文档
  for (const role of data.roles) {
    for (const category of role.categories) {
      if (category.slug === slugString) {
        documentTitle = category.title
        break
      }
    }
  }

  return {
    title: `${documentTitle}`,
  }
}

// 静态生成所有可能的路径
export async function generateStaticParams() {
  const filePath = path.join(process.cwd(), 'public', 'data.json')
  const fileContents = await fs.readFile(filePath, 'utf8')
  const data = JSON.parse(fileContents)

  const paths = []

  // 为每个分类生成路径
  for (const role of data.roles) {
    for (const category of role.categories) {
      const slugArray = category.slug.split('/')
      paths.push({ slug: slugArray })
    }
  }

  return paths
}

export default async function ManualPage({ params }: { params: any }) {
  // 获取数据
  const filePath = path.join(process.cwd(), 'public', 'data.json')
  const fileContents = await fs.readFile(filePath, 'utf8')
  const data = JSON.parse(fileContents)

  // 查找当前内容
  const resolvedParams = await params
  const slugString = Array.isArray(resolvedParams.slug)
    ? resolvedParams.slug.join('/')
    : ''
  let currentDocument = null
  let currentRole = null

  for (const role of data.roles) {
    for (const category of role.categories) {
      if (category.slug === slugString) {
        currentDocument = category
        currentRole = role
        break
      }
    }
    if (currentDocument) break
  }

  // 如果找不到文档，返回404
  if (!currentDocument || !currentRole) {
    notFound()
  }

  // 加载Markdown内容
  let markdownContent = ''
  if (currentDocument.contentPath) {
    try {
      const contentPath = path.join(
        process.cwd(),
        'public',
        currentDocument.contentPath
      )
      markdownContent = await fs.readFile(contentPath, 'utf8')
    } catch (error) {
      console.error(`Error loading markdown file: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Container maxWidth="md">
        {/* 面包屑导航 */}
        <Breadcrumbs aria-label="breadcrumb" className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline">
            首页
          </Link>
          <Typography color="text.primary">{currentRole.name}</Typography>
          <Typography color="text.primary">{currentDocument.title}</Typography>
        </Breadcrumbs>

        {/* 文档内容 - 使用渐进式渲染 */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 2,
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
          }}
        >
          {/* 使用客户端组件处理标题 */}
          <DocumentTitle title={currentDocument.title} />

          {currentDocument.description && (
            <Typography
              variant="body1"
              sx={{
                mb: 4,
                color: 'text.secondary',
                pb: 3,
                borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
              }}
            >
              {currentDocument.description}
            </Typography>
          )}

          {/* 使用渐进式Markdown渲染 */}
          <Box sx={{ mt: 3 }}>
            <ProgressiveMarkdown content={markdownContent} />
          </Box>
        </Paper>

        {/* 返回按钮 */}
        <Box sx={{ mt: 4 }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              color: '#3a86ff',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            ← 返回帮助中心
          </Link>
        </Box>
      </Container>
    </div>
  )
}
