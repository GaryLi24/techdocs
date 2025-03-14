/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 启用静态导出
  images: {
    unoptimized: true, // 静态导出时需要
  },
  // 如果你想要自定义导出目录
  distDir: 'build',
}

module.exports = nextConfig
