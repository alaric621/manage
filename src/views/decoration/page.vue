<template>
  <div class="list-page decoration-page-page">
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
        <ElFormItem label="页面名称">
          <ElInput
            v-model="query.keyword"
            placeholder="页面名称"
            clearable
            style="width: 220px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <Icon icon="solar:magnifer-bold-duotone" width="16" />
            </template>
          </ElInput>
        </ElFormItem>
        <ElFormItem label="页面类型">
          <ElSelect v-model="query.type" placeholder="全部类型" clearable style="width: 150px">
            <ElOption label="首页" value="home" />
            <ElOption label="自定义页" value="custom" />
            <ElOption label="活动页" value="activity" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="状态">
          <ElSelect v-model="query.status" placeholder="全部状态" clearable style="width: 140px">
            <ElOption label="已发布" value="published" />
            <ElOption label="草稿" value="draft" />
            <ElOption label="已下线" value="offline" />
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
            页面列表
            <span class="title-sub">共 {{ total }} 个页面</span>
          </div>
          <div class="panel-actions">
            <ElButton type="primary" size="small" @click="openCreate">
              <Icon icon="solar:add-circle-bold-duotone" class="btn-icon" />新增页面
            </ElButton>
          </div>
        </div>
      </template>

      <!-- 状态标签页 -->
      <ElTabs v-model="activeTab" class="status-tabs" @tab-change="handleTabChange">
        <ElTabPane label="全部" name="all" />
        <ElTabPane label="已发布" name="published" />
        <ElTabPane label="草稿" name="draft" />
        <ElTabPane label="已下线" name="offline" />
      </ElTabs>

      <ElTable v-loading="loading" :data="list" class="pretty-table" row-key="id">
        <ElTableColumn label="页面" min-width="240">
          <template #default="{ row }">
            <div class="page-cell">
              <div class="page-thumb" :style="{ background: row.thumb }">
                <Icon :icon="row.icon" width="20" />
              </div>
              <div class="page-meta">
                <div class="page-name">{{ row.name }}</div>
                <div class="page-path">{{ row.path }}</div>
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="页面类型" width="120">
          <template #default="{ row }">
            <ElTag size="small" effect="light" round>{{ row.typeText }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="模块数" width="90" align="center">
          <template #default="{ row }">{{ row.moduleCount }}</template>
        </ElTableColumn>
        <ElTableColumn label="访问量" width="100" align="right">
          <template #default="{ row }">{{ row.views }}</template>
        </ElTableColumn>
        <ElTableColumn label="状态" width="100">
          <template #default="{ row }">
            <span class="status-dot" :style="{ color: row.statusColor, background: row.statusBg }">
              <i class="dot"></i>{{ row.statusText }}
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="updatedAt" label="更新时间" width="170" />
        <ElTableColumn label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <ElButton link type="primary" size="small" @click="openEdit(row)">编辑</ElButton>
            <ElButton link type="primary" size="small" @click="handlePreview(row)">预览</ElButton>
            <ElButton
              v-if="row.status !== 'published'"
              link
              type="success"
              size="small"
              @click="handlePublish(row)"
            >
              发布
            </ElButton>
            <ElButton
              v-else
              link
              type="warning"
              size="small"
              @click="handleOffline(row)"
            >
              下线
            </ElButton>
            <ElPopconfirm title="确定删除该页面？" @confirm="handleDelete(row)">
              <template #reference>
                <ElButton link type="danger" size="small" :disabled="row.type === 'home'">
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
      :title="formMode === 'create' ? '新增页面' : '编辑页面'"
      width="520px"
      destroy-on-close
    >
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="90px">
        <ElFormItem label="页面名称" prop="name">
          <ElInput v-model="form.name" placeholder="如：双十一活动页" maxlength="30" show-word-limit />
        </ElFormItem>
        <ElFormItem label="页面类型" prop="type">
          <ElSelect v-model="form.type" style="width: 100%">
            <ElOption label="首页" value="home" />
            <ElOption label="自定义页" value="custom" />
            <ElOption label="活动页" value="activity" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="访问路径" prop="path">
          <ElInput v-model="form.path" placeholder="如：/pages/activity/1111" />
        </ElFormItem>
        <ElFormItem label="页面描述">
          <ElInput v-model="form.desc" type="textarea" :rows="3" maxlength="120" show-word-limit placeholder="页面用途说明" />
        </ElFormItem>
        <ElFormItem label="状态">
          <ElRadioGroup v-model="form.status">
            <ElRadio value="draft">草稿</ElRadio>
            <ElRadio value="published">发布</ElRadio>
            <ElRadio value="offline">下线</ElRadio>
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
type PageType = 'home' | 'custom' | 'activity'
type PageStatus = 'published' | 'draft' | 'offline'
type TabName = 'all' | PageStatus
type FormMode = 'create' | 'edit'

interface PageRow {
  id: number
  name: string
  path: string
  type: PageType
  icon: string
  thumb: string
  moduleCount: number
  views: number
  status: PageStatus
  updatedAt: string
  desc: string
}

interface PageView extends PageRow {
  typeText: string
  statusText: string
  statusColor: string
  statusBg: string
}

interface PageForm {
  id: number | null
  name: string
  path: string
  type: PageType
  status: PageStatus
  desc: string
}

interface QueryState {
  keyword: string
  type: '' | PageType
  status: '' | PageStatus
}

// ---------- 概览 ----------
const stats = computed(() => {
  const total = mockData.length
  const published = mockData.filter(d => d.status === 'published').length
  const draft = mockData.filter(d => d.status === 'draft').length
  const views = mockData.reduce((s, d) => s + d.views, 0)
  return [
    { label: '页面总数', value: total, icon: 'solar:documents-bold-duotone', color: '#409eff', bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
    { label: '已发布', value: published, icon: 'solar:check-circle-bold-duotone', color: '#52b788', bg: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' },
    { label: '草稿', value: draft, icon: 'solar:document-add-bold-duotone', color: '#e6a23c', bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)' },
    { label: '总访问量', value: views, icon: 'solar:eye-bold-duotone', color: '#9254de', bg: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)' }
  ]
})

// ---------- 查询 ----------
const query = reactive<QueryState>({ keyword: '', type: '', status: '' })

const activeTab = ref<TabName>('all')
function handleTabChange(name: string | number): void {
  const tab = String(name) as TabName
  query.status = tab === 'all' ? '' : (tab as PageStatus)
  page.current = 1
  fetchList()
}

// ---------- 列表 ----------
const loading = ref(false)
const list = ref<PageView[]>([])
const total = ref(0)
const page = reactive({ current: 1, size: 10 })

const mockData: PageRow[] = [
  { id: 1, name: '商城首页', path: '/pages/index', type: 'home', icon: 'solar:home-2-bold-duotone', thumb: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)', moduleCount: 12, views: 128600, status: 'published', updatedAt: '2026-10-30 09:12', desc: '商城默认首页' },
  { id: 2, name: '双十一活动页', path: '/pages/activity/1111', type: 'activity', icon: 'solar:gift-bold-duotone', thumb: 'linear-gradient(135deg, #fff4e6, #ffe4c4)', moduleCount: 8, views: 48600, status: 'published', updatedAt: '2026-10-29 18:40', desc: '双十一大促活动页' },
  { id: 3, name: '新品推荐页', path: '/pages/custom/new', type: 'custom', icon: 'solar:star-bold-duotone', thumb: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)', moduleCount: 6, views: 8600, status: 'draft', updatedAt: '2026-10-28 14:20', desc: '新品推荐专题' },
  { id: 4, name: '会员中心页', path: '/pages/custom/member', type: 'custom', icon: 'solar:user-bold-duotone', thumb: 'linear-gradient(135deg, #e6f7ee, #cdf0de)', moduleCount: 10, views: 32600, status: 'published', updatedAt: '2026-10-27 10:00', desc: '会员中心' },
  { id: 5, name: '春节活动页（旧）', path: '/pages/activity/spring', type: 'activity', icon: 'solar:gift-bold-duotone', thumb: 'linear-gradient(135deg, #ffeaea, #ffd6d6)', moduleCount: 8, views: 1200, status: 'offline', updatedAt: '2026-02-20 09:00', desc: '春节活动页已下线' }
]

const typeMap: Record<PageType, string> = {
  home: '首页',
  custom: '自定义页',
  activity: '活动页'
}

const statusMap: Record<PageStatus, { text: string; color: string; bg: string }> = {
  published: { text: '已发布', color: '#52b788', bg: 'rgba(82,183,136,0.12)' },
  draft: { text: '草稿', color: '#e6a23c', bg: 'rgba(230,162,60,0.12)' },
  offline: { text: '已下线', color: '#909399', bg: 'rgba(144,147,153,0.12)' }
}

function decorate(rows: PageRow[]): PageView[] {
  return rows.map(r => {
    const s = statusMap[r.status]
    return {
      ...r,
      typeText: typeMap[r.type],
      statusText: s.text,
      statusColor: s.color,
      statusBg: s.bg
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

const defaultForm = (): PageForm => ({
  id: null,
  name: '',
  path: '',
  type: 'custom',
  status: 'draft',
  desc: ''
})

const form = reactive<PageForm>(defaultForm())

const rules: FormRules<PageForm> = {
  name: [{ required: true, message: '请输入页面名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择页面类型', trigger: 'change' }],
  path: [{ required: true, message: '请输入访问路径', trigger: 'blur' }]
}

function openCreate(): void {
  formMode.value = 'create'
  Object.assign(form, defaultForm())
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

function openEdit(row: PageView): void {
  formMode.value = 'edit'
  Object.assign(form, {
    id: row.id,
    name: row.name,
    path: row.path,
    type: row.type,
    status: row.status,
    desc: row.desc
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
    const newRow: PageRow = {
      id: Date.now(),
      name: form.name,
      path: form.path,
      type: form.type,
      icon: 'solar:documents-bold-duotone',
      thumb: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)',
      moduleCount: 0,
      views: 0,
      status: form.status,
      updatedAt: new Date().toLocaleString('zh-CN'),
      desc: form.desc
    }
    mockData.unshift(newRow)
    ElMessage.success('页面已新增')
  } else if (form.id) {
    const idx = mockData.findIndex(d => d.id === form.id)
    if (idx > -1) {
      mockData[idx] = {
        ...mockData[idx],
        name: form.name,
        path: form.path,
        type: form.type,
        status: form.status,
        desc: form.desc,
        updatedAt: new Date().toLocaleString('zh-CN')
      }
    }
    ElMessage.success('页面已更新')
  }

  dialogVisible.value = false
  fetchList()
}

function handlePublish(row: PageView): void {
  const target = mockData.find(d => d.id === row.id)
  if (target) target.status = 'published'
  const s = statusMap.published
  row.status = 'published'
  row.statusText = s.text
  row.statusColor = s.color
  row.statusBg = s.bg
  ElMessage.success('页面已发布')
}

function handleOffline(row: PageView): void {
  if (row.type === 'home') {
    ElMessage.warning('首页不可下线')
    return
  }
  const target = mockData.find(d => d.id === row.id)
  if (target) target.status = 'offline'
  const s = statusMap.offline
  row.status = 'offline'
  row.statusText = s.text
  row.statusColor = s.color
  row.statusBg = s.bg
  ElMessage.success('页面已下线')
}

function handlePreview(row: PageView): void {
  ElMessageBox.alert(`预览页面：${row.name}<br/>路径：${row.path}`, '页面预览', {
    dangerouslyUseHTMLString: true,
    confirmButtonText: '关闭'
  })
}

function handleDelete(row: PageView): void {
  if (row.type === 'home') {
    ElMessage.warning('首页不可删除')
    return
  }
  const idx = mockData.findIndex(d => d.id === row.id)
  if (idx > -1) mockData.splice(idx, 1)
  ElMessage.success('删除成功')
  fetchList()
}

onMounted(fetchList)
</script>

<style lang="scss" scoped>
.decoration-page-page {
  .page-cell {
    display: flex;
    align-items: center;
    gap: 12px;

    .page-thumb {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #409eff;
      flex-shrink: 0;
    }

    .page-name {
      font-size: 13px;
      font-weight: 500;
      color: #1f2d3d;
    }

    .page-path {
      margin-top: 2px;
      font-size: 12px;
      color: #8a94a6;
      font-family: monospace;
    }
  }
}
</style>