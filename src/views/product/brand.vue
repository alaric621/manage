<template>
  <div class="brand-page">
    <!-- 筛选区 -->
    <ElCard class="panel-card filter-card" shadow="never">
      <ElForm :model="query" inline class="filter-form" @submit.prevent>
        <ElFormItem label="品牌名称">
          <ElInput
            v-model="query.keyword"
            placeholder="输入品牌名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <Icon icon="solar:magnifer-bold-duotone" width="16" />
            </template>
          </ElInput>
        </ElFormItem>
        <ElFormItem label="状态">
          <ElSelect v-model="query.status" placeholder="全部状态" clearable style="width: 140px">
            <ElOption label="启用" value="on" />
            <ElOption label="禁用" value="off" />
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
            品牌列表
            <span class="title-sub">共 {{ total }} 个</span>
          </div>
          <div class="panel-actions">
            <ElButton type="primary" size="small" @click="openCreate">
              <Icon icon="solar:add-circle-bold-duotone" class="btn-icon" />新增品牌
            </ElButton>
          </div>
        </div>
      </template>

      <ElTable v-loading="loading" :data="list" class="pretty-table" row-key="id">
        <ElTableColumn label="品牌" min-width="220">
          <template #default="{ row }">
            <div class="brand-cell">
              <div class="brand-logo" :style="{ background: row.bg }">
                <Icon :icon="row.icon" width="22" height="22" />
              </div>
              <div class="brand-meta">
                <div class="brand-name">{{ row.name }}</div>
                <div class="brand-en">{{ row.enName || '--' }}</div>
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="origin" label="品牌产地" width="120">
          <template #default="{ row }">
            {{ row.origin || '--' }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="关联商品" width="100" align="center">
          <template #default="{ row }">{{ row.productCount }}</template>
        </ElTableColumn>
        <ElTableColumn label="状态" width="90">
          <template #default="{ row }">
            <ElSwitch
              v-model="row.status"
              :active-value="'on'"
              :inactive-value="'off'"
              size="small"
              @change="handleStatusChange(row)"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="sort" label="排序" width="80" align="center" />
        <ElTableColumn label="创建时间" width="170">
          <template #default="{ row }">{{ row.createdAt }}</template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <ElButton link type="primary" size="small" @click="openEdit(row)">编辑</ElButton>
            <ElPopconfirm title="确定删除该品牌？" @confirm="handleDelete(row)">
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

    <!-- 新增/编辑弹窗 -->
    <ElDialog
      v-model="dialogVisible"
      :title="formMode === 'create' ? '新增品牌' : '编辑品牌'"
      width="520px"
      destroy-on-close
    >
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="90px">
        <ElFormItem label="品牌名称" prop="name">
          <ElInput v-model="form.name" placeholder="请输入品牌名称" maxlength="30" show-word-limit />
        </ElFormItem>
        <ElFormItem label="英文名称">
          <ElInput v-model="form.enName" placeholder="请输入品牌英文名称" maxlength="40" />
        </ElFormItem>
        <ElFormItem label="品牌图标">
          <div class="logo-picker">
            <ElSelect v-model="form.icon" placeholder="选择图标" style="flex: 1">
              <ElOption v-for="ic in iconOptions" :key="ic.value" :label="ic.label" :value="ic.value">
                <div class="icon-option">
                  <Icon :icon="ic.value" width="18" />
                  <span>{{ ic.label }}</span>
                </div>
              </ElOption>
            </ElSelect>
            <div class="logo-preview" :style="{ background: form.bg }">
              <Icon :icon="form.icon" width="22" />
            </div>
          </div>
        </ElFormItem>
        <ElFormItem label="品牌色">
          <div class="color-picker-wrap">
            <ElColorPicker v-model="form.color" />
            <ElInput v-model="form.color" placeholder="#409eff" style="width: 140px" />
          </div>
        </ElFormItem>
        <ElFormItem label="品牌产地">
          <ElInput v-model="form.origin" placeholder="如：中国 / 美国 / 日本" maxlength="30" />
        </ElFormItem>
        <ElFormItem label="排序">
          <ElInputNumber v-model="form.sort" :min="0" :max="9999" controls-position="right" style="width: 100%" />
        </ElFormItem>
        <ElFormItem label="状态">
          <ElRadioGroup v-model="form.status">
            <ElRadio value="on">启用</ElRadio>
            <ElRadio value="off">禁用</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem label="品牌描述">
          <ElInput
            v-model="form.desc"
            type="textarea"
            :rows="3"
            maxlength="120"
            show-word-limit
            placeholder="简要描述该品牌"
          />
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Icon } from '@iconify/vue'

