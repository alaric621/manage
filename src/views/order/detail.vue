<template>
  <div class="list-page order-detail-page" v-loading="loading">
    <!-- 顶部操作栏 -->
    <div class="detail-toolbar">
      <div class="toolbar-left">
        <ElButton @click="go('/order/list')">
          <Icon icon="solar:alt-arrow-left-bold-duotone" width="16" class="btn-icon" />返回列表
        </ElButton>
        <span class="toolbar-title">订单详情</span>
        <span v-if="order" class="order-no">{{ order.no }}</span>
        <span v-if="order" class="status-dot" :style="{ color: order.statusColor, background: order.statusBg }">
          <i class="dot"></i>{{ order.statusText }}
        </span>
      </div>
      <div class="toolbar-right">
        <ElButton v-if="order?.status === 'paid'" type="primary" @click="handleShip">
          <Icon icon="solar:delivery-bold-duotone" class="btn-icon" />确认发货
        </ElButton>
        <ElButton v-if="order?.status === 'pending'" type="warning" @click="handleCancel">取消订单</ElButton>
        <ElButton v-if="order?.status === 'refund'" type="danger" plain @click="handleRefund">售后处理</ElButton>
        <ElButton @click="handleRemark">
          <Icon icon="solar:pen-bold-duotone" class="btn-icon" />订单备注
        </ElButton>
        <ElButton @click="handlePrint">
          <Icon icon="solar:printer-bold-duotone" class="btn-icon" />打印
        </ElButton>
      </div>
    </div>

    <template v-if="order">
      <!-- 订单状态时间轴 -->
      <ElCard class="panel-card" shadow="never">
        <template #header>
          <div class="panel-header">
            <div class="panel-title">
              <span class="title-dot"></span>
              订单进度
            </div>
          </div>
        </template>
        <ElSteps :active="orderStep" align-center finish-status="success" class="order-steps">
          <ElStep title="提交订单" :description="order.createdAt" />
          <ElStep title="付款成功" :description="order.payTime || '--'" />
          <ElStep title="商家发货" :description="order.shipTime || '--'" />
          <ElStep title="确认收货" :description="order.confirmTime || '--'" />
          <ElStep title="交易完成" :description="order.finishTime || '--'" />
        </ElSteps>
      </ElCard>

      <ElRow :gutter="16">
        <!-- 主信息 -->
        <ElCol :xs="24" :md="16">
          <!-- 商品信息 -->
          <ElCard class="panel-card" shadow="never">
            <template #header>
              <div class="panel-header">
                <div class="panel-title">
                  <span class="title-dot"></span>
                  商品信息
                </div>
              </div>
            </template>
            <ElTable :data="order.goods" class="pretty-table" size="small">
              <ElTableColumn label="商品" min-width="260">
                <template #default="{ row }">
                  <div class="goods-cell">
                    <div class="goods-thumb" :style="{ background: row.thumb }">
                      <Icon :icon="row.icon" width="20" />
                    </div>
                    <div class="goods-meta">
                      <div class="goods-name">{{ row.name }}</div>
                      <div class="goods-spec">{{ row.spec }}</div>
                    </div>
                  </div>
                </template>
              </ElTableColumn>
              <ElTableColumn label="单价" width="100" align="right">
                <template #default="{ row }">¥ {{ row.price.toFixed(2) }}</template>
              </ElTableColumn>
              <ElTableColumn prop="count" label="数量" width="80" align="center" />
              <ElTableColumn label="小计" width="110" align="right">
                <template #default="{ row }">
                  <span class="amount">¥ {{ (row.price * row.count).toFixed(2) }}</span>
                </template>
              </ElTableColumn>
            </ElTable>

            <div class="amount-summary">
              <div class="summary-row">
                <span class="label">商品总额</span>
                <span class="value">¥ {{ order.amount.toFixed(2) }}</span>
              </div>
              <div class="summary-row">
                <span class="label">优惠金额</span>
                <span class="value discount">- ¥ {{ order.discount.toFixed(2) }}</span>
              </div>
              <div class="summary-row">
                <span class="label">运费</span>
                <span class="value">¥ {{ order.freight.toFixed(2) }}</span>
              </div>
              <div class="summary-row total">
                <span class="label">实付金额</span>
                <span class="value">¥ {{ order.payAmount.toFixed(2) }}</span>
              </div>
            </div>
          </ElCard>

          <!-- 收货信息 -->
          <ElCard class="panel-card" shadow="never">
            <template #header>
              <div class="panel-header">
                <div class="panel-title">
                  <span class="title-dot"></span>
                  收货信息
                </div>
              </div>
            </template>
            <ElDescriptions :column="2" border class="info-desc">
              <ElDescriptionsItem label="收货人">{{ order.receiver }}</ElDescriptionsItem>
              <ElDescriptionsItem label="联系电话">{{ order.receiverPhone }}</ElDescriptionsItem>
              <ElDescriptionsItem label="收货地址" :span="2">{{ order.address }}</ElDescriptionsItem>
              <ElDescriptionsItem label="物流公司" :span="1">{{ order.expressCompany || '--' }}</ElDescriptionsItem>
              <ElDescriptionsItem label="物流单号" :span="1">{{ order.expressNo || '--' }}</ElDescriptionsItem>
            </ElDescriptions>
          </ElCard>

          <!-- 订单备注 -->
          <ElCard v-if="order.remark" class="panel-card" shadow="never">
            <template #header>
              <div class="panel-header">
                <div class="panel-title">
                  <span class="title-dot"></span>
                  订单备注
                </div>
              </div>
            </template>
            <div class="order-remark">{{ order.remark }}</div>
          </ElCard>
        </ElCol>

        <!-- 侧栏 -->
        <ElCol :xs="24" :md="8">
          <!-- 会员信息 -->
          <ElCard class="panel-card" shadow="never">
            <template #header>
              <div class="panel-header">
                <div class="panel-title">
                  <span class="title-dot"></span>
                  会员信息
                </div>
              </div>
            </template>
            <div class="member-info">
              <div class="member-avatar" :style="{ background: order.avatarBg }">
                {{ order.memberName.charAt(0) }}
              </div>
              <div class="member-meta">
                <div class="member-name">{{ order.memberName }}</div>
                <div class="member-phone">{{ order.memberPhone }}</div>
              </div>
            </div>
          </ElCard>

          <!-- 支付信息 -->
          <ElCard class="panel-card" shadow="never">
            <template #header>
              <div class="panel-header">
                <div class="panel-title">
                  <span class="title-dot"></span>
                  支付信息
                </div>
              </div>
            </template>
            <ElDescriptions :column="1" border class="info-desc">
              <ElDescriptionsItem label="支付方式">{{ order.payText }}</ElDescriptionsItem>
              <ElDescriptionsItem label="支付时间">{{ order.payTime || '--' }}</ElDescriptionsItem>
              <ElDescriptionsItem label="交易流水号">{{ order.tradeNo || '--' }}</ElDescriptionsItem>
            </ElDescriptions>
          </ElCard>

          <!-- 操作日志 -->
          <ElCard class="panel-card" shadow="never">
            <template #header>
              <div class="panel-header">
                <div class="panel-title">
                  <span class="title-dot"></span>
                  操作日志
                </div>
              </div>
            </template>
            <ElTimeline>
              <ElTimelineItem
                v-for="(log, idx) in order.logs"
                :key="idx"
                :timestamp="log.time"
                :type="log.type"
                placement="top"
              >
                {{ log.content }}
              </ElTimelineItem>
            </ElTimeline>
          </ElCard>
        </ElCol>
      </ElRow>
    </template>

    <ElEmpty v-else-if="!loading" description="未找到该订单" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Icon } from '@iconify/vue'

