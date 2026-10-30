<template>
  <div class="list-page menu-page">
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

    <ElRow :gutter="16">
      <!-- 左侧：菜单树 -->
      <ElCol :xs="24" :md="9">
        <ElCard class="panel-card" shadow="never">
          <template #header>
            <div class="panel-header">
              <div class="panel-title">
                <span class="title-dot"></span>
                菜单结构
                <span class="title-sub">{{ totalCount }} 项</span>
              </div>
              <ElButton type="primary" size="small" @click="openCreate(null)">
                <Icon icon="solar:add-circle-bold-duotone" class="btn-icon" />新增
              </ElButton>
            </div>
          </template>

          <ElInput v-model="filterText" placeholder="搜索菜单名称" clearable class="tree-search">
            <template #prefix>
              <Icon icon="solar:magnifer-bold-duotone" width="16" />
            </template>
          </ElInput>

          <div class="tree-wrap">
            <ElTree
              ref="treeRef"
              :data="treeData"
              :props="treeProps"
              node-key="id"
              default-expand-all
              highlight-current
              :filter-node-method="filterNode"
              :expand-on-click-node="false"
              class="menu-tree"
              @node-click="handleNodeClick"
            >
              <template #default="{ data }">
                <div class="tree-node">
                  <span class="tree-label">
                    <Icon :icon="data.icon || 'solar:menu-dots-bold-duotone'" width="16" class="tree-icon" />
                    {{ data.title }}
                    <ElTag v-if="data.status === 'off'" size="small" type="info" effect="plain" round class="tree-tag">
                      禁用
                    </ElTag>
                  </span>
                  <span class="tree-actions">
                    <ElTooltip content="新增子菜单" placement="top">
                      <ElButton link type="primary" size="small" @click.stop="openCreate(data)">
                        <Icon icon="solar:add-circle-bold-duotone" width="14" />
                      </ElButton>
                    </ElTooltip>
                    <ElTooltip content="编辑" placement="top">
                      <ElButton link type="primary" size="small" @click.stop="openEdit(data)">
                        <Icon icon="solar:pen-bold-duotone" width="14" />
                      </ElButton>
                    </ElTooltip>
                    <ElTooltip content="删除" placement="top">
                      <ElPopconfirm title="确定删除该菜单？" @confirm="handleDelete(data)">
                        <template #reference>
                          <ElButton link type="danger" size="small" @click.stop>
                            <Icon icon="solar:trash-bin-trash-bold-duotone" width="14" />
                          </ElButton>
                        </template>
                      </ElPopconfirm>
                    </ElTooltip>
                  </span>
                </div>
              </template>
            </ElTree>

            <ElEmpty v-if="!treeData.length" description="暂无菜单，点击右上角新增" :image-size="80" />
          </div>
        </ElCard>
      </ElCol>

      <!-- 右侧：菜单详情/表单 -->
      <ElCol :xs="24" :md="15">
        <ElCard class="panel-card" shadow="never">
          <template #header>
            <div class="panel-header">
              <div class="panel-title">
                <span class="title-dot"></span>
                {{ formMode === 'create' ? '新增菜单' : formMode === 'edit' ? '编辑菜单' : '菜单详情' }}
              </div>
              <div v-if="formMode === 'view' && currentNode" class="header-actions">
                <ElButton size="small" @click="openEdit(currentNode)">
                  <Icon icon="solar:pen-bold-duotone" class="btn-icon" />编辑
                </ElButton>
                <ElButton size="small" type="primary" plain @click="openCreate(currentNode)">
                  <Icon icon="solar:add-circle-bold-duotone" class="btn-icon" />添加子菜单
                </ElButton>
              </div>
            </div>
          </template>

          <!-- 详情视图 -->
          <template v-if="formMode === 'view' && currentNode">
            <div class="detail-overview">
              <div class="detail-cover">
                <Icon :icon="currentNode.icon || 'solar:menu-dots-bold-duotone'" width="32" />
              </div>
              <div class="detail-info">
                <h3 class="detail-name">{{ currentNode.title }}</h3>
                <p class="detail-path">{{ currentNode.path || '--' }}</p>
              </div>
              <ElTag :type="currentNode.status === 'on' ? 'success' : 'info'" size="small" effect="light" round>
                {{ currentNode.status === 'on' ? '启用' : '禁用' }}
              </ElTag>
            </div>

            <ElDescriptions :column="2" border class="detail-desc">
              <ElDescriptionsItem label="菜单 ID">{{ currentNode.id }}</ElDescriptionsItem>
              <ElDescriptionsItem label="路由名称">{{ currentNode.name || '--' }}</ElDescriptionsItem>
              <ElDescriptionsItem label="访问路径">{{ currentNode.path || '--' }}</ElDescriptionsItem>
              <ElDescriptionsItem label="菜单图标">{{ currentNode.icon || '--' }}</ElDescriptionsItem>
              <ElDescriptionsItem label="排序">{{ currentNode.sort }}</ElDescriptionsItem>
              <ElDescriptionsItem label="是否隐藏">
                <ElTag :type="currentNode.hidden ? 'info' : 'success'" size="small" effect="light">
                  {{ currentNode.hidden ? '隐藏' : '显示' }}
                </ElTag>
              </ElDescriptionsItem>
              <ElDescriptionsItem label="子菜单数">{{ currentNode.children?.length || 0 }}</ElDescriptionsItem>
              <ElDescriptionsItem label="创建时间">{{ currentNode.createdAt || '--' }}</ElDescriptionsItem>
            </ElDescriptions>

            <div v-if="currentNode.children?.length" class="child-section">
              <div class="child-title">子菜单（{{ currentNode.children.length }}）</div>
              <div class="child-list">
                <div
                  v-for="child in currentNode.children"
                  :key="child.id"
                  class="child-item"
                  @click="handleNodeClick(child)"
                >
                  <Icon :icon="child.icon || 'solar:menu-dots-bold-duotone'" width="16" class="child-icon" />
                  <span>{{ child.title }}</span>
                  <Icon icon="solar:alt-arrow-right-bold-duotone" width="14" class="child-arrow" />
                </div>
              </div>
            </div>
          </template>

          <ElEmpty
            v-else-if="formMode === 'view'"
            description="请从左侧选择一个菜单，或新增菜单"
            :image-size="100"
          >
            <ElButton type="primary" @click="openCreate(null)">
              <Icon icon="solar:add-circle-bold-duotone" class="btn-icon" />新增菜单
            </ElButton>
          </ElEmpty>

          <!-- 表单视图 -->
          <ElForm
            v-else
            ref="formRef"
            :model="form"
            :rules="rules"
            label-width="100px"
            class="menu-form"
          >
            <ElFormItem label="上级菜单">
              <ElTreeSelect
                v-model="form.parentId"
                :data="parentOptions"
                :props="{ label: 'title', value: 'id', children: 'children' }"
                check-strictly
                clearable
                placeholder="不选则为顶级菜单"
                style="width: 100%"
              />
            </ElFormItem>
            <ElRow :gutter="16">
              <ElCol :span="12">
                <ElFormItem label="菜单名称" prop="title">
                  <ElInput v-model="form.title" placeholder="如：商品管理" maxlength="20" show-word-limit />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="路由名称">
                  <ElInput v-model="form.name" placeholder="如：ProductList" />
                </ElFormItem>
              </ElCol>
            </ElRow>
            <ElFormItem label="访问路径" prop="path">
              <ElInput v-model="form.path" placeholder="如：/product/list" />
            </ElFormItem>
            <ElFormItem label="菜单图标">
              <div class="icon-picker">
                <ElSelect v-model="form.icon" placeholder="选择图标" filterable style="flex: 1">
                  <ElOption v-for="ic in iconOptions" :key="ic.value" :label="ic.label" :value="ic.value">
                    <div class="icon-option">
                      <Icon :icon="ic.value" width="18" />
                      <span>{{ ic.label }}</span>
                    </div>
                  </ElOption>
                </ElSelect>
                <div class="icon-preview">
                  <Icon :icon="form.icon || 'solar:menu-dots-bold-duotone'" width="20" />
                </div>
              </div>
            </ElFormItem>
            <ElRow :gutter="16">
              <ElCol :span="12">
                <ElFormItem label="排序">
                  <ElInputNumber v-model="form.sort" :min="0" :max="9999" controls-position="right" style="width: 100%" />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="状态">
                  <ElRadioGroup v-model="form.status">
                    <ElRadio value="on">启用</ElRadio>
                    <ElRadio value="off">禁用</ElRadio>
                  </ElRadioGroup>
                </ElFormItem>
              </ElCol>
            </ElRow>
            <ElFormItem label="是否隐藏">
              <ElSwitch v-model="form.hidden" />
              <span class="form-tip">隐藏后不在侧边栏显示，但仍可访问</span>
            </ElFormItem>
            <ElFormItem>
              <ElButton type="primary" :loading="saving" @click="handleSave">保存</ElButton>
              <ElButton @click="cancelForm">取消</ElButton>
            </ElFormItem>
          </ElForm>
        </ElCard>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { ElTree } from 'element-plus'
