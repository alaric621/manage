<template>
  <div class="list-page shipping-page">
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
        <ElFormItem label="订单号/会员">
          <ElInput
            v-model="query.keyword"
            placeholder="订单号/会员昵称"
            clearable
            style="width: 220px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <Icon icon="solar:magnifer-bold-duotone" width="16" />
            </template>
          </ElInput>
        </ElFormItem>
        <ElFormItem label="物流公司">
          <ElSelect v-model="query.expressCompany" placeholder="全部物流" clearable style="width: 160px">
            <ElOption v-for="c in expressOptions" :key="c" :label="c" :value="c" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="发货状态">
          <ElSelect v-model="query.shipStatus" placeholder="全部状态" clearable style="width: 140px">
            <ElOption label="待发货" value="pending" />
            <ElOption label="已发货" value="shipped" />
            <ElOption label="已签收" value="received" />
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
            发货管理
            <span class="title-sub">共 {{ total }} 笔</span>
          </div>
          <div class="panel-actions">
            <ElButton
              v-if="selection.length"
              type="primary"
              size="small"
              @click="handleBatchShip"
            >
              <Icon icon="solar:delivery-bold-duotone" class="btn-icon" />
              批量发货（{{ selection.length }}）
            </ElButton>
            <ElButton size="small" @click="handleExport">
              <Icon icon="solar:download-bold-duotone" class="btn-icon" />导出
            </ElButton>
          </div>
        </div>
      </template>

      <!-- 状态标签页 -->
      <ElTabs v-model="activeTab" class="status-tabs" @tab-change="handleTabChange">
        <ElTabPane label="全部" name="all" />
        <ElTabPane label="待发货" name="pending" />
        <ElTabPane label="已发货" name="shipped" />
        <ElTabPane label="已签收" name="received" />
      </ElTabs>

      <ElTable
        v-loading="loading"
        :data="list"
        class="pretty-table"
        row-key="id"
        @selection-change="handleSelectionChange"
      >
        <ElTableColumn type="selection" width="46" align="center" :selectable="row => row.shipStatus === 'pending'" />
        <ElTableColumn label="订单号" width="170">
          <template #default="{ row }">
            <div class="order-cell">
              <span class="order-no">{{ row.no }}</span>
              <span class="order-time">{{ row.payTime }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="会员" width="140">
          <template #default="{ row }">
            <div class="member-cell">
              <div class="member-avatar" :style="{ background: row.avatarBg }">
                {{ row.memberName.charAt(0) }}
              </div>
              <div class="member-meta">
                <div class="member-name">{{ row.memberName }}</div>
                <div class="member-phone">{{ maskPhone(row.memberPhone) }}</div>
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="商品" min-width="200">
          <template #default="{ row }">
            <div class="goods-cell">
              <div class="goods-thumb" :style="{ background: row.goodsThumb }">
                <Icon :icon="row.goodsIcon" width="18" />
              </div>
              <div class="goods-meta">
                <div class="goods-name">{{ row.goodsName }}</div>
                <div class="goods-sub">共 {{ row.goodsCount }} 件</div>
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="收货信息" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="address-cell">
              <div class="address-receiver">{{ row.receiver }} {{ row.receiverPhone }}</div>
              <div class="address-text">{{ row.address }}</div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="物流信息" min-width="200">
          <template #default="{ row }">
            <div v-if="row.shipStatus !== 'pending'" class="express-cell">
              <div class="express-company">{{ row.expressCompany }}</div>
              <div class="express-no">{{ row.expressNo }}</div>
            </div>
            <span v-else class="empty-text">--</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="发货状态" width="100">
          <template #default="{ row }">
            <span class="status-dot" :style="{ color: row.statusColor, background: row.statusBg }">
              <i class="dot"></i>{{ row.statusText }}
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <ElButton link type="primary" size="small" @click="openDetail(row)">详情</ElButton>
            <ElButton
              v-if="row.shipStatus === 'pending'"
              link
              type="success"
              size="small"
              @click="openShipDialog(row)"
            >
              发货
            </ElButton>
            <ElButton
              v-if="row.shipStatus === 'shipped'"
              link
              type="primary"
              size="small"
              @click="handleTrack(row)"
            >
              物流追踪
            </ElButton>
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

    <!-- 发货弹窗 -->
    <ElDialog v-model="shipDialogVisible" title="订单发货" width="520px" destroy-on-close>
      <template v-if="shipOrder">
        <div class="ship-order-info">
          <div class="info-row">
            <span class="info-label">订单号</span>
            <span class="info-value">{{ shipOrder.no }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">收货人</span>
            <span class="info-value">{{ shipOrder.receiver }} {{ shipOrder.receiverPhone }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">收货地址</span>
            <span class="info-value">{{ shipOrder.address }}</span>
          </div>
        </div>

        <ElForm ref="shipFormRef" :model="shipForm" :rules="shipRules" label-width="90px">
          <ElFormItem label="物流公司" prop="expressCompany">
            <ElSelect v-model="shipForm.expressCompany" placeholder="请选择物流公司" style="width: 100%">
              <ElOption v-for="c in expressOptions" :key="c" :label="c" :value="c" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="物流单号" prop="expressNo">
            <ElInput v-model="shipForm.expressNo" placeholder="请输入物流单号" />
          </ElFormItem>
          <ElFormItem label="发货备注">
            <ElInput v-model="shipForm.remark" type="textarea" :rows="2" maxlength="80" show-word-limit placeholder="备注信息" />
          </ElFormItem>
        </ElForm>
      </template>
      <template #footer>
        <ElButton @click="shipDialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="shipping" @click="handleConfirmShip">确认发货</ElButton>
      </template>
    </ElDialog>

    <!-- 物流追踪 -->
    <ElDrawer v-model="trackVisible" title="物流追踪" size="420px">
      <template v-if="trackOrder">
        <div class="track-header">
          <div class="track-company">{{ trackOrder.expressCompany }}</div>
          <div class="track-no">{{ trackOrder.expressNo }}</div>
        </div>
        <ElTimeline>
          <ElTimelineItem
            v-for="(t, idx) in trackList"
            :key="idx"
            :timestamp="t.time"
            :type="idx === 0 ? 'primary' : 'info'"
            :hollow="idx !== 0"
            placement="top"
          >
            {{ t.content }}
          </ElTimelineItem>
        </ElTimeline>
      </template>
    </ElDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Icon } from '@iconify/vue'

// ---------- 类型 ----------
type ShipStatus = 'pending' | 'shipped' | 'received'
type TabName = 'all' | ShipStatus

interface ShipRow {
  id: number
  no: string
  payTime: string
  memberName: string
  memberPhone: string
  avatarBg: string
  goodsName: string
  goodsIcon: string
  goodsThumb: string
  goodsCount: number
  receiver: string
  receiverPhone: string
  address: string
  shipStatus: ShipStatus
  expressCompany: string
  expressNo: string
}

interface ShipView extends ShipRow {
  statusText: string
  statusColor: string
  statusBg: string
}

interface ShipForm {
  expressCompany: string
  expressNo: string
  remark: string
}

interface QueryState {
  keyword: string
  expressCompany: string
  shipStatus: '' | ShipStatus
}

interface TrackLog {
  time: string
  content: string
}

// ---------- 物流公司 ----------
const expressOptions = ['顺丰速运', '中通快递', '圆通速递', '韵达快递', '京东物流', 'EMS']

// ---------- 概览 ----------
const stats = computed(() => {
  const total = mockData.length
  const pending = mockData.filter(d => d.shipStatus === 'pending').length
  const shipped = mockData.filter(d => d.shipStatus === 'shipped').length
  const received = mockData.filter(d => d.shipStatus === 'received').length
  return [
    { label: '发货总数', value: total, icon: 'solar:delivery-bold-duotone', color: '#409eff', bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
    { label: '待发货', value: pending, icon: 'solar:box-bold-duotone', color: '#e6a23c', bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)' },
    { label: '已发货', value: shipped, icon: 'solar:plane-bold-duotone', color: '#52b788', bg: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' },
    { label: '已签收', value: received, icon: 'solar:check-circle-bold-duotone', color: '#9254de', bg: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)' }
  ]
})

// ---------- 查询 ----------
const query = reactive<QueryState>({ keyword: '', expressCompany: '', shipStatus: '' })

const activeTab = ref<TabName>('all')
function handleTabChange(name: string | number): void {
  const tab = String(name) as TabName
  query.shipStatus = tab === 'all' ? '' : (tab as ShipStatus)
  page.current = 1
  fetchList()
}

// ---------- 列表 ----------
const loading = ref(false)
const list = ref<ShipView[]>([])
const total = ref(0)
const page = reactive({ current: 1, size: 10 })
const selection = ref<ShipView[]>([])

const mockData: ShipRow[] = [
  { id: 1, no: 'SO20261030001', payTime: '2026-10-30 10:13', memberName: '张三', memberPhone: '13812345678', avatarBg: '#409eff', goodsName: '无线蓝牙耳机 Pro', goodsIcon: 'solar:headphones-round-sound-bold-duotone', goodsThumb: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)', goodsCount: 2, receiver: '张三', receiverPhone: '13812345678', address: '广东省深圳市南山区科技园', shipStatus: 'pending', expressCompany: '', expressNo: '' },
  { id: 2, no: 'SO20261030002', payTime: '2026-10-30 09:59', memberName: '李四', memberPhone: '13987654321', avatarBg: '#52b788', goodsName: '智能手表 S9', goodsIcon: 'solar:watch-square-bold-duotone', goodsThumb: 'linear-gradient(135deg, #e6f7ee, #cdf0de)', goodsCount: 1, receiver: '李四', receiverPhone: '13987654321', address: '北京市朝阳区建国路 88 号', shipStatus: 'shipped', expressCompany: '顺丰速运', expressNo: 'SF1234567890123' },
  { id: 3, no: 'SO20261030003', payTime: '2026-10-30 09:21', memberName: '王五', memberPhone: '13711112222', avatarBg: '#e6a23c', goodsName: '便携充电宝 20000mAh', goodsIcon: 'solar:battery-charge-bold-duotone', goodsThumb: 'linear-gradient(135deg, #fff4e6, #ffe4c4)', goodsCount: 1, receiver: '王五', receiverPhone: '13711112222', address: '上海市浦东新区张江路 100 号', shipStatus: 'pending', expressCompany: '', expressNo: '' },
  { id: 4, no: 'SO20261029001', payTime: '2026-10-29 16:21', memberName: '赵六', memberPhone: '13633334444', avatarBg: '#9254de', goodsName: '轻薄羽绒服', goodsIcon: 'solar:bag-smile-bold-duotone', goodsThumb: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)', goodsCount: 1, receiver: '赵六', receiverPhone: '13633334444', address: '浙江省杭州市西湖区文三路 66 号', shipStatus: 'received', expressCompany: '中通快递', expressNo: 'ZTO8888888888' }
]

const statusMap: Record<ShipStatus, { text: string; color: string; bg: string }> = {
  pending: { text: '待发货', color: '#e6a23c', bg: 'rgba(230,162,60,0.12)' },
  shipped: { text: '已发货', color: '#409eff', bg: 'rgba(64,158,255,0.12)' },
  received: { text: '已签收', color: '#52b788', bg: 'rgba(82,183,136,0.12)' }
}

function decorate(rows: ShipRow[]): ShipView[] {
  return rows.map(r => {
    const s = statusMap[r.shipStatus]
    return { ...r, statusText: s.text, statusColor: s.color, statusBg: s.bg }
  })
}

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
      data = data.filter(d => d.no.toLowerCase().includes(k) || d.memberName.toLowerCase().includes(k))
    }
    if (query.expressCompany) {
      data = data.filter(d => d.expressCompany === query.expressCompany)
    }
    if (query.shipStatus) {
      data = data.filter(d => d.shipStatus === query.shipStatus)
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
  query.expressCompany = ''
  query.shipStatus = ''
  activeTab.value = 'all'
  page.current = 1
  fetchList()
}

function handleSelectionChange(val: ShipView[]): void {
  selection.value = val
}

function handleExport(): void {
  ElMessage.success('导出任务已提交')
}

// ---------- 发货弹窗 ----------
const shipDialogVisible = ref(false)
const shipOrder = ref<ShipView | null>(null)
const shipFormRef = ref<FormInstance>()
const shipping = ref(false)

const shipForm = reactive<ShipForm>({
  expressCompany: '',
  expressNo: '',
  remark: ''
})

const shipRules: FormRules<ShipForm> = {
  expressCompany: [{ required: true, message: '请选择物流公司', trigger: 'change' }],
  expressNo: [{ required: true, message: '请输入物流单号', trigger: 'blur' }]
}

function openShipDialog(row: ShipView): void {
  shipOrder.value = row
  shipForm.expressCompany = ''
  shipForm.expressNo = ''
  shipForm.remark = ''
  shipDialogVisible.value = true
}

async function handleConfirmShip(): Promise<void> {
  if (!shipFormRef.value || !shipOrder.value) return
  try {
    await shipFormRef.value.validate()
  } catch {
    return
  }
  shipping.value = true
  await new Promise(r => setTimeout(r, 500))
  shipping.value = false

  const target = mockData.find(d => d.id === shipOrder.value!.id)
  if (target) {
    target.shipStatus = 'shipped'
    target.expressCompany = shipForm.expressCompany
    target.expressNo = shipForm.expressNo
  }
  ElMessage.success('发货成功')
  shipDialogVisible.value = false
  fetchList()
}

// ---------- 批量发货 ----------
function handleBatchShip(): void {
  if (!selection.value.length) return
  ElMessageBox.confirm(`确定批量发货 ${selection.value.length} 笔订单吗？`, '提示', { type: 'warning' })
    .then(() => {
      selection.value.forEach(row => {
        const target = mockData.find(d => d.id === row.id)
        if (target) {
          target.shipStatus = 'shipped'
          target.expressCompany = '顺丰速运'
          target.expressNo = `SF${Date.now()}${row.id}`
        }
      })
      selection.value = []
      ElMessage.success('批量发货成功')
      fetchList()
    })
    .catch(() => {})
}

// ---------- 物流追踪 ----------
const trackVisible = ref(false)
const trackOrder = ref<ShipView | null>(null)
const trackList = ref<TrackLog[]>([])

function handleTrack(row: ShipView): void {
  trackOrder.value = row
  trackList.value = [
    { time: '2026-10-30 15:20', content: '已签收，签收人：本人' },
    { time: '2026-10-30 10:30', content: '快件已到达【深圳南山科技园营业点】' },
    { time: '2026-10-30 06:15', content: '快件已从【深圳转运中心】发出' },
    { time: '2026-10-29 22:40', content: '快件已到达【深圳转运中心】' },
    { time: '2026-10-29 18:30', content: '快递员已揽收' }
  ]
  trackVisible.value = true
}

// ---------- 详情 ----------
function openDetail(row: ShipView): void {
  ElMessage.info(`查看订单 ${row.no} 详情`)
}

onMounted(fetchList)
</script>

<style lang="scss" scoped>
.shipping-page {
  .order-cell {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .order-no {
      font-size: 13px;
      font-weight: 500;
      color: #1f2d3d;
      font-family: monospace;
    }

    .order-time {
      font-size: 12px;
      color: #8a94a6;
    }
  }

  .member-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .member-avatar {
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

    .member-name {
      font-size: 13px;
      font-weight: 500;
      color: #1f2d3d;
    }

    .member-phone {
      margin-top: 2px;
      font-size: 12px;
      color: #8a94a6;
    }
  }

  .goods-cell {
    display: flex;
    align-items: center;
    gap: 10px;

    .goods-thumb {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #409eff;
      flex-shrink: 0;
    }

    .goods-name {
      font-size: 13px;
      font-weight: 500;
      color: #1f2d3d;
    }

    .goods-sub {
      margin-top: 2px;
      font-size: 12px;
      color: #8a94a6;
    }
  }

  .address-cell {
    .address-receiver {
      font-size: 13px;
      color: #1f2d3d;
      font-weight: 500;
    }

    .address-text {
      margin-top: 2px;
      font-size: 12px;
      color: #8a94a6;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .express-cell {
    .express-company {
      font-size: 13px;
      color: #1f2d3d;
    }

    .express-no {
      margin-top: 2px;
      font-size: 12px;
      color: #8a94a6;
      font-family: monospace;
    }
  }

  .empty-text {
    color: #8a94a6;
    font-size: 12px;
  }

  // 发货弹窗
  .ship-order-info {
    padding: 12px 14px;
    background: #f7f9fc;
    border-radius: 10px;
    margin-bottom: 16px;

    .info-row {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 4px 0;
      font-size: 13px;
    }

    .info-label {
      color: #8a94a6;
      min-width: 70px;
    }

    .info-value {
      color: #1f2d3d;
      flex: 1;
      word-break: break-all;
    }
  }

  // 物流追踪
  .track-header {
    padding: 14px 16px;
    background: #f7f9fc;
    border-radius: 10px;
    margin-bottom: 16px;

    .track-company {
      font-size: 14px;
      font-weight: 600;
      color: #1f2d3d;
    }

    .track-no {
      margin-top: 4px;
      font-size: 12px;
      color: #8a94a6;
      font-family: monospace;
    }
  }
}
</style>