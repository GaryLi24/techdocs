export const createAnchorId = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5\-]/g, '') // 同时支持英文和中文
    .replace(/\-+/g, '-')
    .replace(/^-|-$/g, '') // 移除首尾连字符
}
