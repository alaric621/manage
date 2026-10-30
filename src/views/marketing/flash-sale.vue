<template>
  <div class="list-page flash-sale-page">
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
        <ElFormItem label="活动类型">
          <ElSelect v-model="query.type" placeholder="全部类型" clearable style="width: 150px">
            <ElOption label="秒杀" value="flash" />
            <ElOption label="限时折扣" value="discount" />
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
            秒杀 / 限时折扣
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
                <Icon :icon="row.typeIcon" width="18" />
              </div>
              <div class="activity-meta">
                <div class="activity-name">{{ row.name }}</div>
                <div class="activity-type">{{ row.typeText }}</div>
              </div>
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
        <ElTableColumn label="折扣力度" width="120">
          <template #default="{ row }">
            <span class="discount-text">{{ row.discountText }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="已售/库存" width="140" align="center">
          <template #default="{ row }">
            <div class="stock-cell">
              <div class="stock-bar">
                <span class="stock-bar-fill" :style="{ width: row.soldPercent + '%' }"></span>
              </div>
              <div class="stock-text">{{ row.sold }} / {{ row.stock }}</div>
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
      :title="formMode === 'create' ? '新增秒杀/限时折扣' : '编辑秒杀/限时折扣'"
      width="640px"
      destroy-on-close
    >
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px">
        <ElFormItem label="活动名称" prop="name">
          <ElInput v-model="form.name" placeholder="如：双十一秒杀专场" maxlength="30" show-word-limit />
        </ElFormItem>
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="活动类型" prop="type">
              <ElSelect v-model="form.type" style="width: 100%">
                <ElOption label="秒杀" value="flash" />
                <ElOption label="限时折扣" value="discount" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="折扣力度">
              <ElInputNumber v-model="form.discount" :min="0.1" :max="1" :step="0.05" :precision="2" controls-position="right" style="width: 100%" />
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
        <ElFormItem label="活动库存">
          <ElInputNumber v-model="form.stock" :min="1" :max="999999" controls-position="right" style="width: 200px" />
        </ElFormItem>
        <ElFormItem label="限购数量">
          <ElInputNumber v-model="form.limitCount" :min="1" :max="99" controls-position="right" style="width: 200px" />
          <span class="form-tip">每位用户限购数量</span>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Icon } from '@iconify/vue'

// ---------- 类型 ----------
type ActivityType = 'flash' | 'discount'
type ActivityStatus = 'pending' | 'active' | 'expired' | 'disabled'
type TabName = 'all' | ActivityStatus
type FormMode = 'create' | 'edit'

interface ActivityGoods {
  name: string
  price: number
  icon: string
  thumb: string
}

interface ActivityRow {
  id: number
  name: string
  type: ActivityType
  discount: number
  startAt: string
  endAt: string
  goodsCount: number
  stock: number
  sold: number
  limitCount: number
  status: ActivityStatus
  desc: string
  goodsList: ActivityGoods[]
}

interface ActivityView extends ActivityRow {
  typeText: string
  typeIcon: string
  discountText: string
  soldPercent: number
  statusText: string
  statusColor: string
  statusBg: string
  bg: string
  color: string
}

interface ActivityForm {
  id: number | null
  name: string
  type: ActivityType
  discount: number
  startAt: string
  endAt: string
  stock: number
  limitCount: number
  status: ActivityStatus
  desc: string
  goodsList: ActivityGoods[]
}

interface QueryState {
  keyword: string
  type: '' | ActivityType
  status: '' | ActivityStatus
}

