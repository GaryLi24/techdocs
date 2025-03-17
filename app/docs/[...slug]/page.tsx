import { promises as fs } from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import { Metadata, ResolvingMetadata } from 'next'
import { Container, Typography, Box, Paper } from '@mui/material'
import DocumentTitle from '@/components/DocumentTitle'
import dynamic from 'next/dynamic'
import DocNavigation from '@/components/DocNavigation'

// 使用动态导入渐进式渲染组件
const ProgressiveMarkdown = dynamic(
  () => import('@/components/ProgressiveMarkdown'),
  {
    loading: () => (
      <Box
        sx={{
          my: 4,
          p: 3,
          border: '1px dashed rgba(0,0,0,0.1)',
          borderRadius: 1,
          textAlign: 'center',
        }}
      >
        <Typography
          variant="body1"
          sx={{ color: 'text.secondary', fontWeight: 500 }}
        >
          文档加载中...
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Box
            sx={{
              width: '60%',
              height: '4px',
              bgcolor: '#f0f0f0',
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: '30%',
                bgcolor: 'primary.main',
                animation: 'pulse 1.5s infinite',
                '@keyframes pulse': {
                  '0%': { left: '-30%' },
                  '100%': { left: '100%' },
                },
              }}
            />
          </Box>
        </Box>
      </Box>
    ),
    ssr: true, // 改为客户端渲染，避免部分加载问题
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
    <div className="min-h-screen bg-gray-50 pb-4">
      <DocNavigation
        markdownContent={markdownContent}
        title={currentDocument.title}
        roleName={currentRole.name}
      />
      <Container maxWidth="md">
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
          <Box sx={{ mt: 1, minHeight: 300 }}>
            {' '}
            {/* 添加最小高度避免布局跳动 */}
            <ProgressiveMarkdown content={markdownContent} />
          </Box>
        </Paper>
      </Container>
    </div>
  )
}
