/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 启用静态导出
  images: {
    unoptimized: true, // 静态导出时需要
  },
  distDir: 'build',
}

module.exports = nextConfig
