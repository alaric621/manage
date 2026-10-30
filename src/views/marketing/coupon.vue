<template>
  <div class="list-page coupon-page">
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
        <ElFormItem label="优惠券">
          <ElInput
            v-model="query.keyword"
            placeholder="券名称/券码"
            clearable
            style="width: 220px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <Icon icon="solar:magnifer-bold-duotone" width="16" />
            </template>
          </ElInput>
        </ElFormItem>
        <ElFormItem label="类型">
          <ElSelect v-model="query.type" placeholder="全部类型" clearable style="width: 150px">
            <ElOption label="满减券" value="full" />
            <ElOption label="折扣券" value="discount" />
            <ElOption label="无门槛券" value="no-threshold" />
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
            优惠券列表
            <span class="title-sub">共 {{ total }} 张</span>
          </div>
          <div class="panel-actions">
            <ElButton type="primary" size="small" @click="openCreate">
              <Icon icon="solar:add-circle-bold-duotone" class="btn-icon" />新增优惠券
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
        <ElTableColumn label="优惠券" min-width="240">
          <template #default="{ row }">
            <div class="coupon-cell">
              <div class="coupon-badge" :style="{ background: row.bg, color: row.color }">
                <span class="coupon-value">{{ row.displayValue }}</span>
                <span class="coupon-type">{{ row.typeText }}</span>
              </div>
              <div class="coupon-meta">
                <div class="coupon-name">{{ row.name }}</div>
                <div class="coupon-code">券码：{{ row.code }}</div>
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="使用条件" min-width="160">
          <template #default="{ row }">{{ row.conditionText }}</template>
        </ElTableColumn>
        <ElTableColumn label="发放/总量" width="120" align="center">
          <template #default="{ row }">
            <div class="stock-cell">
              <span class="stock-issued">{{ row.issued }}</span>
              <span class="stock-total">/ {{ row.total }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="已使用" width="90" align="center">
          <template #default="{ row }">{{ row.used }}</template>
        </ElTableColumn>
        <ElTableColumn label="有效期" width="200">
          <template #default="{ row }">
            <div class="period-cell">
              <div>{{ row.startAt }}</div>
              <div class="period-end">至 {{ row.endAt }}</div>
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
        <ElTableColumn label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <ElButton link type="primary" size="small" @click="openEdit(row)">编辑</ElButton>
            <ElButton
              link
              :type="row.status === 'disabled' ? 'success' : 'warning'"
              size="small"
              @click="toggleStatus(row)"
            >
              {{ row.status === 'disabled' ? '启用' : '停用' }}
            </ElButton>
            <ElPopconfirm title="确定删除该优惠券？" @confirm="handleDelete(row)">
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
      :title="formMode === 'create' ? '新增优惠券' : '编辑优惠券'"
      width="620px"
      destroy-on-close
    >
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px">
        <ElFormItem label="券名称" prop="name">
          <ElInput v-model="form.name" placeholder="如：双十一满减券" maxlength="30" show-word-limit />
        </ElFormItem>
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="券类型" prop="type">
              <ElSelect v-model="form.type" style="width: 100%">
                <ElOption label="满减券" value="full" />
                <ElOption label="折扣券" value="discount" />
                <ElOption label="无门槛券" value="no-threshold" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="发放总量" prop="total">
              <ElInputNumber v-model="form.total" :min="1" :max="999999" controls-position="right" style="width: 100%" />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="面额/折扣">
              <ElInputNumber v-model="form.value" :min="0" :precision="2" controls-position="right" style="width: 100%">
                <template #prefix>{{ form.type === 'discount' ? '' : '¥' }}</template>
                <template #suffix>{{ form.type === 'discount' ? '折' : '' }}</template>
              </ElInputNumber>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="使用门槛">
              <ElInputNumber v-model="form.threshold" :min="0" :precision="2" controls-position="right" style="width: 100%">
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
        <ElFormItem label="使用说明">
          <ElInput v-model="form.desc" type="textarea" :rows="3" maxlength="120" show-word-limit placeholder="优惠券使用说明" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Icon } from '@iconify/vue'

// ---------- 类型 ----------
type CouponType = 'full' | 'discount' | 'no-threshold'
type CouponStatus = 'pending' | 'active' | 'expired' | 'disabled'
type TabName = 'all' | CouponStatus
type FormMode = 'create' | 'edit'

interface CouponRow {
  id: number
  name: string
  code: string
  type: CouponType
  value: number
  threshold: number
  issued: number
  total: number
  used: number
  startAt: string
  endAt: string
  status: CouponStatus
  desc: string
}

