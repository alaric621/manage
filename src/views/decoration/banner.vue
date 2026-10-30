<template>
  <div class="list-page banner-page">
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
        <ElFormItem label="广告名称">
          <ElInput
            v-model="query.keyword"
            placeholder="广告/轮播图名称"
            clearable
            style="width: 220px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <Icon icon="solar:magnifer-bold-duotone" width="16" />
            </template>
          </ElInput>
        </ElFormItem>
        <ElFormItem label="展示位置">
          <ElSelect v-model="query.position" placeholder="全部位置" clearable style="width: 150px">
            <ElOption label="首页轮播" value="home-carousel" />
            <ElOption label="分类页广告" value="category" />
            <ElOption label="商品详情页" value="product" />
            <ElOption label="活动页" value="activity" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="状态">
          <ElSelect v-model="query.status" placeholder="全部状态" clearable style="width: 140px">
            <ElOption label="已上线" value="online" />
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
            轮播图 / 广告
            <span class="title-sub">共 {{ total }} 个</span>
          </div>
          <div class="panel-actions">
            <ElButton type="primary" size="small" @click="openCreate">
              <Icon icon="solar:add-circle-bold-duotone" class="btn-icon" />新增广告
            </ElButton>
          </div>
        </div>
      </template>

      <ElTable v-loading="loading" :data="list" class="pretty-table" row-key="id">
        <ElTableColumn label="预览" width="140">
          <template #default="{ row }">
            <div class="banner-thumb" :style="{ background: row.thumb }">
              <Icon :icon="row.icon" width="26" />
              <span class="thumb-label">{{ row.sizeText }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="广告名称" min-width="200">
          <template #default="{ row }">
            <div class="banner-meta">
              <div class="banner-name">{{ row.name }}</div>
              <div class="banner-sub">{{ row.desc || '暂无描述' }}</div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="展示位置" width="140">
          <template #default="{ row }">
            <ElTag size="small" effect="light" round>{{ row.positionText }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="跳转链接" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="link-text">{{ row.link || '--' }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="排序" width="80" align="center">
          <template #default="{ row }">{{ row.sort }}</template>
        </ElTableColumn>
        <ElTableColumn label="曝光/点击" width="140" align="center">
          <template #default="{ row }">
            <div class="stat-cell">
              <span>{{ row.views }}</span>
              <span class="stat-divider">/</span>
              <span>{{ row.clicks }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="点击率" width="90" align="center">
          <template #default="{ row }">
            <span class="rate-text">{{ row.ctr }}%</span>
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
              :type="row.status === 'online' ? 'warning' : 'success'"
              size="small"
              @click="toggleStatus(row)"
            >
              {{ row.status === 'online' ? '下线' : '上线' }}
            </ElButton>
            <ElPopconfirm title="确定删除该广告？" @confirm="handleDelete(row)">
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
      :title="formMode === 'create' ? '新增轮播图/广告' : '编辑轮播图/广告'"
      width="600px"
      destroy-on-close
    >
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px">
        <ElFormItem label="广告名称" prop="name">
          <ElInput v-model="form.name" placeholder="如：首页双十一轮播" maxlength="30" show-word-limit />
        </ElFormItem>
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="展示位置" prop="position">
              <ElSelect v-model="form.position" style="width: 100%">
                <ElOption label="首页轮播" value="home-carousel" />
                <ElOption label="分类页广告" value="category" />
                <ElOption label="商品详情页" value="product" />
                <ElOption label="活动页" value="activity" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="排序">
              <ElInputNumber v-model="form.sort" :min="0" :max="9999" controls-position="right" style="width: 100%" />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElFormItem label="图片上传">
          <div class="upload-wrap">
            <div class="upload-preview" :style="{ background: form.thumb }">
              <Icon :icon="form.icon" width="32" />
            </div>
            <div class="upload-actions">
              <ElUpload
                :show-file-list="false"
                :before-upload="beforeUpload"
                :http-request="handleUpload"
                accept="image/png,image/jpeg,image/webp"
              >
                <ElButton size="small">
                  <Icon icon="solar:upload-bold-duotone" class="btn-icon" />
                  {{ form.icon ? '更换图片' : '上传图片' }}
                </ElButton>
              </ElUpload>
              <span class="upload-tip">建议尺寸 {{ form.sizeText || '750×360px' }}，支持 PNG/JPG/WebP</span>
            </div>
          </div>
        </ElFormItem>
        <ElFormItem label="跳转链接">
          <ElInput v-model="form.link" placeholder="如：/pages/activity/1111" />
        </ElFormItem>
        <ElFormItem label="展示时间">
          <ElDatePicker
            v-model="form.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 100%"
          />
        </ElFormItem>
        <ElFormItem label="状态">
          <ElRadioGroup v-model="form.status">
            <ElRadio value="online">上线</ElRadio>
            <ElRadio value="offline">下线</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem label="广告描述">
          <ElInput v-model="form.desc" type="textarea" :rows="3" maxlength="120" show-word-limit placeholder="广告用途说明" />
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
import type { FormInstance, FormRules, UploadRequestOptions } from 'element-plus'
import { Icon } from '@iconify/vue'

// ---------- 类型 ----------
type BannerPosition = 'home-carousel' | 'category' | 'product' | 'activity'
type BannerStatus = 'online' | 'offline'
type FormMode = 'create' | 'edit'

interface BannerRow {
  id: number
  name: string
  position: BannerPosition
  icon: string
  thumb: string
  sizeText: string
  link: string
  sort: number
  views: number
  clicks: number
  status: BannerStatus
  desc: string
  startAt: string
  endAt: string
}

interface BannerView extends BannerRow {
  positionText: string
  ctr: number
  statusText: string
  statusColor: string
  statusBg: string
}

interface BannerForm {
  id: number | null
  name: string
  position: BannerPosition
  icon: string
  thumb: string
  sizeText: string
  link: string
  sort: number
  status: BannerStatus
  desc: string
  dateRange: [string, string] | null
}

interface QueryState {
  keyword: string
  position: '' | BannerPosition
  status: '' | BannerStatus
}

// ---------- 概览 ----------
const stats = computed(() => {
  const total = mockData.length
  const online = mockData.filter(d => d.status === 'online').length
  const views = mockData.reduce((s, d) => s + d.views, 0)
  const clicks = mockData.reduce((s, d) => s + d.clicks, 0)
  const ctr = views ? ((clicks / views) * 100).toFixed(2) : '0.00'
  return [
    { label: '广告总数', value: total, icon: 'solar:gallery-wide-bold-duotone', color: '#409eff', bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
    { label: '已上线', value: online, icon: 'solar:check-circle-bold-duotone', color: '#52b788', bg: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' },
    { label: '总曝光量', value: views, icon: 'solar:eye-bold-duotone', color: '#e6a23c', bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)' },
    { label: '平均点击率', value: `${ctr}%`, icon: 'solar:cursor-bold-duotone', color: '#9254de', bg: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)' }
  ]
})

// ---------- 查询 ----------
const query = reactive<QueryState>({ keyword: '', position: '', status: '' })

// ---------- 列表 ----------
const loading = ref(false)
const list = ref<BannerView[]>([])
const total = ref(0)
const page = reactive({ current: 1, size: 10 })

const mockData: BannerRow[] = [
  { id: 1, name: '首页双十一轮播', position: 'home-carousel', icon: 'solar:gift-bold-duotone', thumb: 'linear-gradient(135deg, #ffeaea, #ffd6d6)', sizeText: '750×360', link: '/pages/activity/1111', sort: 1, views: 128600, clicks: 12860, status: 'online', desc: '双十一主会场入口', startAt: '2026-10-20 00:00', endAt: '2026-11-12 00:00' },
  { id: 2, name: '首页新品推荐', position: 'home-carousel', icon: 'solar:star-bold-duotone', thumb: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)', sizeText: '750×360', link: '/pages/custom/new', sort: 2, views: 86500, clicks: 4320, status: 'online', desc: '新品推荐轮播', startAt: '2026-10-01 00:00', endAt: '2026-12-31 00:00' },
  { id: 3, name: '分类页顶部广告', position: 'category', icon: 'solar:gallery-wide-bold-duotone', thumb: 'linear-gradient(135deg, #e6f7ee, #cdf0de)', sizeText: '750×180', link: '/pages/category/digital', sort: 1, views: 32600, clicks: 1860, status: 'online', desc: '数码分类顶部广告', startAt: '2026-10-01 00:00', endAt: '2026-12-31 00:00' },
  { id: 4, name: '商品详情推荐位', position: 'product', icon: 'solar:box-bold-duotone', thumb: 'linear-gradient(135deg, #fff4e6, #ffe4c4)', sizeText: '750×200', link: '/pages/product/123', sort: 1, views: 65200, clicks: 3260, status: 'offline', desc: '详情页推荐广告', startAt: '2026-09-01 00:00', endAt: '2026-09-30 00:00' },
  { id: 5, name: '活动页横幅', position: 'activity', icon: 'solar:flag-bold-duotone', thumb: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)', sizeText: '750×300', link: '/pages/activity/1212', sort: 1, views: 15200, clicks: 920, status: 'online', desc: '双十二活动横幅', startAt: '2026-12-01 00:00', endAt: '2026-12-12 00:00' }
]

const positionMap: Record<BannerPosition, string> = {
  'home-carousel': '首页轮播',
  category: '分类页广告',
  product: '商品详情页',
  activity: '活动页'
}

const statusMap: Record<BannerStatus, { text: string; color: string; bg: string }> = {
  online: { text: '已上线', color: '#52b788', bg: 'rgba(82,183,136,0.12)' },
  offline: { text: '已下线', color: '#909399', bg: 'rgba(144,147,153,0.12)' }
}

function decorate(rows: BannerRow[]): BannerView[] {
  return rows.map(r => {
    const s = statusMap[r.status]
    return {
      ...r,
      positionText: positionMap[r.position],
      ctr: r.views ? Number(((r.clicks / r.views) * 100).toFixed(2)) : 0,
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
    if (query.position) {
      data = data.filter(d => d.position === query.position)
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
  query.position = ''
  query.status = ''
  page.current = 1
  fetchList()
}

// ---------- 弹窗 ----------
const dialogVisible = ref(false)
const formMode = ref<FormMode>('create')
const saving = ref(false)
const formRef = ref<FormInstance>()

const defaultForm = (): BannerForm => ({
  id: null,
  name: '',
  position: 'home-carousel',
  icon: '',
  thumb: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)',
  sizeText: '750×360',
  link: '',
  sort: 0,
  status: 'online',
  desc: '',
  dateRange: null
})

const form = reactive<BannerForm>(defaultForm())

const rules: FormRules<BannerForm> = {
  name: [{ required: true, message: '请输入广告名称', trigger: 'blur' }],
  position: [{ required: true, message: '请选择展示位置', trigger: 'change' }]
}

// 图片上传
function beforeUpload(file: File): boolean {
  const isImage = ['image/png', 'image/jpeg', 'image/webp'].includes(file.type)
  if (!isImage) {
    ElMessage.error('仅支持 PNG / JPG / WebP 格式')
    return false
  }
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB')
    return false
  }
  return true
}

function handleUpload(options: UploadRequestOptions): void {
  // TODO: 替换为真实上传接口
  const reader = new FileReader()
  reader.onload = e => {
    form.thumb = `url(${String(e.target?.result)}) center/cover no-repeat`
    form.icon = ''
    ElMessage.success('图片已上传')
  }
  reader.readAsDataURL(options.file)
}

function openCreate(): void {
  formMode.value = 'create'
  Object.assign(form, defaultForm())
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

function openEdit(row: BannerView): void {
  formMode.value = 'edit'
  Object.assign(form, {
    id: row.id,
    name: row.name,
    position: row.position,
    icon: row.icon,
    thumb: row.thumb,
    sizeText: row.sizeText,
    link: row.link,
    sort: row.sort,
    status: row.status,
    desc: row.desc,
    dateRange: [row.startAt, row.endAt]
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

  const dateRange = form.dateRange || ['', '']

  if (formMode.value === 'create') {
    const newRow: BannerRow = {
      id: Date.now(),
      name: form.name,
      position: form.position,
      icon: form.icon || 'solar:gallery-wide-bold-duotone',
      thumb: form.thumb,
      sizeText: form.sizeText,
      link: form.link,
      sort: form.sort,
      views: 0,
      clicks: 0,
      status: form.status,
      desc: form.desc,
      startAt: dateRange[0] || '',
      endAt: dateRange[1] || ''
    }
    mockData.unshift(newRow)
    ElMessage.success('广告已新增')
  } else if (form.id) {
    const idx = mockData.findIndex(d => d.id === form.id)
    if (idx > -1) {
      mockData[idx] = {
        ...mockData[idx],
        name: form.name,
        position: form.position,
        icon: form.icon || 'solar:gallery-wide-bold-duotone',
        thumb: form.thumb,
        sizeText: form.sizeText,
        link: form.link,
        sort: form.sort,
        status: form.status,
        desc: form.desc,
        startAt: dateRange[0] || '',
        endAt: dateRange[1] || ''
      }
    }
    ElMessage.success('广告已更新')
  }

  dialogVisible.value = false
  fetchList()
}

function toggleStatus(row: BannerView): void {
  const next: BannerStatus = row.status === 'online' ? 'offline' : 'online'
  const target = mockData.find(d => d.id === row.id)
  if (target) target.status = next
  const s = statusMap[next]
  row.status = next
  row.statusText = s.text
  row.statusColor = s.color
  row.statusBg = s.bg
  ElMessage.success(`广告已${next === 'online' ? '上线' : '下线'}`)
}

function handleDelete(row: BannerView): void {
  const idx = mockData.findIndex(d => d.id === row.id)
  if (idx > -1) mockData.splice(idx, 1)
  ElMessage.success('删除成功')
  fetchList()
}

onMounted(fetchList)
</script>

<style lang="scss" scoped>
.banner-page {
  .banner-thumb {
    position: relative;
    width: 120px;
    height: 60px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #409eff;
    overflow: hidden;

    .thumb-label {
      position: absolute;
      right: 4px;
      bottom: 4px;
      padding: 0 6px;
      font-size: 11px;
      color: #fff;
      background: rgba(31, 45, 61, 0.6);
      border-radius: 4px;
    }
  }

  .banner-name {
    font-size: 13px;
    font-weight: 500;
    color: #1f2d3d;
  }

  .banner-sub {
    margin-top: 2px;
    font-size: 12px;
    color: #8a94a6;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .link-text {
    font-size: 12px;
    color: #409eff;
    font-family: monospace;
  }

  .stat-cell {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-size: 12px;

    .stat-divider {
      color: #c0c4cc;
    }
  }

  .rate-text {
    font-weight: 600;
    color: #52b788;
  }

  // 上传
  .upload-wrap {
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
  }

  .upload-preview {
    width: 140px;
    height: 70px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #409eff;
    border: 1px solid #eef1f6;
    flex-shrink: 0;
    background-size: cover !important;
  }

  .upload-actions {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .upload-tip {
      font-size: 12px;
      color: #8a94a6;
    }
  }
}
</style>