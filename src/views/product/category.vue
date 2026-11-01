<template>
  <div class="category-page">
    <ElRow :gutter="16">
      <!-- 左侧：分类树 -->
      <ElCol :xs="24" :md="9">
        <ElCard class="panel-card" shadow="never">
          <template #header>
            <div class="panel-header">
              <div class="panel-title">
                <span class="title-dot"></span>
                商品分类
                <span class="title-sub">{{ totalCount }} 个</span>
              </div>
              <ElButton type="primary" size="small" @click="openCreate(null)">
                <Icon icon="solar:add-circle-bold-duotone" class="btn-icon" />新增分类
              </ElButton>
            </div>
          </template>

          <ElInput v-model="filterText" placeholder="搜索分类名称" clearable class="tree-search">
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
              draggable
              :allow-drop="allowDrop"
              :filter-node-method="filterNode"
              :expand-on-click-node="false"
              class="category-tree"
              @node-click="handleNodeClick"
              @node-drop="handleNodeDrop"
            >
              <template #default="{ data }">
                <div class="tree-node">
                  <span class="tree-label">
                    <span class="tree-icon-wrap">
                      <img v-if="data.iconUrl" :src="data.iconUrl" class="tree-icon-img" alt="" />
                      <Icon v-else :icon="data.icon || 'solar:folder-bold-duotone'" width="16" class="tree-icon" />
                    </span>
                    {{ data.name }}
                    <span v-if="data.children?.length" class="tree-count">{{ data.children.length }}</span>
                    <ElTag v-if="data.status === 'off'" size="small" type="info" effect="plain" round class="tree-tag">
                      禁用
                    </ElTag>
                  </span>
                  <span class="tree-actions">
                    <ElTooltip content="新增子分类" placement="top">
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
                      <ElPopconfirm title="确定删除该分类？" @confirm="handleDelete(data)">
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

            <ElEmpty v-if="!treeData.length" description="暂无分类，点击右上角新增" :image-size="80" />
          </div>

          <div class="tree-tip">
            <Icon icon="solar:info-circle-bold-duotone" width="14" />
            支持拖拽调整分类层级与排序
          </div>
        </ElCard>
      </ElCol>

      <!-- 右侧：分类详情/表单 -->
      <ElCol :xs="24" :md="15">
        <ElCard class="panel-card" shadow="never">
          <template #header>
            <div class="panel-header">
              <div class="panel-title">
                <span class="title-dot"></span>
                {{ formMode === 'create' ? '新增分类' : formMode === 'edit' ? '编辑分类' : '分类详情' }}
              </div>
              <div v-if="formMode === 'view' && currentNode" class="header-actions">
                <ElButton size="small" @click="openEdit(currentNode)">
                  <Icon icon="solar:pen-bold-duotone" class="btn-icon" />编辑
                </ElButton>
                <ElButton size="small" type="primary" plain @click="openCreate(currentNode)">
                  <Icon icon="solar:add-circle-bold-duotone" class="btn-icon" />添加子分类
                </ElButton>
              </div>
            </div>
          </template>

          <!-- 详情视图 -->
          <template v-if="formMode === 'view' && currentNode">
            <div class="detail-breadcrumb">
              <ElBreadcrumb separator="/">
                <ElBreadcrumbItem>商品分类</ElBreadcrumbItem>
                <ElBreadcrumbItem v-for="p in currentNodePath" :key="p.id">{{ p.name }}</ElBreadcrumbItem>
              </ElBreadcrumb>
            </div>

            <div class="detail-overview">
              <div class="detail-cover">
                <img v-if="currentNode.iconUrl" :src="currentNode.iconUrl" class="detail-cover-img" alt="" />
                <Icon v-else :icon="currentNode.icon || 'solar:folder-bold-duotone'" width="36" />
              </div>
              <div class="detail-info">
                <h3 class="detail-name">{{ currentNode.name }}</h3>
                <p class="detail-desc">{{ currentNode.desc || '暂无分类描述' }}</p>
              </div>
            </div>

            <ElDescriptions :column="2" border class="detail-desc">
              <ElDescriptionsItem label="分类 ID">{{ currentNode.id }}</ElDescriptionsItem>
              <ElDescriptionsItem label="排序">{{ currentNode.sort }}</ElDescriptionsItem>
              <ElDescriptionsItem label="状态">
                <ElTag :type="currentNode.status === 'on' ? 'success' : 'info'" size="small" effect="light">
                  {{ currentNode.status === 'on' ? '启用' : '禁用' }}
                </ElTag>
              </ElDescriptionsItem>
              <ElDescriptionsItem label="子分类数">{{ currentNode.children?.length || 0 }}</ElDescriptionsItem>
              <ElDescriptionsItem label="关联商品">{{ currentNode.productCount || 0 }}</ElDescriptionsItem>
              <ElDescriptionsItem label="创建时间">{{ currentNode.createdAt || '--' }}</ElDescriptionsItem>
            </ElDescriptions>

            <div v-if="currentNode.children?.length" class="child-section">
              <div class="child-title">子分类（{{ currentNode.children.length }}）</div>
              <div class="child-list">
                <div
                  v-for="child in currentNode.children"
                  :key="child.id"
                  class="child-item"
                  @click="handleNodeClick(child)"
                >
                  <span class="child-icon-wrap">
                    <img v-if="child.iconUrl" :src="child.iconUrl" class="child-icon-img" alt="" />
                    <Icon v-else :icon="child.icon || 'solar:folder-bold-duotone'" width="16" class="child-icon" />
                  </span>
                  <span>{{ child.name }}</span>
                  <Icon icon="solar:alt-arrow-right-bold-duotone" width="14" class="child-arrow" />
                </div>
              </div>
            </div>
          </template>

          <ElEmpty
            v-else-if="formMode === 'view'"
            description="请从左侧选择一个分类，或新增分类"
            :image-size="100"
          >
            <ElButton type="primary" @click="openCreate(null)">
              <Icon icon="solar:add-circle-bold-duotone" class="btn-icon" />新增分类
            </ElButton>
          </ElEmpty>

          <!-- 表单视图 -->
          <ElForm
            v-else
            ref="formRef"
            :model="form"
            :rules="rules"
            label-width="100px"
            class="category-form"
          >
            <ElFormItem label="上级分类">
              <ElTreeSelect
                v-model="form.parentId"
                :data="parentOptions"
                :props="{ label: 'name', value: 'id', children: 'children' }"
                check-strictly
                clearable
                placeholder="不选则为顶级分类"
                style="width: 100%"
              />
            </ElFormItem>
            <ElFormItem label="分类名称" prop="name">
              <ElInput v-model="form.name" placeholder="请输入分类名称" maxlength="30" show-word-limit />
            </ElFormItem>

            <!-- 分类图标：上传 + 内置图标 -->
            <ElFormItem label="分类图标">
              <div class="icon-editor">
                <div class="icon-preview" :class="{ 'has-image': !!form.iconUrl }">
                  <img v-if="form.iconUrl" :src="form.iconUrl" class="icon-preview-img" alt="" />
                  <Icon v-else :icon="form.icon || 'solar:folder-bold-duotone'" width="24" />
                </div>
                <div class="icon-editor-actions">
                  <ElUpload
                    :show-file-list="false"
                    :before-upload="beforeIconUpload"
                    :http-request="handleIconUpload"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  >
                    <ElButton size="small">
                      <Icon icon="solar:upload-bold-duotone" class="btn-icon" />
                      {{ form.iconUrl ? '更换图片' : '上传图标' }}
                    </ElButton>
                  </ElUpload>
                  <ElButton v-if="form.iconUrl" size="small" type="danger" plain @click="removeIconUrl">
                    <Icon icon="solar:trash-bin-trash-bold-duotone" class="btn-icon" />移除
                  </ElButton>
                  <span class="icon-tip">支持 PNG / JPG / SVG / WebP，建议 64×64px</span>
                </div>
              </div>
              <div class="icon-builtin">
                <span class="icon-builtin-label">或选择内置图标：</span>
                <div class="icon-builtin-list">
                  <div
                    v-for="ic in iconOptions"
                    :key="ic.value"
                    class="icon-builtin-item"
                    :class="{ active: !form.iconUrl && form.icon === ic.value }"
                    :title="ic.label"
                    @click="selectBuiltinIcon(ic.value)"
                  >
                    <Icon :icon="ic.value" width="18" />
                  </div>
                </div>
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
            <ElFormItem label="分类描述">
              <ElInput
                v-model="form.desc"
                type="textarea"
                :rows="3"
                maxlength="120"
                show-word-limit
                placeholder="简要描述该分类"
              />
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
import type { FormInstance, FormRules, UploadRequestOptions } from 'element-plus'
import type { ElTree } from 'element-plus'
import { Icon } from '@iconify/vue'

