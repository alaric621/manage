<template>
  <div class="list-page admin-page">
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
        <ElFormItem label="管理员">
          <ElInput
            v-model="query.keyword"
            placeholder="账号/姓名/手机号"
            clearable
            style="width: 220px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <Icon icon="solar:magnifer-bold-duotone" width="16" />
            </template>
          </ElInput>
        </ElFormItem>
        <ElFormItem label="角色">
          <ElSelect v-model="query.role" placeholder="全部角色" clearable style="width: 150px">
            <ElOption v-for="r in roleOptions" :key="r.value" :label="r.label" :value="r.value" />
          </ElSelect>
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
            管理员列表
            <span class="title-sub">共 {{ total }} 位</span>
          </div>
          <div class="panel-actions">
            <ElButton
              v-if="selection.length"
              type="danger"
              plain
              size="small"
              @click="handleBatchDelete"
            >
              <Icon icon="solar:trash-bin-trash-bold-duotone" class="btn-icon" />
              批量删除（{{ selection.length }}）
            </ElButton>
            <ElButton type="primary" size="small" @click="openCreate">
              <Icon icon="solar:add-circle-bold-duotone" class="btn-icon" />新增管理员
            </ElButton>
          </div>
        </div>
      </template>

      <ElTable
        v-loading="loading"
        :data="list"
        class="pretty-table"
        row-key="id"
        @selection-change="handleSelectionChange"
      >
        <ElTableColumn type="selection" width="46" align="center" :selectable="row => row.account !== 'admin'" />
        <ElTableColumn label="管理员" min-width="240">
          <template #default="{ row }">
            <div class="admin-cell">
              <div class="admin-avatar" :style="{ background: row.avatarBg }">
                {{ row.name.charAt(0) }}
              </div>
              <div class="admin-meta">
                <div class="admin-name">
                  {{ row.name }}
                  <ElTag v-if="row.account === 'admin'" size="small" type="danger" effect="light" round>
                    超级管理员
                  </ElTag>
                </div>
                <div class="admin-account">{{ row.account }}</div>
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="角色" width="160">
          <template #default="{ row }">
            <ElTag
              v-for="r in row.roles"
              :key="r"
              size="small"
              effect="light"
              round
              style="margin-right: 4px"
            >
              {{ r }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="手机号" width="130">
          <template #default="{ row }">{{ maskPhone(row.phone) }}</template>
        </ElTableColumn>
        <ElTableColumn label="部门" width="110">
          <template #default="{ row }">{{ row.dept }}</template>
        </ElTableColumn>
        <ElTableColumn label="最后登录" width="200">
          <template #default="{ row }">
            <div class="login-cell">
              <div>{{ row.lastLoginAt || '--' }}</div>
              <div class="login-ip">{{ row.lastLoginIp || '--' }}</div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="状态" width="90">
          <template #default="{ row }">
            <ElSwitch
              v-model="row.status"
              :active-value="'on'"
              :inactive-value="'off'"
              size="small"
              :disabled="row.account === 'admin'"
              @change="handleStatusChange(row)"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <ElButton link type="primary" size="small" @click="openEdit(row)">编辑</ElButton>
            <ElButton link type="primary" size="small" @click="openResetPassword(row)">重置密码</ElButton>
            <ElPopconfirm
              title="确定删除该管理员？"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <ElButton
                  link
                  type="danger"
                  size="small"
                  :disabled="row.account === 'admin'"
                >
                  删除
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
      :title="formMode === 'create' ? '新增管理员' : '编辑管理员'"
      width="560px"
      destroy-on-close
    >
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="90px">
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="姓名" prop="name">
              <ElInput v-model="form.name" placeholder="请输入姓名" maxlength="20" show-word-limit />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="账号" prop="account">
              <ElInput
                v-model="form.account"
                placeholder="登录账号"
                :disabled="formMode === 'edit'"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="手机号" prop="phone">
              <ElInput v-model="form.phone" placeholder="11 位手机号" maxlength="11" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="部门" prop="dept">
              <ElSelect v-model="form.dept" placeholder="选择部门" style="width: 100%">
                <ElOption label="运营部" value="运营部" />
                <ElOption label="客服部" value="客服部" />
                <ElOption label="财务部" value="财务部" />
                <ElOption label="技术部" value="技术部" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElFormItem v-if="formMode === 'create'" label="登录密码" prop="password">
          <ElInput v-model="form.password" type="password" placeholder="至少 6 位" show-password />
        </ElFormItem>
        <ElFormItem label="分配角色" prop="roles">
          <ElSelect
            v-model="form.roles"
            multiple
            placeholder="选择角色"
            style="width: 100%"
          >
            <ElOption v-for="r in roleOptions" :key="r.value" :label="r.label" :value="r.value" />
          </ElSelect>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Icon } from '@iconify/vue'

