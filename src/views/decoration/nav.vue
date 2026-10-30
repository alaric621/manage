<template>
  <div class="list-page nav-page">
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
      <!-- 左侧：导航列表 -->
      <ElCol :xs="24" :md="9">
        <ElCard class="panel-card" shadow="never">
          <template #header>
            <div class="panel-header">
              <div class="panel-title">
                <span class="title-dot"></span>
                导航菜单
                <span class="title-sub">{{ navList.length }} 个</span>
              </div>
              <ElButton type="primary" size="small" @click="openCreate(null)">
                <Icon icon="solar:add-circle-bold-duotone" class="btn-icon" />新增
              </ElButton>
            </div>
          </template>

          <ElInput v-model="filterText" placeholder="搜索导航名称" clearable class="nav-search">
            <template #prefix>
              <Icon icon="solar:magnifer-bold-duotone" width="16" />
            </template>
          </ElInput>

          <div class="nav-list">
            <div
              v-for="nav in filteredNavs"
              :key="nav.id"
              class="nav-item"
              :class="{ active: currentNav?.id === nav.id }"
              @click="selectNav(nav)"
            >
              <div class="nav-left">
                <div class="nav-icon" :style="{ background: nav.bg, color: nav.color }">
                  <Icon :icon="nav.icon" width="18" />
                </div>
                <div class="nav-meta">
                  <div class="nav-name">{{ nav.name }}</div>
                  <div class="nav-sub">
                    {{ nav.children.length }} 个子菜单 · {{ nav.positionText }}
                  </div>
                </div>
              </div>
              <div class="nav-right">
                <ElTag :type="nav.status === 'on' ? 'success' : 'info'" size="small" effect="light" round>
                  {{ nav.status === 'on' ? '显示' : '隐藏' }}
                </ElTag>
              </div>
            </div>

            <ElEmpty v-if="!filteredNavs.length" description="暂无导航菜单" :image-size="60" />
          </div>
        </ElCard>
      </ElCol>

      <!-- 右侧：子菜单管理 -->
      <ElCol :xs="24" :md="15">
        <ElCard class="panel-card" shadow="never">
          <template #header>
            <div class="panel-header">
              <div class="panel-title">
                <span class="title-dot"></span>
                {{ currentNav ? `${currentNav.name} · 子菜单` : '子菜单管理' }}
                <span v-if="currentNav" class="title-sub">{{ currentNav.children.length }} 个</span>
              </div>
              <div v-if="currentNav" class="header-actions">
                <ElButton size="small" @click="openEdit(currentNav)">
                  <Icon icon="solar:pen-bold-duotone" class="btn-icon" />编辑导航
                </ElButton>
                <ElButton type="primary" size="small" @click="openChildDialog('create')">
                  <Icon icon="solar:add-circle-bold-duotone" class="btn-icon" />添加子菜单
                </ElButton>
              </div>
            </div>
          </template>

          <ElEmpty v-if="!currentNav" description="请从左侧选择一个导航菜单" :image-size="80" />

          <template v-else>
            <!-- 导航信息 -->
            <div class="nav-info">
              <div class="info-item">
                <span class="info-label">展示位置</span>
                <span class="info-value">{{ currentNav.positionText }}</span>
              </div>
              <div class="info-divider"></div>
              <div class="info-item">
                <span class="info-label">状态</span>
                <ElTag :type="currentNav.status === 'on' ? 'success' : 'info'" size="small" effect="light" round>
                  {{ currentNav.status === 'on' ? '显示' : '隐藏' }}
                </ElTag>
              </div>
              <div class="info-divider"></div>
              <div class="info-item">
                <span class="info-label">排序</span>
                <span class="info-value">{{ currentNav.sort }}</span>
              </div>
            </div>

            <!-- 子菜单列表 -->
            <div v-if="!currentNav.children.length" class="empty-children">
              <Icon icon="solar:info-circle-bold-duotone" width="18" />
              该导航还没有子菜单，点击「添加子菜单」开始配置
            </div>

            <ElTable
              v-else
              :data="currentNav.children"
              size="small"
              class="pretty-table"
              row-key="id"
            >
              <ElTableColumn label="排序" width="70" align="center">
                <template #default="{ $index }">
                  <span class="sort-index">{{ $index + 1 }}</span>
                </template>
              </ElTableColumn>
              <ElTableColumn label="子菜单" min-width="180">
                <template #default="{ row }">
                  <div class="child-cell">
                    <div class="child-icon" :style="{ background: row.bg, color: row.color }">
                      <Icon :icon="row.icon" width="16" />
                    </div>
                    <span class="child-name">{{ row.name }}</span>
                  </div>
                </template>
              </ElTableColumn>
              <ElTableColumn label="跳转链接" min-width="180" show-overflow-tooltip>
                <template #default="{ row }">
                  <span class="link-text">{{ row.link || '--' }}</span>
                </template>
              </ElTableColumn>
              <ElTableColumn label="状态" width="90">
                <template #default="{ row }">
                  <ElSwitch
                    v-model="row.status"
                    :active-value="'on'"
                    :inactive-value="'off'"
                    size="small"
                    @change="handleChildStatusChange(row)"
                  />
                </template>
              </ElTableColumn>
              <ElTableColumn label="操作" width="140" fixed="right">
                <template #default="{ row, $index }">
                  <ElButton link type="primary" size="small" @click="openChildDialog('edit', row, $index)">
                    编辑
                  </ElButton>
                  <ElPopconfirm title="确定删除该子菜单？" @confirm="handleDeleteChild($index)">
                    <template #reference>
                      <ElButton link type="danger" size="small">删除</ElButton>
                    </template>
                  </ElPopconfirm>
                </template>
              </ElTableColumn>
            </ElTable>
          </template>
        </ElCard>
      </ElCol>
    </ElRow>

    <!-- 导航弹窗 -->
    <ElDialog
      v-model="navDialogVisible"
      :title="navFormMode === 'create' ? '新增导航菜单' : '编辑导航菜单'"
      width="520px"
      destroy-on-close
    >
      <ElForm ref="navFormRef" :model="navForm" :rules="navRules" label-width="100px">
        <ElFormItem label="导航名称" prop="name">
          <ElInput v-model="navForm.name" placeholder="如：首页、分类、购物车" maxlength="20" show-word-limit />
        </ElFormItem>
        <ElFormItem label="导航图标">
          <ElSelect v-model="navForm.icon" placeholder="选择图标" style="width: 100%">
            <ElOption v-for="ic in iconOptions" :key="ic.value" :label="ic.label" :value="ic.value">
              <div class="icon-option">
                <Icon :icon="ic.value" width="18" />
                <span>{{ ic.label }}</span>
              </div>
            </ElOption>
          </ElSelect>
        </ElFormItem>
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="主题色">
              <ElColorPicker v-model="navForm.color" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="排序">
              <ElInputNumber v-model="navForm.sort" :min="0" :max="9999" controls-position="right" style="width: 100%" />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElFormItem label="展示位置" prop="position">
          <ElSelect v-model="navForm.position" style="width: 100%">
            <ElOption label="底部导航" value="bottom" />
            <ElOption label="首页顶部" value="home-top" />
            <ElOption label="个人中心" value="profile" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="状态">
          <ElRadioGroup v-model="navForm.status">
            <ElRadio value="on">显示</ElRadio>
            <ElRadio value="off">隐藏</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="navDialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="saving" @click="handleSaveNav">保存</ElButton>
      </template>
    </ElDialog>

    <!-- 子菜单弹窗 -->
    <ElDialog
      v-model="childDialogVisible"
      :title="childFormMode === 'create' ? '添加子菜单' : '编辑子菜单'"
      width="520px"
      destroy-on-close
    >
      <ElForm ref="childFormRef" :model="childForm" :rules="childRules" label-width="100px">
        <ElFormItem label="子菜单名称" prop="name">
          <ElInput v-model="childForm.name" placeholder="如：数码、服饰、美妆" maxlength="20" show-word-limit />
        </ElFormItem>
        <ElFormItem label="图标">
          <ElSelect v-model="childForm.icon" placeholder="选择图标" style="width: 100%">
            <ElOption v-for="ic in childIconOptions" :key="ic.value" :label="ic.label" :value="ic.value">
              <div class="icon-option">
                <Icon :icon="ic.value" width="18" />
                <span>{{ ic.label }}</span>
              </div>
            </ElOption>
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="跳转链接" prop="link">
          <ElInput v-model="childForm.link" placeholder="如：/pages/category/digital" />
        </ElFormItem>
        <ElFormItem label="状态">
          <ElRadioGroup v-model="childForm.status">
            <ElRadio value="on">显示</ElRadio>
            <ElRadio value="off">隐藏</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="childDialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="saving" @click="handleSaveChild">保存</ElButton>
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
type NavPosition = 'bottom' | 'home-top' | 'profile'
type DialogMode = 'create' | 'edit'