import { Icon } from '@iconify/vue'

// ---------- 类型 ----------
type ItemStatus = 'on' | 'off'
type FormMode = 'view' | 'create' | 'edit'

interface MenuNode {
  id: number
  title: string
  name: string
  path: string
  icon: string
  parentId: number | null
  sort: number
  status: ItemStatus
  hidden: boolean
  createdAt?: string
  children?: MenuNode[]
}

interface MenuForm {
  id: number | null
  parentId: number | null
  title: string
  name: string
  path: string
  icon: string
  sort: number
  status: ItemStatus
  hidden: boolean
}

// ---------- 树配置 ----------
const treeRef = ref<InstanceType<typeof ElTree>>()
const filterText = ref('')
const treeProps = { children: 'children', label: 'title' }

const treeData = ref<MenuNode[]>([
  {
    id: 1, title: '控制台', name: 'Console', path: '/console', icon: 'solar:home-2-bold-duotone',
    parentId: null, sort: 1, status: 'on', hidden: false, createdAt: '2025-01-01 00:00'
  },
  {
    id: 2, title: '商品管理', name: 'Product', path: '/product', icon: 'solar:cart-large-bold-duotone',
    parentId: null, sort: 2, status: 'on', hidden: false, createdAt: '2025-01-01 00:00',
    children: [
      { id: 21, title: '商品列表', name: 'ProductList', path: '/product/list', icon: 'solar:box-bold-duotone', parentId: 2, sort: 1, status: 'on', hidden: false },
      { id: 22, title: '商品分类', name: 'ProductCategory', path: '/product/category', icon: 'solar:folder-bold-duotone', parentId: 2, sort: 2, status: 'on', hidden: false },
      { id: 23, title: '标签', name: 'ProductTag', path: '/product/tag', icon: 'solar:tag-bold-duotone', parentId: 2, sort: 3, status: 'on', hidden: false },
      { id: 24, title: '规格', name: 'ProductSpec', path: '/product/spec', icon: 'solar:slider-vertical-bold-duotone', parentId: 2, sort: 4, status: 'on', hidden: false },
      { id: 25, title: '品牌', name: 'ProductBrand', path: '/product/brand', icon: 'solar:medal-ribbon-bold-duotone', parentId: 2, sort: 5, status: 'on', hidden: false },
      { id: 26, title: '商品评价', name: 'ProductReview', path: '/product/review', icon: 'solar:star-bold-duotone', parentId: 2, sort: 6, status: 'on', hidden: false }
    ]
  },
  {
    id: 3, title: '订单管理', name: 'Order', path: '/order', icon: 'solar:document-bold-duotone',
    parentId: null, sort: 3, status: 'on', hidden: false, createdAt: '2025-01-01 00:00',
    children: [
      { id: 31, title: '订单列表', name: 'OrderList', path: '/order/list', icon: 'solar:list-bold-duotone', parentId: 3, sort: 1, status: 'on', hidden: false },
      { id: 32, title: '售后/退款', name: 'OrderRefund', path: '/order/refund', icon: 'solar:refresh-circle-bold-duotone', parentId: 3, sort: 2, status: 'on', hidden: false },
      { id: 33, title: '发货管理', name: 'OrderShipping', path: '/order/shipping', icon: 'solar:delivery-bold-duotone', parentId: 3, sort: 3, status: 'on', hidden: false }
    ]
  },
  {
    id: 4, title: '会员管理', name: 'User', path: '/user', icon: 'solar:user-bold-duotone',
    parentId: null, sort: 4, status: 'on', hidden: false, createdAt: '2025-01-01 00:00',
    children: [
      { id: 41, title: '会员列表', name: 'UserList', path: '/user/list', icon: 'solar:users-group-rounded-bold-duotone', parentId: 4, sort: 1, status: 'on', hidden: false },
      { id: 42, title: '会员等级', name: 'UserLevel', path: '/user/level', icon: 'solar:ranking-bold-duotone', parentId: 4, sort: 2, status: 'on', hidden: false },
      { id: 43, title: '积分管理', name: 'UserPoints', path: '/user/points', icon: 'solar:gift-bold-duotone', parentId: 4, sort: 3, status: 'on', hidden: false }
    ]
  },
  {
    id: 5, title: '权限管理', name: 'Permission', path: '/permission', icon: 'solar:shield-keyhole-bold-duotone',
    parentId: null, sort: 5, status: 'on', hidden: false, createdAt: '2025-01-01 00:00',
    children: [
      { id: 51, title: '角色管理', name: 'PermissionRole', path: '/permission/role', icon: 'solar:users-group-rounded-bold-duotone', parentId: 5, sort: 1, status: 'on', hidden: false },
      { id: 52, title: '菜单权限', name: 'PermissionMenu', path: '/permission/menu', icon: 'solar:menu-dots-bold-duotone', parentId: 5, sort: 2, status: 'on', hidden: false },
      { id: 53, title: '接口权限', name: 'PermissionApi', path: '/permission/api', icon: 'solar:code-square-bold-duotone', parentId: 5, sort: 3, status: 'on', hidden: false },
      { id: 54, title: '操作日志', name: 'PermissionLog', path: '/permission/log', icon: 'solar:history-bold-duotone', parentId: 5, sort: 4, status: 'on', hidden: false }
    ]
  }
])

