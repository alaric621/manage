<template>
  <div class="list-page group-buy-page">
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
        <ElFormItem label="活动名称">
          <ElInput
            v-model="query.keyword"
            placeholder="活动名称/商品名称"
            clearable
            style="width: 220px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <Icon icon="solar:magnifer-bold-duotone" width="16" />
            </template>
          </ElInput>
        </ElFormItem>
        <ElFormItem label="成团人数">
          <ElSelect v-model="query.groupSize" placeholder="全部人数" clearable style="width: 140px">
            <ElOption label="2 人团" :value="2" />
            <ElOption label="3 人团" :value="3" />
            <ElOption label="5 人团" :value="5" />
            <ElOption label="10 人团" :value="10" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="状态">
          <ElSelect v-model="query.status" placeholder="全部状态" clearable style="width: 140px">
            <ElOption label="未开始" value="pending" />
            <ElOption label="进行中" value="active" />
            <ElOption label="已结束" value="expired" />
            <ElOption label="已停用" value="disabled" />
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
            拼团活动
            <span class="title-sub">共 {{ total }} 个活动</span>
          </div>
          <div class="panel-actions">
            <ElButton type="primary" size="small" @click="openCreate">
              <Icon icon="solar:add-circle-bold-duotone" class="btn-icon" />新增拼团
            </ElButton>
          </div>
        </div>
      </template>

      <!-- 状态标签页 -->
      <ElTabs v-model="activeTab" class="status-tabs" @tab-change="handleTabChange">
        <ElTabPane label="全部" name="all" />
        <ElTabPane label="未开始" name="pending" />
        <ElTabPane label="进行中" name="active" />
        <ElTabPane label="已结束" name="expired" />
        <ElTabPane label="已停用" name="disabled" />
      </ElTabs>

      <ElTable v-loading="loading" :data="list" class="pretty-table" row-key="id">
        <ElTableColumn label="活动" min-width="240">
          <template #default="{ row }">
            <div class="activity-cell">
              <div class="activity-badge" :style="{ background: row.bg, color: row.color }">
                <Icon icon="solar:users-group-two-rounded-bold-duotone" width="18" />
              </div>
              <div class="activity-meta">
                <div class="activity-name">{{ row.name }}</div>
                <div class="activity-size">{{ row.groupSize }} 人成团</div>
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="拼团价" width="130" align="right">
          <template #default="{ row }">
            <div class="price-cell">
              <span class="price">¥ {{ row.groupPrice.toFixed(2) }}</span>
              <span class="origin">¥ {{ row.originPrice.toFixed(2) }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="活动时间" width="200">
          <template #default="{ row }">
            <div class="period-cell">
              <div>{{ row.startAt }}</div>
              <div class="period-end">至 {{ row.endAt }}</div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="成团/开团" width="130" align="center">
          <template #default="{ row }">
            <div class="group-stat">
              <span class="stat-success">{{ row.successCount }}</span>
              <span class="stat-divider">/</span>
              <span class="stat-total">{{ row.totalGroups }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="成团率" width="120" align="center">
          <template #default="{ row }">
            <div class="rate-cell">
              <div class="rate-bar">
                <span class="rate-bar-fill" :style="{ width: row.successRate + '%' }"></span>
              </div>
              <span class="rate-text">{{ row.successRate }}%</span>
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
        <ElTableColumn label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <ElButton link type="primary" size="small" @click="openEdit(row)">编辑</ElButton>
            <ElButton link type="primary" size="small" @click="openGroups(row)">拼团记录</ElButton>
            <ElButton
              link
              :type="row.status === 'disabled' ? 'success' : 'warning'"
              size="small"
              @click="toggleStatus(row)"
            >
              {{ row.status === 'disabled' ? '启用' : '停用' }}
            </ElButton>
            <ElPopconfirm title="确定删除该活动？" @confirm="handleDelete(row)">
              <template #reference>
                <ElButton link type="danger" size="small">删除</ElButton>
              </template>
            </ElPopconfirm>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>

    <!-- 新增/编辑弹窗 -->
    <ElDialog
      v-model="dialogVisible"
      :title="formMode === 'create' ? '新增拼团活动' : '编辑拼团活动'"
      width="640px"
      destroy-on-close
    >
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px">
        <ElFormItem label="活动名称" prop="name">
          <ElInput v-model="form.name" placeholder="如：三人成团优惠" maxlength="30" show-word-limit />
        </ElFormItem>
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="成团人数" prop="groupSize">
              <ElInputNumber v-model="form.groupSize" :min="2" :max="99" controls-position="right" style="width: 100%" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="拼团有效期">
              <ElInputNumber v-model="form.validHours" :min="1" :max="168" controls-position="right" style="width: 100%">
                <template #suffix>小时</template>
              </ElInputNumber>
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="拼团价" prop="groupPrice">
              <ElInputNumber v-model="form.groupPrice" :min="0" :precision="2" controls-position="right" style="width: 100%">
                <template #prefix>¥</template>
              </ElInputNumber>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="原价">
              <ElInputNumber v-model="form.originPrice" :min="0" :precision="2" controls-position="right" style="width: 100%">
                <template #prefix>¥</template>
              </ElInputNumber>
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="开始时间" prop="startAt">
              <ElDatePicker v-model="form.startAt" type="datetime" style="width: 100%" placeholder="选择开始时间" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="结束时间" prop="endAt">
              <ElDatePicker v-model="form.endAt" type="datetime" style="width: 100%" placeholder="选择结束时间" />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElFormItem label="参与商品">
          <div class="goods-editor">
            <div v-for="(g, idx) in form.goodsList" :key="idx" class="goods-item">
              <div class="goods-thumb" :style="{ background: g.thumb }">
                <Icon :icon="g.icon" width="16" />
              </div>
              <div class="goods-meta">
                <div class="goods-name">{{ g.name }}</div>
                <div class="goods-sub">原价 ¥{{ g.price.toFixed(2) }}</div>
              </div>
              <ElButton link type="danger" size="small" @click="removeGoods(idx)">
                <Icon icon="solar:trash-bin-trash-bold-duotone" width="14" />
              </ElButton>
            </div>
            <ElButton size="small" class="add-goods-btn" @click="addGoods">
              <Icon icon="solar:add-circle-bold-duotone" class="btn-icon" />添加商品
            </ElButton>
          </div>
        </ElFormItem>
        <ElFormItem label="活动说明">
          <ElInput v-model="form.desc" type="textarea" :rows="3" maxlength="120" show-word-limit placeholder="活动规则说明" />
        </ElFormItem>
        <ElFormItem label="状态">
          <ElRadioGroup v-model="form.status">
            <ElRadio value="pending">未开始</ElRadio>
            <ElRadio value="active">进行中</ElRadio>
            <ElRadio value="disabled">停用</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="saving" @click="handleSave">保存</ElButton>
      </template>
    </ElDialog>

    <!-- 拼团记录抽屉 -->
    <ElDrawer v-model="groupsVisible" title="拼团记录" size="560px">
      <template v-if="currentActivity">
        <div class="drawer-activity">
          <div class="activity-badge" :style="{ background: currentActivity.bg, color: currentActivity.color }">
            <Icon icon="solar:users-group-two-rounded-bold-duotone" width="20" />
          </div>
          <div>
            <div class="activity-name">{{ currentActivity.name }}</div>
            <div class="activity-sub">
              {{ currentActivity.groupSize }} 人成团 · 拼团价 ¥{{ currentActivity.groupPrice.toFixed(2) }}
            </div>
          </div>
        </div>

        <div class="section-title">拼团记录（{{ mockGroups.length }}）</div>
        <div class="group-list">
          <div v-for="g in mockGroups" :key="g.id" class="group-item">
            <div class="group-header">
              <span class="group-no">团号：{{ g.no }}</span>
              <span class="status-dot" :style="{ color: g.statusColor, background: g.statusBg }">
                <i class="dot"></i>{{ g.statusText }}
              </span>
            </div>
            <div class="group-body">
              <div class="group-row">
                <span class="label">团长</span>
                <span>{{ g.leader }}</span>
              </div>
              <div class="group-row">
                <span class="label">已参与</span>
                <span>{{ g.joined }} / {{ g.groupSize }} 人</span>
              </div>
              <div class="group-row">
                <span class="label">开团时间</span>
                <span>{{ g.createdAt }}</span>
              </div>
              <div class="group-row">
                <span class="label">截止时间</span>
                <span>{{ g.expireAt }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </ElDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Icon } from '@iconify/vue'

// ---------- 类型 ----------
type ActivityStatus = 'pending' | 'active' | 'expired' | 'disabled'
type TabName = 'all' | ActivityStatus
type FormMode = 'create' | 'edit'

interface GroupGoods {
  name: string
  price: number
  icon: string
  thumb: string
}

interface GroupBuyRow {
  id: number
  name: string
  groupSize: number
  validHours: number
  groupPrice: number
  originPrice: number
  startAt: string
  endAt: string
  successCount: number
  totalGroups: number
  status: ActivityStatus
  desc: string
  goodsList: GroupGoods[]
}

interface GroupBuyView extends GroupBuyRow {
  successRate: number
  statusText: string
  statusColor: string
  statusBg: string
  bg: string
  color: string
}

interface GroupBuyForm {
  id: number | null
  name: string
  groupSize: number
  validHours: number
  groupPrice: number
  originPrice: number
  startAt: string
  endAt: string
  status: ActivityStatus
  desc: string
  goodsList: GroupGoods[]
}

interface QueryState {
  keyword: string
  groupSize: number | ''
  status: '' | ActivityStatus
}

interface GroupRecord {
  id: number
  no: string
  leader: string
  joined: number
  groupSize: number
  createdAt: string
  expireAt: string
  statusText: string
  statusColor: string
  statusBg: string
}

// ---------- 概览 ----------
const stats = computed(() => {
  const total = mockData.length
  const active = mockData.filter(d => d.status === 'active').length
  const success = mockData.reduce((s, d) => s + d.successCount, 0)
  const groups = mockData.reduce((s, d) => s + d.totalGroups, 0)
  return [
    { label: '活动总数', value: total, icon: 'solar:users-group-two-rounded-bold-duotone', color: '#409eff', bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
    { label: '进行中', value: active, icon: 'solar:play-circle-bold-duotone', color: '#52b788', bg: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' },
    { label: '成团数', value: success, icon: 'solar:check-circle-bold-duotone', color: '#e6a23c', bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)' },
    { label: '开团总数', value: groups, icon: 'solar:user-plus-bold-duotone', color: '#9254de', bg: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)' }
  ]
})

// ---------- 查询 ----------
const query = reactive<QueryState>({ keyword: '', groupSize: '', status: '' })

const activeTab = ref<TabName>('all')
function handleTabChange(name: string | number): void {
  const tab = String(name) as TabName
  query.status = tab === 'all' ? '' : (tab as ActivityStatus)
  page.current = 1
  fetchList()
}

// ---------- 列表 ----------
const loading = ref(false)
const list = ref<GroupBuyView[]>([])
const total = ref(0)
const page = reactive({ current: 1, size: 10 })

const mockData: GroupBuyRow[] = [
  {
    id: 1, name: '三人成团优惠', groupSize: 3, validHours: 24, groupPrice: 299, originPrice: 399,
    startAt: '2026-10-20 00:00', endAt: '2026-11-20 23:59',
    successCount: 286, totalGroups: 386, status: 'active', desc: '三人成团立减 100 元',
    goodsList: [
      { name: '无线蓝牙耳机 Pro', price: 399, icon: 'solar:headphones-round-sound-bold-duotone', thumb: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' }
    ]
  },
  {
    id: 2, name: '双十一拼团专场', groupSize: 5, validHours: 12, groupPrice: 199, originPrice: 299,
    startAt: '2026-11-01 00:00', endAt: '2026-11-11 23:59',
    successCount: 0, totalGroups: 0, status: 'pending', desc: '5 人成团享超低价',
    goodsList: []
  },
  {
    id: 3, name: '周末两人拼团', groupSize: 2, validHours: 24, groupPrice: 599, originPrice: 799,
    startAt: '2026-10-18 00:00', endAt: '2026-10-19 23:59',
    successCount: 126, totalGroups: 186, status: 'expired', desc: '两人拼团享 75 折',
    goodsList: []
  },
  {
    id: 4, name: '测试拼团', groupSize: 10, validHours: 48, groupPrice: 99, originPrice: 159,
    startAt: '2026-09-01 00:00', endAt: '2026-09-30 23:59',
    successCount: 36, totalGroups: 86, status: 'disabled', desc: '测试用拼团活动',
    goodsList: []
  }
]

const statusMap: Record<ActivityStatus, { text: string; color: string; bg: string }> = {
  pending: { text: '未开始', color: '#e6a23c', bg: 'rgba(230,162,60,0.12)' },
  active: { text: '进行中', color: '#52b788', bg: 'rgba(82,183,136,0.12)' },
  expired: { text: '已结束', color: '#909399', bg: 'rgba(144,147,153,0.12)' },
  disabled: { text: '已停用', color: '#f56c6c', bg: 'rgba(245,108,108,0.12)' }
}

function decorate(rows: GroupBuyRow[]): GroupBuyView[] {
  return rows.map(r => {
    const s = statusMap[r.status]
    return {
      ...r,
      successRate: r.totalGroups ? Math.round((r.successCount / r.totalGroups) * 100) : 0,
      statusText: s.text,
      statusColor: s.color,
      statusBg: s.bg,
      bg: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)',
      color: '#9254de'
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
      data = data.filter(d => d.name.toLowerCase().includes(k))
    }
    if (query.groupSize !== '') {
      data = data.filter(d => d.groupSize === query.groupSize)
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
  query.groupSize = ''
  query.status = ''
  activeTab.value = 'all'
  page.current = 1
  fetchList()
}

// ---------- 弹窗 ----------
const dialogVisible = ref(false)
const formMode = ref<FormMode>('create')
const saving = ref(false)
const formRef = ref<FormInstance>()

const defaultForm = (): GroupBuyForm => ({
  id: null,
  name: '',
  groupSize: 3,
  validHours: 24,
  groupPrice: 0,
  originPrice: 0,
  startAt: '',
  endAt: '',
  status: 'pending',
  desc: '',
  goodsList: []
})

const form = reactive<GroupBuyForm>(defaultForm())

const rules: FormRules<GroupBuyForm> = {
  name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
  groupSize: [{ required: true, message: '请输入成团人数', trigger: 'blur' }],
  groupPrice: [{ required: true, message: '请输入拼团价', trigger: 'blur' }],
  startAt: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endAt: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

const goodsPool: GroupGoods[] = [
  { name: '无线蓝牙耳机 Pro', price: 399, icon: 'solar:headphones-round-sound-bold-duotone', thumb: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
  { name: '智能手表 S9', price: 899, icon: 'solar:watch-square-bold-duotone', thumb: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' },
  { name: '便携充电宝 20000mAh', price: 129, icon: 'solar:battery-charge-bold-duotone', thumb: 'linear-gradient(135deg, #fff4e6, #ffe4c4)' },
  { name: '轻薄羽绒服', price: 599, icon: 'solar:bag-smile-bold-duotone', thumb: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)' }
]

function addGoods(): void {
  if (form.goodsList.length >= goodsPool.length) {
    ElMessage.warning('已添加全部示例商品')
    return
  }
  form.goodsList.push({ ...goodsPool[form.goodsList.length] })
}

function removeGoods(idx: number): void {
  form.goodsList.splice(idx, 1)
}

function openCreate(): void {
  formMode.value = 'create'
  Object.assign(form, defaultForm())
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

function openEdit(row: GroupBuyView): void {
  formMode.value = 'edit'
  Object.assign(form, {
    id: row.id,
    name: row.name,
    groupSize: row.groupSize,
    validHours: row.validHours,
    groupPrice: row.groupPrice,
    originPrice: row.originPrice,
    startAt: row.startAt,
    endAt: row.endAt,
    status: row.status === 'expired' ? 'disabled' : row.status,
    desc: row.desc,
    goodsList: row.goodsList.map(g => ({ ...g }))
  })
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

async function handleSave(): Promise<void> {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  saving.value = true
  await new Promise(r => setTimeout(r, 300))
  saving.value = false

  if (formMode.value === 'create') {
    const newRow: GroupBuyRow = {
      id: Date.now(),
      name: form.name,
      groupSize: form.groupSize,
      validHours: form.validHours,
      groupPrice: form.groupPrice,
      originPrice: form.originPrice,
      startAt: form.startAt,
      endAt: form.endAt,
      successCount: 0,
      totalGroups: 0,
      status: form.status,
      desc: form.desc,
      goodsList: form.goodsList.map(g => ({ ...g }))
    }
    mockData.unshift(newRow)
    ElMessage.success('拼团活动已新增')
  } else if (form.id) {
    const idx = mockData.findIndex(d => d.id === form.id)
    if (idx > -1) {
      mockData[idx] = {
        ...mockData[idx],
        name: form.name,
        groupSize: form.groupSize,
        validHours: form.validHours,
        groupPrice: form.groupPrice,
        originPrice: form.originPrice,
        startAt: form.startAt,
        endAt: form.endAt,
        status: form.status,
        desc: form.desc,
        goodsList: form.goodsList.map(g => ({ ...g }))
      }
    }
    ElMessage.success('拼团活动已更新')
  }

  dialogVisible.value = false
  fetchList()
}

function toggleStatus(row: GroupBuyView): void {
  const next: ActivityStatus = row.status === 'disabled' ? 'active' : 'disabled'
  const target = mockData.find(d => d.id === row.id)
  if (target) target.status = next
  const s = statusMap[next]
  row.status = next
  row.statusText = s.text
  row.statusColor = s.color
  row.statusBg = s.bg
  ElMessage.success(`活动已${next === 'active' ? '启用' : '停用'}`)
}

function handleDelete(row: GroupBuyView): void {
  const idx = mockData.findIndex(d => d.id === row.id)
  if (idx > -1) mockData.splice(idx, 1)
  ElMessage.success('删除成功')
  fetchList()
}

// ---------- 拼团记录 ----------
const groupsVisible = ref(false)
const currentActivity = ref<GroupBuyView | null>(null)

const mockGroups: GroupRecord[] = [
  { id: 1, no: 'G20261030001', leader: '张三', joined: 3, groupSize: 3, createdAt: '2026-10-30 09:00', expireAt: '2026-10-31 09:00', statusText: '已成团', statusColor: '#52b788', statusBg: 'rgba(82,183,136,0.12)' },
  { id: 2, no: 'G20261030002', leader: '李四', joined: 2, groupSize: 3, createdAt: '2026-10-30 10:12', expireAt: '2026-10-31 10:12', statusText: '待成团', statusColor: '#e6a23c', statusBg: 'rgba(230,162,60,0.12)' },
  { id: 3, no: 'G20261030003', leader: '王五', joined: 1, groupSize: 3, createdAt: '2026-10-30 11:30', expireAt: '2026-10-31 11:30', statusText: '待成团', statusColor: '#e6a23c', statusBg: 'rgba(230,162,60,0.12)' },
  { id: 4, no: 'G20261029001', leader: '赵六', joined: 3, groupSize: 3, createdAt: '2026-10-29 14:00', expireAt: '2026-10-30 14:00', statusText: '已成团', statusColor: '#52b788', statusBg: 'rgba(82,183,136,0.12)' }
]

function openGroups(row: GroupBuyView): void {
  currentActivity.value = row
  groupsVisible.value = true
}

onMounted(fetchList)
</script>

<style lang="scss" scoped>
.group-buy-page {
  .activity-cell {
    display: flex;
    align-items: center;
    gap: 10px;

    .activity-badge {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .activity-name {
      font-size: 13px;
      font-weight: 500;
      color: #1f2d3d;
    }

    .activity-size {
      margin-top: 2px;
      font-size: 12px;
      color: #8a94a6;
    }
  }

  .price-cell {
    display: flex;
    flex-direction: column;
    align-items: flex-end;

    .price {
      font-weight: 600;
      color: #f56c6c;
    }

    .origin {
      font-size: 12px;
      color: #8a94a6;
      text-decoration: line-through;
    }
  }

  .period-cell {
    font-size: 12px;
    color: #5a6472;

    .period-end {
      margin-top: 2px;
      color: #8a94a6;
    }
  }

  .group-stat {
    display: inline-flex;
    align-items: center;
    gap: 2px;

    .stat-success {
      font-weight: 600;
      color: #52b788;
    }

    .stat-divider {
      color: #c0c4cc;
    }

    .stat-total {
      font-size: 12px;
      color: #8a94a6;
    }
  }

  .rate-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: center;

    .rate-bar {
      width: 100%;
      height: 6px;
      background: #eef1f6;
      border-radius: 999px;
      overflow: hidden;
    }

    .rate-bar-fill {
      display: block;
      height: 100%;
      background: linear-gradient(90deg, #52b788, #7dd3a8);
      border-radius: 999px;
    }

    .rate-text {
      font-size: 12px;
      color: #52b788;
      font-weight: 500;
    }
  }

  // 弹窗内
  .goods-editor {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .goods-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    background: #f7f9fc;
    border-radius: 10px;

    .goods-thumb {
      width: 32px;
      height: 32px;
      border-radius: 8px;
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
      color: #1f2d3d;
      font-weight: 500;
    }

    .goods-sub {
      margin-top: 2px;
      font-size: 12px;
      color: #8a94a6;
    }
  }

  .add-goods-btn {
    border-style: dashed;
    width: 100%;
  }

  // 拼团记录抽屉
  .drawer-activity {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px;
    background: #f7f9fc;
    border-radius: 12px;
    margin-bottom: 16px;

    .activity-badge {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .activity-name {
      font-size: 14px;
      font-weight: 600;
      color: #1f2d3d;
    }

    .activity-sub {
      margin-top: 2px;
      font-size: 12px;
      color: #8a94a6;
    }
  }

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #1f2d3d;
    margin: 16px 0 10px;
  }

  .group-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .group-item {
    border: 1px solid #eef1f6;
    border-radius: 10px;
    overflow: hidden;

    .group-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      background: #f8fafd;
      border-bottom: 1px solid #eef1f6;
    }

    .group-no {
      font-size: 12px;
      color: #5a6472;
      font-family: monospace;
    }

    .group-body {
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .group-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13px;
      color: #1f2d3d;

      .label {
        color: #8a94a6;
      }
    }
  }
}
</style>