interface NavChild {
  id: number
  name: string
  icon: string
  color: string
  bg: string
  link: string
  status: ItemStatus
}

interface NavItem {
  id: number
  name: string
  icon: string
  color: string
  bg: string
  position: NavPosition
  sort: number
  status: ItemStatus
  children: NavChild[]
}

interface NavForm {
  id: number | null
  name: string
  icon: string
  color: string
  position: NavPosition
  sort: number
  status: ItemStatus
}

interface ChildForm {
  id: number | null
  name: string
  icon: string
  link: string
  status: ItemStatus
}

// ---------- 图标 ----------
const iconOptions = [
  { label: '首页', value: 'solar:home-2-bold-duotone' },
  { label: '分类', value: 'solar:widget-bold-duotone' },
  { label: '购物车', value: 'solar:cart-large-bold-duotone' },
  { label: '我的', value: 'solar:user-bold-duotone' },
  { label: '搜索', value: 'solar:magnifer-bold-duotone' }
]

const childIconOptions = [
  { label: '数码', value: 'solar:laptop-bold-duotone' },
  { label: '服饰', value: 'solar:t-shirt-bold-duotone' },
  { label: '美妆', value: 'solar:magic-stick-3-bold-duotone' },
  { label: '食品', value: 'solar:gift-bold-duotone' },
  { label: '家居', value: 'solar:home-smile-bold-duotone' },
  { label: '母婴', value: 'solar:hearts-bold-duotone' }
]

