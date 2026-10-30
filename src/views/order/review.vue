<template>
  <div class="review-page">
    <!-- 数据概览 -->
    <ElRow :gutter="16" class="stat-row">
      <ElCol v-for="s in stats" :key="s.label" :xs="12" :sm="12" :md="6">
        <div class="stat-card" :style="{ '--accent': s.color, '--accent-soft': s.bg }">
          <div class="stat-icon">
            <Icon :icon="s.icon" width="22" height="22" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ s.value }}</div>
            <div class="stat-label">{{ s.label }}</div>
          </div>
        </div>
      </ElCol>
    </ElRow>

    <!-- 筛选区 -->
    <ElCard class="panel-card filter-card" shadow="never">
      <ElForm :model="query" inline class="filter-form" @submit.prevent>
        <ElFormItem label="商品名称">
          <ElInput
            v-model="query.keyword"
            placeholder="输入商品名称/会员"
            clearable
            style="width: 220px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <Icon icon="solar:magnifer-bold-duotone" width="16" />
            </template>
          </ElInput>
        </ElFormItem>
        <ElFormItem label="评分">
          <ElSelect v-model="query.rating" placeholder="全部评分" clearable style="width: 140px">
            <ElOption label="5 星" :value="5" />
            <ElOption label="4 星" :value="4" />
            <ElOption label="3 星" :value="3" />
            <ElOption label="2 星" :value="2" />
            <ElOption label="1 星" :value="1" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="状态">
          <ElSelect v-model="query.status" placeholder="全部状态" clearable style="width: 140px">
            <ElOption label="待审核" value="pending" />
            <ElOption label="已通过" value="approved" />
            <ElOption label="已拒绝" value="rejected" />
            <ElOption label="有追评" value="followup" />
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
            评价列表
            <span class="title-sub">共 {{ total }} 条</span>
          </div>
          <div class="panel-actions">
            <ElButton
              v-if="selection.length"
              type="success"
              plain
              size="small"
              @click="handleBatchAudit('approved')"
            >
              <Icon icon="solar:check-circle-bold-duotone" class="btn-icon" />
              批量通过（{{ selection.length }}）
            </ElButton>
            <ElButton
              v-if="selection.length"
              type="danger"
              plain
              size="small"
              @click="handleBatchAudit('rejected')"
            >
              <Icon icon="solar:close-circle-bold-duotone" class="btn-icon" />
              批量拒绝
            </ElButton>
          </div>
        </div>
      </template>

      <!-- 状态标签页 -->
      <ElTabs v-model="activeTab" class="status-tabs" @tab-change="handleTabChange">
        <ElTabPane label="全部" name="all" />
        <ElTabPane label="待审核" name="pending" />
        <ElTabPane label="已通过" name="approved" />
        <ElTabPane label="已拒绝" name="rejected" />
        <ElTabPane label="有追评" name="followup" />
      </ElTabs>

      <ElTable
        v-loading="loading"
        :data="list"
        class="pretty-table"
        row-key="id"
        @selection-change="handleSelectionChange"
      >
        <ElTableColumn type="selection" width="46" align="center" />
        <ElTableColumn label="商品" min-width="220">
          <template #default="{ row }">
            <div class="product-cell">
              <div class="product-thumb" :style="{ background: row.thumb }">
                <Icon :icon="row.icon" width="20" height="20" />
              </div>
              <div class="product-meta">
                <div class="product-name">{{ row.productName }}</div>
                <div class="product-no">{{ row.productNo }}</div>
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="会员" width="140">
          <template #default="{ row }">
            <div class="user-cell">
              <div class="user-avatar" :style="{ background: row.avatarBg }">
                {{ row.userName.charAt(0) }}
              </div>
              <span class="user-name">{{ row.userName }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="评分" width="120">
          <template #default="{ row }">
            <ElRate :model-value="row.rating" disabled size="small" />
          </template>
        </ElTableColumn>
        <ElTableColumn label="评价内容" min-width="260">
          <template #default="{ row }">
            <div class="content-cell">
              <div class="content-text">{{ row.content }}</div>
              <div v-if="row.images.length" class="content-images">
                <div
                  v-for="(img, idx) in row.images"
                  :key="idx"
                  class="content-image"
                  :style="{ background: img }"
                >
                  <Icon icon="solar:gallery-bold-duotone" width="14" />
                </div>
              </div>
              <div v-if="row.followup" class="followup-tag">
                <Icon icon="solar:chat-round-line-bold-duotone" width="12" />
                有追评
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="状态" width="100">
          <template #default="{ row }">
            <span class="status-dot" :style="{ color: row.statusColor, background: row.statusBg }">
              <i class="dot"></i>{{ row.statusText }}
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createdAt" label="评价时间" width="170" />
        <ElTableColumn label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <ElButton link type="primary" size="small" @click="openDetail(row)">查看</ElButton>
            <template v-if="row.status === 'pending'">
              <ElButton link type="success" size="small" @click="handleAudit(row, 'approved')">
                通过
              </ElButton>
              <ElButton link type="danger" size="small" @click="handleAudit(row, 'rejected')">
                拒绝
              </ElButton>
            </template>
            <ElPopconfirm title="确定删除该评价？" @confirm="handleDelete(row)">
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
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="fetchList"
          @current-change="fetchList"
        />
      </div>
    </ElCard>

    <!-- 详情抽屉 -->
    <ElDrawer v-model="drawerVisible" title="评价详情" size="480px">
      <template v-if="currentReview">
        <div class="drawer-product">
          <div class="product-thumb" :style="{ background: currentReview.thumb }">
            <Icon :icon="currentReview.icon" width="22" height="22" />
          </div>
          <div>
            <div class="product-name">{{ currentReview.productName }}</div>
            <div class="product-no">{{ currentReview.productNo }}</div>
          </div>
        </div>

        <ElDescriptions :column="1" border class="drawer-desc">
          <ElDescriptionsItem label="会员">{{ currentReview.userName }}</ElDescriptionsItem>
          <ElDescriptionsItem label="评分">
            <ElRate :model-value="currentReview.rating" disabled size="small" />
          </ElDescriptionsItem>
          <ElDescriptionsItem label="评价时间">{{ currentReview.createdAt }}</ElDescriptionsItem>
          <ElDescriptionsItem label="状态">
            <span class="status-dot" :style="{ color: currentReview.statusColor, background: currentReview.statusBg }">
              <i class="dot"></i>{{ currentReview.statusText }}
            </span>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="评价内容">{{ currentReview.content }}</ElDescriptionsItem>
          <ElDescriptionsItem v-if="currentReview.followup" label="追评内容">
            {{ currentReview.followup }}
          </ElDescriptionsItem>
        </ElDescriptions>

        <div v-if="currentReview.images.length" class="drawer-images">
          <div class="drawer-section-title">评价图片</div>
          <div class="drawer-image-list">
            <div
              v-for="(img, idx) in currentReview.images"
              :key="idx"
              class="drawer-image"
              :style="{ background: img }"
            >
              <Icon icon="solar:gallery-bold-duotone" width="22" />
            </div>
          </div>
        </div>

        <div v-if="currentReview.status === 'pending'" class="drawer-actions">
          <ElButton type="success" @click="handleAudit(currentReview, 'approved'); drawerVisible = false">
            <Icon icon="solar:check-circle-bold-duotone" class="btn-icon" />审核通过
          </ElButton>
          <ElButton type="danger" @click="handleAudit(currentReview, 'rejected'); drawerVisible = false">
            <Icon icon="solar:close-circle-bold-duotone" class="btn-icon" />拒绝
          </ElButton>
        </div>
      </template>
    </ElDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Icon } from '@iconify/vue'

