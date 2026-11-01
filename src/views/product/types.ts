/**
 * 商品模块类型定义
 *
 * 对接真实接口时，这些类型保持不变，只需要：
 *   1. 确保后端返回的字段与这里一致
 *   2. 如果后端字段命名不同（如 category_id 而不是 category），
 *      在 api/product.ts 里做一次字段映射即可，不用改这里
 */

// ============================================================
// 基础枚举
// ============================================================

/** SKU 模式：单规格 / 多规格 */
export type SkuMode = 'single' | 'multi'

/** 保存类型：草稿 / 发布上架 */
export type SaveType = 'draft' | 'publish'

/** 商品状态：已上架 / 已下架 */
export type ProductStatus = 'on' | 'off'

// ============================================================
// 选项类
// ============================================================

/** 商品分类（支持多级） */
export interface CategoryOption {
  value: string
  label: string
  children?: CategoryOption[]
}

/** 品牌选项 */
export interface BrandOption {
  value: string
  label: string
}

// ============================================================
// 商品图片
// ============================================================

/**
 * 商品主图
 * - icon: 内置图标名（未上传图片时占位用）
 * - bg: 内置渐变背景（未上传图片时占位用）
 * - 如果后续真实上传图片，可扩展 url 字段：
 *     url?: string
 */
export interface ProductImage {
  icon: string
  bg: string
  url?: string
}

// ============================================================
// 单规格
// ============================================================

/** 单规格价格库存 */
export interface SingleSku {
  /** 售价 */
  price: number
  /** 原价，0 表示无原价 */
  originPrice: number
  /** 成本价 */
  costPrice: number
  /** 库存 */
  stock: number
  /** 库存预警值 */
  warnStock: number
  /** 重量 kg */
  weight: number
}

// ============================================================
// 多规格
// ============================================================

/**
 * 规格值
 * - name: 规格值名称，如「黑色」「XL」
 * - image: 规格值图片（base64 或 CDN URL），空字符串表示未上传
 */
export interface SpecValue {
  name: string
  image: string
}

/**
 * 规格项
 * - name: 规格名，如「颜色」「尺寸」
 * - values: 规格值列表
 * - inputVisible / inputValue: 输入框临时状态，仅前端使用
 */
export interface SpecItem {
  name: string
  values: SpecValue[]
  inputVisible: boolean
  inputValue: string
}

/**
 * SKU 行（多规格下的每个组合）
 * - specValues: 规格值组合，如 ['黑色', 'XL']，顺序与 form.specs 一致
 * - price / originPrice / stock / weight: 该 SKU 独立价格库存
 * - skuNo: SKU 编码
 * - image: 该 SKU 图片（base64 或 CDN URL），空字符串表示未上传
 */
export interface SkuRow {
  specValues: string[]
  price: number
  originPrice: number
  stock: number
  skuNo: string
  weight: number
  image: string
}

// ============================================================
// 商品表单（创建 / 编辑共用）
// ============================================================

/**
 * 商品表单完整结构
 * 创建页 form 是 ProductForm，保存时合并 skuMode / skuRows 组成 SaveProductPayload
 */
export interface ProductForm {
  /** 商品名称 */
  name: string
  /** 商品分类，级联路径，如 ['digital', 'audio'] */
  category: string[]
  /** 品牌 value */
  brand: string
  /** 标签列表 */
  tags: string[]
  /** 商品编号 */
  no: string
  /** 上架状态 */
  status: ProductStatus
  /** 排序 */
  sort: number
  /** 商品简介 */
  desc: string
  /** 商品主图列表 */
  images: ProductImage[]
  /** 单规格数据 */
  single: SingleSku
  /** 多规格定义 */
  specs: SpecItem[]
  /** 商品详情（纯文本） */
  detail: string
}