// ---------- 类型 ----------
type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled' | 'refund'

interface OrderGoods {
  id: number
  name: string
  spec: string
  price: number
  count: number
  icon: string
  thumb: string
}

interface OrderLog {
  time: string
  content: string
  type: 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

interface OrderDetail {
  no: string
  status: OrderStatus
  statusText: string
  statusColor: string
  statusBg: string
  memberName: string
  memberPhone: string
  avatarBg: string
  amount: number
  discount: number
  freight: number
  payAmount: number
  payText: string
  payTime: string
  tradeNo: string
  createdAt: string
  shipTime: string
  confirmTime: string
  finishTime: string
  receiver: string
  receiverPhone: string
  address: string
  expressCompany: string
  expressNo: string
  remark: string
  goods: OrderGoods[]
  logs: OrderLog[]
}

// ---------- 基础 ----------
const router = useRouter()
const route = useRoute()
const loading = ref(true)
const order = ref<OrderDetail | null>(null)

const orderStep = computed(() => {
  if (!order.value) return 0
  const map: Record<OrderStatus, number> = {
    pending: 0,
    paid: 1,
    shipped: 2,
    completed: 4,
    cancelled: 0,
    refund: 1
  }
  return map[order.value.status]
})

// ---------- 加载 ----------
async function fetchDetail(): Promise<void> {
  loading.value = true
  try {
    await new Promise(r => setTimeout(r, 400))
    order.value = {
      no: String(route.params.id || 'SO20261030001'),
      status: 'paid',
      statusText: '待发货',
      statusColor: '#52b788',
      statusBg: 'rgba(82,183,136,0.12)',
      memberName: '张三',
      memberPhone: '13812345678',
      avatarBg: '#409eff',
      amount: 798,
      discount: 30,
      freight: 0,
      payAmount: 768,
      payText: '微信支付',
      payTime: '2026-10-30 10:13:20',
      tradeNo: '4200001234202610301234567890',
      createdAt: '2026-10-30 10:12:00',
      shipTime: '',
      confirmTime: '',
      finishTime: '',
      receiver: '张三',
      receiverPhone: '13812345678',
      address: '广东省深圳市南山区科技园',
      expressCompany: '',
      expressNo: '',
      remark: '请尽快发货',
      goods: [
        { id: 1, name: '无线蓝牙耳机 Pro', spec: '黑色 / 标准版', price: 399, count: 2, icon: 'solar:headphones-round-sound-bold-duotone', thumb: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' }
      ],
      logs: [
        { time: '2026-10-30 10:13:20', content: '买家完成支付 ¥768.00', type: 'success' },
        { time: '2026-10-30 10:12:30', content: '买家提交订单', type: 'primary' },
        { time: '2026-10-30 10:12:00', content: '订单创建', type: 'info' }
      ]
    }
  } catch {
    ElMessage.error('加载订单详情失败')
  } finally {
    loading.value = false
  }
}

// ---------- 操作 ----------
function handleShip(): void {
  ElMessageBox.confirm('确认发货该订单吗？', '提示', { type: 'warning' })
    .then(() => {
      if (order.value) {
        order.value.status = 'shipped'
        order.value.statusText = '已发货'
        order.value.statusColor = '#409eff'
        order.value.statusBg = 'rgba(64,158,255,0.12)'
        order.value.shipTime = new Date().toLocaleString('zh-CN')
      }
      ElMessage.success('已确认发货')
    })
    .catch(() => {})
}

function handleCancel(): void {
  ElMessageBox.confirm('确定取消该订单吗？', '提示', { type: 'warning' })
    .then(() => {
      if (order.value) {
        order.value.status = 'cancelled'
        order.value.statusText = '已取消'
        order.value.statusColor = '#909399'
        order.value.statusBg = 'rgba(144,147,153,0.12)'
      }
      ElMessage.success('订单已取消')
    })
    .catch(() => {})
}

function handleRefund(): void {
  ElMessageBox.confirm('是否同意退款？', '售后处理', {
    type: 'warning',
    confirmButtonText: '同意退款',
    cancelButtonText: '暂不处理'
  })
    .then(() => ElMessage.success('已同意退款'))
    .catch(() => {})
}

function handleRemark(): void {
  if (!order.value) return
  ElMessageBox.prompt('请输入订单备注', '订单备注', {
    inputType: 'textarea',
    inputValue: order.value.remark,
    confirmButtonText: '保存',
    cancelButtonText: '取消'
  })
    .then(({ value }) => {
      if (order.value) order.value.remark = value || ''
      ElMessage.success('备注已保存')
    })
    .catch(() => {})
}

function handlePrint(): void {
  ElMessage.success('打印任务已提交')
}

function go(path: string): void {
  router.push(path)
}

onMounted(fetchDetail)
</script>

<style lang="scss" scoped>
.order-detail-page {
  .detail-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 16px;

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .toolbar-title {
      font-size: 18px;
      font-weight: 600;
      color: #1f2d3d;
    }

    .order-no {
      font-family: monospace;
      font-size: 13px;
      color: #8a94a6;
    }

    .toolbar-right {
      display: flex;
      gap: 8px;
    }

    .btn-icon {
      margin-right: 4px;
      vertical-align: middle;
    }
  }

  // 进度
  .order-steps {
    padding: 8px 0;
  }

  // 商品
  .goods-cell {
    display: flex;
    align-items: center;
    gap: 10px;

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
  }

  .amount {
    font-weight: 600;
    color: #1f2d3d;
  }

  // 金额
  .amount-summary {
    margin-top: 16px;
    padding: 14px 16px;
    background: #f7f9fc;
    border-radius: 10px;

    .summary-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;

      .label {
        color: #8a94a6;
      }

      .value {
        color: #1f2d3d;
        font-weight: 500;
      }

      .discount {
        color: #52b788;
      }

      &.total {
        border-top: 1px dashed #eef1f6;
        margin-top: 4px;
        padding-top: 10px;

        .label {
          color: #1f2d3d;
          font-weight: 600;
        }

        .value {
          color: #f56c6c;
          font-size: 18px;
          font-weight: 700;
        }
      }
    }
  }

  // 信息描述
  .info-desc {
    :deep(.el-descriptions__label) {
      width: 100px;
      color: #8a94a6;
      background: #f8fafd;
    }
  }

  // 备注
  .order-remark {
    padding: 12px;
    background: #fffbe6;
    border: 1px solid #ffe58f;
    border-radius: 8px;
    font-size: 13px;
    color: #8a6d3b;
    line-height: 1.6;
  }

  // 会员
  .member-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .member-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 18px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .member-name {
      font-size: 14px;
      font-weight: 600;
      color: #1f2d3d;
    }

    .member-phone {
      margin-top: 2px;
      font-size: 12px;
      color: #8a94a6;
    }
  }
}

@media (max-width: 768px) {
  .order-detail-page {
    .detail-toolbar {
      flex-direction: column;
      align-items: flex-start;
    }

    .toolbar-right {
      flex-wrap: wrap;
    }
  }
}
</style>