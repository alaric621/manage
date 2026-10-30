<template>
  <div class="list-page full-reduction-page">
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
            placeholder="活动名称"
            clearable
            style="width: 220px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <Icon icon="solar:magnifer-bold-duotone" width="16" />
            </template>
          </ElInput>
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
            满减活动
            <span class="title-sub">共 {{ total }} 个活动</span>
          </div>
          <div class="panel-actions">
            <ElButton type="primary" size="small" @click="openCreate">
              <Icon icon="solar:add-circle-bold-duotone" class="btn-icon" />新增活动
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
                <Icon icon="solar:sale-bold-duotone" width="18" />
              </div>
              <div class="activity-meta">
                <div class="activity-name">{{ row.name }}</div>
                <div class="activity-rule">{{ row.ruleText }}</div>
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="阶梯规则" min-width="220">
          <template #default="{ row }">
            <div class="tier-list">
              <span v-for="(t, idx) in row.tiers" :key="idx" class="tier-item">
                满 ¥{{ t.threshold }} 减 ¥{{ t.reduce }}
              </span>
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
        <ElTableColumn label="参与商品" width="100" align="center">
          <template #default="{ row }">{{ row.goodsCount }}</template>
        </ElTableColumn>
        <ElTableColumn label="使用次数" width="100" align="center">
          <template #default="{ row }">{{ row.usedCount }}</template>
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
      :title="formMode === 'create' ? '新增满减活动' : '编辑满减活动'"
      width="640px"
      destroy-on-close
    >
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px">
        <ElFormItem label="活动名称" prop="name">
          <ElInput v-model="form.name" placeholder="如：双十一满减专场" maxlength="30" show-word-limit />
        </ElFormItem>
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
        <ElFormItem label="阶梯规则" prop="tiers">
          <div class="tier-editor">
            <div v-for="(t, idx) in form.tiers" :key="idx" class="tier-row">
              <span class="tier-label">满</span>
              <ElInputNumber v-model="t.threshold" :min="1" :precision="2" controls-position="right" style="width: 140px">
                <template #prefix>¥</template>
              </ElInputNumber>
              <span class="tier-label">减</span>
              <ElInputNumber v-model="t.reduce" :min="0" :precision="2" controls-position="right" style="width: 140px">
                <template #prefix>¥</template>
              </ElInputNumber>
              <ElButton link type="danger" size="small" @click="removeTier(idx)">
                <Icon icon="solar:trash-bin-trash-bold-duotone" width="14" />
              </ElButton>
            </div>
            <ElButton size="small" class="add-tier-btn" @click="addTier">
              <Icon icon="solar:add-circle-bold-duotone" class="btn-icon" />添加阶梯
            </ElButton>
          </div>
        </ElFormItem>
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
        <ElFormItem label="使用说明">
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

interface Tier {
  threshold: number
  reduce: number
}

interface ActivityGoods {
  name: string
  price: number
  icon: string
  thumb: string
}

interface FullReductionRow {
  id: number
  name: string
  tiers: Tier[]
  startAt: string
  endAt: string
  goodsCount: number
  usedCount: number
  status: ActivityStatus
  desc: string
  goodsList: ActivityGoods[]
}

interface FullReductionView extends FullReductionRow {
  ruleText: string
  statusText: string
  statusColor: string
  statusBg: string
  bg: string
  color: string
}

interface FullReductionForm {
  id: number | null
  name: string
  tiers: Tier[]
  startAt: string
  endAt: string
  status: ActivityStatus
  desc: string
  goodsList: ActivityGoods[]
}

interface QueryState {
  keyword: string
  status: '' | ActivityStatus
}

