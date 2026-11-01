<template>
  <div class="product-page">
    <!-- 筛选区 -->
    <ElForm :model="query" inline class="filter-form" @submit.prevent>
      <ElFormItem label="商品名称">
        <ElInput v-model="query.keyword" placeholder="输入商品名称/编号" clearable style="width: 220px"
          @keyup.enter="handleSearch">
          <template #prefix>
            <Icon icon="solar:magnifer-bold-duotone" width="16" />
          </template>
        </ElInput>
      </ElFormItem>
      <ElFormItem label="商品分类">
        <ElSelect v-model="query.category" placeholder="全部分类" clearable style="width: 160px">
          <ElOption v-for="c in categories" :key="c.value" :label="c.label" :value="c.value" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="状态">
        <ElSelect v-model="query.status" placeholder="全部状态" clearable style="width: 140px">
          <ElOption label="已上架" value="on" />
          <ElOption label="已下架" value="off" />
          <ElOption label="库存预警" value="low" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem>
        <ElButton type="primary" @click="handleSearch">
          <Icon icon="solar:magnifer-bold-duotone" class="btn-icon" />查询
        </ElButton>
        <ElButton @click="handleReset">
          <Icon icon="solar:refresh-bold-duotone" class="btn-icon" />重置
        </ElButton>
      </ElFormItem>
    </ElForm>
    <!-- 列表区 -->
    <div class="list-panel">
      <!-- 头部 -->
      <div class="panel-header">
        <div class="panel-title">
          <span class="title-dot"></span>
          商品列表
          <span class="title-sub">共 {{ total }} 件</span>
        </div>
        <div class="panel-actions">
          <ElButton v-if="selection.length" type="danger" plain size="small" @click="handleBatchDelete">
            <Icon icon="solar:trash-bin-trash-bold-duotone" class="btn-icon" />
            批量删除（{{ selection.length }}）
          </ElButton>
          <ElButton type="primary" size="small" @click="go('/product/create')">
            <Icon icon="solar:add-circle-bold-duotone" class="btn-icon" />新增商品
          </ElButton>
        </div>
      </div>

      <!-- 状态标签页 -->
      <ElTabs v-model="activeTab" class="status-tabs" @tab-change="handleTabChange">
        <ElTabPane label="全部" name="all" />
        <ElTabPane label="已上架" name="on" />
        <ElTabPane label="已下架" name="off" />
        <ElTabPane label="库存预警" name="low" />
      </ElTabs>

      <!-- 表格：占满剩余空间 -->
      <div class="table-wrap">
        <ElTable v-loading="loading" :data="list" class="pretty-table" row-key="id" height="100%"
          @selection-change="handleSelectionChange">
          <ElTableColumn type="selection" width="46" align="center" />

          <ElTableColumn label="图片" min-width="260">
            <template #default="{ row }">
              <div class="product-cell" @click="go(`/product/detail/${row.id}`)">
                <ElImage :src="row.imageUrl || '/images/placeholder.png'"
                  :preview-src-list="row.imageUrl ? [row.imageUrl] : []" :preview-teleported="true" fit="cover"
                  class="product-thumb" lazy>
                  <template #error>
                    <div class="image-error">
                      <Icon icon="solar:gallery-broken" width="20" />
                    </div>
                  </template>
                </ElImage>
                <div class="product-meta">
                  <div class="product-name">{{ row.name }}</div>
                  <div class="product-no">编号：{{ row.no }}</div>
                </div>
              </div>
            </template>
          </ElTableColumn>

          <ElTableColumn label="分类" width="100">
            <template #default="{ row }">
              <ElTag size="small" effect="light" round>{{ row.category }}</ElTag>
            </template>
          </ElTableColumn>

          <ElTableColumn label="价格" width="130" align="right">
            <template #default="{ row }">
              <div class="price-cell">
                <span class="price">¥ {{ row.price.toFixed(2) }}</span>
                <span v-if="row.originPrice" class="origin">¥ {{ row.originPrice.toFixed(2) }}</span>
              </div>
            </template>
          </ElTableColumn>

          <ElTableColumn label="库存" width="100" align="center">
            <template #default="{ row }">
              <span class="stock" :class="{ low: row.stock <= row.warnStock }">
                {{ row.stock }}
                <Icon v-if="row.stock <= row.warnStock" icon="solar:danger-triangle-bold-duotone" width="14" />
              </span>
            </template>
          </ElTableColumn>

          <ElTableColumn prop="sales" label="销量" width="80" align="right" />

          <ElTableColumn label="状态" width="150">
            <template #default="{ row }">
              <span class="status-dot" :style="{ color: row.statusColor, background: row.statusBg }">
                <i class="dot"></i>{{ row.statusText }}
              </span>
            </template>
          </ElTableColumn>

          <ElTableColumn label="操作" width="220" fixed="right">
            <template #default="{ row }">
              <ElButton link type="primary" size="small" @click="go(`/product/detail/${row.id}`)">
                详情
              </ElButton>
              <ElButton link type="primary" size="small" @click="go(`/product/edit/${row.id}`)">
                编辑
              </ElButton>
              <ElButton link :type="row.status === 'on' ? 'warning' : 'success'" size="small"
                @click="toggleStatus(row)">
                {{ row.status === 'on' ? '下架' : '上架' }}
              </ElButton>
              <ElPopconfirm title="确定删除该商品？" @confirm="handleDelete(row)">
                <template #reference>
                  <ElButton link type="danger" size="small">删除</ElButton>
                </template>
              </ElPopconfirm>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrap">
        <ElPagination v-model:current-page="page.current" v-model:page-size="page.size" :total="total"
          :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" background
          @size-change="fetchList" @current-change="fetchList" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { Icon } from '@iconify/vue'