const iconOptions = [
  { label: '控制台', value: 'solar:home-2-bold-duotone' },
  { label: '商品', value: 'solar:cart-large-bold-duotone' },
  { label: '订单', value: 'solar:document-bold-duotone' },
  { label: '会员', value: 'solar:user-bold-duotone' },
  { label: '权限', value: 'solar:shield-keyhole-bold-duotone' },
  { label: '菜单', value: 'solar:menu-dots-bold-duotone' },
  { label: '设置', value: 'solar:settings-bold-duotone' },
  { label: '图表', value: 'solar:chart-bold-duotone' }
]

// 统计
const totalCount = computed(() => {
  let count = 0
  function walk(nodes: MenuNode[]): void {
    nodes.forEach(n => {
      count++
      if (n.children) walk(n.children)
    })
  }
  walk(treeData.value)
  return count
})

// ---------- 当前节点 ----------
const currentNode = ref<MenuNode | null>(null)

// ---------- 表单 ----------
const formRef = ref<FormInstance>()
const formMode = ref<FormMode>('view')
const saving = ref(false)

const defaultForm = (): MenuForm => ({
  id: null,
  parentId: null,
  title: '',
  name: '',
  path: '',
  icon: 'solar:menu-dots-bold-duotone',
  sort: 0,
  status: 'on',
  hidden: false
})