// ---------- 类型 ----------
type CategoryStatus = 'on' | 'off'
type FormMode = 'view' | 'create' | 'edit'

interface CategoryNode {
  id: number
  name: string
  parentId: number | null
  icon: string
  iconUrl: string
  sort: number
  status: CategoryStatus
  desc: string
  productCount?: number
  createdAt?: string
  children?: CategoryNode[]
}

interface CategoryForm {
  id: number | null
  parentId: number | null
  name: string
  icon: string
  iconUrl: string
  sort: number
  status: CategoryStatus
  desc: string
}

// ---------- 树配置 ----------
const treeRef = ref<InstanceType<typeof ElTree>>()
const filterText = ref('')
const treeProps = { children: 'children', label: 'name' }

const treeData = ref<CategoryNode[]>([
  {
    id: 1, name: '数码', parentId: null, icon: 'solar:laptop-bold-duotone', iconUrl: '', sort: 1, status: 'on', desc: '数码电子产品', productCount: 128, createdAt: '2026-09-01 10:00',
    children: [
      { id: 11, name: '音频设备', parentId: 1, icon: 'solar:headphones-round-sound-bold-duotone', iconUrl: '', sort: 1, status: 'on', desc: '耳机、音箱', productCount: 86, createdAt: '2026-09-01 10:10' },
      { id: 12, name: '智能穿戴', parentId: 1, icon: 'solar:watch-square-bold-duotone', iconUrl: '', sort: 2, status: 'on', desc: '手表、手环', productCount: 42, createdAt: '2026-09-01 10:20' }
    ]
  },
  {
    id: 2, name: '服饰', parentId: null, icon: 'solar:t-shirt-bold-duotone', iconUrl: '', sort: 2, status: 'on', desc: '服装鞋帽', productCount: 96, createdAt: '2026-09-02 11:00',
    children: [
      { id: 21, name: '外套', parentId: 2, icon: 'solar:bag-smile-bold-duotone', iconUrl: '', sort: 1, status: 'on', desc: '夹克、羽绒服', productCount: 52, createdAt: '2026-09-02 11:10' },
      { id: 22, name: '衬衫', parentId: 2, icon: 'solar:t-shirt-bold-duotone', iconUrl: '', sort: 2, status: 'off', desc: '长袖、短袖', productCount: 44, createdAt: '2026-09-02 11:20' }
    ]
  },
  {
    id: 3, name: '美妆', parentId: null, icon: 'solar:magic-stick-3-bold-duotone', iconUrl: '', sort: 3, status: 'on', desc: '护肤彩妆', productCount: 64, createdAt: '2026-09-03 09:00',
    children: [
      { id: 31, name: '护肤', parentId: 3, icon: 'solar:water-drops-bold-duotone', iconUrl: '', sort: 1, status: 'on', desc: '精华、面霜', productCount: 36, createdAt: '2026-09-03 09:10' },
      { id: 32, name: '彩妆', parentId: 3, icon: 'solar:palette-bold-duotone', iconUrl: '', sort: 2, status: 'on', desc: '口红、粉底', productCount: 28, createdAt: '2026-09-03 09:20' }
    ]
  },
  { id: 4, name: '食品', parentId: null, icon: 'solar:gift-bold-duotone', iconUrl: '', sort: 4, status: 'on', desc: '零食饮品', productCount: 56, createdAt: '2026-09-04 14:00' }
])