// ---------- 类型 ----------
type BrandStatus = 'on' | 'off'
type FormMode = 'create' | 'edit'

interface BrandRow {
  id: number
  name: string
  enName: string
  icon: string
  color: string
  bg: string
  origin: string
  productCount: number
  status: BrandStatus
  sort: number
  desc: string
  createdAt: string
}

interface BrandForm {
  id: number | null
  name: string
  enName: string
  icon: string
  color: string
  bg: string
  origin: string
  sort: number
  status: BrandStatus
  desc: string
}

interface QueryState {
  keyword: string
  status: '' | BrandStatus
}

// ---------- 查询 ----------
const query = reactive<QueryState>({ keyword: '', status: '' })

// ---------- 列表 ----------
const loading = ref(false)
const list = ref<BrandRow[]>([])
const total = ref(0)
const page = reactive({ current: 1, size: 10 })

const mockData: BrandRow[] = [
  { id: 1, name: '小米', enName: 'Xiaomi', icon: 'solar:medal-ribbon-bold-duotone', color: '#ff6900', bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)', origin: '中国', productCount: 128, status: 'on', sort: 1, desc: '科技以人为本', createdAt: '2026-09-01 10:00' },
  { id: 2, name: '华为', enName: 'HUAWEI', icon: 'solar:medal-star-bold-duotone', color: '#c7000b', bg: 'linear-gradient(135deg, #ffeaea, #ffd6d6)', origin: '中国', productCount: 96, status: 'on', sort: 2, desc: '构建万物互联的智能世界', createdAt: '2026-09-02 11:20' },
  { id: 3, name: 'Nike', enName: 'Nike', icon: 'solar:running-round-bold-duotone', color: '#111111', bg: 'linear-gradient(135deg, #eef1f6, #dbe2eb)', origin: '美国', productCount: 64, status: 'on', sort: 3, desc: 'Just Do It', createdAt: '2026-09-03 09:15' },
  { id: 4, name: '苹果', enName: 'Apple', icon: 'solar:apple-bold-duotone', color: '#333333', bg: 'linear-gradient(135deg, #f5f7fa, #e4e7ed)', origin: '美国', productCount: 52, status: 'on', sort: 4, desc: 'Think Different', createdAt: '2026-09-04 14:30' },
  { id: 5, name: '自有品牌', enName: 'Local Brand', icon: 'solar:star-bold-duotone', color: '#52b788', bg: 'linear-gradient(135deg, #e6f7ee, #cdf0de)', origin: '中国', productCount: 22, status: 'off', sort: 5, desc: '商城自营品牌', createdAt: '2026-09-05 16:45' }
]

const iconOptions = [
  { label: '奖牌', value: 'solar:medal-ribbon-bold-duotone' },
  { label: '星奖', value: 'solar:medal-star-bold-duotone' },
  { label: '跑步', value: 'solar:running-round-bold-duotone' },
  { label: '苹果', value: 'solar:apple-bold-duotone' },
  { label: '星星', value: 'solar:star-bold-duotone' },
  { label: '皇冠', value: 'solar:crown-bold-duotone' },
  { label: '标签', value: 'solar:tag-bold-duotone' }
]

