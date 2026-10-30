<template>
  <div class="list-page role-page">
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
        <ElFormItem label="角色名称">
          <ElInput
            v-model="query.keyword"
            placeholder="角色名称/标识"
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
            角色列表
            <span class="title-sub">共 {{ total }} 个角色</span>
          </div>
          <div class="panel-actions">
            <ElButton type="primary" size="small" @click="openCreate">
              <Icon icon="solar:add-circle-bold-duotone" class="btn-icon" />新增角色
            </ElButton>
          </div>
        </div>
      </template>

      <ElTable v-loading="loading" :data="list" class="pretty-table" row-key="id">
        <ElTableColumn label="角色" min-width="220">
          <template #default="{ row }">
            <div class="role-cell">
              <div class="role-badge" :style="{ background: row.bg, color: row.color }">
                <Icon :icon="row.icon" width="18" />
              </div>
              <div class="role-meta">
                <div class="role-name">{{ row.name }}</div>
                <div class="role-code">{{ row.code }}</div>
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="描述" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">{{ row.desc || '--' }}</template>
        </ElTableColumn>
        <ElTableColumn label="成员数" width="90" align="center">
          <template #default="{ row }">{{ row.memberCount }}</template>
        </ElTableColumn>
        <ElTableColumn label="权限" width="120" align="center">
          <template #default="{ row }">
            <ElButton link type="primary" size="small" @click="openPermission(row)">
              配置权限
            </ElButton>
          </template>
        </ElTableColumn>
        <ElTableColumn label="状态" width="90">
          <template #default="{ row }">
            <ElSwitch
              v-model="row.status"
              :active-value="'on'"
              :inactive-value="'off'"
              size="small"
              :disabled="row.code === 'super-admin'"
              @change="handleStatusChange(row)"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createdAt" label="创建时间" width="170" />
        <ElTableColumn label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <ElButton link type="primary" size="small" @click="openEdit(row)">编辑</ElButton>
            <ElButton link type="primary" size="small" @click="openMembers(row)">成员</ElButton>
            <ElPopconfirm
              title="确定删除该角色？"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <ElButton
                  link
                  type="danger"
                  size="small"
                  :disabled="row.code === 'super-admin'"
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
      :title="formMode === 'create' ? '新增角色' : '编辑角色'"
      width="520px"
      destroy-on-close
    >
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="90px">
        <ElFormItem label="角色名称" prop="name">
          <ElInput v-model="form.name" placeholder="如：运营专员" maxlength="30" show-word-limit />
        </ElFormItem>
        <ElFormItem label="角色标识" prop="code">
          <ElInput v-model="form.code" placeholder="如：operator" :disabled="formMode === 'edit'" />
        </ElFormItem>
        <ElFormItem label="角色图标">
          <ElSelect v-model="form.icon" placeholder="选择图标" style="width: 100%">
            <ElOption v-for="ic in iconOptions" :key="ic.value" :label="ic.label" :value="ic.value">
              <div class="icon-option">
                <Icon :icon="ic.value" width="18" />
                <span>{{ ic.label }}</span>
              </div>
            </ElOption>
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="描述">
          <ElInput v-model="form.desc" type="textarea" :rows="3" maxlength="120" show-word-limit placeholder="角色职责说明" />
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

    <!-- 权限配置抽屉 -->
    <ElDrawer v-model="permissionVisible" title="配置角色权限" size="480px">
      <template v-if="currentRole">
        <div class="drawer-role">
          <div class="role-badge" :style="{ background: currentRole.bg, color: currentRole.color }">
            <Icon :icon="currentRole.icon" width="20" />
          </div>
          <div>
            <div class="drawer-name">{{ currentRole.name }}</div>
            <div class="drawer-code">{{ currentRole.code }}</div>
          </div>
        </div>

        <div class="section-title">菜单权限</div>
        <ElTree
          ref="menuTreeRef"
          :data="menuTreeData"
          show-checkbox
          node-key="id"
          default-expand-all
          :default-checked-keys="currentRole.menuIds"
          class="permission-tree"
        >
          <template #default="{ data }">
            <span class="tree-label">
              <Icon :icon="data.icon" width="14" />
              {{ data.label }}
            </span>
          </template>
        </ElTree>

        <div class="drawer-actions">
          <ElButton @click="permissionVisible = false">取消</ElButton>
          <ElButton type="primary" :loading="saving" @click="handleSavePermission">保存权限</ElButton>
        </div>
      </template>
    </ElDrawer>

    <!-- 成员抽屉 -->
    <ElDrawer v-model="membersVisible" title="角色成员" size="480px">
      <template v-if="currentRole">
        <div class="drawer-role">
          <div class="role-badge" :style="{ background: currentRole.bg, color: currentRole.color }">
            <Icon :icon="currentRole.icon" width="20" />
          </div>
          <div>
            <div class="drawer-name">{{ currentRole.name }}</div>
            <div class="drawer-code">{{ currentRole.code }}</div>
          </div>
        </div>

        <div class="section-title">成员列表（{{ mockMembers.length }}）</div>
        <div class="member-list">
          <div v-for="m in mockMembers" :key="m.id" class="member-item">
            <div class="member-avatar" :style="{ background: m.avatarBg }">
              {{ m.name.charAt(0) }}
            </div>
            <div class="member-meta">
              <div class="member-name">{{ m.name }}</div>
              <div class="member-account">{{ m.account }}</div>
            </div>
            <ElTag size="small" effect="light" round>{{ m.dept }}</ElTag>
          </div>
        </div>
      </template>
    </ElDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { ElTree } from 'element-plus'