// ---------- 类型 ----------
type ItemStatus = 'on' | 'off'
type FormMode = 'create' | 'edit'

interface AdminRow {
  id: number
  name: string
  account: string
  avatarBg: string
  phone: string
  dept: string
  roles: string[]
  status: ItemStatus
  lastLoginAt: string
  lastLoginIp: string
  createdAt: string
}

interface AdminForm {
  id: number | null
  name: string
  account: string
  phone: string
  dept: string
  password: string
  roles: string[]
  status: ItemStatus
}

interface QueryState {
  keyword: string
  role: string
  status: '' | ItemStatus
}

// ---------- 角色选项 ----------
const roleOptions = [
  { label: '超级管理员', value: '超级管理员' },
  { label: '运营专员', value: '运营专员' },
  { label: '订单客服', value: '订单客服' },
  { label: '财务人员', value: '财务人员' },
  { label: '访客', value: '访客' }
]

// ---------- 概览 ----------
const stats = computed(() => {
  const total = mockData.length
  const enabled = mockData.filter(d => d.status === 'on').length
  const disabled = mockData.filter(d => d.status === 'off').length
  const roles = new Set(mockData.flatMap(d => d.roles)).size
  return [
    { label: '管理员总数', value: total, icon: 'solar:user-id-bold-duotone', color: '#409eff', bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
    { label: '启用中', value: enabled, icon: 'solar:check-circle-bold-duotone', color: '#52b788', bg: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' },
    { label: '已禁用', value: disabled, icon: 'solar:user-block-bold-duotone', color: '#e6a23c', bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)' },
    { label: '角色种类', value: roles, icon: 'solar:users-group-rounded-bold-duotone', color: '#9254de', bg: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)' }
  ]
})

// ---------- 查询 ----------
const query = reactive<QueryState>({ keyword: '', role: '', status: '' })

// ---------- 列表 ----------
const loading = ref(false)
const list = ref<AdminRow[]>([])
const total = ref(0)
const page = reactive({ current: 1, size: 10 })
const selection = ref<AdminRow[]>([])

const mockData: AdminRow[] = [
  { id: 1, name: '超级管理员', account: 'admin', avatarBg: '#f56c6c', phone: '13800000001', dept: '技术部', roles: ['超级管理员'], status: 'on', lastLoginAt: '2026-10-30 09:12:30', lastLoginIp: '192.168.1.10', createdAt: '2025-01-01 00:00' },
  { id: 2, name: '张三', account: 'zhangsan', avatarBg: '#409eff', phone: '13812345678', dept: '运营部', roles: ['运营专员'], status: 'on', lastLoginAt: '2026-10-30 08:40:12', lastLoginIp: '10.0.0.22', createdAt: '2025-03-12 10:20' },
  { id: 3, name: '李四', account: 'lisi', avatarBg: '#52b788', phone: '13987654321', dept: '客服部', roles: ['订单客服'], status: 'on', lastLoginAt: '2026-10-29 22:18:05', lastLoginIp: '172.16.0.5', createdAt: '2025-05-08 14:00' },
  { id: 4, name: '王五', account: 'wangwu', avatarBg: '#e6a23c', phone: '13711112222', dept: '财务部', roles: ['财务人员'], status: 'on', lastLoginAt: '2026-10-29 20:05:44', lastLoginIp: '192.168.2.33', createdAt: '2025-07-15 09:30' },
  { id: 5, name: '赵六', account: 'zhaoliu', avatarBg: '#9254de', phone: '13633334444', dept: '运营部', roles: ['运营专员', '订单客服'], status: 'off', lastLoginAt: '2026-09-25 20:05:00', lastLoginIp: '10.1.1.8', createdAt: '2025-09-01 11:00' }
]

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
        d.name.toLowerCase().includes(k) ||
        d.account.toLowerCase().includes(k) ||
        d.phone.includes(query.keyword)
      )
    }
    if (query.role) {
      data = data.filter(d => d.roles.includes(query.role))
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
  query.role = ''
  query.status = ''
  page.current = 1
  fetchList()
}