const form = reactive<MenuForm>(defaultForm())

const rules: FormRules<MenuForm> = {
  title: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  path: [{ required: true, message: '请输入访问路径', trigger: 'blur' }]
}

const parentOptions = ref<MenuNode[]>([])

function buildParentOptions(): void {
  function clone(nodes: MenuNode[]): MenuNode[] {
    return nodes
      .filter(n => n.id !== form.id)
      .map(n => ({
        ...n,
        children: n.children ? clone(n.children) : undefined
      }))
  }
  parentOptions.value = clone(treeData.value)
}

// ---------- 搜索 ----------
watch(filterText, val => {
  treeRef.value?.filter(val)
})

function filterNode(value: string, data: MenuNode): boolean {
  if (!value) return true
  return data.title.includes(value)
}

// ---------- 树操作 ----------
function handleNodeClick(data: MenuNode): void {
  currentNode.value = data
  formMode.value = 'view'
}

// ---------- 查找 ----------
function findNode(nodes: MenuNode[], id: number): MenuNode | null {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children) {
      const r = findNode(n.children, id)
      if (r) return r
    }
  }
  return null
}

function findParentList(nodes: MenuNode[], id: number): MenuNode[] | null {
  for (const n of nodes) {
    if (n.id === id) return nodes
    if (n.children) {
      const r = findParentList(n.children, id)
      if (r) return r
    }
  }
  return null
}