// ---------- 导航数据 ----------
const navList = ref<NavItem[]>([
  {
    id: 1, name: '首页', icon: 'solar:home-2-bold-duotone', color: '#409eff', bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)',
    position: 'bottom', sort: 1, status: 'on',
    children: []
  },
  {
    id: 2, name: '分类', icon: 'solar:widget-bold-duotone', color: '#52b788', bg: 'linear-gradient(135deg, #e6f7ee, #cdf0de)',
    position: 'bottom', sort: 2, status: 'on',
    children: [
      { id: 21, name: '数码', icon: 'solar:laptop-bold-duotone', color: '#409eff', bg: '#e8f3ff', link: '/pages/category/digital', status: 'on' },
      { id: 22, name: '服饰', icon: 'solar:t-shirt-bold-duotone', color: '#52b788', bg: '#e6f7ee', link: '/pages/category/clothes', status: 'on' },
      { id: 23, name: '美妆', icon: 'solar:magic-stick-3-bold-duotone', color: '#e6a23c', bg: '#fff4e6', link: '/pages/category/beauty', status: 'on' }
    ]
  },
  {
    id: 3, name: '购物车', icon: 'solar:cart-large-bold-duotone', color: '#e6a23c', bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)',
    position: 'bottom', sort: 3, status: 'on',
    children: []
  },
  {
    id: 4, name: '我的', icon: 'solar:user-bold-duotone', color: '#9254de', bg: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)',
    position: 'bottom', sort: 4, status: 'on',
    children: [
      { id: 41, name: '订单', icon: 'solar:document-bold-duotone', color: '#409eff', bg: '#e8f3ff', link: '/pages/user/order', status: 'on' },
      { id: 42, name: '收藏', icon: 'solar:star-bold-duotone', color: '#e6a23c', bg: '#fff4e6', link: '/pages/user/favorite', status: 'on' },
      { id: 43, name: '设置', icon: 'solar:settings-bold-duotone', color: '#8a94a6', bg: '#f5f7fa', link: '/pages/user/settings', status: 'on' }
    ]
  }
])

const positionMap: Record<NavPosition, string> = {
  bottom: '底部导航',
  'home-top': '首页顶部',
  profile: '个人中心'
}

