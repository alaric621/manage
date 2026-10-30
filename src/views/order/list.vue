<template>
  <div class="list-page order-page">
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
            placeholder="订单号 / 会员昵称 / 手机号"
            clearable
            style="width: 240px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <Icon icon="solar:magnifer-bold-duotone" width="16" />
            </template>
          </ElInput>
        </ElFormItem>
        <ElFormItem label="支付方式">
          <ElSelect v-model="query.payMethod" placeholder="全部方式" clearable style="width: 150px">
            <ElOption label="微信支付" value="wechat" />
            <ElOption label="支付宝" value="alipay" />
            <ElOption label="银行卡" value="card" />
            <ElOption label="余额支付" value="balance" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="下单时间">
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
            订单列表
            <span class="title-sub">共 {{ total }} 笔</span>
          </div>
          <div class="panel-actions">
            <ElButton
              v-if="selection.length"
              type="primary"
              plain
              size="small"
              @click="handleBatchShip"
            >
              <Icon icon="solar:delivery-bold-duotone" class="btn-icon" />
              批量发货（{{ selection.length }}）
            </ElButton>
            <ElButton type="primary" size="small" @click="handleExport">
              <Icon icon="solar:download-bold-duotone" class="btn-icon" />导出
            </ElButton>
          </div>
        </div>
      </template>

      <!-- 状态标签页 -->
      <ElTabs v-model="activeTab" class="status-tabs" @tab-change="handleTabChange">
        <ElTabPane label="全部" name="all" />
        <ElTabPane label="待付款" name="pending" />
        <ElTabPane label="待发货" name="paid" />
        <ElTabPane label="已发货" name="shipped" />
        <ElTabPane label="已完成" name="completed" />
        <ElTabPane label="已取消" name="cancelled" />
        <ElTabPane label="售后中" name="refund" />
      </ElTabs>

      <ElTable
        v-loading="loading"
        :data="list"
        class="pretty-table"
        row-key="id"
        @selection-change="handleSelectionChange"
      >
        <ElTableColumn type="selection" width="46" align="center" />
        <ElTableColumn label="订单号" width="180">
          <template #default="{ row }">
            <div class="order-no-cell">
              <span class="order-no">{{ row.no }}</span>
              <span class="order-time">{{ row.createdAt }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="会员" width="150">
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
        <ElTableColumn label="商品" min-width="240">
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
        <ElTableColumn label="订单金额" width="130" align="right">
          <template #default="{ row }">
            <div class="amount-cell">
              <span class="amount">¥ {{ row.amount.toFixed(2) }}</span>
              <span class="amount-sub">实付 ¥ {{ row.payAmount.toFixed(2) }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="支付方式" width="110">
          <template #default="{ row }">
            <span class="pay-method">
              <Icon :icon="row.payIcon" width="14" />
              {{ row.payText }}
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="状态" width="110">
          <template #default="{ row }">
            <span class="status-dot" :style="{ color: row.statusColor, background: row.statusBg }">
              <i class="dot"></i>{{ row.statusText }}
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <ElButton link type="primary" size="small" @click="openDetail(row)">详情</ElButton>
            <ElButton
              v-if="row.status === 'paid'"
              link
              type="success"
              size="small"
              @click="handleShip(row)"
            >
              发货
            </ElButton>
            <ElButton
              v-if="row.status === 'pending'"
              link
              type="warning"
              size="small"
              @click="handleCancel(row)"
            >
              取消
            </ElButton>
            <ElButton
              v-if="row.status === 'refund'"
              link
              type="danger"
              size="small"
              @click="openRefund(row)"
            >
              售后处理
            </ElButton>
            <ElButton link type="primary" size="small" @click="handleRemark(row)">备注</ElButton>
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

    <!-- 订单详情抽屉 -->
    <ElDrawer v-model="drawerVisible" title="订单详情" size="560px">
      <template v-if="currentOrder">
        <div class="order-summary">
          <div class="summary-row">
            <span class="summary-label">订单号</span>
            <span class="summary-value">{{ currentOrder.no }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">状态</span>
            <span class="status-dot" :style="{ color: currentOrder.statusColor, background: currentOrder.statusBg }">
              <i class="dot"></i>{{ currentOrder.statusText }}
            </span>
          </div>
          <div class="summary-row">
            <span class="summary-label">下单时间</span>
            <span class="summary-value">{{ currentOrder.createdAt }}</span>
          </div>
        </div>

        <div class="section-title">会员信息</div>
        <ElDescriptions :column="1" border class="drawer-desc">
          <ElDescriptionsItem label="会员">{{ currentOrder.memberName }}</ElDescriptionsItem>
          <ElDescriptionsItem label="手机号">{{ currentOrder.memberPhone }}</ElDescriptionsItem>
        </ElDescriptions>

        <div class="section-title">收货信息</div>
        <ElDescriptions :column="1" border class="drawer-desc">
          <ElDescriptionsItem label="收货人">{{ currentOrder.receiver }}</ElDescriptionsItem>
          <ElDescriptionsItem label="联系电话">{{ currentOrder.receiverPhone }}</ElDescriptionsItem>
          <ElDescriptionsItem label="收货地址">{{ currentOrder.address }}</ElDescriptionsItem>
        </ElDescriptions>

        <div class="section-title">商品信息</div>
        <div class="goods-list">
          <div v-for="g in currentOrder.goods" :key="g.id" class="goods-item">
            <div class="goods-thumb" :style="{ background: g.thumb }">
              <Icon :icon="g.icon" width="18" />
            </div>
            <div class="goods-meta">
              <div class="goods-name">{{ g.name }}</div>
              <div class="goods-spec">{{ g.spec }}</div>
            </div>
            <div class="goods-price">
              <div class="goods-amount">¥ {{ g.price.toFixed(2) }}</div>
              <div class="goods-count">× {{ g.count }}</div>
            </div>
          </div>
        </div>

        <div class="section-title">金额明细</div>
        <ElDescriptions :column="1" border class="drawer-desc">
          <ElDescriptionsItem label="商品总额">¥ {{ currentOrder.amount.toFixed(2) }}</ElDescriptionsItem>
          <ElDescriptionsItem label="优惠金额">- ¥ {{ currentOrder.discount.toFixed(2) }}</ElDescriptionsItem>
          <ElDescriptionsItem label="运费">¥ {{ currentOrder.freight.toFixed(2) }}</ElDescriptionsItem>
          <ElDescriptionsItem label="实付金额">
            <span class="amount">¥ {{ currentOrder.payAmount.toFixed(2) }}</span>
          </ElDescriptionsItem>
        </ElDescriptions>

        <div class="section-title">支付信息</div>
        <ElDescriptions :column="1" border class="drawer-desc">
          <ElDescriptionsItem label="支付方式">{{ currentOrder.payText }}</ElDescriptionsItem>
          <ElDescriptionsItem label="支付时间">{{ currentOrder.payTime || '--' }}</ElDescriptionsItem>
        </ElDescriptions>

        <div v-if="currentOrder.remark" class="section-title">订单备注</div>
        <div v-if="currentOrder.remark" class="order-remark">{{ currentOrder.remark }}</div>

        <div class="drawer-actions">
          <ElButton
            v-if="currentOrder.status === 'paid'"
            type="primary"
            @click="handleShip(currentOrder)"
          >
            确认发货
          </ElButton>
          <ElButton
            v-if="currentOrder.status === 'refund'"
            type="danger"
            plain
            @click="openRefund(currentOrder)"
          >
            售后处理
          </ElButton>
        </div>
      </template>
    </ElDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Icon } from '@iconify/vue'

// ---------- 类型 ----------
type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled' | 'refund'
type PayMethod = 'wechat' | 'alipay' | 'card' | 'balance'
type TabName = 'all' | OrderStatus

interface OrderGoods {
  id: number
  name: string
  spec: string
  price: number
  count: number
  icon: string
  thumb: string
}

interface OrderRow {
  id: number
  no: string
  memberName: string
  memberPhone: string
  avatarBg: string
  goodsName: string
  goodsIcon: string
  goodsThumb: string
  goodsCount: number
  amount: number
  payAmount: number
  discount: number
  freight: number
  payMethod: PayMethod
  status: OrderStatus
  createdAt: string
  payTime: string
  receiver: string
  receiverPhone: string
  address: string
  remark: string
  goods: OrderGoods[]
}

interface OrderView extends OrderRow {
  statusText: string
  statusColor: string
  statusBg: string
  payText: string
  payIcon: string
}

interface QueryState {
  keyword: string
  payMethod: '' | PayMethod
  dateRange: [string, string] | null
}

// ---------- 概览 ----------
const stats = computed(() => {
  const total = mockData.length
  const pending = mockData.filter(d => d.status === 'pending').length
  const paid = mockData.filter(d => d.status === 'paid').length
  const refund = mockData.filter(d => d.status === 'refund').length
  return [
    { label: '订单总数', value: total, icon: 'solar:document-bold-duotone', color: '#409eff', bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
    { label: '待付款', value: pending, icon: 'solar:clock-circle-bold-duotone', color: '#e6a23c', bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)' },
    { label: '待发货', value: paid, icon: 'solar:delivery-bold-duotone', color: '#52b788', bg: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' },
    { label: '售后中', value: refund, icon: 'solar:refresh-circle-bold-duotone', color: '#f56c6c', bg: 'linear-gradient(135deg, #ffeaea, #ffd6d6)' }
  ]
})

// ---------- 查询 ----------
const query = reactive<QueryState>({ keyword: '', payMethod: '', dateRange: null })

const activeTab = ref<TabName>('all')
function handleTabChange(name: string | number): void {
  const tab = String(name) as TabName
  query.status = tab === 'all' ? '' : (tab as OrderStatus)
  page.current = 1
  fetchList()
}

// ---------- 列表 ----------
const loading = ref(false)
const list = ref<OrderView[]>([])
const total = ref(0)
const page = reactive({ current: 1, size: 10 })
const selection = ref<OrderView[]>([])

const mockData: OrderRow[] = [
  {
    id: 1, no: 'SO20261030001', memberName: '张三', memberPhone: '13812345678', avatarBg: '#409eff',
    goodsName: '无线蓝牙耳机 Pro', goodsIcon: 'solar:headphones-round-sound-bold-duotone', goodsThumb: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)', goodsCount: 2,
    amount: 798, payAmount: 768, discount: 30, freight: 0, payMethod: 'wechat', status: 'paid',
    createdAt: '2026-10-30 10:12:00', payTime: '2026-10-30 10:13:20',
    receiver: '张三', receiverPhone: '13812345678', address: '广东省深圳市南山区科技园', remark: '请尽快发货',
    goods: [
      { id: 1, name: '无线蓝牙耳机 Pro', spec: '黑色 / 标准版', price: 399, count: 2, icon: 'solar:headphones-round-sound-bold-duotone', thumb: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' }
    ]
  },
  {
    id: 2, no: 'SO20261030002', memberName: '李四', memberPhone: '13987654321', avatarBg: '#52b788',
    goodsName: '智能手表 S9', goodsIcon: 'solar:watch-square-bold-duotone', goodsThumb: 'linear-gradient(135deg, #e6f7ee, #cdf0de)', goodsCount: 1,
    amount: 899, payAmount: 899, discount: 0, freight: 0, payMethod: 'alipay', status: 'shipped',
    createdAt: '2026-10-30 09:58:00', payTime: '2026-10-30 09:59:10',
    receiver: '李四', receiverPhone: '13987654321', address: '北京市朝阳区建国路 88 号', remark: '',
    goods: [
      { id: 2, name: '智能手表 S9', spec: '白色 / 46mm', price: 899, count: 1, icon: 'solar:watch-square-bold-duotone', thumb: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' }
    ]
  },
  {
    id: 3, no: 'SO20261030003', memberName: '王五', memberPhone: '13711112222', avatarBg: '#e6a23c',
    goodsName: '便携充电宝 20000mAh', goodsIcon: 'solar:battery-charge-bold-duotone', goodsThumb: 'linear-gradient(135deg, #fff4e6, #ffe4c4)', goodsCount: 1,
    amount: 129, payAmount: 129, discount: 0, freight: 10, payMethod: 'balance', status: 'pending',
    createdAt: '2026-10-30 09:41:00', payTime: '',
    receiver: '王五', receiverPhone: '13711112222', address: '上海市浦东新区张江路 100 号', remark: '',
    goods: [
      { id: 3, name: '便携充电宝 20000mAh', spec: '黑色 / 20000mAh', price: 129, count: 1, icon: 'solar:battery-charge-bold-duotone', thumb: 'linear-gradient(135deg, #fff4e6, #ffe4c4)' }
    ]
  },
  {
    id: 4, no: 'SO20261030004', memberName: '赵六', memberPhone: '13633334444', avatarBg: '#9254de',
    goodsName: '轻薄羽绒服', goodsIcon: 'solar:bag-smile-bold-duotone', goodsThumb: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)', goodsCount: 1,
    amount: 599, payAmount: 599, discount: 0, freight: 0, payMethod: 'card', status: 'refund',
    createdAt: '2026-10-30 09:20:00', payTime: '2026-10-30 09:21:30',
    receiver: '赵六', receiverPhone: '13633334444', address: '浙江省杭州市西湖区文三路 66 号', remark: '申请退款',
    goods: [
      { id: 4, name: '轻薄羽绒服', spec: '黑色 / L', price: 599, count: 1, icon: 'solar:bag-smile-bold-duotone', thumb: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)' }
    ]
  },
  {
    id: 5, no: 'SO20261030005', memberName: '孙七', memberPhone: '13555556666', avatarBg: '#f56c6c',
    goodsName: '保湿精华液 50ml', goodsIcon: 'solar:magic-stick-3-bold-duotone', goodsThumb: 'linear-gradient(135deg, #ffeaea, #ffd6d6)', goodsCount: 3,
    amount: 897, payAmount: 877, discount: 20, freight: 0, payMethod: 'wechat', status: 'completed',
    createdAt: '2026-10-29 16:20:00', payTime: '2026-10-29 16:21:10',
    receiver: '孙七', receiverPhone: '13555556666', address: '江苏省南京市鼓楼区中山路 20 号', remark: '',
    goods: [
      { id: 5, name: '保湿精华液 50ml', spec: '50ml', price: 299, count: 3, icon: 'solar:magic-stick-3-bold-duotone', thumb: 'linear-gradient(135deg, #ffeaea, #ffd6d6)' }
    ]
  }
]

const statusMap: Record<OrderStatus, { text: string; color: string; bg: string }> = {
  pending: { text: '待付款', color: '#e6a23c', bg: 'rgba(230,162,60,0.12)' },
  paid: { text: '待发货', color: '#52b788', bg: 'rgba(82,183,136,0.12)' },
  shipped: { text: '已发货', color: '#409eff', bg: 'rgba(64,158,255,0.12)' },
  completed: { text: '已完成', color: '#909399', bg: 'rgba(144,147,153,0.12)' },
  cancelled: { text: '已取消', color: '#909399', bg: 'rgba(144,147,153,0.12)' },
  refund: { text: '售后中', color: '#f56c6c', bg: 'rgba(245,108,108,0.12)' }
}

const payMap: Record<PayMethod, { text: string; icon: string }> = {
  wechat: { text: '微信支付', icon: 'solar:chat-round-bold-duotone' },
  alipay: { text: '支付宝', icon: 'solar:wallet-money-bold-duotone' },
  card: { text: '银行卡', icon: 'solar:card-bold-duotone' },
  balance: { text: '余额支付', icon: 'solar:wallet-bold-duotone' }
}

function decorate(rows: OrderRow[]): OrderView[] {
  return rows.map(r => {
    const s = statusMap[r.status]
    const p = payMap[r.payMethod]
    return {
      ...r,
      statusText: s.text,
      statusColor: s.color,
      statusBg: s.bg,
      payText: p.text,
      payIcon: p.icon
    }
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
      data = data.filter(d =>
        d.no.toLowerCase().includes(k) ||
        d.memberName.toLowerCase().includes(k) ||
        d.memberPhone.includes(query.keyword)
      )
    }
    if (query.payMethod) {
      data = data.filter(d => d.payMethod === query.payMethod)
    }
    const status = (query as unknown as { status?: '' | OrderStatus }).status
    if (status) {
      data = data.filter(d => d.status === status)
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
  query.payMethod = ''
  query.dateRange = null
  ;(query as unknown as { status?: '' }).status = ''
  activeTab.value = 'all'
  page.current = 1
  fetchList()
}

function handleSelectionChange(val: OrderView[]): void {
  selection.value = val
}

// ---------- 操作 ----------
function handleShip(row: OrderView): void {
  const target = mockData.find(d => d.id === row.id)
  if (target) target.status = 'shipped'
  const s = statusMap.shipped
  row.status = 'shipped'
  row.statusText = s.text
  row.statusColor = s.color
  row.statusBg = s.bg
  ElMessage.success('已确认发货')
}

function handleCancel(row: OrderView): void {
  ElMessageBox.confirm('确定取消该订单吗？', '提示', { type: 'warning' })
    .then(() => {
      const target = mockData.find(d => d.id === row.id)
      if (target) target.status = 'cancelled'
      const s = statusMap.cancelled
      row.status = 'cancelled'
      row.statusText = s.text
      row.statusColor = s.color
      row.statusBg = s.bg
      ElMessage.success('订单已取消')
    })
    .catch(() => {})
}

function openRefund(row: OrderView): void {
  ElMessageBox.confirm(
    `订单 ${row.no} 售后处理，是否同意退款？`,
    '售后处理',
    { type: 'warning', confirmButtonText: '同意退款', cancelButtonText: '暂不处理' }
  )
    .then(() => {
      const target = mockData.find(d => d.id === row.id)
      if (target) target.status = 'cancelled'
      const s = statusMap.cancelled
      row.status = 'cancelled'
      row.statusText = s.text
      row.statusColor = s.color
      row.statusBg = s.bg
      ElMessage.success('已同意退款')
    })
    .catch(() => {})
}

function handleRemark(row: OrderView): void {
  ElMessageBox.prompt('请输入订单备注', '订单备注', {
    inputType: 'textarea',
    inputValue: row.remark,
    confirmButtonText: '保存',
    cancelButtonText: '取消'
  })
    .then(({ value }) => {
      row.remark = value || ''
      const target = mockData.find(d => d.id === row.id)
      if (target) target.remark = row.remark
      ElMessage.success('备注已保存')
    })
    .catch(() => {})
}

function handleBatchShip(): void {
  if (!selection.value.length) return
  const shippable = selection.value.filter(r => r.status === 'paid')
  if (!shippable.length) {
    ElMessage.warning('选中的订单中没有待发货订单')
    return
  }
  ElMessageBox.confirm(`确定批量发货 ${shippable.length} 笔订单吗？`, '提示', { type: 'warning' })
    .then(() => {
      shippable.forEach(row => {
        const target = mockData.find(d => d.id === row.id)
        if (target) target.status = 'shipped'
      })
      selection.value = []
      ElMessage.success('批量发货成功')
      fetchList()
    })
    .catch(() => {})
}

function handleExport(): void {
  ElMessage.success('导出任务已提交，请稍后在导出记录中下载')
}

// ---------- 详情抽屉 ----------
const drawerVisible = ref(false)
const currentOrder = ref<OrderView | null>(null)

function openDetail(row: OrderView): void {
  currentOrder.value = row
  drawerVisible.value = true
}

onMounted(fetchList)
</script>

<style lang="scss" scoped>
// 仅保留订单列表独有样式，通用样式由全局 .list-page 提供
.order-page {
  .order-no-cell {
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
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .goods-sub {
      margin-top: 2px;
      font-size: 12px;
      color: #8a94a6;
    }
  }

  .amount-cell {
    display: flex;
    flex-direction: column;
    align-items: flex-end;

    .amount {
      font-weight: 600;
      color: #1f2d3d;
    }

    .amount-sub {
      font-size: 12px;
      color: #8a94a6;
    }
  }

  .pay-method {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: #5a6472;
  }

  // 详情抽屉
  .order-summary {
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

  .goods-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .goods-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: #f7f9fc;
    border-radius: 10px;

    .goods-thumb {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #409eff;
      flex-shrink: 0;
    }

    .goods-meta {
      flex: 1;
      min-width: 0;
    }

    .goods-name {
      font-size: 13px;
      font-weight: 500;
      color: #1f2d3d;
    }

    .goods-spec {
      margin-top: 2px;
      font-size: 12px;
      color: #8a94a6;
    }

    .goods-price {
      text-align: right;
    }

    .goods-amount {
      font-size: 13px;
      font-weight: 600;
      color: #1f2d3d;
    }

    .goods-count {
      font-size: 12px;
      color: #8a94a6;
    }
  }

  .order-remark {
    padding: 10px 12px;
    background: #fffbe6;
    border: 1px solid #ffe58f;
    border-radius: 8px;
    font-size: 13px;
    color: #8a6d3b;
  }
}
</style>