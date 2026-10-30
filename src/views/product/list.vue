<template>
  <div class="product-page">
    <!-- 筛选区 -->
    <ElCard class="panel-card filter-card" shadow="never">
      <ElForm :model="query" inline class="filter-form" @submit.prevent>
        <ElFormItem label="商品名称">
          <ElInput
            v-model="query.keyword"
            placeholder="输入商品名称/编号"
            clearable
            style="width: 220px"
            @keyup.enter="handleSearch"
          >
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
    </ElCard>

    <!-- 列表区 -->
    <ElCard class="panel-card" shadow="never">
      <template #header>
        <div class="panel-header">
          <div class="panel-title">
            <span class="title-dot"></span>
            商品列表
            <span class="title-sub">共 {{ total }} 件</span>
          </div>
          <div class="panel-actions">
            <ElButton
              v-if="selection.length"
              type="danger"
              plain
              size="small"
              @click="handleBatchDelete"
            >
              <Icon icon="solar:trash-bin-trash-bold-duotone" class="btn-icon" />
              批量删除（{{ selection.length }}）
            </ElButton>
            <ElButton type="primary" size="small" @click="go('/product/create')">
              <Icon icon="solar:add-circle-bold-duotone" class="btn-icon" />新增商品
            </ElButton>
          </div>
        </div>
      </template>

      <!-- 状态标签页 -->
      <ElTabs v-model="activeTab" class="status-tabs" @tab-change="handleTabChange">
        <ElTabPane label="全部" name="all" />
        <ElTabPane label="已上架" name="on" />
        <ElTabPane label="已下架" name="off" />
        <ElTabPane label="库存预警" name="low" />
      </ElTabs>

      <ElTable
        v-loading="loading"
        :data="list"
        class="pretty-table"
        row-key="id"
        @selection-change="handleSelectionChange"
      >
        <ElTableColumn type="selection" width="46" align="center" />
        <ElTableColumn label="商品" min-width="260">
          <template #default="{ row }">
            <div class="product-cell" @click="go(`/product/detail/${row.id}`)">
              <div class="product-thumb" :style="{ background: row.thumb }">
                <Icon :icon="row.icon" width="22" height="22" />
              </div>
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
              <Icon
                v-if="row.stock <= row.warnStock"
                icon="solar:danger-triangle-bold-duotone"
                width="14"
              />
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="sales" label="销量" width="80" align="right" />
        <ElTableColumn label="状态" width="100">
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
            <ElButton
              link
              :type="row.status === 'on' ? 'warning' : 'success'"
              size="small"
              @click="toggleStatus(row)"
            >
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

      <div class="pagination-wrap">
        <ElPagination
          v-model:current-page="page.current"
          v-model:page-size="page.size"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="fetchList"
          @current-change="fetchList"
        />
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Icon } from '@iconify/vue'

// ---------- 类型 ----------
type ProductStatus = 'on' | 'off'

interface CategoryOption {
  label: string
  value: string
}

interface ProductRow {
  id: number
  name: string
  no: string
  category: string
  price: number
  originPrice: number | null
  stock: number
  warnStock: number
  sales: number
  status: ProductStatus
  icon: string
  thumb: string
}