// ---------- 打开表单 ----------
function openCreate(parent: MenuNode | null): void {
  formMode.value = 'create'
  Object.assign(form, defaultForm())
  form.parentId = parent ? parent.id : null
  buildParentOptions()
  nextTick(() => formRef.value?.clearValidate())
}

function openEdit(data: MenuNode): void {
  formMode.value = 'edit'
  Object.assign(form, {
    id: data.id,
    parentId: data.parentId,
    title: data.title,
    name: data.name,
    path: data.path,
    icon: data.icon,
    sort: data.sort,
    status: data.status,
    hidden: data.hidden
  })
  buildParentOptions()
  nextTick(() => formRef.value?.clearValidate())
}

function cancelForm(): void {
  if (formMode.value === 'create') {
    formMode.value = currentNode.value ? 'view' : 'view'
    if (!currentNode.value) Object.assign(form, defaultForm())
  } else if (formMode.value === 'edit' && form.id) {
    const found = findNode(treeData.value, form.id)
    if (found) {
      currentNode.value = found
      formMode.value = 'view'
    }
  }
}

// ---------- 保存 ----------
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
    const newNode: MenuNode = {
      id: Date.now(),
      title: form.title,
      name: form.name,
      path: form.path,
      icon: form.icon,
      parentId: form.parentId,
      sort: form.sort,
      status: form.status,
      hidden: form.hidden,
      createdAt: new Date().toLocaleString('zh-CN'),
      children: []
    }
    if (form.parentId) {
      const parent = findNode(treeData.value, form.parentId)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(newNode)
      }
    } else {
      treeData.value.push(newNode)
    }
    ElMessage.success('菜单已新增')
    currentNode.value = newNode
    formMode.value = 'view'
  } else if (formMode.value === 'edit' && form.id) {
    const node = findNode(treeData.value, form.id)
    if (node) {
      if (node.parentId !== form.parentId) {
        const oldList = findParentList(treeData.value, node.id)
        if (oldList) {
          const idx = oldList.findIndex(n => n.id === node.id)
          if (idx > -1) oldList.splice(idx, 1)
        }
        node.parentId = form.parentId
        if (form.parentId) {
          const parent = findNode(treeData.value, form.parentId)
          if (parent) {
            parent.children = parent.children || []
            parent.children.push(node)
          }
        } else {
          treeData.value.push(node)
        }
      }
      node.title = form.title
      node.name = form.name
      node.path = form.path
      node.icon = form.icon
      node.sort = form.sort
      node.status = form.status
      node.hidden = form.hidden
      currentNode.value = node
    }
    ElMessage.success('菜单已更新')
    formMode.value = 'view'
  }
}

