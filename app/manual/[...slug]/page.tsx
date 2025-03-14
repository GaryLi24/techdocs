// app/manual/[...slug]/page.tsx
import { promises as fs } from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import { Metadata, ResolvingMetadata } from 'next'
import Link from 'next/link'
import { Container, Typography, Box, Paper, Breadcrumbs } from '@mui/material'

// 动态生成元数据
export async function generateMetadata(
  { params }: { params: { slug: string[] } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  // 读取数据文件
  const filePath = path.join(process.cwd(), 'public', 'data.json')
  const fileContents = await fs.readFile(filePath, 'utf8')
  const data = JSON.parse(fileContents)

  // 找到当前文档
  const slugString = params.slug.join('/')
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
    title: `${documentTitle} | 技术文档平台`,
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

export default async function ManualPage({
  params,
}: {
  params: { slug: string[] }
}) {
  // 获取数据
  const filePath = path.join(process.cwd(), 'public', 'data.json')
  const fileContents = await fs.readFile(filePath, 'utf8')
  const data = JSON.parse(fileContents)

  // 查找当前内容
  const slugString = params.slug.join('/')
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

        {/* 文档内容 */}
        <Paper elevation={0} className="p-6 mb-8">
          <Typography variant="h4" component="h1" className="mb-4">
            {currentDocument.title}
          </Typography>

          <Typography variant="body1" className="mb-4">
            {currentDocument.description}
          </Typography>

          {/* 这里可以添加Markdown渲染器来渲染content内容 */}
          <Box className="prose max-w-none">
            <Typography variant="body1">{currentDocument.content}</Typography>
          </Box>
        </Paper>

        {/* 返回按钮 */}
        <Box className="mt-6">
          <Link href="/" className="text-blue-600 hover:underline">
            ← 返回帮助中心
          </Link>
        </Box>
      </Container>
    </div>
  )
}
