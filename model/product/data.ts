/**
 * 商品内存数据
 * 只维护数据本身，不做业务逻辑
 *
 * 当前为化妆品数据，对接真实接口后此文件可删除
 */

import type { SkuMode, SkuRow, SpecItem } from '@/views/product/types'
import { nextId } from '../helpers'

export interface InternalProduct {
  id: number
  name: string
  no: string
  category: string[]
  brand: string
  tags: string[]
  status: 'on' | 'off'
  sort: number
  desc: string
  images: { icon: string; bg: string; url?: string }[]
  single: {
    price: number
    originPrice: number
    costPrice: number
    stock: number
    warnStock: number
    weight: number
  }
  specs: SpecItem[]
  detail: string
  skuMode: SkuMode
  skuRows: SkuRow[]
  sales: number
}

export const categoryLabelMap: Record<string, string> = {
  skincare: '护肤',
  makeup: '彩妆',
  fragrance: '香水',
  bodycare: '身体护理',
  haircare: '洗护',
  tools: '美妆工具'
}

export const categoryMetaMap: Record<string, { icon: string; thumb: string }> = {
  护肤: { icon: 'solar:water-drops-bold-duotone', thumb: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
  彩妆: { icon: 'solar:magic-stick-3-bold-duotone', thumb: 'linear-gradient(135deg, #ffeaea, #ffd6d6)' },
  香水: { icon: 'solar:perfume-bold-duotone', thumb: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)' },
  身体护理: { icon: 'solar:body-bold-duotone', thumb: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' },
  洗护: { icon: 'solar:shower-bold-duotone', thumb: 'linear-gradient(135deg, #fff4e6, #ffe4c4)' },
  美妆工具: { icon: 'solar:brush-bold-duotone', thumb: 'linear-gradient(135deg, #f7f9fc, #e4e7ed)' }
}

// 化妆品占位图（来自 picsum，稳定可访问，可按 id 取不同图）
const placeholder = (seed: string) => `https://picsum.photos/seed/${seed}/400/400`

function seedProduct(seed: {
  name: string
  no: string
  category: string[]
  brand: string
  tags: string[]
  status: 'on' | 'off'
  sort: number
  desc: string
  price: number
  originPrice: number
  stock: number
  warnStock: number
  sales: number
  imageUrls?: string[]
}): InternalProduct {
  const firstCategory = seed.category[0] ?? ''
  const categoryLabel = categoryLabelMap[firstCategory] || '未分类'
  const meta = categoryMetaMap[categoryLabel]
  const urls = seed.imageUrls && seed.imageUrls.length
    ? seed.imageUrls
    : [placeholder(seed.no)]
  return {
    id: nextId(),
    name: seed.name,
    category: seed.category,
    brand: seed.brand,
    tags: seed.tags,
    no: seed.no,
    status: seed.status,
    sort: seed.sort,
    desc: seed.desc,
    images: urls.map((url, idx) => ({
      icon: meta?.icon || 'solar:box-bold-duotone',
      bg: meta?.thumb || 'linear-gradient(135deg, #e8f3ff, #d3e6ff)',
      url,
      // 第一张为主图，其余为附图
      __idx: idx
    })) as { icon: string; bg: string; url?: string }[],
    single: {
      price: seed.price,
      originPrice: seed.originPrice,
      costPrice: Math.round(seed.price * 0.6),
      stock: seed.stock,
      warnStock: seed.warnStock,
      weight: 0.35
    },
    specs: [],
    detail: `【商品卖点】${seed.desc}`,
    skuMode: 'single',
    skuRows: [],
    sales: seed.sales
  }
}

export const productDb: InternalProduct[] = [
  seedProduct({
    name: '兰蔻小黑瓶精华 50ml',
    no: 'SP20261030001',
    category: ['skincare', 'serum'],
    brand: 'lancome',
    tags: ['新品', '热卖'],
    status: 'on',
    sort: 10,
    desc: '修护肌底，改善细纹，提亮肤色',
    price: 760,
    originPrice: 880,
    stock: 1286,
    warnStock: 100,
    sales: 1286,
    imageUrls: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&h=400&fit=crop'
    ]
  }),
  seedProduct({
    name: '雅诗兰黛小棕瓶眼霜 15ml',
    no: 'SP20261030002',
    category: ['skincare', 'eye'],
    brand: 'estee-lauder',
    tags: ['新品'],
    status: 'on',
    sort: 9,
    desc: '淡化黑眼圈，紧致眼周',
    price: 520,
    originPrice: 620,
    stock: 986,
    warnStock: 100,
    sales: 986,
    imageUrls: [
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop'
    ]
  }),
  seedProduct({
    name: 'SK-II 神仙水 230ml',
    no: 'SP20261030003',
    category: ['skincare', 'toner'],
    brand: 'sk2',
    tags: ['热卖'],
    status: 'on',
    sort: 8,
    desc: '调理肌肤，改善暗沉',
    price: 1540,
    originPrice: 1680,
    stock: 72,
    warnStock: 100,
    sales: 872,
    imageUrls: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop'
    ]
  }),
  seedProduct({
    name: 'YSL 圣罗兰方管口红',
    no: 'SP20261030004',
    category: ['makeup', 'lipstick'],
    brand: 'ysl',
    tags: ['限时折扣'],
    status: 'off',
    sort: 7,
    desc: '丝绒质地，持久显色',
    price: 320,
    originPrice: 380,
    stock: 756,
    warnStock: 80,
    sales: 756,
    imageUrls: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop'
    ]
  }),
  seedProduct({
    name: '迪奥烈艳蓝金唇膏 999',
    no: 'SP20261030005',
    category: ['makeup', 'lipstick'],
    brand: 'dior',
    tags: ['热卖'],
    status: 'on',
    sort: 6,
    desc: '经典正红，滋润显白',
    price: 350,
    originPrice: 420,
    stock: 643,
    warnStock: 60,
    sales: 643,
    imageUrls: [
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop'
    ]
  }),
  seedProduct({
    name: '香奈儿五号香水 100ml',
    no: 'SP20261030006',
    category: ['fragrance', 'perfume'],
    brand: 'chanel',
    tags: [],
    status: 'on',
    sort: 5,
    desc: '经典花香调，优雅持久',
    price: 1350,
    originPrice: 0,
    stock: 45,
    warnStock: 50,
    sales: 521,
    imageUrls: [
      'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop'
    ]
  }),
  seedProduct({
    name: '祖玛珑蓝风铃香水 30ml',
    no: 'SP20261030007',
    category: ['fragrance', 'perfume'],
    brand: 'jo-malone',
    tags: [],
    status: 'off',
    sort: 4,
    desc: '清新花香，夏日必备',
    price: 680,
    originPrice: 780,
    stock: 312,
    warnStock: 50,
    sales: 398,
    imageUrls: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&h=400&fit=crop'
    ]
  }),
  seedProduct({
    name: '资生堂红腰子精华 50ml',
    no: 'SP20261030008',
    category: ['skincare', 'serum'],
    brand: 'shiseido',
    tags: ['包邮'],
    status: 'on',
    sort: 3,
    desc: '增强肌肤免疫力，稳定肤况',
    price: 880,
    originPrice: 980,
    stock: 86,
    warnStock: 100,
    sales: 367,
    imageUrls: [
      'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400&h=400&fit=crop'
    ]
  }),
  seedProduct({
    name: '阿玛尼权力粉底液 30ml',
    no: 'SP20261030009',
    category: ['makeup', 'foundation'],
    brand: 'armani',
    tags: ['新品'],
    status: 'on',
    sort: 2,
    desc: '哑光控油，持妆 12 小时',
    price: 580,
    originPrice: 650,
    stock: 520,
    warnStock: 80,
    sales: 486,
    imageUrls: [
      'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=400&h=400&fit=crop'
    ]
  }),
  seedProduct({
    name: '海蓝之谜面霜 60ml',
    no: 'SP20261030010',
    category: ['skincare', 'cream'],
    brand: 'la-mer',
    tags: ['热卖'],
    status: 'on',
    sort: 1,
    desc: '深层修护，滋润保湿',
    price: 2800,
    originPrice: 3200,
    stock: 38,
    warnStock: 50,
    sales: 286,
    imageUrls: [
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop'
    ]
  }),
  seedProduct({
    name: '欧莱雅紫熨斗眼霜 20ml',
    no: 'SP20261030011',
    category: ['skincare', 'eye'],
    brand: 'loreal',
    tags: ['限时折扣'],
    status: 'on',
    sort: 0,
    desc: '淡化细纹，紧致眼周',
    price: 269,
    originPrice: 329,
    stock: 1280,
    warnStock: 100,
    sales: 1560,
    imageUrls: [
      'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?w=400&h=400&fit=crop'
    ]
  }),
  seedProduct({
    name: '魅可子弹头口红 Chili',
    no: 'SP20261030012',
    category: ['makeup', 'lipstick'],
    brand: 'mac',
    tags: ['热卖'],
    status: 'on',
    sort: -1,
    desc: '枫叶砖红，显白不挑皮',
    price: 190,
    originPrice: 230,
    stock: 862,
    warnStock: 80,
    sales: 1240,
    imageUrls: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop'
    ]
  })
]