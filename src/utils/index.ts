// 状态文本映射
export const statusTextMap: Record<string, string> = {
  pending: '待处理',
  materials_checked: '材料已核对',
  in_progress: '进行中',
  completed: '已完成'
}

export const toothStatusTextMap: Record<string, string> = {
  intact: '完好',
  worn: '磨耗',
  fallen: '脱落',
  rebond: '需重粘'
}

export const toothStatusColorMap: Record<string, string> = {
  intact: '#52c41a',
  worn: '#faad14',
  fallen: '#ff4d4f',
  rebond: '#1677ff'
}

// 恒牙牙位列表（FDI牙位表示法）
export const permanentTeeth = {
  upperRight: ['18', '17', '16', '15', '14', '13', '12', '11'],
  upperLeft: ['21', '22', '23', '24', '25', '26', '27', '28'],
  lowerLeft: ['31', '32', '33', '34', '35', '36', '37', '38'],
  lowerRight: ['48', '47', '46', '45', '44', '43', '42', '41']
}

// 格式化日期
export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}

// 格式化完整日期
export function formatFullDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 格式化时间
export function formatTime(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

// 获取牙位区域
export function getToothRegion(toothNumber: string): string {
  const first = toothNumber[0]
  switch (first) {
    case '1': return '右上'
    case '2': return '左上'
    case '3': return '左下'
    case '4': return '右下'
    default: return ''
  }
}

// 生成唯一ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
