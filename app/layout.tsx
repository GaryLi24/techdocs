import type { Metadata } from 'next'
import '../styles/globals.css' // 注意路径更新
import ThemeRegistry from '../components/ThemeRegistry'

export const metadata: Metadata = {
  title: '电子手册',
  description: '船舶网络技术文档及帮助中心',
  // title: {
  //   default: '电子手册', // 默认标题
  //   template: '%s | 技术文档平台'  // 标题模板，%s会被替换为page标题
  // },
  // icons: {
  //   icon: '/favicon.ico',
  // }
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
