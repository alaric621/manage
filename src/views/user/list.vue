<template>
  <div class="list-page member-page">
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
        <ElFormItem label="会员">
          <ElInput
            v-model="query.keyword"
            placeholder="昵称/手机号/会员编号"
            clearable
            style="width: 220px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <Icon icon="solar:magnifer-bold-duotone" width="16" />
            </template>
          </ElInput>
        </ElFormItem>
        <ElFormItem label="会员等级">
          <ElSelect v-model="query.level" placeholder="全部等级" clearable style="width: 150px">
            <ElOption v-for="l in levels" :key="l.value" :label="l.label" :value="l.value" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="状态">
          <ElSelect v-model="query.status" placeholder="全部状态" clearable style="width: 140px">
            <ElOption label="正常" value="normal" />
            <ElOption label="禁用" value="disabled" />
            <ElOption label="黑名单" value="blacklist" />
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
            会员列表
            <span class="title-sub">共 {{ total }} 位</span>
          </div>
          <div class="panel-actions">
            <ElButton
              v-if="selection.length"
              type="danger"
              plain
              size="small"
              @click="handleBatchDisable"
            >
              <Icon icon="solar:user-block-bold-duotone" class="btn-icon" />
              批量禁用（{{ selection.length }}）
            </ElButton>
            <ElButton type="primary" size="small" @click="handleExport">
              <Icon icon="solar:download-bold-duotone" class="btn-icon" />导出
            </ElButton>
          </div>
        </div>
      </template>

      <!-- 状态标签页 -->
      <ElTabs v-model="activeTab" class="status-tabs" @tab-change="handleTabChange">
        <ElTabPane label="全部" name="all" />
        <ElTabPane label="正常" name="normal" />
        <ElTabPane label="禁用" name="disabled" />
        <ElTabPane label="黑名单" name="blacklist" />
      </ElTabs>

      <ElTable
        v-loading="loading"
        :data="list"
        class="pretty-table"
        row-key="id"
        @selection-change="handleSelectionChange"
      >
        <ElTableColumn type="selection" width="46" align="center" />
        <ElTableColumn label="会员" min-width="240">
          <template #default="{ row }">
            <div class="member-cell" @click="openDetail(row)">
              <div class="member-avatar" :style="{ background: row.avatarBg }">
                {{ row.nickname.charAt(0) }}
              </div>
              <div class="member-meta">
                <div class="member-name">
                  {{ row.nickname }}
                  <ElTag v-if="row.levelTag" :type="row.levelTagType" size="small" effect="light" round>
                    {{ row.levelTag }}
                  </ElTag>
                </div>
                <div class="member-no">ID：{{ row.no }}</div>
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="手机号" width="130">
          <template #default="{ row }">{{ maskPhone(row.phone) }}</template>
        </ElTableColumn>
        <ElTableColumn label="会员等级" width="110">
          <template #default="{ row }">{{ row.level }}</template>
        </ElTableColumn>
        <ElTableColumn label="积分" width="90" align="right">
          <template #default="{ row }">{{ row.points }}</template>
        </ElTableColumn>
        <ElTableColumn label="累计消费" width="120" align="right">
          <template #default="{ row }">
            <span class="amount">¥ {{ row.totalAmount.toFixed(2) }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="订单数" width="90" align="right">
          <template #default="{ row }">{{ row.orderCount }}</template>
        </ElTableColumn>
        <ElTableColumn label="状态" width="100">
          <template #default="{ row }">
            <span class="status-dot" :style="{ color: row.statusColor, background: row.statusBg }">
              <i class="dot"></i>{{ row.statusText }}
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createdAt" label="注册时间" width="170" />
        <ElTableColumn label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <ElButton link type="primary" size="small" @click="openDetail(row)">详情</ElButton>
            <ElButton
              link
              :type="row.status === 'normal' ? 'warning' : 'success'"
              size="small"
              @click="toggleStatus(row)"
            >
              {{ row.status === 'normal' ? '禁用' : '启用' }}
            </ElButton>
            <ElPopconfirm title="确定将该会员加入黑名单？" @confirm="handleBlacklist(row)">
              <template #reference>
                <ElButton link type="danger" size="small" :disabled="row.status === 'blacklist'">
                  拉黑
                </ElButton>
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

    <!-- 会员详情抽屉 -->
    <ElDrawer v-model="drawerVisible" title="会员详情" size="480px">
      <template v-if="currentMember">
        <div class="drawer-header">
          <div class="drawer-avatar" :style="{ background: currentMember.avatarBg }">
            {{ currentMember.nickname.charAt(0) }}
          </div>
          <div class="drawer-info">
            <div class="drawer-name">
              {{ currentMember.nickname }}
              <ElTag v-if="currentMember.levelTag" :type="currentMember.levelTagType" size="small" effect="light" round>
                {{ currentMember.levelTag }}
              </ElTag>
            </div>
            <div class="drawer-no">会员 ID：{{ currentMember.no }}</div>
          </div>
        </div>

        <ElDescriptions :column="1" border class="drawer-desc">
          <ElDescriptionsItem label="手机号">{{ currentMember.phone }}</ElDescriptionsItem>
          <ElDescriptionsItem label="会员等级">{{ currentMember.level }}</ElDescriptionsItem>
          <ElDescriptionsItem label="积分">{{ currentMember.points }}</ElDescriptionsItem>
          <ElDescriptionsItem label="累计消费">¥ {{ currentMember.totalAmount.toFixed(2) }}</ElDescriptionsItem>
          <ElDescriptionsItem label="订单数">{{ currentMember.orderCount }}</ElDescriptionsItem>
          <ElDescriptionsItem label="注册时间">{{ currentMember.createdAt }}</ElDescriptionsItem>
          <ElDescriptionsItem label="最近登录">{{ currentMember.lastLogin }}</ElDescriptionsItem>
          <ElDescriptionsItem label="状态">
            <span class="status-dot" :style="{ color: currentMember.statusColor, background: currentMember.statusBg }">
              <i class="dot"></i>{{ currentMember.statusText }}
            </span>
          </ElDescriptionsItem>
        </ElDescriptions>

        <div class="drawer-actions">
          <ElButton type="primary" @click="toggleStatus(currentMember)">
            {{ currentMember.status === 'normal' ? '禁用会员' : '启用会员' }}
          </ElButton>
          <ElButton type="danger" plain :disabled="currentMember.status === 'blacklist'" @click="handleBlacklist(currentMember)">
            加入黑名单
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
type MemberStatus = 'normal' | 'disabled' | 'blacklist'
type TabName = 'all' | MemberStatus

interface MemberRow {
  id: number
  no: string
  nickname: string
  avatarBg: string
  phone: string
  level: string
  levelTag: string
  levelTagType: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  points: number
  totalAmount: number
  orderCount: number
  status: MemberStatus
  createdAt: string
  lastLogin: string
}

interface MemberView extends MemberRow {
  statusText: string
  statusColor: string
  statusBg: string
}

interface QueryState {
  keyword: string
  level: string
  status: '' | MemberStatus
}

// ---------- 概览 ----------
const stats = computed(() => {
  const total = mockData.length
  const normal = mockData.filter(d => d.status === 'normal').length
  const disabled = mockData.filter(d => d.status === 'disabled').length
  const blacklist = mockData.filter(d => d.status === 'blacklist').length
  return [
    { label: '会员总数', value: total, icon: 'solar:users-group-rounded-bold-duotone', color: '#409eff', bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
    { label: '正常会员', value: normal, icon: 'solar:user-check-bold-duotone', color: '#52b788', bg: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' },
    { label: '已禁用', value: disabled, icon: 'solar:user-block-bold-duotone', color: '#e6a23c', bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)' },
    { label: '黑名单', value: blacklist, icon: 'solar:forbidden-circle-bold-duotone', color: '#f56c6c', bg: 'linear-gradient(135deg, #ffeaea, #ffd6d6)' }
  ]
})

// ---------- 查询 ----------
const query = reactive<QueryState>({ keyword: '', level: '', status: '' })
const levels = [
  { label: '普通会员', value: '普通会员' },
  { label: '银卡会员', value: '银卡会员' },
  { label: '金卡会员', value: '金卡会员' },
  { label: '钻石会员', value: '钻石会员' }
]

const activeTab = ref<TabName>('all')
function handleTabChange(name: string | number): void {
  const tab = String(name) as TabName
  query.status = tab === 'all' ? '' : (tab as MemberStatus)
  page.current = 1
  fetchList()
}

// ---------- 列表 ----------
const loading = ref(false)
const list = ref<MemberView[]>([])
const total = ref(0)
const page = reactive({ current: 1, size: 10 })
const selection = ref<MemberView[]>([])

const mockData: MemberRow[] = [
  { id: 1, no: 'M20261030001', nickname: '张三', avatarBg: '#409eff', phone: '13812345678', level: '金卡会员', levelTag: '金卡', levelTagType: 'warning', points: 12860, totalAmount: 12860, orderCount: 36, status: 'normal', createdAt: '2025-06-01 10:00', lastLogin: '2026-10-30 09:12' },
  { id: 2, no: 'M20261030002', nickname: '李四', avatarBg: '#52b788', phone: '13987654321', level: '钻石会员', levelTag: '钻石', levelTagType: 'danger', points: 35680, totalAmount: 35680, orderCount: 86, status: 'normal', createdAt: '2025-03-12 14:20', lastLogin: '2026-10-29 18:40' },
  { id: 3, no: 'M20261030003', nickname: '王五', avatarBg: '#e6a23c', phone: '13711112222', level: '普通会员', levelTag: '普通', levelTagType: 'info', points: 520, totalAmount: 520, orderCount: 2, status: 'disabled', createdAt: '2026-08-15 09:30', lastLogin: '2026-10-20 12:00' },
  { id: 4, no: 'M20261030004', nickname: '赵六', avatarBg: '#9254de', phone: '13633334444', level: '银卡会员', levelTag: '银卡', levelTagType: 'primary', points: 3860, totalAmount: 3860, orderCount: 18, status: 'normal', createdAt: '2025-11-02 16:45', lastLogin: '2026-10-30 08:22' },
  { id: 5, no: 'M20261030005', nickname: '孙七', avatarBg: '#f56c6c', phone: '13555556666', level: '普通会员', levelTag: '普通', levelTagType: 'info', points: 86, totalAmount: 86, orderCount: 1, status: 'blacklist', createdAt: '2026-09-20 11:10', lastLogin: '2026-09-25 20:05' },
  { id: 6, no: 'M20261030006', nickname: '周八', avatarBg: '#13c2c2', phone: '13477778888', level: '金卡会员', levelTag: '金卡', levelTagType: 'warning', points: 15600, totalAmount: 15600, orderCount: 42, status: 'normal', createdAt: '2025-07-08 13:15', lastLogin: '2026-10-30 07:50' }
]

const statusMap: Record<MemberStatus, { text: string; color: string; bg: string }> = {
  normal: { text: '正常', color: '#52b788', bg: 'rgba(82,183,136,0.12)' },
  disabled: { text: '禁用', color: '#e6a23c', bg: 'rgba(230,162,60,0.12)' },
  blacklist: { text: '黑名单', color: '#f56c6c', bg: 'rgba(245,108,108,0.12)' }
}

function decorate(rows: MemberRow[]): MemberView[] {
  return rows.map(r => {
    const s = statusMap[r.status]
    return { ...r, statusText: s.text, statusColor: s.color, statusBg: s.bg }
  })
}

function maskPhone(phone: string): string {
  if (phone.length !== 11) return phone
  return `${phone.slice(0, 3)}****${phone.slice(7)}`
}

async function fetchList(): Promise<void> {
  loading.value = true
  try {
    await new Promise(r => setTimeout(r, 300))
    let data = [...mockData]
    if (query.keyword) {
      const k = query.keyword.toLowerCase()
      data = data.filter(d =>
        d.nickname.toLowerCase().includes(k) ||
        d.phone.includes(query.keyword) ||
        d.no.toLowerCase().includes(k)
      )
    }
    if (query.level) {
      data = data.filter(d => d.level === query.level)
    }
    if (query.status) {
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
  query.level = ''
  query.status = ''
  activeTab.value = 'all'
  page.current = 1
  fetchList()
}

function handleSelectionChange(val: MemberView[]): void {
  selection.value = val
}

// ---------- 操作 ----------
function toggleStatus(row: MemberView): void {
  const next: MemberStatus = row.status === 'normal' ? 'disabled' : 'normal'
  const target = mockData.find(d => d.id === row.id)
  if (target) target.status = next
  const s = statusMap[next]
  row.status = next
  row.statusText = s.text
  row.statusColor = s.color
  row.statusBg = s.bg
  ElMessage.success(`会员已${next === 'normal' ? '启用' : '禁用'}`)
}

function handleBlacklist(row: MemberView): void {
  const target = mockData.find(d => d.id === row.id)
  if (target) target.status = 'blacklist'
  const s = statusMap.blacklist
  row.status = 'blacklist'
  row.statusText = s.text
  row.statusColor = s.color
  row.statusBg = s.bg
  ElMessage.success('已加入黑名单')
}

function handleBatchDisable(): void {
  if (!selection.value.length) return
  ElMessageBox.confirm(`确定批量禁用选中的 ${selection.value.length} 位会员吗？`, '提示', { type: 'warning' })
    .then(() => {
      selection.value.forEach(row => {
        const target = mockData.find(d => d.id === row.id)
        if (target) target.status = 'disabled'
      })
      selection.value = []
      ElMessage.success('批量禁用成功')
      fetchList()
    })
    .catch(() => {})
}

function handleExport(): void {
  ElMessage.success('导出任务已提交，请稍后在导出记录中下载')
}

// ---------- 详情抽屉 ----------
const drawerVisible = ref(false)
const currentMember = ref<MemberView | null>(null)

function openDetail(row: MemberView): void {
  currentMember.value = row
  drawerVisible.value = true
}

onMounted(fetchList)
</script>

<style lang="scss" scoped>
// 仅保留会员列表独有的样式，其余由全局 .list-page 提供
.member-page {
  .member-cell {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;

    .member-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 15px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .member-name {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 500;
      color: #1f2d3d;
    }

    .member-no {
      margin-top: 2px;
      font-size: 12px;
      color: #8a94a6;
    }

    &:hover .member-name {
      color: #409eff;
    }
  }

  .amount {
    font-weight: 600;
    color: #1f2d3d;
  }
}
</style>