<template>
  <div class="product-detail-page" v-loading="loading" element-loading-text="加载商品详情中...">
    <!-- 顶部操作栏 -->
    <div class="detail-toolbar">
      <div class="toolbar-left">
        <ElButton @click="go('/product/list')">
          <Icon icon="solar:alt-arrow-left-bold-duotone" width="16" class="btn-icon" />
          返回列表
        </ElButton>
        <span class="toolbar-title">商品详情</span>
        <ElTag v-if="detail" :type="statusTag.type" effect="light" round size="small">
          {{ statusTag.text }}
        </ElTag>
      </div>
      <div class="toolbar-right">
        <ElButton @click="go(`/product/edit/${productId}`)">
          <Icon icon="solar:pen-bold-duotone" width="16" class="btn-icon" />
          编辑商品
        </ElButton>
        <ElButton
          v-if="detail"
          :type="detail.status === 'on' ? 'warning' : 'success'"
          :loading="toggling"
          @click="handleToggleStatus"
        >
          <Icon
            :icon="detail.status === 'on' ? 'solar:eye-closed-bold-duotone' : 'solar:eye-bold-duotone'"
            width="16"
            class="btn-icon"
          />
          {{ detail.status === 'on' ? '下架商品' : '上架商品' }}
        </ElButton>
      </div>
    </div>

    <template v-if="detail">
      <!-- 概览卡片 -->
      <ElCard class="panel-card overview-card" shadow="never">
        <div class="overview">
          <div class="overview-cover" :style="{ background: mainImage?.bg }">
            <Icon :icon="mainImage?.icon || 'solar:box-bold-duotone'" width="48" height="48" />
          </div>
          <div class="overview-info">
            <h2 class="overview-name">{{ detail.name }}</h2>
            <p class="overview-desc">{{ detail.desc || '暂无商品简介' }}</p>
            <div class="overview-tags">
              <ElTag v-for="t in detail.tags" :key="t" size="small" effect="plain" round>{{ t }}</ElTag>
              <span v-if="!detail.tags.length" class="empty-text">暂无标签</span>
            </div>
            <div class="overview-meta">
              <span>商品编号：{{ detail.no }}</span>
              <span>排序：{{ detail.sort }}</span>
              <span>SKU 模式：{{ detail.skuMode === 'single' ? '单规格' : '多规格' }}</span>
            </div>
          </div>
          <div class="overview-price">
            <div class="price-main">
              <span class="price-symbol">¥</span>
              <span class="price-num">{{ priceDisplay.main }}</span>
            </div>
            <div v-if="priceDisplay.origin" class="price-origin">原价 ¥{{ priceDisplay.origin }}</div>
            <div class="price-stock">
              库存 <b>{{ totalStock }}</b>
            </div>
          </div>
        </div>
      </ElCard>

      <!-- 数据指标 -->
      <ElRow :gutter="16" class="metric-row">
        <ElCol v-for="m in metrics" :key="m.label" :xs="12" :sm="12" :md="6">
          <div class="metric-card">
            <div class="metric-icon" :style="{ background: m.bg, color: m.color }">
              <Icon :icon="m.icon" width="22" height="22" />
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ m.value }}</div>
              <div class="metric-label">{{ m.label }}</div>
            </div>
          </div>
        </ElCol>
      </ElRow>

      <ElRow :gutter="16">
        <!-- 基础信息 -->
        <ElCol :xs="24" :md="14">
          <SectionCard title="基础信息">
            <ElDescriptions :column="2" border class="detail-desc">
              <ElDescriptionsItem label="商品名称" :span="2">{{ detail.name }}</ElDescriptionsItem>
              <ElDescriptionsItem label="商品编号">{{ detail.no }}</ElDescriptionsItem>
              <ElDescriptionsItem label="商品分类">{{ categoryText }}</ElDescriptionsItem>
              <ElDescriptionsItem label="品牌">{{ brandText }}</ElDescriptionsItem>
              <ElDescriptionsItem label="排序">{{ detail.sort }}</ElDescriptionsItem>
              <ElDescriptionsItem label="上架状态">
                <ElTag :type="statusTag.type" size="small" effect="light">{{ statusTag.text }}</ElTag>
              </ElDescriptionsItem>
              <ElDescriptionsItem label="SKU 模式">
                {{ detail.skuMode === 'single' ? '单规格' : '多规格' }}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="商品标签" :span="2">
                <ElTag v-for="t in detail.tags" :key="t" size="small" effect="plain" round style="margin-right: 6px">
                  {{ t }}
                </ElTag>
                <span v-if="!detail.tags.length" class="empty-text">暂无</span>
              </ElDescriptionsItem>
              <ElDescriptionsItem label="商品简介" :span="2">
                {{ detail.desc || '暂无' }}
              </ElDescriptionsItem>
            </ElDescriptions>
          </SectionCard>
        </ElCol>

        <!-- 商品图片 -->
        <ElCol :xs="24" :md="10">
          <SectionCard title="商品图片">
            <template #extra>
              <span class="header-tip">共 {{ detail.images.length }} 张</span>
            </template>
            <div class="detail-images">
              <div
                v-for="(img, idx) in detail.images"
                :key="idx"
                class="detail-image"
                :style="{ background: img.bg }"
              >
                <Icon :icon="img.icon" width="36" height="36" />
                <span v-if="idx === 0" class="main-badge">主图</span>
              </div>
              <ElEmpty v-if="!detail.images.length" description="暂无图片" :image-size="60" />
            </div>
          </SectionCard>
        </ElCol>
      </ElRow>

      <!-- 规格与价格 -->
      <SectionCard title="规格与价格">
        <template #extra>
          <span class="header-tip">
            {{ detail.skuMode === 'single' ? '单规格' : `共 ${detail.skuRows.length} 个 SKU` }}
          </span>
        </template>

        <!-- 单规格 -->
        <ElDescriptions v-if="detail.skuMode === 'single'" :column="3" border class="detail-desc">
          <ElDescriptionsItem label="售价">¥ {{ detail.single.price.toFixed(2) }}</ElDescriptionsItem>
          <ElDescriptionsItem label="原价">
            {{ detail.single.originPrice ? `¥ ${detail.single.originPrice.toFixed(2)}` : '--' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="成本价">
            {{ detail.single.costPrice ? `¥ ${detail.single.costPrice.toFixed(2)}` : '--' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="库存">{{ detail.single.stock }}</ElDescriptionsItem>
          <ElDescriptionsItem label="库存预警">{{ detail.single.warnStock }}</ElDescriptionsItem>
          <ElDescriptionsItem label="重量(kg)">{{ detail.single.weight }}</ElDescriptionsItem>
        </ElDescriptions>

        <!-- 多规格 -->
        <ElTable v-else :data="detail.skuRows" size="small" border class="pretty-table">
          <ElTableColumn
            v-for="(spec, sIdx) in detail.specs"
            :key="sIdx"
            :label="spec.name || `规格${sIdx + 1}`"
            width="120"
          >
            <template #default="{ row }">{{ row.specValues[sIdx] }}</template>
          </ElTableColumn>
          <ElTableColumn label="售价" width="110" align="right">
            <template #default="{ row }">¥ {{ row.price.toFixed(2) }}</template>
          </ElTableColumn>
          <ElTableColumn label="原价" width="110" align="right">
            <template #default="{ row }">
              {{ row.originPrice ? `¥ ${row.originPrice.toFixed(2)}` : '--' }}
            </template>
          </ElTableColumn>
          <ElTableColumn label="库存" width="90" align="center">
            <template #default="{ row }">
              <span :class="{ 'stock-low': row.stock <= detail.single.warnStock }">{{ row.stock }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="skuNo" label="SKU 编码" min-width="140" />
          <ElTableColumn label="重量(kg)" width="100" align="center">
            <template #default="{ row }">{{ row.weight }}</template>
          </ElTableColumn>
        </ElTable>
      </SectionCard>

      <!-- 商品详情 -->
      <SectionCard title="商品详情">
        <div class="detail-content">{{ detail.detail || '暂无详情内容' }}</div>
      </SectionCard>
    </template>

    <ElEmpty v-else-if="!loading" description="未找到该商品" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Icon } from '@iconify/vue'

import SectionCard from './components/SectionCard.vue'
import type { CategoryOption, BrandOption, ProductForm, SkuMode, SkuRow, SpecItem } from './types'

const router = useRouter()
const route = useRoute()
const loading = ref(true)
const toggling = ref(false)
const productId = computed<string>(() => String(route.params.id ?? ''))

// ---------- 选项 ----------
const categoryOptions: CategoryOption[] = [
  { value: 'digital', label: '数码', children: [{ value: 'audio', label: '音频设备' }, { value: 'watch', label: '智能穿戴' }] },
  { value: 'clothes', label: '服饰', children: [{ value: 'coat', label: '外套' }, { value: 'shirt', label: '衬衫' }] },
  { value: 'beauty', label: '美妆', children: [{ value: 'skin', label: '护肤' }, { value: 'makeup', label: '彩妆' }] },
  { value: 'food', label: '食品', children: [{ value: 'snack', label: '零食' }, { value: 'drink', label: '饮品' }] }
]
const brands: BrandOption[] = [
  { value: 'xiaomi', label: '小米' },
  { value: 'huawei', label: '华为' },
  { value: 'nike', label: 'Nike' },
  { value: 'local', label: '自有品牌' }
]

// ---------- 详情数据 ----------
interface ProductDetail extends ProductForm {
  skuMode: SkuMode
  skuRows: SkuRow[]
}

const detail = ref<ProductDetail | null>(null)

async function fetchDetail(): Promise<void> {
  loading.value = true
  try {
    // TODO: 替换为真实接口
    await new Promise(r => setTimeout(r, 500))
    detail.value = {
      name: '无线蓝牙耳机 Pro',
      category: ['digital', 'audio'],
      brand: 'xiaomi',
      tags: ['新品', '热卖'],
      no: 'SP20261030001',
      status: 'on',
      sort: 10,
      desc: '主动降噪，长续航，高清通话',
      images: [
        { icon: 'solar:headphones-round-sound-bold-duotone', bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
        { icon: 'solar:bag-smile-bold-duotone', bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)' }
      ],
      single: { price: 399, originPrice: 499, costPrice: 260, stock: 1286, warnStock: 100, weight: 0.35 },
      specs: [
        { name: '颜色', values: ['黑色', '白色'], inputVisible: false, inputValue: '' },
        { name: '版本', values: ['标准版', '降噪版'], inputVisible: false, inputValue: '' }
      ],
      skuRows: [
        { specValues: ['黑色', '标准版'], price: 399, originPrice: 499, stock: 500, skuNo: 'SKU-BLK-STD', weight: 0.35 },
        { specValues: ['黑色', '降噪版'], price: 499, originPrice: 599, stock: 300, skuNo: 'SKU-BLK-ANC', weight: 0.38 },
        { specValues: ['白色', '标准版'], price: 399, originPrice: 499, stock: 286, skuNo: 'SKU-WHT-STD', weight: 0.35 },
        { specValues: ['白色', '降噪版'], price: 499, originPrice: 599, stock: 200, skuNo: 'SKU-WHT-ANC', weight: 0.38 }
      ],
      detail: '【商品卖点】主动降噪\n【规格参数】蓝牙 5.3\n【售后说明】7 天无理由',
      skuMode: 'multi'
    }
  } catch {
    ElMessage.error('加载商品详情失败')
    detail.value = null
  } finally {
    loading.value = false
  }
}

// ---------- 派生数据 ----------
const mainImage = computed(() => detail.value?.images[0])

const statusTag = computed(() => {
  if (!detail.value) return { type: 'info' as const, text: '未知' }
  return detail.value.status === 'on'
    ? { type: 'success' as const, text: '已上架' }
    : { type: 'info' as const, text: '已下架' }
})

const categoryText = computed<string>(() => {
  if (!detail.value) return '--'
  const path = detail.value.category
  const result: string[] = []
  let level: CategoryOption[] | undefined = categoryOptions
  for (const val of path) {
    const found = level?.find(c => c.value === val)
    if (found) {
      result.push(found.label)
      level = found.children
    }
  }
  return result.join(' / ') || '--'
})

const brandText = computed<string>(() => {
  if (!detail.value) return '--'
  return brands.find(b => b.value === detail.value!.brand)?.label || '--'
})

const totalStock = computed<number>(() => {
  if (!detail.value) return 0
  if (detail.value.skuMode === 'single') return detail.value.single.stock
  return detail.value.skuRows.reduce((s, r) => s + (r.stock || 0), 0)
})

const priceDisplay = computed<{ main: string; origin: string }>(() => {
  if (!detail.value) return { main: '0.00', origin: '' }
  if (detail.value.skuMode === 'single') {
    return {
      main: detail.value.single.price.toFixed(2),
      origin: detail.value.single.originPrice ? detail.value.single.originPrice.toFixed(2) : ''
    }
  }
  const prices = detail.value.skuRows.map(r => r.price).filter(p => p > 0)
  if (!prices.length) return { main: '0.00', origin: '' }
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return {
    main: min === max ? min.toFixed(2) : `${min.toFixed(2)} ~ ${max.toFixed(2)}`,
    origin: ''
  }
})

const metrics = computed(() => {
  if (!detail.value) return []
  const sales = detail.value.skuMode === 'single'
    ? 1286
    : detail.value.skuRows.reduce((s, _r, i) => s + (1200 - i * 80), 0)
  return [
    { label: '总库存', value: totalStock.value, icon: 'solar:box-bold-duotone', bg: '#e8f3ff', color: '#409eff' },
    { label: 'SKU 数量', value: detail.value.skuMode === 'single' ? 1 : detail.value.skuRows.length, icon: 'solar:slider-vertical-bold-duotone', bg: '#e6f7ee', color: '#52b788' },
    { label: '累计销量', value: sales, icon: 'solar:graph-up-bold-duotone', bg: '#fff4e6', color: '#e6a23c' },
    { label: '商品标签', value: detail.value.tags.length, icon: 'solar:tag-bold-duotone', bg: '#f3e8ff', color: '#9254de' }
  ]
})

// ---------- 操作 ----------
async function handleToggleStatus(): Promise<void> {
  if (!detail.value) return
  const next = detail.value.status === 'on' ? 'off' : 'on'
  const action = next === 'on' ? '上架' : '下架'
  try {
    await ElMessageBox.confirm(`确定要${action}该商品吗？`, '提示', { type: 'warning' })
  } catch {
    return
  }
  toggling.value = true
  try {
    // TODO: 调用接口
    await new Promise(r => setTimeout(r, 500))
    detail.value.status = next
    ElMessage.success(`商品已${action}`)
  } finally {
    toggling.value = false
  }
}

function go(path: string): void {
  router.push(path)
}

onMounted(fetchDetail)
</script>

<style lang="scss" scoped>
$primary: #409eff;
$success: #52b788;
$warning: #e6a23c;
$danger: #f56c6c;
$text-main: #1f2d3d;
$text-secondary: #8a94a6;
$text-regular: #5a6472;
$border-light: #eef1f6;
$bg-soft: #f7f9fc;
$radius-block: 12px;
$gap: 16px;

.product-detail-page {
  padding: $gap;
  background: $bg-soft;
  min-height: 100%;
}

// ---------- 顶部操作栏 ----------
.detail-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $gap;

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .toolbar-title {
    font-size: 18px;
    font-weight: 600;
    color: $text-main;
  }

  .toolbar-right {
    display: flex;
    gap: 10px;
  }

  .btn-icon {
    margin-right: 4px;
    vertical-align: middle;
  }
}

// ---------- 概览卡片 ----------
.panel-card {
  border-radius: 14px;
  border: 1px solid $border-light;
  box-shadow: 0 2px 8px rgba(31, 45, 61, 0.04);
  margin-bottom: $gap;

  :deep(.el-card__body) {
    padding: 20px;
  }
}

.overview-card {
  .overview {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .overview-cover {
    width: 120px;
    height: 120px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $primary;
    flex-shrink: 0;
  }

  .overview-info {
    flex: 1;
    min-width: 0;
  }

  .overview-name {
    margin: 0 0 8px;
    font-size: 20px;
    font-weight: 600;
    color: $text-main;
  }

  .overview-desc {
    margin: 0 0 10px;
    font-size: 13px;
    color: $text-secondary;
  }

  .overview-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 10px;
  }

  .overview-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    font-size: 12px;
    color: $text-secondary;
  }

  .overview-price {
    text-align: right;
    flex-shrink: 0;

    .price-main {
      color: $danger;
      font-weight: 700;
    }

    .price-symbol {
      font-size: 16px;
    }

    .price-num {
      font-size: 26px;
    }

    .price-origin {
      font-size: 12px;
      color: $text-secondary;
      text-decoration: line-through;
      margin-top: 4px;
    }

    .price-stock {
      margin-top: 8px;
      font-size: 13px;
      color: $text-regular;

      b {
        color: $primary;
        font-size: 16px;
      }
    }
  }
}

.empty-text {
  font-size: 12px;
  color: $text-secondary;
}

// ---------- 指标卡 ----------
.metric-row {
  margin-bottom: $gap;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border: 1px solid $border-light;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(31, 45, 61, 0.04);
  margin-bottom: $gap;

  .metric-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .metric-value {
    font-size: 20px;
    font-weight: 700;
    color: $text-main;
  }

  .metric-label {
    font-size: 12px;
    color: $text-secondary;
  }
}

// ---------- 详情描述 ----------
.detail-desc {
  :deep(.el-descriptions__label) {
    width: 110px;
    color: $text-secondary;
    background: #f8fafd;
  }

  :deep(.el-descriptions__content) {
    color: $text-regular;
  }
}

.header-tip {
  font-size: 12px;
  color: $text-secondary;
}

// ---------- 图片 ----------
.detail-images {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.detail-image {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $primary;
  border: 1px solid $border-light;

  .main-badge {
    position: absolute;
    top: 6px;
    left: 6px;
    padding: 1px 8px;
    font-size: 11px;
    color: #fff;
    background: $primary;
    border-radius: 999px;
  }
}

// ---------- SKU 表格 ----------
.pretty-table {
  :deep(.el-table__header th) {
    background: #f8fafd;
    color: $text-secondary;
    font-weight: 500;
    font-size: 12px;
  }

  :deep(.el-table td) {
    border-bottom: 1px solid $border-light;
    color: $text-regular;
  }

  .stock-low {
    color: $warning;
    font-weight: 600;
  }
}

// ---------- 详情内容 ----------
.detail-content {
  font-size: 14px;
  color: $text-regular;
  line-height: 1.8;
  white-space: pre-wrap;
  padding: 12px;
  background: $bg-soft;
  border-radius: $radius-block;
}

// ---------- 响应式 ----------
@media (max-width: 768px) {
  .overview-card .overview {
    flex-direction: column;
    align-items: flex-start;
  }

  .overview-price {
    text-align: left !important;
  }

  .detail-toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>