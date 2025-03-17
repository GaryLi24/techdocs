/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 启用静态导出
  images: {
    unoptimized: true, // 静态导出时需要
  },
  // 如果你想要自定义导出目录
  distDir: 'build',
  // 添加这些配置
  basePath: '',
  // assetPrefix: './', // 关键配置：使用相对路径
  trailingSlash: true,
}

module.exports = nextConfig
