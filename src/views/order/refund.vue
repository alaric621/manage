<template>
  <div class="list-page refund-page">
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
        <ElFormItem label="售后单/订单">
          <ElInput
            v-model="query.keyword"
            placeholder="售后单号/订单号/会员"
            clearable
            style="width: 240px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <Icon icon="solar:magnifer-bold-duotone" width="16" />
            </template>
          </ElInput>
        </ElFormItem>
        <ElFormItem label="售后类型">
          <ElSelect v-model="query.type" placeholder="全部类型" clearable style="width: 140px">
            <ElOption label="仅退款" value="refund-only" />
            <ElOption label="退货退款" value="return-refund" />
            <ElOption label="换货" value="exchange" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="状态">
          <ElSelect v-model="query.status" placeholder="全部状态" clearable style="width: 140px">
            <ElOption label="待审核" value="pending" />
            <ElOption label="已同意" value="approved" />
            <ElOption label="已拒绝" value="rejected" />
            <ElOption label="已完成" value="completed" />
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
            售后/退款
            <span class="title-sub">共 {{ total }} 条</span>
          </div>
        </div>
      </template>

      <!-- 状态标签页 -->
      <ElTabs v-model="activeTab" class="status-tabs" @tab-change="handleTabChange">
        <ElTabPane label="全部" name="all" />
        <ElTabPane label="待审核" name="pending" />
        <ElTabPane label="已同意" name="approved" />
        <ElTabPane label="已拒绝" name="rejected" />
        <ElTabPane label="已完成" name="completed" />
      </ElTabs>

      <ElTable v-loading="loading" :data="list" class="pretty-table" row-key="id">
        <ElTableColumn label="售后单号" width="170">
          <template #default="{ row }">
            <div class="refund-no-cell">
              <span class="refund-no">{{ row.no }}</span>
              <span class="order-no">订单：{{ row.orderNo }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="会员" width="140">
          <template #default="{ row }">
            <div class="member-cell">
              <div class="member-avatar" :style="{ background: row.avatarBg }">
                {{ row.memberName.charAt(0) }}
              </div>
              <span class="member-name">{{ row.memberName }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="商品" min-width="220">
          <template #default="{ row }">
            <div class="goods-cell">
              <div class="goods-thumb" :style="{ background: row.goodsThumb }">
                <Icon :icon="row.goodsIcon" width="18" />
              </div>
              <div class="goods-meta">
                <div class="goods-name">{{ row.goodsName }}</div>
                <div class="goods-spec">{{ row.goodsSpec }}</div>
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="售后类型" width="110">
          <template #default="{ row }">
            <ElTag size="small" effect="light" round :type="row.typeTagType">{{ row.typeText }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="退款金额" width="120" align="right">
          <template #default="{ row }">
            <span class="amount">¥ {{ row.amount.toFixed(2) }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="申请原因" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">{{ row.reason }}</template>
        </ElTableColumn>
        <ElTableColumn label="状态" width="110">
          <template #default="{ row }">
            <span class="status-dot" :style="{ color: row.statusColor, background: row.statusBg }">
              <i class="dot"></i>{{ row.statusText }}
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createdAt" label="申请时间" width="170" />
        <ElTableColumn label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <ElButton link type="primary" size="small" @click="openDetail(row)">详情</ElButton>
            <template v-if="row.status === 'pending'">
              <ElButton link type="success" size="small" @click="handleAudit(row, 'approved')">同意</ElButton>
              <ElButton link type="danger" size="small" @click="handleAudit(row, 'rejected')">拒绝</ElButton>
            </template>
            <ElButton
              v-if="row.status === 'approved'"
              link
              type="primary"
              size="small"
              @click="handleComplete(row)"
            >
              完成退款
            </ElButton>
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
    <ElDrawer v-model="drawerVisible" title="售后详情" size="540px">
      <template v-if="currentRefund">
        <div class="refund-summary">
          <div class="summary-row">
            <span class="summary-label">售后单号</span>
            <span class="summary-value">{{ currentRefund.no }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">关联订单</span>
            <span class="summary-value">{{ currentRefund.orderNo }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">状态</span>
            <span class="status-dot" :style="{ color: currentRefund.statusColor, background: currentRefund.statusBg }">
              <i class="dot"></i>{{ currentRefund.statusText }}
            </span>
          </div>
        </div>

        <div class="section-title">商品信息</div>
        <div class="goods-detail">
          <div class="goods-thumb" :style="{ background: currentRefund.goodsThumb }">
            <Icon :icon="currentRefund.goodsIcon" width="22" />
          </div>
          <div class="goods-meta">
            <div class="goods-name">{{ currentRefund.goodsName }}</div>
            <div class="goods-spec">{{ currentRefund.goodsSpec }}</div>
          </div>
          <div class="goods-price">¥ {{ currentRefund.amount.toFixed(2) }}</div>
        </div>

        <div class="section-title">售后信息</div>
        <ElDescriptions :column="1" border class="drawer-desc">
          <ElDescriptionsItem label="售后类型">{{ currentRefund.typeText }}</ElDescriptionsItem>
          <ElDescriptionsItem label="退款金额">¥ {{ currentRefund.amount.toFixed(2) }}</ElDescriptionsItem>
          <ElDescriptionsItem label="申请原因">{{ currentRefund.reason }}</ElDescriptionsItem>
          <ElDescriptionsItem label="问题描述">{{ currentRefund.desc }}</ElDescriptionsItem>
          <ElDescriptionsItem label="申请时间">{{ currentRefund.createdAt }}</ElDescriptionsItem>
        </ElDescriptions>

        <div v-if="currentRefund.images.length" class="section-title">凭证图片</div>
        <div v-if="currentRefund.images.length" class="refund-images">
          <div v-for="(img, idx) in currentRefund.images" :key="idx" class="refund-image" :style="{ background: img }">
            <Icon icon="solar:gallery-bold-duotone" width="18" />
          </div>
        </div>

        <div class="drawer-actions">
          <template v-if="currentRefund.status === 'pending'">
            <ElButton type="success" @click="handleAudit(currentRefund, 'approved'); drawerVisible = false">
              同意售后
            </ElButton>
            <ElButton type="danger" plain @click="handleAudit(currentRefund, 'rejected'); drawerVisible = false">
              拒绝售后
            </ElButton>
          </template>
          <ElButton
            v-if="currentRefund.status === 'approved'"
            type="primary"
            @click="handleComplete(currentRefund); drawerVisible = false"
          >
            完成退款
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
type RefundType = 'refund-only' | 'return-refund' | 'exchange'
type RefundStatus = 'pending' | 'approved' | 'rejected' | 'completed'
type TabName = 'all' | RefundStatus

interface RefundRow {
  id: number
  no: string
  orderNo: string
  memberName: string
  avatarBg: string
  goodsName: string
  goodsIcon: string
  goodsThumb: string
  goodsSpec: string
  type: RefundType
  amount: number
  reason: string
  desc: string
  status: RefundStatus
  createdAt: string
  images: string[]
}

interface RefundView extends RefundRow {
  typeText: string
  typeTagType: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  statusText: string
  statusColor: string
  statusBg: string
}

interface QueryState {
  keyword: string
  type: '' | RefundType
  status: '' | RefundStatus
}

// ---------- 概览 ----------
const stats = computed(() => {
  const total = mockData.length
  const pending = mockData.filter(d => d.status === 'pending').length
  const approved = mockData.filter(d => d.status === 'approved').length
  const amount = mockData.reduce((s, d) => s + d.amount, 0)
  return [
    { label: '售后总数', value: total, icon: 'solar:refresh-circle-bold-duotone', color: '#409eff', bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
    { label: '待审核', value: pending, icon: 'solar:clock-circle-bold-duotone', color: '#e6a23c', bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)' },
    { label: '已同意', value: approved, icon: 'solar:check-circle-bold-duotone', color: '#52b788', bg: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' },
    { label: '退款总额', value: `¥ ${amount.toLocaleString()}`, icon: 'solar:wallet-money-bold-duotone', color: '#f56c6c', bg: 'linear-gradient(135deg, #ffeaea, #ffd6d6)' }
  ]
})

// ---------- 查询 ----------
const query = reactive<QueryState>({ keyword: '', type: '', status: '' })

const activeTab = ref<TabName>('all')
function handleTabChange(name: string | number): void {
  const tab = String(name) as TabName
  query.status = tab === 'all' ? '' : (tab as RefundStatus)
  page.current = 1
  fetchList()
}

// ---------- 列表 ----------
const loading = ref(false)
const list = ref<RefundView[]>([])
const total = ref(0)
const page = reactive({ current: 1, size: 10 })

const mockData: RefundRow[] = [
  { id: 1, no: 'RF20261030001', orderNo: 'SO20261030001', memberName: '张三', avatarBg: '#409eff', goodsName: '无线蓝牙耳机 Pro', goodsIcon: 'solar:headphones-round-sound-bold-duotone', goodsThumb: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)', goodsSpec: '黑色 / 标准版', type: 'refund-only', amount: 399, reason: '商品质量问题', desc: '右耳有电流声', status: 'pending', createdAt: '2026-10-30 10:30', images: ['linear-gradient(135deg, #e8f3ff, #d3e6ff)'] },
  { id: 2, no: 'RF20261030002', orderNo: 'SO20261030004', memberName: '赵六', avatarBg: '#9254de', goodsName: '轻薄羽绒服', goodsIcon: 'solar:bag-smile-bold-duotone', goodsThumb: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)', goodsSpec: '黑色 / L', type: 'return-refund', amount: 599, reason: '尺码不合适', desc: '尺码偏小，申请退货', status: 'approved', createdAt: '2026-10-29 16:00', images: [] },
  { id: 3, no: 'RF20261029001', orderNo: 'SO20261029006', memberName: '李四', avatarBg: '#52b788', goodsName: '智能手表 S9', goodsIcon: 'solar:watch-square-bold-duotone', goodsThumb: 'linear-gradient(135deg, #e6f7ee, #cdf0de)', goodsSpec: '白色 / 46mm', type: 'exchange', amount: 899, reason: '功能异常', desc: '心率监测不准', status: 'rejected', createdAt: '2026-10-29 10:00', images: [] },
  { id: 4, no: 'RF20261028001', orderNo: 'SO20261028003', memberName: '王五', avatarBg: '#e6a23c', goodsName: '保湿精华液 50ml', goodsIcon: 'solar:magic-stick-3-bold-duotone', goodsThumb: 'linear-gradient(135deg, #ffeaea, #ffd6d6)', goodsSpec: '50ml', type: 'refund-only', amount: 299, reason: '收到过期商品', desc: '生产日期已过期', status: 'completed', createdAt: '2026-10-28 09:20', images: ['linear-gradient(135deg, #ffeaea, #ffd6d6)'] }
]

const typeMap: Record<RefundType, { text: string; tagType: 'primary' | 'success' | 'warning' | 'danger' | 'info' }> = {
  'refund-only': { text: '仅退款', tagType: 'info' },
  'return-refund': { text: '退货退款', tagType: 'warning' },
  exchange: { text: '换货', tagType: 'primary' }
}

const statusMap: Record<RefundStatus, { text: string; color: string; bg: string }> = {
  pending: { text: '待审核', color: '#e6a23c', bg: 'rgba(230,162,60,0.12)' },
  approved: { text: '已同意', color: '#52b788', bg: 'rgba(82,183,136,0.12)' },
  rejected: { text: '已拒绝', color: '#f56c6c', bg: 'rgba(245,108,108,0.12)' },
  completed: { text: '已完成', color: '#909399', bg: 'rgba(144,147,153,0.12)' }
}

function decorate(rows: RefundRow[]): RefundView[] {
  return rows.map(r => {
    const s = statusMap[r.status]
    const t = typeMap[r.type]
    return {
      ...r,
      typeText: t.text,
      typeTagType: t.tagType,
      statusText: s.text,
      statusColor: s.color,
      statusBg: s.bg
    }
  })
}

async function fetchList(): Promise<void> {
  loading.value = true
  try {
    await new Promise(r => setTimeout(r, 300))
    let data = [...mockData]
    if (query.keyword) {
      const k = query.keyword.toLowerCase()
      data = data.filter(d =>
        d.no.toLowerCase().includes(k) ||
        d.orderNo.toLowerCase().includes(k) ||
        d.memberName.toLowerCase().includes(k)
      )
    }
    if (query.type) data = data.filter(d => d.type === query.type)
    if (query.status) data = data.filter(d => d.status === query.status)
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
  query.type = ''
  query.status = ''
  activeTab.value = 'all'
  page.current = 1
  fetchList()
}

// ---------- 操作 ----------
function handleAudit(row: RefundView, status: RefundStatus): void {
  const action = status === 'approved' ? '同意' : '拒绝'
  ElMessageBox.confirm(`确定${action}该售后申请吗？`, '提示', { type: 'warning' })
    .then(() => {
      const target = mockData.find(d => d.id === row.id)
      if (target) target.status = status
      const s = statusMap[status]
      row.status = status
      row.statusText = s.text
      row.statusColor = s.color
      row.statusBg = s.bg
      ElMessage.success(`已${action}`)
    })
    .catch(() => {})
}

function handleComplete(row: RefundView): void {
  ElMessageBox.confirm('确定完成退款操作吗？', '提示', { type: 'warning' })
    .then(() => {
      const target = mockData.find(d => d.id === row.id)
      if (target) target.status = 'completed'
      const s = statusMap.completed
      row.status = 'completed'
      row.statusText = s.text
      row.statusColor = s.color
      row.statusBg = s.bg
      ElMessage.success('退款已完成')
    })
    .catch(() => {})
}

// ---------- 详情 ----------
const drawerVisible = ref(false)
const currentRefund = ref<RefundView | null>(null)

function openDetail(row: RefundView): void {
  currentRefund.value = row
  drawerVisible.value = true
}

onMounted(fetchList)
</script>

<style lang="scss" scoped>
.refund-page {
  .refund-no-cell {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .refund-no {
      font-size: 13px;
      font-weight: 500;
      color: #1f2d3d;
      font-family: monospace;
    }

    .order-no {
      font-size: 12px;
      color: #8a94a6;
    }
  }

  .member-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .member-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 12px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .member-name {
      font-size: 13px;
      color: #1f2d3d;
    }
  }

  .goods-cell {
    display: flex;
    align-items: center;
    gap: 10px;

    .goods-thumb {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #409eff;
      flex-shrink: 0;
    }

    .goods-name {
      font-size: 13px;
      font-weight: 500;
      color: #1f2d3d;
    }

    .goods-spec {
      margin-top: 2px;
      font-size: 12px;
      color: #8a94a6;
    }
  }

  .amount {
    font-weight: 600;
    color: #f56c6c;
  }

  // 详情
  .refund-summary {
    padding: 14px 16px;
    background: #f7f9fc;
    border-radius: 12px;
    margin-bottom: 16px;

    .summary-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;

      &:not(:last-child) {
        border-bottom: 1px dashed #eef1f6;
      }
    }

    .summary-label {
      color: #8a94a6;
    }

    .summary-value {
      color: #1f2d3d;
      font-weight: 500;
    }
  }

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #1f2d3d;
    margin: 18px 0 10px;
  }

  .goods-detail {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: #f7f9fc;
    border-radius: 10px;

    .goods-thumb {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #409eff;
      flex-shrink: 0;
    }

    .goods-meta {
      flex: 1;
      min-width: 0;
    }

    .goods-name {
      font-size: 13px;
      font-weight: 500;
      color: #1f2d3d;
    }

    .goods-spec {
      margin-top: 2px;
      font-size: 12px;
      color: #8a94a6;
    }

    .goods-price {
      font-size: 14px;
      font-weight: 600;
      color: #f56c6c;
    }
  }

  .drawer-desc {
    :deep(.el-descriptions__label) {
      width: 100px;
      color: #8a94a6;
      background: #f8fafd;
    }
  }

  .refund-images {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .refund-image {
    width: 80px;
    height: 80px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #409eff;
    border: 1px solid #eef1f6;
  }

  .drawer-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #eef1f6;
  }
}
</style>