interface ProductRowView extends ProductRow {
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

const categories: CategoryOption[] = [
  { label: '数码', value: 'digital' },
  { label: '服饰', value: 'clothes' },
  { label: '美妆', value: 'beauty' },
  { label: '食品', value: 'food' },
  { label: '家居', value: 'home' },
  { label: '母婴', value: 'baby' }
]

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

const mockData: ProductRow[] = [
  { id: 1, name: '无线蓝牙耳机 Pro', no: 'SP20261030001', category: '数码', price: 399.0, originPrice: 499.0, stock: 1286, warnStock: 100, sales: 1286, status: 'on', icon: 'solar:headphones-round-sound-bold-duotone', thumb: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
  { id: 2, name: '智能手表 S9', no: 'SP20261030002', category: '数码', price: 899.0, originPrice: 1099.0, stock: 986, warnStock: 100, sales: 986, status: 'on', icon: 'solar:watch-square-bold-duotone', thumb: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' },
  { id: 3, name: '便携充电宝 20000mAh', no: 'SP20261030003', category: '数码', price: 129.0, originPrice: 159.0, stock: 72, warnStock: 100, sales: 872, status: 'on', icon: 'solar:battery-charge-bold-duotone', thumb: 'linear-gradient(135deg, #fff4e6, #ffe4c4)' },
  { id: 4, name: '轻薄羽绒服', no: 'SP20261030004', category: '服饰', price: 599.0, originPrice: 799.0, stock: 756, warnStock: 80, sales: 756, status: 'off', icon: 'solar:bag-smile-bold-duotone', thumb: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)' },
  { id: 5, name: '保湿精华液 50ml', no: 'SP20261030005', category: '美妆', price: 299.0, originPrice: 359.0, stock: 643, warnStock: 60, sales: 643, status: 'on', icon: 'solar:magic-stick-3-bold-duotone', thumb: 'linear-gradient(135deg, #ffeaea, #ffd6d6)' },
  { id: 6, name: '有机坚果礼盒', no: 'SP20261030006', category: '食品', price: 168.0, originPrice: null, stock: 45, warnStock: 50, sales: 521, status: 'on', icon: 'solar:gift-bold-duotone', thumb: 'linear-gradient(135deg, #fff9e6, #ffefc2)' },
  { id: 7, name: '北欧风陶瓷餐具套装', no: 'SP20261030007', category: '家居', price: 258.0, originPrice: 328.0, stock: 312, warnStock: 50, sales: 398, status: 'off', icon: 'solar:cup-bold-duotone', thumb: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
  { id: 8, name: '婴儿纸尿裤 L 码', no: 'SP20261030008', category: '母婴', price: 139.0, originPrice: 169.0, stock: 86, warnStock: 100, sales: 367, status: 'on', icon: 'solar:hearts-bold-duotone', thumb: 'linear-gradient(135deg, #ffeaea, #ffd6d6)' }
]

const statusMap: Record<'on' | 'off' | 'low', { text: string; color: string; bg: string }> = {
  on: { text: '已上架', color: '#52b788', bg: 'rgba(82,183,136,0.12)' },
  off: { text: '已下架', color: '#909399', bg: 'rgba(144,147,153,0.12)' },
  low: { text: '库存预警', color: '#e6a23c', bg: 'rgba(230,162,60,0.12)' }
}

function decorate(rows: ProductRow[]): ProductRowView[] {
  return rows.map(r => {
    const key: 'on' | 'off' | 'low' = r.stock <= r.warnStock ? 'low' : r.status
    const s = statusMap[key]
    return { ...r, statusText: s.text, statusColor: s.color, statusBg: s.bg }
  })
}

async function fetchList(): Promise<void> {
  loading.value = true
  try {
    // TODO: 替换为真实接口
    await new Promise(r => setTimeout(r, 400))
    let data = [...mockData]
    if (query.keyword) {
      const k = query.keyword.toLowerCase()
      data = data.filter(d => d.name.toLowerCase().includes(k) || d.no.toLowerCase().includes(k))
    }
    if (query.category) {
      const label = categories.find(c => c.value === query.category)?.label
      if (label) data = data.filter(d => d.category === label)
    }
    if (query.status === 'on' || query.status === 'off') {
      data = data.filter(d => d.status === query.status)
    } else if (query.status === 'low') {
      data = data.filter(d => d.stock <= d.warnStock)
    }
    total.value = data.length
    const start = (page.current - 1) * page.size
    list.value = decorate(data.slice(start, start + page.size))
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

function toggleStatus(row: ProductRowView): void {
  const next: ProductStatus = row.status === 'on' ? 'off' : 'on'
  row.status = next
  const s = statusMap[next]
  row.statusText = s.text
  row.statusColor = s.color
  row.statusBg = s.bg
  ElMessage.success(`商品已${next === 'on' ? '上架' : '下架'}`)
}

function handleDelete(row: ProductRowView): void {
  list.value = list.value.filter(r => r.id !== row.id)
  total.value -= 1
  ElMessage.success('删除成功')
}

function handleBatchDelete(): void {
  ElMessageBox.confirm(
    `确定删除选中的 ${selection.value.length} 件商品吗？`,
    '批量删除',
    { type: 'warning' }
  ).then(() => {
    const ids = new Set(selection.value.map(r => r.id))
    list.value = list.value.filter(r => !ids.has(r.id))
    total.value -= ids.size
    selection.value = []
    ElMessage.success('批量删除成功')
  }).catch(() => {})
}

function go(path: string): void {
  router.push(path)
}

onMounted(fetchList)
</script>

<style lang="scss" scoped>
// ---------- 设计令牌 ----------
$primary: #409eff;
$success: #52b788;
$warning: #e6a23c;
$danger: #f56c6c;
$text-main: #1f2d3d;
$text-secondary: #8a94a6;
$text-regular: #5a6472;
$border-light: #eef1f6;
$bg-soft: #f7f9fc;
$radius-card: 14px;
$radius-block: 12px;
$gap: 16px;
$shadow-card: 0 2px 8px rgba(31, 45, 61, 0.04);
$shadow-hover: 0 10px 28px rgba(31, 45, 61, 0.10);

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

@mixin panel {
  // border-radius: $radius-card;
  border: 1px solid $border-light;
  box-shadow: $shadow-card;
  margin-bottom: $gap;
  transition: box-shadow 0.25s ease;

  &:hover {
    box-shadow: $shadow-hover;
  }

  :deep(.el-card__header) {
    padding: 14px 18px;
    border-bottom: 1px solid $border-light;
  }

  :deep(.el-card__body) {
    padding: 16px 18px;
  }
}

// ---------- 页面 ----------
.product-page {
  padding: $gap;
  // background: $bg-soft;
  min-height: 100%;
}

// ---------- 筛选 ----------
.filter-card {
  @include panel;

  .filter-form {
    display: flex;
    flex-wrap: wrap;
    gap: 0 4px;

    :deep(.el-form-item) {
      margin-bottom: 0;
    }
  }
}

// ---------- 列表 ----------
.panel-card {
  @include panel;
}

.panel-header {
  @include flex-between;

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
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

// 响应式
@media (max-width: 768px) {
  .filter-form {
    :deep(.el-form-item) {
      width: 100%;
    }
  }
}
</style>