// ---------- 概览 ----------
const stats = computed(() => {
  const total = mockData.length
  const active = mockData.filter(d => d.status === 'active').length
  const used = mockData.reduce((s, d) => s + d.usedCount, 0)
  const goods = mockData.reduce((s, d) => s + d.goodsCount, 0)
  return [
    { label: '活动总数', value: total, icon: 'solar:sale-bold-duotone', color: '#409eff', bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
    { label: '进行中', value: active, icon: 'solar:play-circle-bold-duotone', color: '#52b788', bg: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' },
    { label: '使用次数', value: used, icon: 'solar:check-circle-bold-duotone', color: '#e6a23c', bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)' },
    { label: '参与商品', value: goods, icon: 'solar:box-bold-duotone', color: '#9254de', bg: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)' }
  ]
})

// ---------- 查询 ----------
const query = reactive<QueryState>({ keyword: '', status: '' })

const activeTab = ref<TabName>('all')
function handleTabChange(name: string | number): void {
  const tab = String(name) as TabName
  query.status = tab === 'all' ? '' : (tab as ActivityStatus)
  page.current = 1
  fetchList()
}

// ---------- 列表 ----------
const loading = ref(false)
const list = ref<FullReductionView[]>([])
const total = ref(0)
const page = reactive({ current: 1, size: 10 })

const mockData: FullReductionRow[] = [
  {
    id: 1, name: '双十一满减专场',
    tiers: [{ threshold: 300, reduce: 50 }, { threshold: 600, reduce: 120 }, { threshold: 1000, reduce: 200 }],
    startAt: '2026-11-01 00:00', endAt: '2026-11-11 23:59',
    goodsCount: 86, usedCount: 2860, status: 'active', desc: '全场满减，多买多减',
    goodsList: [
      { name: '无线蓝牙耳机 Pro', price: 399, icon: 'solar:headphones-round-sound-bold-duotone', thumb: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' }
    ]
  },
  {
    id: 2, name: '周末满减',
    tiers: [{ threshold: 200, reduce: 20 }, { threshold: 500, reduce: 60 }],
    startAt: '2026-10-25 00:00', endAt: '2026-10-26 23:59',
    goodsCount: 42, usedCount: 620, status: 'expired', desc: '周末限时满减',
    goodsList: []
  },
  {
    id: 3, name: '双十二预热满减',
    tiers: [{ threshold: 500, reduce: 80 }, { threshold: 1000, reduce: 180 }],
    startAt: '2026-12-01 00:00', endAt: '2026-12-12 23:59',
    goodsCount: 60, usedCount: 0, status: 'pending', desc: '双十二预热满减',
    goodsList: []
  },
  {
    id: 4, name: '测试满减活动',
    tiers: [{ threshold: 100, reduce: 10 }],
    startAt: '2026-09-01 00:00', endAt: '2026-09-30 23:59',
    goodsCount: 10, usedCount: 86, status: 'disabled', desc: '测试用满减',
    goodsList: []
  }
]

const statusMap: Record<ActivityStatus, { text: string; color: string; bg: string }> = {
  pending: { text: '未开始', color: '#e6a23c', bg: 'rgba(230,162,60,0.12)' },
  active: { text: '进行中', color: '#52b788', bg: 'rgba(82,183,136,0.12)' },
  expired: { text: '已结束', color: '#909399', bg: 'rgba(144,147,153,0.12)' },
  disabled: { text: '已停用', color: '#f56c6c', bg: 'rgba(245,108,108,0.12)' }
}

function decorate(rows: FullReductionRow[]): FullReductionView[] {
  return rows.map(r => {
    const s = statusMap[r.status]
    const ruleText = r.tiers.map(t => `满${t.threshold}减${t.reduce}`).join(' · ')
    return {
      ...r,
      ruleText,
      statusText: s.text,
      statusColor: s.color,
      statusBg: s.bg,
      bg: 'linear-gradient(135deg, #e6f7ee, #cdf0de)',
      color: '#52b788'
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

const defaultForm = (): FullReductionForm => ({
  id: null,
  name: '',
  tiers: [{ threshold: 100, reduce: 10 }],
  startAt: '',
  endAt: '',
  status: 'pending',
  desc: '',
  goodsList: []
})

const form = reactive<FullReductionForm>(defaultForm())

const rules: FormRules<FullReductionForm> = {
  name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
  startAt: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endAt: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

const goodsPool: ActivityGoods[] = [
  { name: '无线蓝牙耳机 Pro', price: 399, icon: 'solar:headphones-round-sound-bold-duotone', thumb: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
  { name: '智能手表 S9', price: 899, icon: 'solar:watch-square-bold-duotone', thumb: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' },
  { name: '便携充电宝 20000mAh', price: 129, icon: 'solar:battery-charge-bold-duotone', thumb: 'linear-gradient(135deg, #fff4e6, #ffe4c4)' },
  { name: '轻薄羽绒服', price: 599, icon: 'solar:bag-smile-bold-duotone', thumb: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)' }
]

function addTier(): void {
  form.tiers.push({ threshold: 0, reduce: 0 })
}

function removeTier(idx: number): void {
  if (form.tiers.length <= 1) {
    ElMessage.warning('至少保留一个阶梯')
    return
  }
  form.tiers.splice(idx, 1)
}

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

function openEdit(row: FullReductionView): void {
  formMode.value = 'edit'
  Object.assign(form, {
    id: row.id,
    name: row.name,
    tiers: row.tiers.map(t => ({ ...t })),
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
  if (!form.tiers.length) {
    ElMessage.warning('请至少添加一个阶梯规则')
    return
  }
  saving.value = true
  await new Promise(r => setTimeout(r, 300))
  saving.value = false

  if (formMode.value === 'create') {
    const newRow: FullReductionRow = {
      id: Date.now(),
      name: form.name,
      tiers: form.tiers.map(t => ({ ...t })),
      startAt: form.startAt,
      endAt: form.endAt,
      goodsCount: form.goodsList.length,
      usedCount: 0,
      status: form.status,
      desc: form.desc,
      goodsList: form.goodsList.map(g => ({ ...g }))
    }
    mockData.unshift(newRow)
    ElMessage.success('活动已新增')
  } else if (form.id) {
    const idx = mockData.findIndex(d => d.id === form.id)
    if (idx > -1) {
      mockData[idx] = {
        ...mockData[idx],
        name: form.name,
        tiers: form.tiers.map(t => ({ ...t })),
        startAt: form.startAt,
        endAt: form.endAt,
        goodsCount: form.goodsList.length,
        status: form.status,
        desc: form.desc,
        goodsList: form.goodsList.map(g => ({ ...g }))
      }
    }
    ElMessage.success('活动已更新')
  }

  dialogVisible.value = false
  fetchList()
}

function toggleStatus(row: FullReductionView): void {
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

function handleDelete(row: FullReductionView): void {
  const idx = mockData.findIndex(d => d.id === row.id)
  if (idx > -1) mockData.splice(idx, 1)
  ElMessage.success('删除成功')
  fetchList()
}

onMounted(fetchList)
</script>

<style lang="scss" scoped>
.full-reduction-page {
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

    .activity-rule {
      margin-top: 2px;
      font-size: 12px;
      color: #8a94a6;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 220px;
    }
  }

  .tier-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;

    .tier-item {
      display: inline-block;
      padding: 2px 8px;
      font-size: 12px;
      color: #52b788;
      background: rgba(82, 183, 136, 0.1);
      border-radius: 999px;
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

  .tier-editor {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .tier-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .tier-label {
    font-size: 13px;
    color: #5a6472;
  }

  .add-tier-btn {
    border-style: dashed;
    width: 100%;
  }

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
}
</style>