import {
  getProductList,
  deleteProduct,
  deleteProducts,
  updateProductStatus,
  getCategories
} from '@/api/product'
import type { ProductListItem } from '@/api/product'

// ---------- 类型 ----------
type ProductStatus = 'on' | 'off'

interface CategoryOption {
  label: string
  value: string
}

interface ProductRowView extends ProductListItem {
  statusText: string
  statusColor: string
  statusBg: string
}

interface QueryState {
  keyword: string
  category: string
  status: '' | ProductStatus | 'low'
}

// ---------- 基础 ----------
const router = useRouter()

const query = reactive<QueryState>({ keyword: '', category: '', status: '' })
const categories = ref<CategoryOption[]>([])

// ---------- 标签页 ----------
const activeTab = ref<'all' | ProductStatus | 'low'>('all')

function handleTabChange(name: string | number): void {
  const tab = String(name) as 'all' | ProductStatus | 'low'
  query.status = tab === 'all' ? '' : tab
  page.current = 1
  fetchList()
}

// ---------- 列表 ----------
const loading = ref(false)
const list = ref<ProductRowView[]>([])
const total = ref(0)
const page = reactive({ current: 1, size: 10 })
const selection = ref<ProductRowView[]>([])

const statusMap: Record<'on' | 'off' | 'low', { text: string; color: string; bg: string }> = {
  on: { text: '已上架', color: '#52b788', bg: 'rgba(82,183,136,0.12)' },
  off: { text: '已下架', color: '#909399', bg: 'rgba(144,147,153,0.12)' },
  low: { text: '库存预警', color: '#e6a23c', bg: 'rgba(230,162,60,0.12)' }
}

function decorate(rows: ProductListItem[]): ProductRowView[] {
  return rows.map(r => {
    const key: 'on' | 'off' | 'low' = r.stock <= r.warnStock ? 'low' : r.status
    const s = statusMap[key]
    return { ...r, statusText: s.text, statusColor: s.color, statusBg: s.bg }
  })
}

async function fetchList(): Promise<void> {
  loading.value = true
  try {
    const res = await getProductList({
      keyword: query.keyword,
      category: query.category,
      status: query.status,
      page: page.current,
      size: page.size
    })
    total.value = res.total
    list.value = decorate(res.list)
  } catch {
    ElMessage.error('加载商品列表失败')
  } finally {
    loading.value = false
  }
}

// ---------- 操作 ----------
function handleSearch(): void {
  page.current = 1
  fetchList()
}

function handleReset(): void {
  query.keyword = ''
  query.category = ''
  query.status = ''
  activeTab.value = 'all'
  page.current = 1
  fetchList()
}

function handleSelectionChange(val: ProductRowView[]): void {
  selection.value = val
}

async function toggleStatus(row: ProductRowView): Promise<void> {
  const next: ProductStatus = row.status === 'on' ? 'off' : 'on'
  try {
    await updateProductStatus(row.id, next)
    const s = statusMap[next]
    row.status = next
    row.statusText = s.text
    row.statusColor = s.color
    row.statusBg = s.bg
    ElMessage.success(`商品已${next === 'on' ? '上架' : '下架'}`)
  } catch {
    ElMessage.error('操作失败')
  }
}

async function handleDelete(row: ProductRowView): Promise<void> {
  try {
    await deleteProduct(row.id)
    list.value = list.value.filter(r => r.id !== row.id)
    total.value -= 1
    ElMessage.success('删除成功')
  } catch {
    ElMessage.error('删除失败')
  }
}

