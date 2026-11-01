/**
 * Mock 通用工具
 */

export function delay(ms = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

let idCounter = 1000
export function nextId(): number {
  return idCounter++
}

export function paginate<T>(list: T[], page: number, size: number): { list: T[]; total: number } {
  const total = list.length
  const start = (page - 1) * size
  return { list: list.slice(start, start + size), total }
}

export function clone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data))
}