const iconOptions = [
  { label: '文件夹', value: 'solar:folder-bold-duotone' },
  { label: '数码', value: 'solar:laptop-bold-duotone' },
  { label: '耳机', value: 'solar:headphones-round-sound-bold-duotone' },
  { label: '手表', value: 'solar:watch-square-bold-duotone' },
  { label: '服饰', value: 'solar:t-shirt-bold-duotone' },
  { label: '美妆', value: 'solar:magic-stick-3-bold-duotone' },
  { label: '食品', value: 'solar:gift-bold-duotone' },
  { label: '护肤', value: 'solar:water-drops-bold-duotone' },
  { label: '彩妆', value: 'solar:palette-bold-duotone' },
  { label: '包', value: 'solar:bag-smile-bold-duotone' }
]

const totalCount = computed(() => {
  let count = 0
  function walk(nodes: CategoryNode[]): void {
    nodes.forEach(n => {
      count++
      if (n.children) walk(n.children)
    })
  }
  walk(treeData.value)
  return count
})

// ---------- 当前节点 ----------
const currentNode = ref<CategoryNode | null>(null)
const currentNodePath = computed<CategoryNode[]>(() => {
  if (!currentNode.value) return []
  const path: CategoryNode[] = []
  function walk(nodes: CategoryNode[], targetId: number, acc: CategoryNode[]): boolean {
    for (const n of nodes) {
      if (n.id === targetId) {
        path.push(...acc, n)
        return true
      }
      if (n.children && walk(n.children, targetId, [...acc, n])) return true
    }
    return false
  }
  walk(treeData.value, currentNode.value.id, [])
  return path
})