// ---------- 类型 ----------
type ReviewStatus = 'pending' | 'approved' | 'rejected'
type TabName = 'all' | 'pending' | 'approved' | 'rejected' | 'followup'

interface ReviewRow {
  id: number
  productName: string
  productNo: string
  icon: string
  thumb: string
  userName: string
  avatarBg: string
  rating: number
  content: string
  followup: string
  images: string[]
  status: ReviewStatus
  createdAt: string
}

interface ReviewView extends ReviewRow {
  statusText: string
  statusColor: string
  statusBg: string
}

interface QueryState {
  keyword: string
  rating: number | ''
  status: '' | ReviewStatus | 'followup'
}

// ---------- 概览统计 ----------
const stats = computed(() => {
  const total = mockData.length
  const pending = mockData.filter(d => d.status === 'pending').length
  const approved = mockData.filter(d => d.status === 'approved').length
  const avg = total ? (mockData.reduce((s, d) => s + d.rating, 0) / total).toFixed(1) : '0.0'
  return [
    { label: '评价总数', value: total, icon: 'solar:star-bold-duotone', color: '#409eff', bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
    { label: '待审核', value: pending, icon: 'solar:clock-circle-bold-duotone', color: '#e6a23c', bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)' },
    { label: '已通过', value: approved, icon: 'solar:check-circle-bold-duotone', color: '#52b788', bg: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' },
    { label: '平均评分', value: avg, icon: 'solar:medal-star-bold-duotone', color: '#9254de', bg: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)' }
  ]
})

// ---------- 查询 ----------
const query = reactive<QueryState>({ keyword: '', rating: '', status: '' })
const activeTab = ref<TabName>('all')

function handleTabChange(name: string | number): void {
  const tab = String(name) as TabName
  query.status = tab === 'all' ? '' : (tab as ReviewStatus | 'followup')
  page.current = 1
  fetchList()
}

// ---------- 列表 ----------
const loading = ref(false)
const list = ref<ReviewView[]>([])
const total = ref(0)
const page = reactive({ current: 1, size: 10 })
const selection = ref<ReviewView[]>([])

const mockData: ReviewRow[] = [
  { id: 1, productName: '无线蓝牙耳机 Pro', productNo: 'SP20261030001', icon: 'solar:headphones-round-sound-bold-duotone', thumb: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)', userName: '张三', avatarBg: '#409eff', rating: 5, content: '音质很好，降噪效果明显，续航也够用，非常满意！', followup: '', images: ['linear-gradient(135deg, #e8f3ff, #d3e6ff)', 'linear-gradient(135deg, #e6f7ee, #cdf0de)'], status: 'approved', createdAt: '2026-10-28 10:12' },
  { id: 2, productName: '智能手表 S9', productNo: 'SP20261030002', icon: 'solar:watch-square-bold-duotone', thumb: 'linear-gradient(135deg, #e6f7ee, #cdf0de)', userName: '李四', avatarBg: '#52b788', rating: 4, content: '外观漂亮，功能齐全，就是续航稍微短了点。', followup: '用了几天，整体体验不错，推荐购买。', images: [], status: 'approved', createdAt: '2026-10-27 15:30' },
  { id: 3, productName: '便携充电宝 20000mAh', productNo: 'SP20261030003', icon: 'solar:battery-charge-bold-duotone', thumb: 'linear-gradient(135deg, #fff4e6, #ffe4c4)', userName: '王五', avatarBg: '#e6a23c', rating: 3, content: '容量大，但有点重，携带不太方便。', followup: '', images: ['linear-gradient(135deg, #fff4e6, #ffe4c4)'], status: 'pending', createdAt: '2026-10-29 09:41' },
  { id: 4, productName: '轻薄羽绒服', productNo: 'SP20261030004', icon: 'solar:bag-smile-bold-duotone', thumb: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)', userName: '赵六', avatarBg: '#9254de', rating: 5, content: '保暖效果好，做工精致，性价比很高！', followup: '', images: [], status: 'approved', createdAt: '2026-10-26 14:20' },
  { id: 5, productName: '保湿精华液 50ml', productNo: 'SP20261030005', icon: 'solar:magic-stick-3-bold-duotone', thumb: 'linear-gradient(135deg, #ffeaea, #ffd6d6)', userName: '孙七', avatarBg: '#f56c6c', rating: 1, content: '收到货已经过期了，申请退款！', followup: '', images: ['linear-gradient(135deg, #ffeaea, #ffd6d6)'], status: 'pending', createdAt: '2026-10-29 08:15' },
  { id: 6, productName: '有机坚果礼盒', productNo: 'SP20261030006', icon: 'solar:gift-bold-duotone', thumb: 'linear-gradient(135deg, #fff9e6, #ffefc2)', userName: '周八', avatarBg: '#13c2c2', rating: 2, content: '包装破损，坚果不新鲜。', followup: '', images: [], status: 'rejected', createdAt: '2026-10-25 16:45' }
]

const statusMap: Record<ReviewStatus, { text: string; color: string; bg: string }> = {
  pending: { text: '待审核', color: '#e6a23c', bg: 'rgba(230,162,60,0.12)' },
  approved: { text: '已通过', color: '#52b788', bg: 'rgba(82,183,136,0.12)' },
  rejected: { text: '已拒绝', color: '#909399', bg: 'rgba(144,147,153,0.12)' }
}

function decorate(rows: ReviewRow[]): ReviewView[] {
  return rows.map(r => {
    const s = statusMap[r.status]
    return { ...r, statusText: s.text, statusColor: s.color, statusBg: s.bg }
  })
}

async function fetchList(): Promise<void> {
  loading.value = true
  try {
    await new Promise(r => setTimeout(r, 300))
    let data = [...mockData]
    if (query.keyword) {
      const k = query.keyword.toLowerCase()
      data = data.filter(d => d.productName.toLowerCase().includes(k) || d.userName.toLowerCase().includes(k))
    }
    if (query.rating) {
      data = data.filter(d => d.rating === query.rating)
    }
    if (query.status === 'followup') {
      data = data.filter(d => !!d.followup)
    } else if (query.status) {
      data = data.filter(d => d.status === query.status)
    }
    total.value = data.length
    const start = (page.current - 1) * page.size
    list.value = decorate(data.slice(start, start + page.size))
  } finally {
    loading.value = false
  }
}

function handleSearch(): void {
  page.current = 1
  fetchList()
}

function handleReset(): void {
  query.keyword = ''
  query.rating = ''
  query.status = ''
  activeTab.value = 'all'
  page.current = 1
  fetchList()
}

function handleSelectionChange(val: ReviewView[]): void {
  selection.value = val
}

// ---------- 审核 ----------
function handleAudit(row: ReviewView, status: ReviewStatus): void {
  const target = mockData.find(d => d.id === row.id)
  if (target) target.status = status
  const s = statusMap[status]
  row.status = status
  row.statusText = s.text
  row.statusColor = s.color
  row.statusBg = s.bg
  ElMessage.success(status === 'approved' ? '评价已通过' : '评价已拒绝')
}

function handleBatchAudit(status: ReviewStatus): void {
  if (!selection.value.length) return
  const action = status === 'approved' ? '通过' : '拒绝'
  ElMessageBox.confirm(`确定批量${action}选中的 ${selection.value.length} 条评价吗？`, '提示', { type: 'warning' })
    .then(() => {
      selection.value.forEach(row => {
        const target = mockData.find(d => d.id === row.id)
        if (target) target.status = status
      })
      selection.value = []
      ElMessage.success(`已批量${action}`)
      fetchList()
    })
    .catch(() => {})
}

function handleDelete(row: ReviewView): void {
  const idx = mockData.findIndex(d => d.id === row.id)
  if (idx > -1) mockData.splice(idx, 1)
  ElMessage.success('删除成功')
  fetchList()
}

// ---------- 详情抽屉 ----------
const drawerVisible = ref(false)
const currentReview = ref<ReviewView | null>(null)

function openDetail(row: ReviewView): void {
  currentReview.value = row
  drawerVisible.value = true
}

onMounted(fetchList)
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
$radius-card: 14px;
$radius-block: 12px;
$gap: 16px;
$shadow-card: 0 2px 8px rgba(31, 45, 61, 0.04);
$shadow-hover: 0 10px 28px rgba(31, 45, 61, 0.10);

@mixin flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.review-page {
  padding: $gap;
  // background: $bg-soft;
  min-height: 100%;
}

// ---------- 概览卡片 ----------
.stat-row {
  margin-bottom: $gap;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid $border-light;
  border-radius: $radius-card;
  box-shadow: $shadow-card;
  background: #fff;
  margin-bottom: $gap;
  transition: transform 0.25s ease, box-shadow 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-hover;
  }

  .stat-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    @include flex-center;
    background: var(--accent-soft);
    color: var(--accent);
    flex-shrink: 0;
  }

  .stat-value {
    font-size: 20px;
    font-weight: 700;
    color: $text-main;
  }

  .stat-label {
    font-size: 12px;
    color: $text-secondary;
  }
}

