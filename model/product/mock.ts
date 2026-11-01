/**
 * 商品 Mock 操作
 */

import type { BrandOption, CategoryOption } from '@/views/product/types'
import { delay, paginate, clone } from '../helpers'
import { productDb, categoryLabelMap, categoryMetaMap } from './data'
import type { InternalProduct } from './data'

export interface ProductListItem {
  id: number
  name: string
  no: string
  category: string
  price: number
  originPrice: number | null
  stock: number
  warnStock: number
  sales: number
  status: 'on' | 'off'
  icon: string
  thumb: string
}

export interface ProductListQuery {
  keyword?: string
  category?: string
  status?: '' | 'on' | 'off' | 'low'
  page: number
  size: number
}

export interface ProductListResult {
  list: ProductListItem[]
  total: number
}

export interface ProductDetail extends Omit<InternalProduct, 'sales'> {
  id: number
}

export interface SaveProductPayload {
  id?: number
  name: string
  category: string[]
  brand: string
  tags: string[]
  no: string
  status: 'on' | 'off'
  sort: number
  desc: string
  images: { icon: string; bg: string }[]
  single: InternalProduct['single']
  specs: InternalProduct['specs']
  detail: string
  skuMode: InternalProduct['skuMode']
  skuRows: InternalProduct['skuRows']
}

export interface SaveProductResult {
  id: number
  message: string
}

function toListItem(p: InternalProduct): ProductListItem {
  const firstCategory = p.category[0] ?? ''
  const categoryLabel = categoryLabelMap[firstCategory] || '未分类'
  const meta = categoryMetaMap[categoryLabel]
  const price = p.skuMode === 'multi' && p.skuRows.length
    ? Math.min(...p.skuRows.map(r => r.price).filter(v => v > 0))
    : p.single.price
  const stock = p.skuMode === 'multi' && p.skuRows.length
    ? p.skuRows.reduce((s, r) => s + r.stock, 0)
    : p.single.stock
  return {
    id: p.id,
    name: p.name,
    no: p.no,
    category: categoryLabel,
    price: Number.isFinite(price) ? price : 0,
    originPrice: p.single.originPrice || null,
    stock,
    warnStock: p.single.warnStock,
    sales: p.sales,
    status: p.status,
    icon: meta?.icon || 'solar:box-bold-duotone',
    thumb: meta?.thumb || 'linear-gradient(135deg, #e8f3ff, #d3e6ff)'
  }
}

export async function mockGetCategories(): Promise<CategoryOption[]> {
  await delay(100)
  return [
    { value: 'digital', label: '数码', children: [{ value: 'audio', label: '音频设备' }, { value: 'watch', label: '智能穿戴' }] },
    { value: 'clothes', label: '服饰', children: [{ value: 'coat', label: '外套' }, { value: 'shirt', label: '衬衫' }] },
    { value: 'beauty', label: '美妆', children: [{ value: 'skin', label: '护肤' }, { value: 'makeup', label: '彩妆' }] },
    { value: 'food', label: '食品', children: [{ value: 'snack', label: '零食' }, { value: 'drink', label: '饮品' }] },
    { value: 'home', label: '家居', children: [{ value: 'cup', label: '餐具' }] },
    { value: 'baby', label: '母婴', children: [{ value: 'diaper', label: '纸尿裤' }] }
  ]
}

export async function mockGetBrands(): Promise<BrandOption[]> {
  await delay(100)
  return [
    { value: 'xiaomi', label: '小米' },
    { value: 'huawei', label: '华为' },
    { value: 'nike', label: 'Nike' },
    { value: 'local', label: '自有品牌' }
  ]
}

export async function mockGetTags(): Promise<string[]> {
  await delay(100)
  return ['新品', '热卖', '限时折扣', '包邮', '赠品']
}

export async function mockGetProductList(params: ProductListQuery): Promise<ProductListResult> {
  await delay(300)
  let data = productDb.map(toListItem)

  if (params.keyword) {
    const k = params.keyword.toLowerCase()
    data = data.filter(d => d.name.toLowerCase().includes(k) || d.no.toLowerCase().includes(k))
  }
  if (params.category) {
    const label = categoryLabelMap[params.category]
    if (label) data = data.filter(d => d.category === label)
  }
  if (params.status === 'on' || params.status === 'off') {
    data = data.filter(d => d.status === params.status)
  } else if (params.status === 'low') {
    data = data.filter(d => d.stock <= d.warnStock)
  }

  data.sort((a, b) => b.id - a.id)

  return paginate(data, params.page, params.size)
}

export async function mockGetProductDetail(id: number): Promise<ProductDetail | null> {
  await delay(200)
  const target = productDb.find(p => p.id === id)
  if (!target) return null
  const { sales, ...detail } = target
  return clone(detail) as ProductDetail
}

export async function mockSaveProduct(
  payload: SaveProductPayload,
  type: 'draft' | 'publish'
): Promise<SaveProductResult> {
  await delay(400)

  const status = type === 'publish' ? 'on' : payload.status
  const { id, skuMode, skuRows, ...baseForm } = payload

  if (id) {
    const idx = productDb.findIndex(p => p.id === id)
    if (idx === -1) throw new Error('商品不存在')
    const existing = productDb[idx]
    productDb[idx] = {
      ...existing,
      ...baseForm,
      status,
      skuMode,
      skuRows: clone(skuRows),
      sales: existing.sales
    }
    return {
      id,
      message: type === 'publish' ? '商品已保存并上架' : '草稿已保存'
    }
  }

  const newId = Date.now()
  const newProduct: InternalProduct = {
    ...baseForm,
    id: newId,
    status,
    skuMode,
    skuRows: clone(skuRows),
    sales: 0
  }
  productDb.unshift(newProduct)

  return {
    id: newId,
    message: type === 'publish' ? '商品已保存并上架' : '草稿已保存'
  }
}

export async function mockDeleteProduct(id: number): Promise<void> {
  await delay(200)
  const idx = productDb.findIndex(p => p.id === id)
  if (idx > -1) productDb.splice(idx, 1)
}

export async function mockDeleteProducts(ids: number[]): Promise<void> {
  await delay(200)
  const set = new Set(ids)
  for (let i = productDb.length - 1; i >= 0; i--) {
    if (set.has(productDb[i].id)) productDb.splice(i, 1)
  }
}

export async function mockUpdateProductStatus(id: number, status: 'on' | 'off'): Promise<void> {
  await delay(150)
  const target = productDb.find(p => p.id === id)
  if (target) target.status = status
}

export async function mockUploadImage(file: File): Promise<string> {
  await delay(300)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(String(e.target?.result || ''))
    reader.onerror = () => reject(new Error('读取图片失败'))
    reader.readAsDataURL(file)
  })
}