function handleBatchDelete(): void {
  ElMessageBox.confirm(
    `确定删除选中的 ${selection.value.length} 件商品吗？`,
    '批量删除',
    { type: 'warning' }
  ).then(async () => {
    const ids = selection.value.map(r => r.id)
    try {
      await deleteProducts(ids)
      const idSet = new Set(ids)
      list.value = list.value.filter(r => !idSet.has(r.id))
      total.value -= ids.length
      selection.value = []
      ElMessage.success('批量删除成功')
    } catch {
      ElMessage.error('批量删除失败')
    }
  }).catch(() => { })
}

function go(path: string): void {
  router.push(path)
}

// 图片加载失败时清空 imageUrl，回退到图标
function handleImageError(e: Event): void {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}

// ---------- 初始化 ----------
onMounted(async () => {
  try {
    const cats = await getCategories()
    categories.value = cats.map(c => ({ label: c.label, value: c.value }))
  } catch {
    // 分类加载失败不影响列表
  }
  fetchList()
})
</script>

<style lang="scss" scoped>
// ---------- 设计令牌 ----------
$primary: #409eff;
$warning: #e6a23c;
$text-main: #1f2d3d;
$text-secondary: #8a94a6;
$text-regular: #5a6472;
$border-light: #eef1f6;
$bg-soft: #f7f9fc;
$radius-card: 14px;
$gap: 16px;
$shadow-card: 0 2px 8px rgba(31, 45, 61, 0.04);

@mixin flex-between($align: center) {
  display: flex;
  align-items: $align;
  justify-content: space-between;
}

@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

// ---------- 页面：撑满高度 ----------
.product-page {
  padding: $gap;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// ---------- 筛选区 ----------
.filter-form {
  flex-shrink: 0;
  padding: 14px 18px;
  background: #fff;
  display: flex;
  flex-wrap: wrap;
  gap: 0 4px;

  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}

// ---------- 列表区：占满剩余 ----------
.list-panel {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 14px 18px 16px;
  background: #fff;
  overflow: hidden;
}

.panel-header {
  @include flex-between;
  flex-shrink: 0;
  margin-bottom: 12px;

  .panel-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 600;
    color: $text-main;

    .title-dot {
      width: 6px;
      height: 16px;
      border-radius: 3px;
      background: linear-gradient(180deg, $primary, #7cc0ff);
    }

    .title-sub {
      font-size: 12px;
      font-weight: 400;
      color: $text-secondary;
      margin-left: 2px;
    }
  }

  .panel-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .btn-icon {
    margin-right: 4px;
    vertical-align: middle;
  }
}

// 状态标签页
.status-tabs {
  flex-shrink: 0;
  margin-bottom: 12px;

  :deep(.el-tabs__header) {
    margin-bottom: 0;
  }

  :deep(.el-tabs__nav-wrap::after) {
    height: 1px;
    background: $border-light;
  }

  :deep(.el-tabs__item) {
    font-size: 13px;
    color: $text-secondary;

    &.is-active {
      color: $primary;
      font-weight: 600;
    }
  }
}

// ---------- 表格滚动区 ----------
.table-wrap {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

// ---------- 表格 ----------
.pretty-table {
  :deep(.el-table__header th) {
    background: #f8fafd;
    color: $text-secondary;
    font-weight: 500;
    font-size: 12px;
  }

  :deep(.el-table__row:hover > td) {
    background: #f5f9ff !important;
  }

  :deep(.el-table td) {
    border-bottom: 1px solid $border-light;
    color: $text-regular;
    vertical-align: middle;
  }

  :deep(.el-table__inner-wrapper::before) {
    display: none;
  }
}

// 商品单元格
.product-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;

  .product-thumb {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    @include flex-center;
    color: $primary;
    flex-shrink: 0;
    overflow: hidden;
    background: $bg-soft;

    .thumb-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }

  .product-meta {
    min-width: 0;
  }

  .product-name {
    font-size: 13px;
    font-weight: 500;
    color: $text-main;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: color 0.2s ease;
  }

  &:hover .product-name {
    color: $primary;
  }

  .product-no {
    margin-top: 2px;
    font-size: 12px;
    color: $text-secondary;
  }
}

// 价格
.price-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  .price {
    font-weight: 600;
    color: $text-main;
  }

  .origin {
    font-size: 12px;
    color: $text-secondary;
    text-decoration: line-through;
  }
}

// 库存
.stock {
  display: inline-flex;
  align-items: center;
  gap: 4px;

  &.low {
    color: $warning;
    font-weight: 600;
  }
}

// 状态圆点
.status-dot {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
}

// 分页
.pagination-wrap {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

// 响应式
@media (max-width: 768px) {
  .product-page {
    padding: 12px;
    gap: 12px;
  }

  .filter-form {
    :deep(.el-form-item) {
      width: 100%;
    }
  }
}
</style>