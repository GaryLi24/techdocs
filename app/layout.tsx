import type { Metadata } from 'next'
import '../styles/globals.css' // 注意路径更新
import ThemeRegistry from '../components/ThemeRegistry'

export const metadata: Metadata = {
  title: '技术文档平台',
  description: '专业的技术文档系统',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  )
}