// ---------- 概览 ----------
const stats = computed(() => {
  const total = mockData.length
  const active = mockData.filter(d => d.status === 'active').length
  const sold = mockData.reduce((s, d) => s + d.sold, 0)
  const goods = mockData.reduce((s, d) => s + d.goodsCount, 0)
  return [
    { label: '活动总数', value: total, icon: 'solar:lightning-bold-duotone', color: '#409eff', bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
    { label: '进行中', value: active, icon: 'solar:play-circle-bold-duotone', color: '#52b788', bg: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' },
    { label: '已售商品', value: sold, icon: 'solar:cart-large-bold-duotone', color: '#e6a23c', bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)' },
    { label: '参与商品', value: goods, icon: 'solar:box-bold-duotone', color: '#9254de', bg: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)' }
  ]
})

// ---------- 查询 ----------
const query = reactive<QueryState>({ keyword: '', type: '', status: '' })

const activeTab = ref<TabName>('all')
function handleTabChange(name: string | number): void {
  const tab = String(name) as TabName
  query.status = tab === 'all' ? '' : (tab as ActivityStatus)
  page.current = 1
  fetchList()
}

// ---------- 列表 ----------
const loading = ref(false)
const list = ref<ActivityView[]>([])
const total = ref(0)
const page = reactive({ current: 1, size: 10 })

const mockData: ActivityRow[] = [
  {
    id: 1, name: '双十一秒杀专场', type: 'flash', discount: 0.5,
    startAt: '2026-11-11 00:00', endAt: '2026-11-11 23:59',
    goodsCount: 12, stock: 5000, sold: 3860, limitCount: 2, status: 'active',
    desc: '精选爆款 5 折秒杀',
    goodsList: [
      { name: '无线蓝牙耳机 Pro', price: 399, icon: 'solar:headphones-round-sound-bold-duotone', thumb: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
      { name: '智能手表 S9', price: 899, icon: 'solar:watch-square-bold-duotone', thumb: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' }
    ]
  },
  {
    id: 2, name: '周末限时 8 折', type: 'discount', discount: 0.8,
    startAt: '2026-10-26 00:00', endAt: '2026-10-27 23:59',
    goodsCount: 36, stock: 2000, sold: 2000, limitCount: 5, status: 'expired',
    desc: '周末限时全场 8 折',
    goodsList: []
  },
  {
    id: 3, name: '双十二预热秒杀', type: 'flash', discount: 0.6,
    startAt: '2026-12-01 00:00', endAt: '2026-12-12 23:59',
    goodsCount: 8, stock: 3000, sold: 0, limitCount: 1, status: 'pending',
    desc: '双十二预热场',
    goodsList: []
  },
  {
    id: 4, name: '会员日 7 折', type: 'discount', discount: 0.7,
    startAt: '2026-09-15 00:00', endAt: '2026-09-15 23:59',
    goodsCount: 20, stock: 800, sold: 620, limitCount: 3, status: 'disabled',
    desc: '会员专享 7 折',
    goodsList: []
  }
]

const statusMap: Record<ActivityStatus, { text: string; color: string; bg: string }> = {
  pending: { text: '未开始', color: '#e6a23c', bg: 'rgba(230,162,60,0.12)' },
  active: { text: '进行中', color: '#52b788', bg: 'rgba(82,183,136,0.12)' },
  expired: { text: '已结束', color: '#909399', bg: 'rgba(144,147,153,0.12)' },
  disabled: { text: '已停用', color: '#f56c6c', bg: 'rgba(245,108,108,0.12)' }
}

const typeMap: Record<ActivityType, { text: string; icon: string; bg: string; color: string }> = {
  flash: { text: '秒杀', icon: 'solar:lightning-bold-duotone', bg: 'linear-gradient(135deg, #ffeaea, #ffd6d6)', color: '#f56c6c' },
  discount: { text: '限时折扣', icon: 'solar:sale-bold-duotone', bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)', color: '#e6a23c' }
}

function decorate(rows: ActivityRow[]): ActivityView[] {
  return rows.map(r => {
    const s = statusMap[r.status]
    const t = typeMap[r.type]
    return {
      ...r,
      typeText: t.text,
      typeIcon: t.icon,
      discountText: `${(r.discount * 10).toFixed(1)} 折`,
      soldPercent: r.stock ? Math.min(100, Math.round((r.sold / r.stock) * 100)) : 0,
      statusText: s.text,
      statusColor: s.color,
      statusBg: s.bg,
      bg: t.bg,
      color: t.color
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

const defaultForm = (): ActivityForm => ({
  id: null,
  name: '',
  type: 'flash',
  discount: 0.8,
  startAt: '',
  endAt: '',
  stock: 100,
  limitCount: 1,
  status: 'pending',
  desc: '',
  goodsList: []
})

const form = reactive<ActivityForm>(defaultForm())

const rules: FormRules<ActivityForm> = {
  name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择活动类型', trigger: 'change' }],
  startAt: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endAt: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

const goodsPool: ActivityGoods[] = [
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

function openEdit(row: ActivityView): void {
  formMode.value = 'edit'
  Object.assign(form, {
    id: row.id,
    name: row.name,
    type: row.type,
    discount: row.discount,
    startAt: row.startAt,
    endAt: row.endAt,
    stock: row.stock,
    limitCount: row.limitCount,
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
    const newRow: ActivityRow = {
      id: Date.now(),
      name: form.name,
      type: form.type,
      discount: form.discount,
      startAt: form.startAt,
      endAt: form.endAt,
      goodsCount: form.goodsList.length,
      stock: form.stock,
      sold: 0,
      limitCount: form.limitCount,
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
        type: form.type,
        discount: form.discount,
        startAt: form.startAt,
        endAt: form.endAt,
        goodsCount: form.goodsList.length,
        stock: form.stock,
        limitCount: form.limitCount,
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

function toggleStatus(row: ActivityView): void {
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

function handleDelete(row: ActivityView): void {
  const idx = mockData.findIndex(d => d.id === row.id)
  if (idx > -1) mockData.splice(idx, 1)
  ElMessage.success('删除成功')
  fetchList()
}

onMounted(fetchList)
</script>

<style lang="scss" scoped>
.flash-sale-page {
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

    .activity-type {
      margin-top: 2px;
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

  .discount-text {
    font-weight: 600;
    color: #f56c6c;
  }

  .stock-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .stock-bar {
      width: 100%;
      height: 6px;
      background: #eef1f6;
      border-radius: 999px;
      overflow: hidden;
    }

    .stock-bar-fill {
      display: block;
      height: 100%;
      background: linear-gradient(90deg, #409eff, #7cc0ff);
      border-radius: 999px;
      transition: width 0.3s ease;
    }

    .stock-text {
      font-size: 12px;
      color: #8a94a6;
      text-align: center;
    }
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

  .form-tip {
    margin-left: 8px;
    font-size: 12px;
    color: #8a94a6;
  }
}
</style>