<template>
  <div class="list-page log-page">
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
        <ElFormItem label="操作人">
          <ElInput
            v-model="query.keyword"
            placeholder="操作人/模块/内容"
            clearable
            style="width: 220px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <Icon icon="solar:magnifer-bold-duotone" width="16" />
            </template>
          </ElInput>
        </ElFormItem>
        <ElFormItem label="操作模块">
          <ElSelect v-model="query.module" placeholder="全部模块" clearable style="width: 150px">
            <ElOption v-for="m in moduleOptions" :key="m.value" :label="m.label" :value="m.value" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="操作结果">
          <ElSelect v-model="query.result" placeholder="全部结果" clearable style="width: 140px">
            <ElOption label="成功" value="success" />
            <ElOption label="失败" value="fail" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="操作时间">
          <ElDatePicker
            v-model="query.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 340px"
          />
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
            操作日志
            <span class="title-sub">共 {{ total }} 条</span>
          </div>
          <div class="panel-actions">
            <ElButton type="primary" size="small" @click="handleExport">
              <Icon icon="solar:download-bold-duotone" class="btn-icon" />导出
            </ElButton>
          </div>
        </div>
      </template>

      <!-- 结果标签页 -->
      <ElTabs v-model="activeTab" class="status-tabs" @tab-change="handleTabChange">
        <ElTabPane label="全部" name="all" />
        <ElTabPane label="成功" name="success" />
        <ElTabPane label="失败" name="fail" />
      </ElTabs>

      <ElTable v-loading="loading" :data="list" class="pretty-table" row-key="id">
        <ElTableColumn label="操作人" width="160">
          <template #default="{ row }">
            <div class="operator-cell">
              <div class="operator-avatar" :style="{ background: row.avatarBg }">
                {{ row.operator.charAt(0) }}
              </div>
              <div class="operator-meta">
                <div class="operator-name">{{ row.operator }}</div>
                <div class="operator-ip">{{ row.ip }}</div>
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作模块" width="110">
          <template #default="{ row }">
            <ElTag size="small" effect="light" round>{{ row.moduleText }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作动作" width="120">
          <template #default="{ row }">
            <span class="action-text">{{ row.action }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作内容" min-width="260" show-overflow-tooltip>
          <template #default="{ row }">{{ row.content }}</template>
        </ElTableColumn>
        <ElTableColumn label="请求方法" width="90">
          <template #default="{ row }">
            <span class="method-text" :class="row.method.toLowerCase()">{{ row.method }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="结果" width="90">
          <template #default="{ row }">
            <span class="status-dot" :style="{ color: row.resultColor, background: row.resultBg }">
              <i class="dot"></i>{{ row.resultText }}
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="耗时" width="80" align="right">
          <template #default="{ row }">
            <span class="duration" :class="{ slow: row.duration > 500 }">{{ row.duration }}ms</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createdAt" label="操作时间" width="170" />
        <ElTableColumn label="操作" width="90" fixed="right">
          <template #default="{ row }">
            <ElButton link type="primary" size="small" @click="openDetail(row)">详情</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>

    <!-- 日志详情抽屉 -->
    <ElDrawer v-model="drawerVisible" title="日志详情" size="520px">
      <template v-if="currentLog">
        <div class="log-summary">
          <div class="summary-row">
            <span class="summary-label">操作人</span>
            <span class="summary-value">{{ currentLog.operator }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">IP 地址</span>
            <span class="summary-value">{{ currentLog.ip }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">操作时间</span>
            <span class="summary-value">{{ currentLog.createdAt }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">操作结果</span>
            <span class="status-dot" :style="{ color: currentLog.resultColor, background: currentLog.resultBg }">
              <i class="dot"></i>{{ currentLog.resultText }}
            </span>
          </div>
        </div>

        <div class="section-title">请求信息</div>
        <ElDescriptions :column="1" border class="drawer-desc">
          <ElDescriptionsItem label="模块">{{ currentLog.moduleText }}</ElDescriptionsItem>
          <ElDescriptionsItem label="动作">{{ currentLog.action }}</ElDescriptionsItem>
          <ElDescriptionsItem label="请求方法">{{ currentLog.method }}</ElDescriptionsItem>
          <ElDescriptionsItem label="接口路径">{{ currentLog.path }}</ElDescriptionsItem>
          <ElDescriptionsItem label="耗时">{{ currentLog.duration }}ms</ElDescriptionsItem>
        </ElDescriptions>

        <div class="section-title">操作内容</div>
        <div class="log-content">{{ currentLog.content }}</div>

        <div class="section-title">请求参数</div>
        <pre class="log-json">{{ currentLog.params }}</pre>

        <div v-if="currentLog.result === 'fail'" class="section-title">错误信息</div>
        <div v-if="currentLog.result === 'fail'" class="log-error">{{ currentLog.error }}</div>
      </template>
    </ElDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Icon } from '@iconify/vue'

// ---------- 类型 ----------
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
type LogResult = 'success' | 'fail'
type TabName = 'all' | LogResult

interface LogRow {
  id: number
  operator: string
  avatarBg: string
  ip: string
  module: string
  action: string
  content: string
  method: HttpMethod
  path: string
  result: LogResult
  duration: number
  createdAt: string
  params: string
  error: string
}

interface LogView extends LogRow {
  moduleText: string
  resultText: string
  resultColor: string
  resultBg: string
}

interface QueryState {
  keyword: string
  module: string
  result: '' | LogResult
  dateRange: [string, string] | null
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
  const success = mockData.filter(d => d.result === 'success').length
  const fail = mockData.filter(d => d.result === 'fail').length
  const avgDuration = mockData.length
    ? Math.round(mockData.reduce((s, d) => s + d.duration, 0) / mockData.length)
    : 0
  return [
    { label: '日志总数', value: total, icon: 'solar:history-bold-duotone', color: '#409eff', bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
    { label: '成功操作', value: success, icon: 'solar:check-circle-bold-duotone', color: '#52b788', bg: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' },
    { label: '失败操作', value: fail, icon: 'solar:close-circle-bold-duotone', color: '#f56c6c', bg: 'linear-gradient(135deg, #ffeaea, #ffd6d6)' },
    { label: '平均耗时', value: `${avgDuration}ms`, icon: 'solar:clock-circle-bold-duotone', color: '#e6a23c', bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)' }
  ]
})

// ---------- 查询 ----------
const query = reactive<QueryState>({
  keyword: '',
  module: '',
  result: '',
  dateRange: null
})

const activeTab = ref<TabName>('all')
function handleTabChange(name: string | number): void {
  const tab = String(name) as TabName
  query.result = tab === 'all' ? '' : (tab as LogResult)
  page.current = 1
  fetchList()
}

// ---------- 列表 ----------
const loading = ref(false)
const list = ref<LogView[]>([])
const total = ref(0)
const page = reactive({ current: 1, size: 10 })

const mockData: LogRow[] = [
  { id: 1, operator: '张三', avatarBg: '#409eff', ip: '192.168.1.10', module: 'product', action: '新增商品', content: '创建商品「无线蓝牙耳机 Pro」', method: 'POST', path: '/api/product/create', result: 'success', duration: 128, createdAt: '2026-10-30 10:12:00', params: '{\n  "name": "无线蓝牙耳机 Pro",\n  "price": 399\n}', error: '' },
  { id: 2, operator: '李四', avatarBg: '#52b788', ip: '10.0.0.22', module: 'order', action: '订单发货', content: '订单 SO20261030001 发货', method: 'POST', path: '/api/order/ship', result: 'success', duration: 256, createdAt: '2026-10-30 09:40:12', params: '{\n  "orderNo": "SO20261030001",\n  "express": "顺丰速运"\n}', error: '' },
  { id: 3, operator: '王五', avatarBg: '#e6a23c', ip: '172.16.0.5', module: 'product', action: '删除商品', content: '删除商品「测试商品 001」', method: 'DELETE', path: '/api/product/delete', result: 'fail', duration: 86, createdAt: '2026-10-30 09:18:05', params: '{\n  "id": 999\n}', error: '商品不存在或已被引用，无法删除' },
  { id: 4, operator: '赵六', avatarBg: '#9254de', ip: '192.168.2.33', module: 'user', action: '禁用会员', content: '禁用会员「孙七」', method: 'PUT', path: '/api/user/disable', result: 'success', duration: 156, createdAt: '2026-10-30 08:05:44', params: '{\n  "userId": 5\n}', error: '' },
  { id: 5, operator: '周八', avatarBg: '#13c2c2', ip: '10.1.1.8', module: 'permission', action: '修改角色', content: '更新角色「运营专员」权限', method: 'PUT', path: '/api/permission/role/update', result: 'success', duration: 320, createdAt: '2026-10-29 18:32:10', params: '{\n  "roleId": 2,\n  "menuIds": ["product", "marketing"]\n}', error: '' },
  { id: 6, operator: '张三', avatarBg: '#409eff', ip: '192.168.1.10', module: 'marketing', action: '新增优惠券', content: '创建优惠券「双十二满减券」', method: 'POST', path: '/api/marketing/coupon/create', result: 'success', duration: 98, createdAt: '2026-10-29 16:20:08', params: '{\n  "name": "双十二满减券",\n  "value": 50\n}', error: '' }
]

const resultMap: Record<LogResult, { text: string; color: string; bg: string }> = {
  success: { text: '成功', color: '#52b788', bg: 'rgba(82,183,136,0.12)' },
  fail: { text: '失败', color: '#f56c6c', bg: 'rgba(245,108,108,0.12)' }
}

async function fetchList(): Promise<void> {
  loading.value = true
  try {
    await new Promise(r => setTimeout(r, 300))
    let data = [...mockData]
    if (query.keyword) {
      const k = query.keyword.toLowerCase()
      data = data.filter(d =>
        d.operator.toLowerCase().includes(k) ||
        d.content.toLowerCase().includes(k) ||
        d.action.toLowerCase().includes(k)
      )
    }
    if (query.module) {
      data = data.filter(d => d.module === query.module)
    }
    if (query.result) {
      data = data.filter(d => d.result === query.result)
    }
    total.value = data.length
    const start = (page.current - 1) * page.size
    list.value = data.slice(start, start + page.size).map(r => {
      const s = resultMap[r.result]
      return {
        ...r,
        moduleText: moduleMap[r.module] || r.module,
        resultText: s.text,
        resultColor: s.color,
        resultBg: s.bg
      }
    })
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
  query.module = ''
  query.result = ''
  query.dateRange = null
  activeTab.value = 'all'
  page.current = 1
  fetchList()
}

function handleExport(): void {
  ElMessage.success('导出任务已提交，请稍后在导出记录中下载')
}

// ---------- 详情抽屉 ----------
const drawerVisible = ref(false)
const currentLog = ref<LogView | null>(null)

function openDetail(row: LogView): void {
  currentLog.value = row
  drawerVisible.value = true
}

onMounted(fetchList)
</script>

<style lang="scss" scoped>
.log-page {
  .operator-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .operator-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .operator-name {
      font-size: 13px;
      font-weight: 500;
      color: #1f2d3d;
    }

    .operator-ip {
      margin-top: 2px;
      font-size: 12px;
      color: #8a94a6;
      font-family: monospace;
    }
  }

  .action-text {
    font-size: 13px;
    color: #409eff;
  }

  .method-text {
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;

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

  .duration {
    font-size: 12px;
    color: #5a6472;

    &.slow {
      color: #e6a23c;
      font-weight: 600;
    }
  }

  // 详情抽屉
  .log-summary {
    padding: 14px 16px;
    background: #f7f9fc;
    border-radius: 12px;
    margin-bottom: 16px;

    .summary-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;

      &:not(:last-child) {
        border-bottom: 1px dashed #eef1f6;
      }
    }

    .summary-label {
      color: #8a94a6;
    }

    .summary-value {
      color: #1f2d3d;
      font-weight: 500;
    }
  }

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #1f2d3d;
    margin: 18px 0 10px;
  }

  .drawer-desc {
    :deep(.el-descriptions__label) {
      width: 100px;
      color: #8a94a6;
      background: #f8fafd;
    }
  }

  .log-content {
    padding: 12px;
    background: #f7f9fc;
    border-radius: 10px;
    font-size: 13px;
    color: #1f2d3d;
    line-height: 1.7;
  }

  .log-json {
    padding: 12px;
    background: #1f2d3d;
    border-radius: 10px;
    font-size: 12px;
    color: #e8f3ff;
    font-family: 'Monaco', 'Menlo', monospace;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
    margin: 0;
    max-height: 240px;
    overflow-y: auto;
  }

  .log-error {
    padding: 12px;
    background: rgba(245, 108, 108, 0.1);
    border: 1px solid rgba(245, 108, 108, 0.3);
    border-radius: 10px;
    font-size: 13px;
    color: #f56c6c;
    line-height: 1.6;
  }
}
</style>