import { promises as fs } from 'fs'
import path from 'path'
import HomeClient from '../components/HomeClient'

// 这个函数在构建时执行，用于静态生成页面
export default async function Home() {
  // 在服务器端读取数据文件
  const filePath = path.join(process.cwd(), 'public', 'data.json')
  const fileContents = await fs.readFile(filePath, 'utf8')
  const data = JSON.parse(fileContents)
  console.log('🚀 ~ Home ~ data:', data)

  // 将数据传递给客户端组件
  return <HomeClient initialRoles={data.roles} />
}