import { Icon } from '@iconify/vue'

// ---------- 类型 ----------
type ItemStatus = 'on' | 'off'
type FormMode = 'create' | 'edit'

interface MenuNode {
  id: string
  label: string
  icon: string
  children?: MenuNode[]
}

interface RoleRow {
  id: number
  name: string
  code: string
  icon: string
  color: string
  bg: string
  desc: string
  memberCount: number
  status: ItemStatus
  createdAt: string
  menuIds: string[]
}

interface RoleForm {
  id: number | null
  name: string
  code: string
  icon: string
  desc: string
  status: ItemStatus
}

interface QueryState {
  keyword: string
  status: '' | ItemStatus
}

// ---------- 概览 ----------
const stats = computed(() => {
  const total = mockData.length
  const enabled = mockData.filter(d => d.status === 'on').length
  const members = mockData.reduce((s, d) => s + d.memberCount, 0)
  const codes = mockData.length
  return [
    { label: '角色总数', value: total, icon: 'solar:users-group-rounded-bold-duotone', color: '#409eff', bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
    { label: '启用中', value: enabled, icon: 'solar:check-circle-bold-duotone', color: '#52b788', bg: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' },
    { label: '覆盖成员', value: members, icon: 'solar:user-id-bold-duotone', color: '#e6a23c', bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)' },
    { label: '权限项', value: codes, icon: 'solar:shield-keyhole-bold-duotone', color: '#9254de', bg: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)' }
  ]
})

// ---------- 查询 ----------
const query = reactive<QueryState>({ keyword: '', status: '' })

// ---------- 列表 ----------
const loading = ref(false)
const list = ref<RoleRow[]>([])
const total = ref(0)
const page = reactive({ current: 1, size: 10 })

const mockData: RoleRow[] = [
  { id: 1, name: '超级管理员', code: 'super-admin', icon: 'solar:crown-bold-duotone', color: '#f56c6c', bg: 'linear-gradient(135deg, #ffeaea, #ffd6d6)', desc: '拥有系统全部权限', memberCount: 1, status: 'on', createdAt: '2025-01-01 00:00', menuIds: ['all'] },
  { id: 2, name: '运营专员', code: 'operator', icon: 'solar:megaphone-bold-duotone', color: '#409eff', bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)', desc: '负责营销活动、商品运营', memberCount: 6, status: 'on', createdAt: '2025-03-12 10:20', menuIds: ['product', 'marketing'] },
  { id: 3, name: '订单客服', code: 'order-service', icon: 'solar:headphones-round-sound-bold-duotone', color: '#52b788', bg: 'linear-gradient(135deg, #e6f7ee, #cdf0de)', desc: '处理订单、售后及会员问题', memberCount: 12, status: 'on', createdAt: '2025-05-08 14:00', menuIds: ['order', 'user'] },
  { id: 4, name: '财务人员', code: 'finance', icon: 'solar:wallet-money-bold-duotone', color: '#e6a23c', bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)', desc: '查看订单及数据统计', memberCount: 3, status: 'on', createdAt: '2025-07-15 09:30', menuIds: ['order', 'analytics'] },
  { id: 5, name: '访客', code: 'guest', icon: 'solar:user-bold-duotone', color: '#8a94a6', bg: 'linear-gradient(135deg, #f5f7fa, #e4e7ed)', desc: '只读权限', memberCount: 2, status: 'off', createdAt: '2025-09-01 11:00', menuIds: [] }
]

const iconOptions = [
  { label: '皇冠', value: 'solar:crown-bold-duotone' },
  { label: '喇叭', value: 'solar:megaphone-bold-duotone' },
  { label: '耳机', value: 'solar:headphones-round-sound-bold-duotone' },
  { label: '钱包', value: 'solar:wallet-money-bold-duotone' },
  { label: '用户', value: 'solar:user-bold-duotone' },
  { label: '盾牌', value: 'solar:shield-keyhole-bold-duotone' }
]

const menuTreeData: MenuNode[] = [
  {
    id: 'console', label: '控制台', icon: 'solar:home-2-bold-duotone'
  },
  {
    id: 'product', label: '商品管理', icon: 'solar:cart-large-bold-duotone',
    children: [
      { id: 'product-list', label: '商品列表', icon: 'solar:box-bold-duotone' },
      { id: 'product-category', label: '商品分类', icon: 'solar:folder-bold-duotone' },
      { id: 'product-tag', label: '标签', icon: 'solar:tag-bold-duotone' },
      { id: 'product-spec', label: '规格', icon: 'solar:slider-vertical-bold-duotone' },
      { id: 'product-brand', label: '品牌', icon: 'solar:medal-ribbon-bold-duotone' },
      { id: 'product-review', label: '商品评价', icon: 'solar:star-bold-duotone' }
    ]
  },
  {
    id: 'order', label: '订单管理', icon: 'solar:document-bold-duotone',
    children: [
      { id: 'order-list', label: '订单列表', icon: 'solar:list-bold-duotone' },
      { id: 'order-refund', label: '售后/退款', icon: 'solar:refresh-circle-bold-duotone' },
      { id: 'order-shipping', label: '发货管理', icon: 'solar:delivery-bold-duotone' }
    ]
  },
  {
    id: 'user', label: '会员管理', icon: 'solar:user-bold-duotone',
    children: [
      { id: 'user-list', label: '会员列表', icon: 'solar:users-group-rounded-bold-duotone' },
      { id: 'user-level', label: '会员等级', icon: 'solar:ranking-bold-duotone' },
      { id: 'user-points', label: '积分管理', icon: 'solar:gift-bold-duotone' }
    ]
  },
  {
    id: 'marketing', label: '营销管理', icon: 'solar:chart-2-bold-duotone',
    children: [
      { id: 'marketing-coupon', label: '优惠券', icon: 'solar:ticket-bold-duotone' },
      { id: 'marketing-flash-sale', label: '秒杀/限时折扣', icon: 'solar:lightning-bold-duotone' },
      { id: 'marketing-full-reduction', label: '满减活动', icon: 'solar:sale-bold-duotone' },
      { id: 'marketing-group-buy', label: '拼团', icon: 'solar:users-group-two-rounded-bold-duotone' }
    ]
  },
  {
    id: 'decoration', label: '店铺装修', icon: 'solar:palette-bold-duotone',
    children: [
      { id: 'decoration-page', label: '页面管理', icon: 'solar:documents-bold-duotone' },
      { id: 'decoration-banner', label: '轮播图/广告', icon: 'solar:gallery-wide-bold-duotone' },
      { id: 'decoration-nav', label: '导航菜单', icon: 'solar:menu-dots-bold-duotone' }
    ]
  },
  {
    id: 'analytics', label: '数据统计', icon: 'solar:chart-bold-duotone',
    children: [
      { id: 'analytics-sales', label: '销售概览', icon: 'solar:graph-up-bold-duotone' },
      { id: 'analytics-product', label: '商品分析', icon: 'solar:pie-chart-bold-duotone' },
      { id: 'analytics-user', label: '会员分析', icon: 'solar:user-check-bold-duotone' }
    ]
  },
  {
    id: 'permission', label: '权限管理', icon: 'solar:shield-keyhole-bold-duotone',
    children: [
      { id: 'permission-role', label: '角色管理', icon: 'solar:users-group-rounded-bold-duotone' },
      { id: 'permission-menu', label: '菜单权限', icon: 'solar:menu-dots-bold-duotone' },
      { id: 'permission-api', label: '接口权限', icon: 'solar:code-square-bold-duotone' },
      { id: 'permission-log', label: '操作日志', icon: 'solar:history-bold-duotone' }
    ]
  }
]

async function fetchList(): Promise<void> {
  loading.value = true
  try {
    await new Promise(r => setTimeout(r, 300))
    let data = [...mockData]
    if (query.keyword) {
      const k = query.keyword.toLowerCase()
      data = data.filter(d => d.name.toLowerCase().includes(k) || d.code.toLowerCase().includes(k))
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

const defaultForm = (): RoleForm => ({
  id: null,
  name: '',
  code: '',
  icon: 'solar:user-bold-duotone',
  desc: '',
  status: 'on'
})

const form = reactive<RoleForm>(defaultForm())

const rules: FormRules<RoleForm> = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色标识', trigger: 'blur' }]
}

function openCreate(): void {
  formMode.value = 'create'
  Object.assign(form, defaultForm())
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

function openEdit(row: RoleRow): void {
  formMode.value = 'edit'
  Object.assign(form, {
    id: row.id,
    name: row.name,
    code: row.code,
    icon: row.icon,
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
    const newRow: RoleRow = {
      id: Date.now(),
      name: form.name,
      code: form.code,
      icon: form.icon,
      color: '#409eff',
      bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)',
      desc: form.desc,
      memberCount: 0,
      status: form.status,
      createdAt: new Date().toLocaleString('zh-CN'),
      menuIds: []
    }
    mockData.push(newRow)
    ElMessage.success('角色已新增')
  } else if (form.id) {
    const idx = mockData.findIndex(d => d.id === form.id)
    if (idx > -1) {
      mockData[idx] = {
        ...mockData[idx],
        name: form.name,
        icon: form.icon,
        desc: form.desc,
        status: form.status
      }
    }
    ElMessage.success('角色已更新')
  }

  dialogVisible.value = false
  fetchList()
}

function handleStatusChange(row: RoleRow): void {
  ElMessage.success(`角色已${row.status === 'on' ? '启用' : '禁用'}`)
}

function handleDelete(row: RoleRow): void {
  if (row.memberCount > 0) {
    ElMessageBox.alert('该角色下还有成员，请先移除成员', '提示', { type: 'warning' })
    return
  }
  const idx = mockData.findIndex(d => d.id === row.id)
  if (idx > -1) mockData.splice(idx, 1)
  ElMessage.success('删除成功')
  fetchList()
}

// ---------- 权限配置 ----------
const permissionVisible = ref(false)
const currentRole = ref<RoleRow | null>(null)
const menuTreeRef = ref<InstanceType<typeof ElTree>>()

function openPermission(row: RoleRow): void {
  currentRole.value = row
  permissionVisible.value = true
  nextTick(() => {
    menuTreeRef.value?.setCheckedKeys([])
    if (row.menuIds.includes('all')) {
      menuTreeRef.value?.setCheckedKeys(getAllNodeIds(menuTreeData))
    } else {
      menuTreeRef.value?.setCheckedKeys(row.menuIds)
    }
  })
}

function getAllNodeIds(nodes: MenuNode[]): string[] {
  const ids: string[] = []
  function walk(list: MenuNode[]): void {
    list.forEach(n => {
      ids.push(n.id)
      if (n.children) walk(n.children)
    })
  }
  walk(nodes)
  return ids
}

async function handleSavePermission(): Promise<void> {
  if (!currentRole.value || !menuTreeRef.value) return
  saving.value = true
  await new Promise(r => setTimeout(r, 300))
  saving.value = false
  const checked = menuTreeRef.value.getCheckedKeys() as string[]
  const halfChecked = menuTreeRef.value.getHalfCheckedKeys() as string[]
  const ids = [...checked, ...halfChecked]
  const target = mockData.find(d => d.id === currentRole.value!.id)
  if (target) target.menuIds = ids
  currentRole.value.menuIds = ids
  ElMessage.success('权限已保存')
  permissionVisible.value = false
}

// ---------- 成员 ----------
const membersVisible = ref(false)
const mockMembers = [
  { id: 1, name: '张三', account: 'zhangsan@shop.com', dept: '运营部', avatarBg: '#409eff' },
  { id: 2, name: '李四', account: 'lisi@shop.com', dept: '运营部', avatarBg: '#52b788' },
  { id: 3, name: '王五', account: 'wangwu@shop.com', dept: '客服部', avatarBg: '#e6a23c' },
  { id: 4, name: '赵六', account: 'zhaoliu@shop.com', dept: '客服部', avatarBg: '#9254de' }
]

function openMembers(row: RoleRow): void {
  currentRole.value = row
  membersVisible.value = true
}

onMounted(fetchList)
</script>

<style lang="scss" scoped>
.role-page {
  .role-cell {
    display: flex;
    align-items: center;
    gap: 10px;

    .role-badge {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .role-name {
      font-size: 13px;
      font-weight: 500;
      color: #1f2d3d;
    }

    .role-code {
      margin-top: 2px;
      font-size: 12px;
      color: #8a94a6;
      font-family: monospace;
    }
  }

  .icon-option {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  // 抽屉
  .drawer-role {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px;
    background: #f7f9fc;
    border-radius: 12px;
    margin-bottom: 16px;

    .role-badge {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .drawer-name {
      font-size: 14px;
      font-weight: 600;
      color: #1f2d3d;
    }

    .drawer-code {
      margin-top: 2px;
      font-size: 12px;
      color: #8a94a6;
      font-family: monospace;
    }
  }

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #1f2d3d;
    margin: 16px 0 10px;
  }

  .permission-tree {
    :deep(.el-tree-node__content) {
      height: 34px;
      border-radius: 6px;

      &:hover {
        background: #f5f9ff;
      }
    }

    .tree-label {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #5a6472;
    }
  }

  .drawer-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #eef1f6;
  }

  // 成员
  .member-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .member-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: #f7f9fc;
    border-radius: 10px;

    .member-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .member-meta {
      flex: 1;
      min-width: 0;
    }

    .member-name {
      font-size: 13px;
      font-weight: 500;
      color: #1f2d3d;
    }

    .member-account {
      margin-top: 2px;
      font-size: 12px;
      color: #8a94a6;
    }
  }
}
</style>