// ---------- 概览 ----------
const stats = computed(() => {
  const total = navList.value.length
  const children = navList.value.reduce((s, n) => s + n.children.length, 0)
  const visible = navList.value.filter(n => n.status === 'on').length
  const positions = new Set(navList.value.map(n => n.position)).size
  return [
    { label: '导航总数', value: total, icon: 'solar:menu-dots-bold-duotone', color: '#409eff', bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
    { label: '子菜单数', value: children, icon: 'solar:list-bold-duotone', color: '#52b788', bg: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' },
    { label: '显示中', value: visible, icon: 'solar:check-circle-bold-duotone', color: '#e6a23c', bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)' },
    { label: '展示位置', value: positions, icon: 'solar:widget-bold-duotone', color: '#9254de', bg: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)' }
  ]
})

// ---------- 选中 ----------
const currentNav = ref<NavItem | null>(navList.value[0] ?? null)

function selectNav(nav: NavItem): void {
  currentNav.value = nav
}

// ---------- 搜索 ----------
const filterText = ref('')
const filteredNavs = computed(() =>
  navList.value.filter(n => !filterText.value || n.name.includes(filterText.value))
)

// 子菜单展示的派生数据
function getNavPositionText(nav: NavItem): string {
  return positionMap[nav.position]
}

// 给导航补充 positionText 用于模板（直接计算）
const filteredNavsWithText = computed(() =>
  filteredNavs.value.map(n => ({ ...n, positionText: getNavPositionText(n) }))
)

// ---------- 导航弹窗 ----------
const navDialogVisible = ref(false)
const navFormMode = ref<DialogMode>('create')
const navFormRef = ref<FormInstance>()
const saving = ref(false)

const defaultNavForm = (): NavForm => ({
  id: null,
  name: '',
  icon: 'solar:home-2-bold-duotone',
  color: '#409eff',
  position: 'bottom',
  sort: 0,
  status: 'on'
})

const navForm = reactive<NavForm>(defaultNavForm())

const navRules: FormRules<NavForm> = {
  name: [{ required: true, message: '请输入导航名称', trigger: 'blur' }],
  position: [{ required: true, message: '请选择展示位置', trigger: 'change' }]
}

function openCreate(_parent: NavItem | null): void {
  navFormMode.value = 'create'
  Object.assign(navForm, defaultNavForm())
  navDialogVisible.value = true
  nextTick(() => navFormRef.value?.clearValidate())
}

function openEdit(nav: NavItem): void {
  navFormMode.value = 'edit'
  Object.assign(navForm, {
    id: nav.id,
    name: nav.name,
    icon: nav.icon,
    color: nav.color,
    position: nav.position,
    sort: nav.sort,
    status: nav.status
  })
  navDialogVisible.value = true
  nextTick(() => navFormRef.value?.clearValidate())
}

async function handleSaveNav(): Promise<void> {
  if (!navFormRef.value) return
  try {
    await navFormRef.value.validate()
  } catch {
    return
  }
  saving.value = true
  await new Promise(r => setTimeout(r, 300))
  saving.value = false

  const bg = `linear-gradient(135deg, ${navForm.color}1a, ${navForm.color}33)`

  if (navFormMode.value === 'create') {
    const newNav: NavItem = {
      id: Date.now(),
      name: navForm.name,
      icon: navForm.icon,
      color: navForm.color,
      bg,
      position: navForm.position,
      sort: navForm.sort,
      status: navForm.status,
      children: []
    }
    navList.value.push(newNav)
    currentNav.value = newNav
    ElMessage.success('导航已新增')
  } else if (navForm.id) {
    const target = navList.value.find(n => n.id === navForm.id)
    if (target) {
      target.name = navForm.name
      target.icon = navForm.icon
      target.color = navForm.color
      target.bg = bg
      target.position = navForm.position
      target.sort = navForm.sort
      target.status = navForm.status
      if (currentNav.value?.id === target.id) currentNav.value = target
    }
    ElMessage.success('导航已更新')
  }

  navDialogVisible.value = false
}

// ---------- 子菜单弹窗 ----------
const childDialogVisible = ref(false)
const childFormMode = ref<DialogMode>('create')
const editingChildIndex = ref(-1)
const childFormRef = ref<FormInstance>()

const defaultChildForm = (): ChildForm => ({
  id: null,
  name: '',
  icon: 'solar:widget-bold-duotone',
  link: '',
  status: 'on'
})

const childForm = reactive<ChildForm>(defaultChildForm())

const childRules: FormRules<ChildForm> = {
  name: [{ required: true, message: '请输入子菜单名称', trigger: 'blur' }],
  link: [{ required: true, message: '请输入跳转链接', trigger: 'blur' }]
}

function openChildDialog(mode: DialogMode, child?: NavChild, index?: number): void {
  childFormMode.value = mode
  editingChildIndex.value = index ?? -1
  if (mode === 'create') {
    Object.assign(childForm, defaultChildForm())
  } else if (child) {
    Object.assign(childForm, {
      id: child.id,
      name: child.name,
      icon: child.icon,
      link: child.link,
      status: child.status
    })
  }
  childDialogVisible.value = true
  nextTick(() => childFormRef.value?.clearValidate())
}

async function handleSaveChild(): Promise<void> {
  if (!childFormRef.value || !currentNav.value) return
  try {
    await childFormRef.value.validate()
  } catch {
    return
  }
  saving.value = true
  await new Promise(r => setTimeout(r, 300))
  saving.value = false

  if (childFormMode.value === 'create') {
    const newChild: NavChild = {
      id: Date.now(),
      name: childForm.name,
      icon: childForm.icon,
      color: '#409eff',
      bg: '#e8f3ff',
      link: childForm.link,
      status: childForm.status
    }
    currentNav.value.children.push(newChild)
    ElMessage.success('子菜单已添加')
  } else if (editingChildIndex.value > -1) {
    const child = currentNav.value.children[editingChildIndex.value]
    if (child) {
      child.name = childForm.name
      child.icon = childForm.icon
      child.link = childForm.link
      child.status = childForm.status
    }
    ElMessage.success('子菜单已更新')
  }

  childDialogVisible.value = false
}

function handleDeleteChild(index: number): void {
  if (!currentNav.value) return
  currentNav.value.children.splice(index, 1)
  ElMessage.success('删除成功')
}

function handleChildStatusChange(child: NavChild): void {
  ElMessage.success(`子菜单已${child.status === 'on' ? '显示' : '隐藏'}`)
}

// ---------- 删除导航（暂未在操作列，预留） ----------
function handleDeleteNav(nav: NavItem): void {
  if (nav.children.length) {
    ElMessageBox.alert('请先删除该导航下的子菜单', '提示', { type: 'warning' })
    return
  }
  const idx = navList.value.findIndex(n => n.id === nav.id)
  if (idx > -1) navList.value.splice(idx, 1)
  if (currentNav.value?.id === nav.id) {
    currentNav.value = navList.value[0] ?? null
  }
  ElMessage.success('删除成功')
}

onMounted(() => {
  if (!currentNav.value && navList.value.length) {
    currentNav.value = navList.value[0]
  }
})
</script>

<style lang="scss" scoped>
.nav-page {
  .nav-search {
    margin-bottom: 12px;
  }

  .nav-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 620px;
    overflow-y: auto;
  }

  .nav-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    border-radius: 12px;
    border: 1px solid transparent;
    background: #f7f9fc;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #f5f9ff;
      border-color: #dbe7fa;
    }

    &.active {
      background: #e8f3ff;
      border-color: #bcd9ff;
    }

    .nav-left {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }

    .nav-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .nav-name {
      font-size: 13px;
      font-weight: 600;
      color: #1f2d3d;
    }

    .nav-sub {
      margin-top: 2px;
      font-size: 12px;
      color: #8a94a6;
    }
  }

  // 导航信息
  .nav-info {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px 16px;
    background: #f7f9fc;
    border-radius: 12px;
    margin-bottom: 16px;

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .info-label {
      font-size: 12px;
      color: #8a94a6;
    }

    .info-value {
      font-size: 13px;
      font-weight: 600;
      color: #1f2d3d;
    }

    .info-divider {
      width: 1px;
      height: 18px;
      background: #eef1f6;
    }
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }

  // 子菜单
  .child-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .child-icon {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .child-name {
      font-size: 13px;
      color: #1f2d3d;
    }
  }

  .link-text {
    font-size: 12px;
    color: #409eff;
    font-family: monospace;
  }

  .sort-index {
    display: inline-block;
    width: 22px;
    height: 22px;
    line-height: 22px;
    text-align: center;
    border-radius: 6px;
    background: #f0f5ff;
    color: #409eff;
    font-size: 12px;
    font-weight: 600;
  }

  .empty-children {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 24px;
    font-size: 13px;
    color: #8a94a6;
    background: #f7f9fc;
    border-radius: 12px;
  }

  .icon-option {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
</style>