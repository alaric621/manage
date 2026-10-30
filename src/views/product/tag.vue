<template>
  <div class="tag-page">
    <!-- 筛选区 -->
    <ElCard class="panel-card filter-card" shadow="never">
      <ElForm :model="query" inline class="filter-form" @submit.prevent>
        <ElFormItem label="标签名称">
          <ElInput
            v-model="query.keyword"
            placeholder="输入标签名称"
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
            标签列表
            <span class="title-sub">共 {{ total }} 个</span>
          </div>
          <div class="panel-actions">
            <ElButton type="primary" size="small" @click="openCreate">
              <Icon icon="solar:add-circle-bold-duotone" class="btn-icon" />新增标签
            </ElButton>
          </div>
        </div>
      </template>

      <ElTable v-loading="loading" :data="list" class="pretty-table" row-key="id">
        <ElTableColumn label="标签" min-width="200">
          <template #default="{ row }">
            <div class="tag-cell">
              <span class="tag-preview" :style="{ background: row.color + '1a', color: row.color }">
                {{ row.name }}
              </span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="color" label="颜色" width="120">
          <template #default="{ row }">
            <div class="color-cell">
              <span class="color-dot" :style="{ background: row.color }"></span>
              <span class="color-text">{{ row.color }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="关联商品" width="100" align="center">
          <template #default="{ row }">{{ row.productCount }}</template>
        </ElTableColumn>
        <ElTableColumn label="状态" width="100">
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
            <ElPopconfirm title="确定删除该标签？" @confirm="handleDelete(row)">
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
      :title="formMode === 'create' ? '新增标签' : '编辑标签'"
      width="480px"
      destroy-on-close
    >
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="90px">
        <ElFormItem label="标签名称" prop="name">
          <ElInput v-model="form.name" placeholder="请输入标签名称" maxlength="20" show-word-limit />
        </ElFormItem>
        <ElFormItem label="标签颜色" prop="color">
          <div class="color-picker-wrap">
            <ElColorPicker v-model="form.color" />
            <ElInput v-model="form.color" placeholder="#409eff" style="width: 140px" />
            <span class="tag-preview small" :style="{ background: form.color + '1a', color: form.color }">
              {{ form.name || '预览' }}
            </span>
          </div>
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
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="saving" @click="handleSave">保存</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Icon } from '@iconify/vue'

// ---------- 类型 ----------
type TagStatus = 'on' | 'off'
type FormMode = 'create' | 'edit'

interface TagRow {
  id: number
  name: string
  color: string
  productCount: number
  status: TagStatus
  sort: number
  createdAt: string
}

interface TagForm {
  id: number | null
  name: string
  color: string
  sort: number
  status: TagStatus
}

interface QueryState {
  keyword: string
  status: '' | TagStatus
}

// ---------- 查询 ----------
const query = reactive<QueryState>({ keyword: '', status: '' })

// ---------- 列表 ----------
const loading = ref(false)
const list = ref<TagRow[]>([])
const total = ref(0)
const page = reactive({ current: 1, size: 10 })

const mockData: TagRow[] = [
  { id: 1, name: '新品', color: '#409eff', productCount: 128, status: 'on', sort: 1, createdAt: '2026-10-01 10:00' },
  { id: 2, name: '热卖', color: '#f56c6c', productCount: 256, status: 'on', sort: 2, createdAt: '2026-10-02 11:20' },
  { id: 3, name: '限时折扣', color: '#e6a23c', productCount: 86, status: 'on', sort: 3, createdAt: '2026-10-03 09:15' },
  { id: 4, name: '包邮', color: '#52b788', productCount: 512, status: 'on', sort: 4, createdAt: '2026-10-04 14:30' },
  { id: 5, name: '赠品', color: '#9254de', productCount: 42, status: 'off', sort: 5, createdAt: '2026-10-05 16:45' },
  { id: 6, name: '预售', color: '#13c2c2', productCount: 18, status: 'on', sort: 6, createdAt: '2026-10-06 08:00' }
]

async function fetchList(): Promise<void> {
  loading.value = true
  try {
    await new Promise(r => setTimeout(r, 300))
    let data = [...mockData]
    if (query.keyword) {
      data = data.filter(d => d.name.includes(query.keyword))
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

const defaultForm = (): TagForm => ({
  id: null,
  name: '',
  color: '#409eff',
  sort: 0,
  status: 'on'
})

const form = reactive<TagForm>(defaultForm())

const rules: FormRules<TagForm> = {
  name: [{ required: true, message: '请输入标签名称', trigger: 'blur' }],
  color: [{ required: true, message: '请选择标签颜色', trigger: 'change' }]
}

function openCreate(): void {
  formMode.value = 'create'
  Object.assign(form, defaultForm())
  dialogVisible.value = true
}

function openEdit(row: TagRow): void {
  formMode.value = 'edit'
  Object.assign(form, {
    id: row.id,
    name: row.name,
    color: row.color,
    sort: row.sort,
    status: row.status
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
    const newRow: TagRow = {
      id: Date.now(),
      name: form.name,
      color: form.color,
      productCount: 0,
      status: form.status,
      sort: form.sort,
      createdAt: new Date().toLocaleString('zh-CN')
    }
    mockData.unshift(newRow)
    ElMessage.success('标签已新增')
  } else if (form.id) {
    const idx = mockData.findIndex(d => d.id === form.id)
    if (idx > -1) {
      mockData[idx] = {
        ...mockData[idx],
        name: form.name,
        color: form.color,
        sort: form.sort,
        status: form.status
      }
    }
    ElMessage.success('标签已更新')
  }

  dialogVisible.value = false
  fetchList()
}

function handleDelete(row: TagRow): void {
  const idx = mockData.findIndex(d => d.id === row.id)
  if (idx > -1) mockData.splice(idx, 1)
  ElMessage.success('删除成功')
  fetchList()
}

function handleStatusChange(row: TagRow): void {
  ElMessage.success(`标签已${row.status === 'on' ? '启用' : '禁用'}`)
}

onMounted(fetchList)
</script>

<style lang="scss" scoped>
$primary: #409eff;
$danger: #f56c6c;
$text-main: #1f2d3d;
$text-secondary: #8a94a6;
$text-regular: #5a6472;
$border-light: #eef1f6;
$bg-soft: #f7f9fc;
$radius-card: 14px;
$gap: 16px;
$shadow-card: 0 2px 8px rgba(31, 45, 61, 0.04);
$shadow-hover: 0 10px 28px rgba(31, 45, 61, 0.10);

@mixin flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tag-page {
  padding: $gap;
  background: $bg-soft;
  min-height: 100%;
}

.panel-card {
  border-radius: $radius-card;
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

// ---------- 标签 ----------
.tag-cell {
  display: flex;
  align-items: center;
}

.tag-preview {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;

  &.small {
    padding: 2px 10px;
    font-size: 12px;
  }
}

// ---------- 颜色 ----------
.color-cell {
  display: flex;
  align-items: center;
  gap: 6px;

  .color-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 1px solid $border-light;
  }

  .color-text {
    font-size: 12px;
    color: $text-secondary;
    font-family: monospace;
  }
}

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
  .tag-page {
    padding: 12px;
  }

  .filter-form {
    :deep(.el-form-item) {
      width: 100%;
    }
  }
}
</style>