interface CouponView extends CouponRow {
  typeText: string
  displayValue: string
  conditionText: string
  statusText: string
  statusColor: string
  statusBg: string
  bg: string
  color: string
}

interface CouponForm {
  id: number | null
  name: string
  type: CouponType
  value: number
  threshold: number
  total: number
  startAt: string
  endAt: string
  status: CouponStatus
  desc: string
}

interface QueryState {
  keyword: string
  type: '' | CouponType
  status: '' | CouponStatus
}

// ---------- 概览 ----------
const stats = computed(() => {
  const total = mockData.length
  const active = mockData.filter(d => d.status === 'active').length
  const used = mockData.reduce((s, d) => s + d.used, 0)
  const issued = mockData.reduce((s, d) => s + d.issued, 0)
  return [
    { label: '优惠券总数', value: total, icon: 'solar:ticket-bold-duotone', color: '#409eff', bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
    { label: '进行中', value: active, icon: 'solar:play-circle-bold-duotone', color: '#52b788', bg: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' },
    { label: '已发放', value: issued, icon: 'solar:gift-bold-duotone', color: '#e6a23c', bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)' },
    { label: '已使用', value: used, icon: 'solar:check-circle-bold-duotone', color: '#9254de', bg: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)' }
  ]
})

// ---------- 查询 ----------
const query = reactive<QueryState>({ keyword: '', type: '', status: '' })

const activeTab = ref<TabName>('all')
function handleTabChange(name: string | number): void {
  const tab = String(name) as TabName
  query.status = tab === 'all' ? '' : (tab as CouponStatus)
  page.current = 1
  fetchList()
}

// ---------- 列表 ----------
const loading = ref(false)
const list = ref<CouponView[]>([])
const total = ref(0)
const page = reactive({ current: 1, size: 10 })

const mockData: CouponRow[] = [
  { id: 1, name: '双十一满减券', code: 'CPN20261111001', type: 'full', value: 50, threshold: 300, issued: 3200, total: 5000, used: 2860, startAt: '2026-11-01 00:00', endAt: '2026-11-11 23:59', status: 'active', desc: '满 300 减 50' },
  { id: 2, name: '新人专享折扣券', code: 'CPN20261001001', type: 'discount', value: 9, threshold: 0, issued: 8600, total: 10000, used: 6420, startAt: '2026-10-01 00:00', endAt: '2026-12-31 23:59', status: 'active', desc: '9 折优惠，新用户专享' },
  { id: 3, name: '无门槛 10 元券', code: 'CPN20260915001', type: 'no-threshold', value: 10, threshold: 0, issued: 5000, total: 5000, used: 5000, startAt: '2026-09-15 00:00', endAt: '2026-09-30 23:59', status: 'expired', desc: '无门槛立减 10 元' },
  { id: 4, name: '会员日满减券', code: 'CPN20261201001', type: 'full', value: 100, threshold: 800, issued: 0, total: 3000, used: 0, startAt: '2026-12-01 00:00', endAt: '2026-12-07 23:59', status: 'pending', desc: '满 800 减 100' },
  { id: 5, name: '测试优惠券', code: 'CPN20260801001', type: 'no-threshold', value: 5, threshold: 0, issued: 200, total: 200, used: 86, startAt: '2026-08-01 00:00', endAt: '2026-08-31 23:59', status: 'disabled', desc: '测试用券' }
]

const statusMap: Record<CouponStatus, { text: string; color: string; bg: string }> = {
  pending: { text: '未开始', color: '#e6a23c', bg: 'rgba(230,162,60,0.12)' },
  active: { text: '进行中', color: '#52b788', bg: 'rgba(82,183,136,0.12)' },
  expired: { text: '已结束', color: '#909399', bg: 'rgba(144,147,153,0.12)' },
  disabled: { text: '已停用', color: '#f56c6c', bg: 'rgba(245,108,108,0.12)' }
}

function decorate(rows: CouponRow[]): CouponView[] {
  return rows.map(r => {
    const s = statusMap[r.status]
    let typeText = '满减券'
    let displayValue = `¥${r.value}`
    let conditionText = `满 ¥${r.threshold} 可用`
    let bg = 'linear-gradient(135deg, #e8f3ff, #d3e6ff)'
    let color = '#409eff'
    if (r.type === 'discount') {
      typeText = '折扣券'
      displayValue = `${r.value} 折`
      conditionText = '无门槛' // 折扣券一般无门槛
      bg = 'linear-gradient(135deg, #f3e8ff, #e5d4ff)'
      color = '#9254de'
    } else if (r.type === 'no-threshold') {
      typeText = '无门槛券'
      displayValue = `¥${r.value}`
      conditionText = '无门槛'
      bg = 'linear-gradient(135deg, #e6f7ee, #cdf0de)'
      color = '#52b788'
    }
    return {
      ...r,
      typeText,
      displayValue,
      conditionText,
      statusText: s.text,
      statusColor: s.color,
      statusBg: s.bg,
      bg,
      color
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
      data = data.filter(d => d.name.toLowerCase().includes(k) || d.code.toLowerCase().includes(k))
    }
    if (query.type) {
      data = data.filter(d => d.type === query.type)
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
  query.type = ''
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

const defaultForm = (): CouponForm => ({
  id: null,
  name: '',
  type: 'full',
  value: 0,
  threshold: 0,
  total: 100,
  startAt: '',
  endAt: '',
  status: 'pending',
  desc: ''
})

const form = reactive<CouponForm>(defaultForm())

const rules: FormRules<CouponForm> = {
  name: [{ required: true, message: '请输入券名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择券类型', trigger: 'change' }],
  total: [{ required: true, message: '请输入发放总量', trigger: 'blur' }],
  startAt: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endAt: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

function openCreate(): void {
  formMode.value = 'create'
  Object.assign(form, defaultForm())
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

function openEdit(row: CouponView): void {
  formMode.value = 'edit'
  Object.assign(form, {
    id: row.id,
    name: row.name,
    type: row.type,
    value: row.value,
    threshold: row.threshold,
    total: row.total,
    startAt: row.startAt,
    endAt: row.endAt,
    status: row.status === 'expired' ? 'disabled' : row.status,
    desc: row.desc
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
    const newRow: CouponRow = {
      id: Date.now(),
      name: form.name,
      code: `CPN${Date.now()}`,
      type: form.type,
      value: form.value,
      threshold: form.threshold,
      issued: 0,
      total: form.total,
      used: 0,
      startAt: form.startAt,
      endAt: form.endAt,
      status: form.status,
      desc: form.desc
    }
    mockData.unshift(newRow)
    ElMessage.success('优惠券已新增')
  } else if (form.id) {
    const idx = mockData.findIndex(d => d.id === form.id)
    if (idx > -1) {
      mockData[idx] = {
        ...mockData[idx],
        name: form.name,
        type: form.type,
        value: form.value,
        threshold: form.threshold,
        total: form.total,
        startAt: form.startAt,
        endAt: form.endAt,
        status: form.status,
        desc: form.desc
      }
    }
    ElMessage.success('优惠券已更新')
  }

  dialogVisible.value = false
  fetchList()
}

function toggleStatus(row: CouponView): void {
  const next: CouponStatus = row.status === 'disabled' ? 'active' : 'disabled'
  const target = mockData.find(d => d.id === row.id)
  if (target) target.status = next
  const s = statusMap[next]
  row.status = next
  row.statusText = s.text
  row.statusColor = s.color
  row.statusBg = s.bg
  ElMessage.success(`优惠券已${next === 'active' ? '启用' : '停用'}`)
}

function handleDelete(row: CouponView): void {
  const idx = mockData.findIndex(d => d.id === row.id)
  if (idx > -1) mockData.splice(idx, 1)
  ElMessage.success('删除成功')
  fetchList()
}

onMounted(fetchList)
</script>

<style lang="scss" scoped>
.coupon-page {
  .coupon-cell {
    display: flex;
    align-items: center;
    gap: 12px;

    .coupon-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 68px;
      padding: 6px 8px;
      border-radius: 10px;
      flex-shrink: 0;
    }

    .coupon-value {
      font-size: 14px;
      font-weight: 700;
    }

    .coupon-type {
      font-size: 11px;
      margin-top: 2px;
      opacity: 0.8;
    }

    .coupon-name {
      font-size: 13px;
      font-weight: 500;
      color: #1f2d3d;
    }

    .coupon-code {
      margin-top: 2px;
      font-size: 12px;
      color: #8a94a6;
      font-family: monospace;
    }
  }

  .stock-cell {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 2px;

    .stock-issued {
      font-weight: 600;
      color: #409eff;
    }

    .stock-total {
      font-size: 12px;
      color: #8a94a6;
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
}
</style>