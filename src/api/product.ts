/**
 * 商品接口
 *
 * 当前直接使用 @model 下的 mock。
 * 对接真实接口时，把每个函数里的 mockXxx 替换为 request.xxx 即可。
 */

import type {
  ProductListItem,
  ProductListQuery,
  ProductListResult,
  ProductDetail,
  SaveProductPayload,
  SaveProductResult
} from '@model/product/mock'

// 重新导出类型，页面统一从 @/api/product 导入
export type {
  ProductListItem,
  ProductListQuery,
  ProductListResult,
  ProductDetail,
  SaveProductPayload,
  SaveProductResult
}

// ============================================================
// 分类
// ============================================================

export async function getCategories() {
  const { mockGetCategories } = await import('@model/product/mock')
  return mockGetCategories()
  // return request.get('/api/product/category/tree')
}

// ============================================================
// 品牌
// ============================================================

export async function getBrands() {
  const { mockGetBrands } = await import('@model/product/mock')
  return mockGetBrands()
  // return request.get('/api/product/brand/list')
}

// ============================================================
// 标签
// ============================================================

export async function getTags() {
  const { mockGetTags } = await import('@model/product/mock')
  return mockGetTags()
  // return request.get('/api/product/tag/list')
}

// ============================================================
// 列表
// ============================================================

export async function getProductList(params: ProductListQuery): Promise<ProductListResult> {
  const { mockGetProductList } = await import('@model/product/mock')
  return mockGetProductList(params)
  // return request.get('/api/product/list', { params })
}

// ============================================================
// 详情
// ============================================================

export async function getProductDetail(id: number): Promise<ProductDetail | null> {
  const { mockGetProductDetail } = await import('@model/product/mock')
  return mockGetProductDetail(id)
  // return request.get(`/api/product/${id}`)
}

// ============================================================
// 保存
// ============================================================

export async function saveProduct(
  payload: SaveProductPayload,
  type: 'draft' | 'publish'
): Promise<SaveProductResult> {
  const { mockSaveProduct } = await import('@model/product/mock')
  return mockSaveProduct(payload, type)
  // return request.post('/api/product/save', { ...payload, type })
}

// ============================================================
// 删除
// ============================================================

export async function deleteProduct(id: number): Promise<void> {
  const { mockDeleteProduct } = await import('@model/product/mock')
  return mockDeleteProduct(id)
  // return request.delete(`/api/product/${id}`)
}

export async function deleteProducts(ids: number[]): Promise<void> {
  const { mockDeleteProducts } = await import('@model/product/mock')
  return mockDeleteProducts(ids)
  // return request.post('/api/product/batch-delete', { ids })
}

// ============================================================
// 上下架
// ============================================================

export async function updateProductStatus(id: number, status: 'on' | 'off'): Promise<void> {
  const { mockUpdateProductStatus } = await import('@model/product/mock')
  return mockUpdateProductStatus(id, status)
  // return request.patch(`/api/product/${id}/status`, { status })
}

// ============================================================
// 上传
// ============================================================

export async function uploadImage(file: File): Promise<string> {
  const { mockUploadImage } = await import('@model/product/mock')
  return mockUploadImage(file)
  // const form = new FormData()
  // form.append('file', file)
  // const res = await request.post('/api/upload', form)
  // return res.url
}