// ---------- 表单 ----------
const formRef = ref<FormInstance>()
const formMode = ref<FormMode>('view')
const saving = ref(false)

const defaultForm = (): CategoryForm => ({
  id: null,
  parentId: null,
  name: '',
  icon: 'solar:folder-bold-duotone',
  iconUrl: '',
  sort: 0,
  status: 'on',
  desc: ''
})

const form = reactive<CategoryForm>(defaultForm())

const rules: FormRules<CategoryForm> = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

const parentOptions = ref<CategoryNode[]>([])

function buildParentOptions(): void {
  function clone(nodes: CategoryNode[]): CategoryNode[] {
    return nodes
      .filter(n => n.id !== form.id)
      .map(n => ({
        ...n,
        children: n.children ? clone(n.children) : undefined
      }))
  }
  parentOptions.value = clone(treeData.value)
}

// ---------- 图标上传 ----------
function beforeIconUpload(file: File): boolean {
  const isImage = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'].includes(file.type)
  if (!isImage) {
    ElMessage.error('仅支持 PNG / JPG / SVG / WebP 格式')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('图标大小不能超过 2MB')
    return false
  }
  return true
}

async function handleIconUpload(options: UploadRequestOptions): Promise<void> {
  // TODO: 替换为真实上传接口
  // const res = await api.uploadFile(options.file)
  // form.iconUrl = res.url
  const reader = new FileReader()
  reader.onload = e => {
    form.iconUrl = String(e.target?.result || '')
    ElMessage.success('图标已上传')
  }
  reader.readAsDataURL(options.file)
}

function removeIconUrl(): void {
  form.iconUrl = ''
}

function selectBuiltinIcon(value: string): void {
  form.icon = value
  form.iconUrl = ''
}

// ---------- 搜索 ----------
watch(filterText, val => {
  treeRef.value?.filter(val)
})

function filterNode(value: string, data: CategoryNode): boolean {
  if (!value) return true
  return data.name.includes(value)
}

// ---------- 树操作 ----------
function handleNodeClick(data: CategoryNode): void {
  currentNode.value = data
  formMode.value = 'view'
}

function allowDrop(_dragging: unknown, dropNode: { data?: CategoryNode }, type: 'prev' | 'inner' | 'next'): boolean {
  return type !== 'inner' || !!dropNode.data
}

function handleNodeDrop(): void {
  ElMessage.success('分类层级已更新')
}

// ---------- 查找 ----------
function findNode(nodes: CategoryNode[], id: number): CategoryNode | null {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children) {
      const r = findNode(n.children, id)
      if (r) return r
    }
  }
  return null
}