// ---------- 删除 ----------
function handleDelete(data: MenuNode): void {
  if (data.children && data.children.length) {
    ElMessageBox.alert('该菜单下存在子菜单，请先删除子菜单', '提示', { type: 'warning' })
    return
  }
  const list = findParentList(treeData.value, data.id)
  if (list) {
    const idx = list.findIndex(n => n.id === data.id)
    if (idx > -1) list.splice(idx, 1)
  }
  if (currentNode.value?.id === data.id) {
    currentNode.value = null
    formMode.value = 'view'
  }
  ElMessage.success('删除成功')
}

onMounted(() => {
  buildParentOptions()
  if (treeData.value.length) {
    currentNode.value = treeData.value[0]
    nextTick(() => treeRef.value?.setCurrentKey(treeData.value[0].id))
  }
})
</script>

<style lang="scss" scoped>
.menu-page {
  .tree-search {
    margin-bottom: 12px;
  }

  .tree-wrap {
    max-height: 620px;
    overflow-y: auto;
  }

  .menu-tree {
    :deep(.el-tree-node__content) {
      height: 38px;
      border-radius: 8px;
      padding-right: 6px;

      &:hover {
        background: #f5f9ff;
      }
    }

    :deep(.el-tree-node.is-current > .el-tree-node__content) {
      background: #e8f3ff;
      color: #409eff;
    }
  }

  .tree-node {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    .tree-label {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #5a6472;
    }

    .tree-icon {
      color: #409eff;
    }

    .tree-tag {
      margin-left: 4px;
    }

    .tree-actions {
      display: none;
      align-items: center;
      gap: 2px;
    }

    &:hover .tree-actions {
      display: inline-flex;
    }
  }

  // 详情
  .detail-overview {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px;
    background: #f7f9fc;
    border-radius: 12px;
    margin-bottom: 16px;

    .detail-cover {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #409eff;
      background: linear-gradient(135deg, #e8f3ff, #d3e6ff);
      flex-shrink: 0;
    }

    .detail-info {
      flex: 1;
      min-width: 0;
    }

    .detail-name {
      margin: 0 0 4px;
      font-size: 16px;
      font-weight: 600;
      color: #1f2d3d;
    }

    .detail-path {
      margin: 0;
      font-size: 12px;
      color: #8a94a6;
      font-family: monospace;
    }
  }

  .detail-desc {
    :deep(.el-descriptions__label) {
      width: 100px;
      color: #8a94a6;
      background: #f8fafd;
    }
  }

  .child-section {
    margin-top: 20px;

    .child-title {
      font-size: 14px;
      font-weight: 600;
      color: #1f2d3d;
      margin-bottom: 10px;
    }

    .child-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 10px;
    }

    .child-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      border: 1px solid #eef1f6;
      border-radius: 10px;
      font-size: 13px;
      color: #5a6472;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        border-color: #409eff;
        background: #f5f9ff;
        color: #409eff;
      }

      .child-icon {
        color: #409eff;
      }

      .child-arrow {
        margin-left: auto;
        color: #8a94a6;
      }
    }
  }

  // 表单
  .menu-form {
    max-width: 620px;
  }

  .icon-picker {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
  }

  .icon-preview {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #409eff;
    background: linear-gradient(135deg, #e8f3ff, #d3e6ff);
    flex-shrink: 0;
  }

  .icon-option {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .form-tip {
    margin-left: 8px;
    font-size: 12px;
    color: #8a94a6;
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }
}

@media (max-width: 768px) {
  .tree-wrap {
    max-height: none;
  }

  .child-list {
    grid-template-columns: 1fr;
  }
}
</style>