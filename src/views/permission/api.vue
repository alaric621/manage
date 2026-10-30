<template>
  <div class="list-page api-page">
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
        <ElFormItem label="接口名称">
          <ElInput
            v-model="query.keyword"
            placeholder="接口名称/路径"
            clearable
            style="width: 220px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <Icon icon="solar:magnifer-bold-duotone" width="16" />
            </template>
          </ElInput>
        </ElFormItem>
        <ElFormItem label="请求方法">
          <ElSelect v-model="query.method" placeholder="全部方法" clearable style="width: 140px">
            <ElOption label="GET" value="GET" />
            <ElOption label="POST" value="POST" />
            <ElOption label="PUT" value="PUT" />
            <ElOption label="DELETE" value="DELETE" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="所属模块">
          <ElSelect v-model="query.module" placeholder="全部模块" clearable style="width: 150px">
            <ElOption v-for="m in moduleOptions" :key="m.value" :label="m.label" :value="m.value" />
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
            接口权限
            <span class="title-sub">共 {{ total }} 个接口</span>
          </div>
          <div class="panel-actions">
            <ElButton type="primary" size="small" @click="openCreate">
              <Icon icon="solar:add-circle-bold-duotone" class="btn-icon" />新增接口
            </ElButton>
          </div>
        </div>
      </template>

      <ElTable v-loading="loading" :data="list" class="pretty-table" row-key="id">
        <ElTableColumn label="接口" min-width="260">
          <template #default="{ row }">
            <div class="api-cell">
              <div class="api-method" :class="row.method.toLowerCase()">{{ row.method }}</div>
              <div class="api-meta">
                <div class="api-name">{{ row.name }}</div>
                <div class="api-path">{{ row.path }}</div>
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="所属模块" width="120">
          <template #default="{ row }">
            <ElTag size="small" effect="light" round>{{ row.moduleText }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="权限标识" min-width="180">
          <template #default="{ row }">
            <span class="permission-code">{{ row.permissionCode || '--' }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="描述" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">{{ row.desc || '--' }}</template>
        </ElTableColumn>
        <ElTableColumn label="调用次数" width="100" align="right">
          <template #default="{ row }">{{ row.callCount }}</template>
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
        <ElTableColumn label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <ElButton link type="primary" size="small" @click="openEdit(row)">编辑</ElButton>
            <ElPopconfirm title="确定删除该接口？" @confirm="handleDelete(row)">
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

    <!-- 新增/编辑弹窗 -->
    <ElDialog
      v-model="dialogVisible"
      :title="formMode === 'create' ? '新增接口' : '编辑接口'"
      width="560px"
      destroy-on-close
    >
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px">
        <ElFormItem label="接口名称" prop="name">
          <ElInput v-model="form.name" placeholder="如：查询商品列表" maxlength="30" show-word-limit />
        </ElFormItem>
        <ElRow :gutter="16">
          <ElCol :span="8">
            <ElFormItem label="请求方法" prop="method">
              <ElSelect v-model="form.method" style="width: 100%">
                <ElOption label="GET" value="GET" />
                <ElOption label="POST" value="POST" />
                <ElOption label="PUT" value="PUT" />
                <ElOption label="DELETE" value="DELETE" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="16">
            <ElFormItem label="接口路径" prop="path">
              <ElInput v-model="form.path" placeholder="如：/api/product/list" />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElFormItem label="所属模块" prop="module">
          <ElSelect v-model="form.module" style="width: 100%">
            <ElOption v-for="m in moduleOptions" :key="m.value" :label="m.label" :value="m.value" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="权限标识">
          <ElInput v-model="form.permissionCode" placeholder="如：product:list" />
        </ElFormItem>
        <ElFormItem label="接口描述">
          <ElInput v-model="form.desc" type="textarea" :rows="3" maxlength="120" show-word-limit placeholder="接口用途说明" />
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
import { ref, reactive, computed, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Icon } from '@iconify/vue'

// ---------- 类型 ----------
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
type ItemStatus = 'on' | 'off'
type FormMode = 'create' | 'edit'

interface ApiRow {
  id: number
  name: string
  method: HttpMethod
  path: string
  module: string
  permissionCode: string
  desc: string
  callCount: number
  status: ItemStatus
}

interface ApiView extends ApiRow {
  moduleText: string
}

interface ApiForm {
  id: number | null
  name: string
  method: HttpMethod
  path: string
  module: string
  permissionCode: string
  desc: string
  status: ItemStatus
}

interface QueryState {
  keyword: string
  method: '' | HttpMethod
  module: string
}

// ---------- 模块选项 ----------
const moduleOptions = [
  { label: '商品', value: 'product' },
  { label: '订单', value: 'order' },
  { label: '会员', value: 'user' },
  { label: '营销', value: 'marketing' },
  { label: '权限', value: 'permission' },
  { label: '系统', value: 'system' }
]

const moduleMap: Record<string, string> = {
  product: '商品',
  order: '订单',
  user: '会员',
  marketing: '营销',
  permission: '权限',
  system: '系统'
}

// ---------- 概览 ----------
const stats = computed(() => {
  const total = mockData.length
  const enabled = mockData.filter(d => d.status === 'on').length
  const getCount = mockData.filter(d => d.method === 'GET').length
  const writeCount = mockData.filter(d => d.method !== 'GET').length
  return [
    { label: '接口总数', value: total, icon: 'solar:code-square-bold-duotone', color: '#409eff', bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
    { label: '启用中', value: enabled, icon: 'solar:check-circle-bold-duotone', color: '#52b788', bg: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' },
    { label: '查询接口', value: getCount, icon: 'solar:magnifer-bold-duotone', color: '#e6a23c', bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)' },
    { label: '写入接口', value: writeCount, icon: 'solar:pen-bold-duotone', color: '#9254de', bg: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)' }
  ]
})

// ---------- 查询 ----------
const query = reactive<QueryState>({ keyword: '', method: '', module: '' })

// ---------- 列表 ----------
const loading = ref(false)
const list = ref<ApiView[]>([])
const total = ref(0)
const page = reactive({ current: 1, size: 10 })

const mockData: ApiRow[] = [
  { id: 1, name: '查询商品列表', method: 'GET', path: '/api/product/list', module: 'product', permissionCode: 'product:list', desc: '分页查询商品列表', callCount: 128600, status: 'on' },
  { id: 2, name: '新增商品', method: 'POST', path: '/api/product/create', module: 'product', permissionCode: 'product:create', desc: '创建新商品', callCount: 1286, status: 'on' },
  { id: 3, name: '更新商品', method: 'PUT', path: '/api/product/update', module: 'product', permissionCode: 'product:update', desc: '更新商品信息', callCount: 8620, status: 'on' },
  { id: 4, name: '删除商品', method: 'DELETE', path: '/api/product/delete', module: 'product', permissionCode: 'product:delete', desc: '删除商品', callCount: 128, status: 'on' },
  { id: 5, name: '查询订单列表', method: 'GET', path: '/api/order/list', module: 'order', permissionCode: 'order:list', desc: '分页查询订单', callCount: 86200, status: 'on' },
  { id: 6, name: '订单发货', method: 'POST', path: '/api/order/ship', module: 'order', permissionCode: 'order:ship', desc: '订单发货操作', callCount: 3260, status: 'on' },
  { id: 7, name: '查询会员列表', method: 'GET', path: '/api/user/list', module: 'user', permissionCode: 'user:list', desc: '分页查询会员', callCount: 42600, status: 'on' },
  { id: 8, name: '禁用会员', method: 'PUT', path: '/api/user/disable', module: 'user', permissionCode: 'user:disable', desc: '禁用会员账号', callCount: 286, status: 'off' }
]

async function fetchList(): Promise<void> {
  loading.value = true
  try {
    await new Promise(r => setTimeout(r, 300))
    let data = [...mockData]
    if (query.keyword) {
      const k = query.keyword.toLowerCase()
      data = data.filter(d => d.name.toLowerCase().includes(k) || d.path.toLowerCase().includes(k))
    }
    if (query.method) {
      data = data.filter(d => d.method === query.method)
    }
    if (query.module) {
      data = data.filter(d => d.module === query.module)
    }
    total.value = data.length
    const start = (page.current - 1) * page.size
    list.value = data.slice(start, start + page.size).map(r => ({
      ...r,
      moduleText: moduleMap[r.module] || r.module
    }))
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
  query.method = ''
  query.module = ''
  page.current = 1
  fetchList()
}

// ---------- 弹窗 ----------
const dialogVisible = ref(false)
const formMode = ref<FormMode>('create')
const saving = ref(false)
const formRef = ref<FormInstance>()

const defaultForm = (): ApiForm => ({
  id: null,
  name: '',
  method: 'GET',
  path: '',
  module: 'product',
  permissionCode: '',
  desc: '',
  status: 'on'
})

const form = reactive<ApiForm>(defaultForm())

const rules: FormRules<ApiForm> = {
  name: [{ required: true, message: '请输入接口名称', trigger: 'blur' }],
  method: [{ required: true, message: '请选择请求方法', trigger: 'change' }],
  path: [{ required: true, message: '请输入接口路径', trigger: 'blur' }],
  module: [{ required: true, message: '请选择所属模块', trigger: 'change' }]
}

function openCreate(): void {
  formMode.value = 'create'
  Object.assign(form, defaultForm())
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

function openEdit(row: ApiView): void {
  formMode.value = 'edit'
  Object.assign(form, {
    id: row.id,
    name: row.name,
    method: row.method,
    path: row.path,
    module: row.module,
    permissionCode: row.permissionCode,
    desc: row.desc,
    status: row.status
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
    const newRow: ApiRow = {
      id: Date.now(),
      name: form.name,
      method: form.method,
      path: form.path,
      module: form.module,
      permissionCode: form.permissionCode,
      desc: form.desc,
      callCount: 0,
      status: form.status
    }
    mockData.unshift(newRow)
    ElMessage.success('接口已新增')
  } else if (form.id) {
    const idx = mockData.findIndex(d => d.id === form.id)
    if (idx > -1) {
      mockData[idx] = {
        ...mockData[idx],
        name: form.name,
        method: form.method,
        path: form.path,
        module: form.module,
        permissionCode: form.permissionCode,
        desc: form.desc,
        status: form.status
      }
    }
    ElMessage.success('接口已更新')
  }

  dialogVisible.value = false
  fetchList()
}

function handleStatusChange(row: ApiView): void {
  ElMessage.success(`接口已${row.status === 'on' ? '启用' : '禁用'}`)
}

function handleDelete(row: ApiView): void {
  const idx = mockData.findIndex(d => d.id === row.id)
  if (idx > -1) mockData.splice(idx, 1)
  ElMessage.success('删除成功')
  fetchList()
}

onMounted(fetchList)
</script>

<style lang="scss" scoped>
.api-page {
  .api-cell {
    display: flex;
    align-items: center;
    gap: 10px;

    .api-method {
      min-width: 56px;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      text-align: center;
      flex-shrink: 0;

      &.get {
        color: #409eff;
        background: rgba(64, 158, 255, 0.12);
      }

      &.post {
        color: #52b788;
        background: rgba(82, 183, 136, 0.12);
      }

      &.put {
        color: #e6a23c;
        background: rgba(230, 162, 60, 0.12);
      }

      &.delete {
        color: #f56c6c;
        background: rgba(245, 108, 108, 0.12);
      }
    }

    .api-name {
      font-size: 13px;
      font-weight: 500;
      color: #1f2d3d;
    }

    .api-path {
      margin-top: 2px;
      font-size: 12px;
      color: #8a94a6;
      font-family: monospace;
    }
  }

  .permission-code {
    font-size: 12px;
    color: #5a6472;
    font-family: monospace;
    padding: 2px 8px;
    background: #f7f9fc;
    border-radius: 4px;
  }
}
</style>