function handleSelectionChange(val: AdminRow[]): void {
  selection.value = val
}

// ---------- 弹窗 ----------
const dialogVisible = ref(false)
const formMode = ref<FormMode>('create')
const saving = ref(false)
const formRef = ref<FormInstance>()

const defaultForm = (): AdminForm => ({
  id: null,
  name: '',
  account: '',
  phone: '',
  dept: '',
  password: '',
  roles: [],
  status: 'on'
})

const form = reactive<AdminForm>(defaultForm())

const rules: FormRules<AdminForm> = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  account: [{ required: true, message: '请输入登录账号', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  dept: [{ required: true, message: '请选择部门', trigger: 'change' }],
  password: [
    { required: true, message: '请输入登录密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' }
  ],
  roles: [{ required: true, message: '请至少选择一个角色', trigger: 'change' }]
}

function openCreate(): void {
  formMode.value = 'create'
  Object.assign(form, defaultForm())
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

function openEdit(row: AdminRow): void {
  formMode.value = 'edit'
  Object.assign(form, {
    id: row.id,
    name: row.name,
    account: row.account,
    phone: row.phone,
    dept: row.dept,
    password: '',
    roles: [...row.roles],
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
    const newRow: AdminRow = {
      id: Date.now(),
      name: form.name,
      account: form.account,
      avatarBg: '#409eff',
      phone: form.phone,
      dept: form.dept,
      roles: [...form.roles],
      status: form.status,
      lastLoginAt: '',
      lastLoginIp: '',
      createdAt: new Date().toLocaleString('zh-CN')
    }
    mockData.push(newRow)
    ElMessage.success('管理员已新增')
  } else if (form.id) {
    const idx = mockData.findIndex(d => d.id === form.id)
    if (idx > -1) {
      mockData[idx] = {
        ...mockData[idx],
        name: form.name,
        phone: form.phone,
        dept: form.dept,
        roles: [...form.roles],
        status: form.status
      }
    }
    ElMessage.success('管理员已更新')
  }

  dialogVisible.value = false
  fetchList()
}

function handleStatusChange(row: AdminRow): void {
  ElMessage.success(`管理员已${row.status === 'on' ? '启用' : '禁用'}`)
}

function openResetPassword(row: AdminRow): void {
  ElMessageBox.prompt(`为「${row.name}」设置新密码`, '重置密码', {
    inputType: 'password',
    inputPattern: /^.{6,}$/,
    inputErrorMessage: '密码至少 6 位',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(() => {
      ElMessage.success('密码已重置')
    })
    .catch(() => {})
}

function handleDelete(row: AdminRow): void {
  const idx = mockData.findIndex(d => d.id === row.id)
  if (idx > -1) mockData.splice(idx, 1)
  ElMessage.success('删除成功')
  fetchList()
}

function handleBatchDelete(): void {
  if (!selection.value.length) return
  ElMessageBox.confirm(`确定删除选中的 ${selection.value.length} 位管理员吗？`, '提示', { type: 'warning' })
    .then(() => {
      const ids = new Set(selection.value.map(r => r.id))
      for (let i = mockData.length - 1; i >= 0; i--) {
        if (ids.has(mockData[i].id)) mockData.splice(i, 1)
      }
      selection.value = []
      ElMessage.success('批量删除成功')
      fetchList()
    })
    .catch(() => {})
}

onMounted(fetchList)
</script>

<style lang="scss" scoped>
.admin-page {
  .admin-cell {
    display: flex;
    align-items: center;
    gap: 10px;

    .admin-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .admin-name {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 500;
      color: #1f2d3d;
    }

    .admin-account {
      margin-top: 2px;
      font-size: 12px;
      color: #8a94a6;
      font-family: monospace;
    }
  }

  .login-cell {
    font-size: 12px;
    color: #5a6472;

    .login-ip {
      margin-top: 2px;
      color: #8a94a6;
      font-family: monospace;
    }
  }
}
</style>