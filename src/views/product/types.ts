export type SkuMode = 'single' | 'multi'
export type SaveType = 'draft' | 'publish'
export type ProductStatus = 'on' | 'off'

export interface CategoryOption {
  value: string
  label: string
  children?: CategoryOption[]
}

export interface BrandOption {
  value: string
  label: string
}

export interface ProductImage {
  icon: string
  bg: string
}

export interface SingleSku {
  price: number
  originPrice: number
  costPrice: number
  stock: number
  warnStock: number
  weight: number
}

export interface SpecItem {
  name: string
  values: string[]
  inputVisible: boolean
  inputValue: string
}

export interface SkuRow {
  specValues: string[]
  price: number
  originPrice: number
  stock: number
  skuNo: string
  weight: number
}

export interface ProductForm {
  name: string
  category: string[]
  brand: string
  tags: string[]
  no: string
  status: ProductStatus
  sort: number
  desc: string
  images: ProductImage[]
  single: SingleSku
  specs: SpecItem[]
  detail: string
}