function findParentList(nodes: CategoryNode[], id: number): CategoryNode[] | null {
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
function openCreate(parent: CategoryNode | null): void {
  formMode.value = 'create'
  Object.assign(form, defaultForm())
  form.parentId = parent ? parent.id : null
  buildParentOptions()
  nextTick(() => formRef.value?.clearValidate())
}

function openEdit(data: CategoryNode): void {
  formMode.value = 'edit'
  Object.assign(form, {
    id: data.id,
    parentId: data.parentId,
    name: data.name,
    icon: data.icon,
    iconUrl: data.iconUrl,
    sort: data.sort,
    status: data.status,
    desc: data.desc
  })
  buildParentOptions()
  nextTick(() => formRef.value?.clearValidate())
}

function cancelForm(): void {
  if (formMode.value === 'create') {
    formMode.value = 'view'
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
    const newNode: CategoryNode = {
      id: Date.now(),
      name: form.name,
      parentId: form.parentId,
      icon: form.icon,
      iconUrl: form.iconUrl,
      sort: form.sort,
      status: form.status,
      desc: form.desc,
      productCount: 0,
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
    ElMessage.success('分类已新增')
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
      node.name = form.name
      node.icon = form.icon
      node.iconUrl = form.iconUrl
      node.sort = form.sort
      node.status = form.status
      node.desc = form.desc
      currentNode.value = node
    }
    ElMessage.success('分类已更新')
    formMode.value = 'view'
  }
}

// ---------- 删除 ----------
function handleDelete(data: CategoryNode): void {
  if (data.children && data.children.length) {
    ElMessageBox.alert('该分类下存在子分类，请先删除子分类', '提示', { type: 'warning' })
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

@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-page {
  padding: $gap;
  // background: $bg-soft;
  min-height: 100%;
  box-sizing: border-box;
}

.panel-card {
  // border-radius: $radius-card;
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

.header-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  margin-right: 4px;
  vertical-align: middle;
}

// ---------- 树 ----------
.tree-search {
  margin-bottom: 12px;
}

.tree-wrap {
  max-height: 620px;
  overflow-y: auto;
}

.category-tree {
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
    color: $primary;
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
    color: $text-regular;
  }

  .tree-icon-wrap {
    display: inline-flex;
    width: 18px;
    height: 18px;
    align-items: center;
    justify-content: center;
  }

  .tree-icon {
    color: $primary;
  }

  .tree-icon-img {
    width: 18px;
    height: 18px;
    object-fit: contain;
    border-radius: 4px;
  }

  .tree-count {
    display: inline-block;
    padding: 0 6px;
    font-size: 11px;
    color: $text-secondary;
    background: #f0f5ff;
    border-radius: 999px;
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

.tree-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding: 8px 12px;
  font-size: 12px;
  color: $text-secondary;
  background: $bg-soft;
  border-radius: 8px;
}

// ---------- 详情 ----------
.detail-breadcrumb {
  margin-bottom: 16px;
}

.detail-overview {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: $bg-soft;
  border-radius: $radius-block;
  margin-bottom: 16px;

  .detail-cover {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    @include flex-center;
    color: $primary;
    background: linear-gradient(135deg, #e8f3ff, #d3e6ff);
    flex-shrink: 0;
    overflow: hidden;
  }

  .detail-cover-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .detail-name {
    margin: 0 0 4px;
    font-size: 18px;
    font-weight: 600;
    color: $text-main;
  }

  .detail-desc {
    margin: 0;
    font-size: 13px;
    color: $text-secondary;
  }
}

.detail-desc {
  :deep(.el-descriptions__label) {
    width: 100px;
    color: $text-secondary;
    background: #f8fafd;
  }

  :deep(.el-descriptions__content) {
    color: $text-regular;
  }
}

.child-section {
  margin-top: 20px;

  .child-title {
    font-size: 14px;
    font-weight: 600;
    color: $text-main;
    margin-bottom: 10px;
  }

  .child-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
  }

  .child-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border: 1px solid $border-light;
    border-radius: $radius-block;
    font-size: 13px;
    color: $text-regular;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: $primary;
      background: #f5f9ff;
      color: $primary;
    }

    .child-icon-wrap {
      display: inline-flex;
      width: 18px;
      height: 18px;
      align-items: center;
      justify-content: center;
    }

    .child-icon {
      color: $primary;
    }

    .child-icon-img {
      width: 18px;
      height: 18px;
      object-fit: contain;
      border-radius: 4px;
    }

    .child-arrow {
      margin-left: auto;
      color: $text-secondary;
    }
  }
}

// ---------- 表单 ----------
.category-form {
  max-width: 620px;
}

// 图标编辑器
.icon-editor {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-preview {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  @include flex-center;
  color: $primary;
  background: linear-gradient(135deg, #e8f3ff, #d3e6ff);
  border: 1px solid $border-light;
  flex-shrink: 0;
  overflow: hidden;

  &.has-image {
    background: #fff;
  }
}

.icon-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.icon-editor-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;

  .icon-tip {
    font-size: 12px;
    color: $text-secondary;
    flex-basis: 100%;
  }
}

.icon-builtin {
  margin-top: 12px;
  padding: 10px 12px;
  background: $bg-soft;
  border-radius: $radius-block;

  .icon-builtin-label {
    display: block;
    font-size: 12px;
    color: $text-secondary;
    margin-bottom: 8px;
  }

  .icon-builtin-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .icon-builtin-item {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    @include flex-center;
    color: $text-regular;
    background: #fff;
    border: 1px solid $border-light;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      color: $primary;
      border-color: $primary;
    }

    &.active {
      color: $primary;
      border-color: $primary;
      background: #e8f3ff;
    }
  }
}

// ---------- 响应式 ----------
@media (max-width: 768px) {
  .category-page {
    padding: 12px;
  }

  .tree-wrap {
    max-height: none;
  }

  .child-list {
    grid-template-columns: 1fr;
  }

  .icon-editor {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>