// ---------- 面板 ----------
.panel-card {
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

.filter-card {
  .filter-form {
    display: flex;
    flex-wrap: wrap;
    gap: 0 4px;

    :deep(.el-form-item) {
      margin-bottom: 0;
    }
  }
}

.panel-header {
  @include flex-between;
}

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

// ---------- 商品单元格 ----------
.product-cell {
  display: flex;
  align-items: center;
  gap: 10px;

  .product-thumb {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    @include flex-center;
    color: $primary;
    flex-shrink: 0;
  }

  .product-name {
    font-size: 13px;
    font-weight: 500;
    color: $text-main;
  }

  .product-no {
    margin-top: 2px;
    font-size: 12px;
    color: $text-secondary;
  }
}

// ---------- 会员单元格 ----------
.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .user-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    flex-shrink: 0;
  }

  .user-name {
    font-size: 13px;
    color: $text-main;
  }
}

// ---------- 评价内容 ----------
.content-cell {
  .content-text {
    font-size: 13px;
    color: $text-regular;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .content-images {
    display: flex;
    gap: 4px;
    margin-top: 6px;
  }

  .content-image {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    @include flex-center;
    color: $primary;
  }

  .followup-tag {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    margin-top: 6px;
    padding: 1px 8px;
    font-size: 11px;
    color: $primary;
    background: #e8f3ff;
    border-radius: 999px;
  }
}

// ---------- 状态 ----------
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

// ---------- 分页 ----------
.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

// ---------- 详情抽屉 ----------
.drawer-product {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: $bg-soft;
  border-radius: $radius-block;
  margin-bottom: 16px;

  .product-thumb {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    @include flex-center;
    color: $primary;
  }

  .product-name {
    font-size: 14px;
    font-weight: 600;
    color: $text-main;
  }

  .product-no {
    margin-top: 2px;
    font-size: 12px;
    color: $text-secondary;
  }
}

.drawer-desc {
  :deep(.el-descriptions__label) {
    width: 90px;
    color: $text-secondary;
    background: #f8fafd;
  }
}

.drawer-section-title {
  font-size: 13px;
  font-weight: 600;
  color: $text-main;
  margin: 16px 0 10px;
}

.drawer-images {
  .drawer-image-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .drawer-image {
    width: 80px;
    height: 80px;
    border-radius: 10px;
    @include flex-center;
    color: $primary;
    border: 1px solid $border-light;
  }
}

.drawer-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid $border-light;
}

// ---------- 响应式 ----------
@media (max-width: 768px) {
  .review-page {
    padding: 12px;
  }

  .filter-form {
    :deep(.el-form-item) {
      width: 100%;
    }
  }
}
</style>