async function fetchList(): Promise<void> {
  loading.value = true
  try {
    await new Promise(r => setTimeout(r, 300))
    let data = [...mockData]
    if (query.keyword) {
      const k = query.keyword.toLowerCase()
      data = data.filter(d => d.name.toLowerCase().includes(k) || d.enName.toLowerCase().includes(k))
    }
    if (query.status) {
      data = data.filter(d => d.status === query.status)
    }
    total.value = data.length
    const start = (page.current - 1) * page.size
    list.value = data.slice(start, start + page.size)
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
  page.current = 1
  fetchList()
}

// ---------- 弹窗 ----------
const dialogVisible = ref(false)
const formMode = ref<FormMode>('create')
const saving = ref(false)
const formRef = ref<FormInstance>()

const defaultForm = (): BrandForm => ({
  id: null,
  name: '',
  enName: '',
  icon: 'solar:medal-ribbon-bold-duotone',
  color: '#409eff',
  bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)',
  origin: '',
  sort: 0,
  status: 'on',
  desc: ''
})

const form = reactive<BrandForm>(defaultForm())

// 根据品牌色生成浅色渐变底
const bgPreview = computed(() => `${form.color}1a`)

const rules: FormRules<BrandForm> = {
  name: [{ required: true, message: '请输入品牌名称', trigger: 'blur' }],
  icon: [{ required: true, message: '请选择品牌图标', trigger: 'change' }]
}

function openCreate(): void {
  formMode.value = 'create'
  Object.assign(form, defaultForm())
  dialogVisible.value = true
}

function openEdit(row: BrandRow): void {
  formMode.value = 'edit'
  Object.assign(form, {
    id: row.id,
    name: row.name,
    enName: row.enName,
    icon: row.icon,
    color: row.color,
    bg: row.bg,
    origin: row.origin,
    sort: row.sort,
    status: row.status,
    desc: row.desc
  })
  dialogVisible.value = true
}

async function handleSave(): Promise<void> {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  saving.value = true
  await new Promise(r => setTimeout(r, 400))
  saving.value = false

  if (formMode.value === 'create') {
    const newRow: BrandRow = {
      id: Date.now(),
      name: form.name,
      enName: form.enName,
      icon: form.icon,
      color: form.color,
      bg: form.bg,
      origin: form.origin,
      productCount: 0,
      status: form.status,
      sort: form.sort,
      desc: form.desc,
      createdAt: new Date().toLocaleString('zh-CN')
    }
    mockData.unshift(newRow)
    ElMessage.success('品牌已新增')
  } else if (form.id) {
    const idx = mockData.findIndex(d => d.id === form.id)
    if (idx > -1) {
      mockData[idx] = {
        ...mockData[idx],
        name: form.name,
        enName: form.enName,
        icon: form.icon,
        color: form.color,
        bg: form.bg,
        origin: form.origin,
        sort: form.sort,
        status: form.status,
        desc: form.desc
      }
    }
    ElMessage.success('品牌已更新')
  }

  dialogVisible.value = false
  fetchList()
}

function handleDelete(row: BrandRow): void {
  const idx = mockData.findIndex(d => d.id === row.id)
  if (idx > -1) mockData.splice(idx, 1)
  ElMessage.success('删除成功')
  fetchList()
}

function handleStatusChange(row: BrandRow): void {
  ElMessage.success(`品牌已${row.status === 'on' ? '启用' : '禁用'}`)
}

onMounted(fetchList)
</script>

<style lang="scss" scoped>
$primary: #409eff;
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

.brand-page {
  padding: $gap;
  min-height: 100%;
}

.panel-card {
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

.btn-icon {
  margin-right: 4px;
  vertical-align: middle;
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

// ---------- 品牌单元格 ----------
.brand-cell {
  display: flex;
  align-items: center;
  gap: 12px;

  .brand-logo {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $primary;
    flex-shrink: 0;
  }

  .brand-meta {
    min-width: 0;
  }

  .brand-name {
    font-size: 13px;
    font-weight: 500;
    color: $text-main;
  }

  .brand-en {
    margin-top: 2px;
    font-size: 12px;
    color: $text-secondary;
  }
}

// ---------- 图标选择 ----------
.logo-picker {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.logo-preview {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $primary;
  flex-shrink: 0;
  border: 1px solid $border-light;
}

.icon-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

// ---------- 颜色 ----------
.color-picker-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

// ---------- 分页 ----------
.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

@media (max-width: 768px) {
  .brand-page {
    padding: 12px;
  }

  .filter-form {
    :deep(.el-form-item) {
      width: 100%;
    }
  }
}
</style>