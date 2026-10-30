<template>
  <div class="console-page">
    <!-- 欢迎区 -->
    <div class="welcome-card">
      <div class="welcome-content">
        <div class="welcome-text">
          <div class="welcome-greeting">
            <span class="wave">👋</span>
            你好，{{ adminName }}
          </div>
          <div class="welcome-sub">
            今天是 {{ today }}，商城整体运营情况如下
          </div>
        </div>
        <div class="welcome-actions">
          <ElButton class="ghost-btn" :loading="refreshing" @click="refreshData">
            <Icon v-if="!refreshing" icon="solar:refresh-bold-duotone" width="16" class="btn-icon" />
            刷新数据
          </ElButton>
          <ElButton type="primary" class="primary-btn" @click="go('/order/list')">
            <Icon icon="solar:box-bold-duotone" width="16" class="btn-icon" />
            去处理订单
          </ElButton>
        </div>
      </div>
      <div class="welcome-deco"></div>
    </div>

    <!-- 实时概览 -->
    <div class="quick-overview">
      <div v-for="o in overviewItems" :key="o.label" class="quick-item">
        <div class="quick-icon" :style="{ background: o.bg, color: o.color }">
          <Icon :icon="o.icon" width="20" />
        </div>
        <div class="quick-info">
          <div class="quick-value">{{ o.value }}</div>
          <div class="quick-label">{{ o.label }}</div>
        </div>
        <div class="quick-trend" :class="o.trend >= 0 ? 'up' : 'down'">
          {{ o.trend >= 0 ? '+' : '' }}{{ o.trend }}%
        </div>
      </div>
    </div>

    <ElRow :gutter="16">
      <!-- 左：核心指标 + 销售趋势 -->
      <ElCol :xs="24" :md="16">
        <ElRow :gutter="16">
          <ElCol v-for="s in statCards" :key="s.label" :xs="12" :sm="12" :md="6">
            <div class="stat-card" :style="{ '--accent': s.color, '--accent-soft': s.bg }">
              <div class="stat-header">
                <span class="stat-label">{{ s.label }}</span>
                <div class="stat-icon">
                  <Icon :icon="s.icon" width="18" />
                </div>
              </div>
              <div class="stat-value">{{ s.value }}</div>
              <div class="stat-trend" :class="s.trend >= 0 ? 'up' : 'down'">
                <Icon
                  :icon="s.trend >= 0 ? 'solar:alt-arrow-up-bold-duotone' : 'solar:alt-arrow-down-bold-duotone'"
                  width="12"
                />
                {{ Math.abs(s.trend) }}% 较昨日
              </div>
            </div>
          </ElCol>
        </ElRow>

        <!-- 销售趋势图 -->
        <ElCard class="panel-card chart-card" shadow="never">
          <template #header>
            <div class="panel-header">
              <div class="panel-title">
                <span class="title-dot"></span>
                销售趋势
                <span class="title-sub">{{ trendRange === '7d' ? '近 7 天' : '近 30 天' }}</span>
              </div>
              <ElRadioGroup v-model="trendRange" size="small" @change="renderTrendChart">
                <ElRadioButton label="7d">7天</ElRadioButton>
                <ElRadioButton label="30d">30天</ElRadioButton>
              </ElRadioGroup>
            </div>
          </template>
          <div class="chart-wrap">
            <div ref="trendChartRef" class="chart-box"></div>
          </div>
        </ElCard>
      </ElCol>

      <!-- 右：待办 + 快捷入口 -->
      <ElCol :xs="24" :md="8">
        <ElCard class="panel-card todo-card" shadow="never">
          <template #header>
            <div class="panel-header">
              <div class="panel-title">
                <span class="title-dot"></span>
                待办事项
              </div>
              <ElTag size="small" type="danger" effect="light" round>
                {{ totalTodo }} 项
              </ElTag>
            </div>
          </template>
          <div class="todo-list">
            <div
              v-for="t in todos"
              :key="t.label"
              class="todo-item"
              @click="go(t.path)"
            >
              <div class="todo-icon" :style="{ background: t.bg, color: t.color }">
                <Icon :icon="t.icon" width="18" />
              </div>
              <div class="todo-info">
                <div class="todo-label">{{ t.label }}</div>
                <div class="todo-desc">{{ t.desc }}</div>
              </div>
              <div class="todo-count" :style="{ color: t.color, background: t.bg }">
                {{ t.count }}
              </div>
            </div>
          </div>
        </ElCard>

        <ElCard class="panel-card quick-card" shadow="never">
          <template #header>
            <div class="panel-header">
              <div class="panel-title">
                <span class="title-dot"></span>
                快捷入口
              </div>
            </div>
          </template>
          <div class="quick-entry-grid">
            <div
              v-for="q in quickEntries"
              :key="q.path"
              class="quick-entry"
              @click="go(q.path)"
            >
              <div class="entry-icon" :style="{ background: q.bg, color: q.color }">
                <Icon :icon="q.icon" width="20" />
              </div>
              <span class="entry-label">{{ q.label }}</span>
            </div>
          </div>
        </ElCard>
      </ElCol>
    </ElRow>

    <ElRow :gutter="16">
      <!-- 订单状态 -->
      <ElCol :xs="24" :sm="12" :md="8">
        <ElCard class="panel-card chart-card small-chart" shadow="never">
          <template #header>
            <div class="panel-header">
              <div class="panel-title">
                <span class="title-dot"></span>
                订单状态分布
              </div>
            </div>
          </template>
          <div class="chart-wrap">
            <div ref="orderChartRef" class="chart-box"></div>
          </div>
        </ElCard>
      </ElCol>

      <!-- 热销商品 -->
      <ElCol :xs="24" :sm="12" :md="8">
        <ElCard class="panel-card" shadow="never">
          <template #header>
            <div class="panel-header">
              <div class="panel-title">
                <span class="title-dot"></span>
                热销商品 TOP5
              </div>
              <ElLink type="primary" :underline="false" @click="go('/product/list')">
                全部 <Icon icon="solar:alt-arrow-right-bold-duotone" width="12" />
              </ElLink>
            </div>
          </template>
          <div class="top-goods-list">
            <div v-for="(g, idx) in topGoods" :key="g.name" class="top-goods-item">
              <span class="rank-badge" :class="`rank-${idx + 1}`">{{ idx + 1 }}</span>
              <div class="goods-thumb" :style="{ background: g.thumb }">
                <Icon :icon="g.icon" width="16" />
              </div>
              <div class="goods-info">
                <div class="goods-name">{{ g.name }}</div>
                <div class="goods-sales">销量 {{ g.sales }}</div>
              </div>
              <div class="goods-amount">¥{{ (g.amount / 1000).toFixed(1) }}k</div>
            </div>
          </div>
        </ElCard>
      </ElCol>

      <!-- 最近动态 -->
      <ElCol :xs="24" :md="8">
        <ElCard class="panel-card" shadow="never">
          <template #header>
            <div class="panel-header">
              <div class="panel-title">
                <span class="title-dot"></span>
                最近动态
              </div>
              <ElLink type="primary" :underline="false" @click="go('/permission/log')">
                全部 <Icon icon="solar:alt-arrow-right-bold-duotone" width="12" />
              </ElLink>
            </div>
          </template>
          <ElTimeline class="activity-timeline">
            <ElTimelineItem
              v-for="(a, idx) in activities"
              :key="idx"
              :timestamp="a.time"
              :type="a.type"
              placement="top"
            >
              {{ a.content }}
            </ElTimelineItem>
          </ElTimeline>
        </ElCard>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Icon } from '@iconify/vue'
import * as echarts from 'echarts'

// ---------- 基础 ----------
const router = useRouter()
const adminName = ref('管理员')
const refreshing = ref(false)

const today = computed(() =>
  new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
)

// ---------- 实时概览 ----------
const overviewItems = computed(() => [
  { label: '实时访客', value: '3,286', trend: 12.5, icon: 'solar:users-group-rounded-bold-duotone', color: '#409eff', bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
  { label: '支付转化率', value: '4.8%', trend: 0.6, icon: 'solar:graph-up-bold-duotone', color: '#52b788', bg: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' },
  { label: '客单价', value: '¥268.50', trend: -2.1, icon: 'solar:wallet-money-bold-duotone', color: '#e6a23c', bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)' },
  { label: '退款率', value: '1.2%', trend: -0.3, icon: 'solar:refresh-circle-bold-duotone', color: '#f56c6c', bg: 'linear-gradient(135deg, #ffeaea, #ffd6d6)' }
])

// ---------- 核心指标 ----------
const statCards = computed(() => [
  { label: '今日销售额', value: '¥86,420', trend: 12.8, icon: 'solar:wallet-money-bold-duotone', color: '#409eff', bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
  { label: '今日订单数', value: '1,286', trend: 5.2, icon: 'solar:cart-large-bold-duotone', color: '#52b788', bg: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' },
  { label: '新增会员', value: '286', trend: 8.6, icon: 'solar:user-plus-bold-duotone', color: '#e6a23c', bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)' },
  { label: '待处理售后', value: '18', trend: -2.4, icon: 'solar:refresh-circle-bold-duotone', color: '#f56c6c', bg: 'linear-gradient(135deg, #ffeaea, #ffd6d6)' }
])

// ---------- 待办 ----------
const todos = computed(() => [
  { label: '待发货订单', desc: '请尽快处理发货', count: 128, icon: 'solar:delivery-bold-duotone', color: '#409eff', bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)', path: '/order/shipping' },
  { label: '待处理售后', desc: '用户售后申请待审核', count: 18, icon: 'solar:refresh-circle-bold-duotone', color: '#f56c6c', bg: 'linear-gradient(135deg, #ffeaea, #ffd6d6)', path: '/order/refund' },
  { label: '待审核评价', desc: '商品评价待审核', count: 36, icon: 'solar:star-bold-duotone', color: '#e6a23c', bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)', path: '/product/review' },
  { label: '库存预警商品', desc: '库存低于预警值', count: 12, icon: 'solar:danger-triangle-bold-duotone', color: '#52b788', bg: 'linear-gradient(135deg, #e6f7ee, #cdf0de)', path: '/product/list' }
])

const totalTodo = computed(() => todos.value.reduce((s, t) => s + t.count, 0))

// ---------- 快捷入口 ----------
const quickEntries = computed(() => [
  { label: '商品管理', path: '/product/list', icon: 'solar:box-bold-duotone', color: '#409eff', bg: '#e8f3ff' },
  { label: '订单管理', path: '/order/list', icon: 'solar:document-bold-duotone', color: '#52b788', bg: '#e6f7ee' },
  { label: '会员管理', path: '/user/list', icon: 'solar:users-group-rounded-bold-duotone', color: '#e6a23c', bg: '#fff4e6' },
  { label: '营销管理', path: '/marketing/coupon', icon: 'solar:chart-2-bold-duotone', color: '#9254de', bg: '#f3e8ff' },
  { label: '数据统计', path: '/analytics/sales', icon: 'solar:graph-up-bold-duotone', color: '#13c2c2', bg: '#e6fffb' },
  { label: '系统设置', path: '/settings/general', icon: 'solar:settings-bold-duotone', color: '#8a94a6', bg: '#f5f7fa' }
])

// ---------- 热销商品 ----------
const topGoods = ref([
  { name: '无线蓝牙耳机 Pro', sales: 1286, amount: 512400, icon: 'solar:headphones-round-sound-bold-duotone', thumb: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
  { name: '智能手表 S9', sales: 986, amount: 886400, icon: 'solar:watch-square-bold-duotone', thumb: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' },
  { name: '便携充电宝 20000mAh', sales: 872, amount: 112488, icon: 'solar:battery-charge-bold-duotone', thumb: 'linear-gradient(135deg, #fff4e6, #ffe4c4)' },
  { name: '轻薄羽绒服', sales: 756, amount: 452844, icon: 'solar:bag-smile-bold-duotone', thumb: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)' },
  { name: '保湿精华液 50ml', sales: 643, amount: 192257, icon: 'solar:magic-stick-3-bold-duotone', thumb: 'linear-gradient(135deg, #ffeaea, #ffd6d6)' }
])

// ---------- 最近动态 ----------
const activities = ref([
  { content: '管理员 admin 处理了订单 SO20261030001 的发货', time: '10 分钟前', type: 'success' as const },
  { content: '用户「张三」提交了售后申请', time: '32 分钟前', type: 'warning' as const },
  { content: '审核通过 12 条商品评价', time: '1 小时前', type: 'primary' as const },
  { content: '新增优惠券「双十二满减券」', time: '2 小时前', type: 'info' as const },
  { content: '角色「运营专员」权限已更新', time: '昨天 18:20', type: 'info' as const }
])

// ---------- 图表 ----------
const trendChartRef = ref<HTMLElement>()
const orderChartRef = ref<HTMLElement>()
let trendChart: echarts.ECharts | null = null
let orderChart: echarts.ECharts | null = null
const trendRange = ref<'7d' | '30d'>('7d')

const tooltipStyle = {
  backgroundColor: 'rgba(255,255,255,0.98)',
  borderColor: '#eef1f6',
  borderWidth: 1,
  padding: [10, 14],
  textStyle: { color: '#1f2d3d', fontSize: 12 },
  extraCssText: 'box-shadow: 0 8px 24px rgba(31,45,61,0.12); border-radius: 10px;'
}

function renderTrendChart(): void {
  if (!trendChart) return
  const data7d = {
    x: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    sales: [52000, 61000, 58000, 72000, 86000, 98000, 86420],
    orders: [820, 960, 900, 1120, 1286, 1420, 1286]
  }
  const data30d = {
    x: Array.from({ length: 30 }, (_, i) => `${i + 1}日`),
    sales: Array.from({ length: 30 }, () => Math.round(50000 + Math.random() * 50000)),
    orders: Array.from({ length: 30 }, () => Math.round(800 + Math.random() * 800))
  }
  const data = trendRange.value === '7d' ? data7d : data30d

  trendChart.setOption({
    tooltip: {
      trigger: 'axis',
      ...tooltipStyle,
      axisPointer: { type: 'line', lineStyle: { color: '#c6d9f5', type: 'dashed' } }
    },
    legend: { right: 0, top: 0, icon: 'circle', itemWidth: 10, itemHeight: 10, textStyle: { color: '#8a94a6', fontSize: 12 } },
    grid: { left: 10, right: 20, bottom: 6, top: 40, containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.x,
      axisLine: { lineStyle: { color: '#eef1f6' } },
      axisTick: { show: false },
      axisLabel: { color: '#8a94a6', fontSize: 12 }
    },
    yAxis: [
      {
        type: 'value',
        name: '销售额',
        nameTextStyle: { color: '#b0b8c7', fontSize: 12 },
        axisLabel: { formatter: '¥{value}', color: '#8a94a6', fontSize: 12 },
        splitLine: { lineStyle: { color: '#f2f4f8' } }
      },
      {
        type: 'value',
        name: '订单数',
        nameTextStyle: { color: '#b0b8c7', fontSize: 12 },
        axisLabel: { color: '#8a94a6', fontSize: 12 },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '销售额',
        type: 'line',
        smooth: true,
        data: data.sales,
        symbol: 'circle',
        symbolSize: 7,
        showSymbol: false,
        lineStyle: { width: 3, color: '#409eff' },
        itemStyle: { color: '#409eff', borderColor: '#fff', borderWidth: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64,158,255,0.28)' },
            { offset: 1, color: 'rgba(64,158,255,0.01)' }
          ])
        }
      },
      {
        name: '订单数',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: data.orders,
        symbol: 'circle',
        symbolSize: 7,
        showSymbol: false,
        lineStyle: { width: 3, color: '#52b788' },
        itemStyle: { color: '#52b788', borderColor: '#fff', borderWidth: 2 }
      }
    ]
  })
}

function renderOrderChart(): void {
  if (!orderChart) return
  const total = 820 + 1100 + 960 + 2400 + 18
  orderChart.setOption({
    tooltip: { trigger: 'item', ...tooltipStyle, formatter: '{b}<br/>订单：{c}（{d}%）' },
    legend: { bottom: 0, left: 'center', icon: 'circle', itemWidth: 10, itemHeight: 10, textStyle: { color: '#8a94a6', fontSize: 12 } },
    title: {
      text: total.toLocaleString(),
      subtext: '总订单',
      left: '50%',
      top: '34%',
      textAlign: 'center',
      textStyle: { color: '#1f2d3d', fontSize: 20, fontWeight: 700 },
      subtextStyle: { color: '#8a94a6', fontSize: 12 }
    },
    series: [
      {
        type: 'pie',
        radius: ['48%', '72%'],
        center: ['50%', '44%'],
        itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 3 },
        label: { show: false },
        emphasis: { scale: true, scaleSize: 6 },
        data: [
          { value: 820, name: '待付款', itemStyle: { color: '#e6a23c' } },
          { value: 1100, name: '待发货', itemStyle: { color: '#409eff' } },
          { value: 960, name: '已发货', itemStyle: { color: '#52b788' } },
          { value: 2400, name: '已完成', itemStyle: { color: '#909399' } },
          { value: 18, name: '售后中', itemStyle: { color: '#f56c6c' } }
        ]
      }
    ]
  })
}

function initCharts(): void {
  nextTick(() => {
    if (trendChartRef.value) {
      trendChart = echarts.init(trendChartRef.value)
      renderTrendChart()
    }
    if (orderChartRef.value) {
      orderChart = echarts.init(orderChartRef.value)
      renderOrderChart()
    }
  })
}

let resizeTimer: number | null = null
function handleResize(): void {
  if (resizeTimer) window.clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(() => {
    trendChart?.resize()
    orderChart?.resize()
  }, 200)
}

// ---------- 操作 ----------
async function refreshData(): Promise<void> {
  refreshing.value = true
  await new Promise(r => setTimeout(r, 600))
  refreshing.value = false
  renderTrendChart()
  renderOrderChart()
  ElMessage.success('数据已刷新')
}

function go(path: string): void {
  router.push(path)
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (resizeTimer) window.clearTimeout(resizeTimer)
  trendChart?.dispose()
  orderChart?.dispose()
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

.console-page {
  padding: $gap;
  background: $bg-soft;
  min-height: 100%;
}

// ---------- 欢迎区 ----------
.welcome-card {
  position: relative;
  overflow: hidden;
  border-radius: $radius-card;
  padding: 24px 28px;
  margin-bottom: $gap;
  background: linear-gradient(120deg, #ffffff 0%, #f3f8ff 55%, #eaf3ff 100%);
  box-shadow: $shadow-card;

  .welcome-content {
    @include flex-between;
    position: relative;
    z-index: 2;
    flex-wrap: wrap;
    gap: 16px;
  }

  .welcome-text {
    .welcome-greeting {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 22px;
      font-weight: 600;
      color: $text-main;

      .wave {
        display: inline-block;
        animation: wave 2.4s ease-in-out infinite;
        transform-origin: 70% 70%;
      }
    }

    .welcome-sub {
      margin-top: 6px;
      font-size: 13px;
      color: $text-secondary;
    }
  }

  .welcome-actions {
    display: flex;
    gap: 10px;
  }

  .ghost-btn {
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.8);
    border-color: #dbe7fa;
    color: $text-regular;

    &:hover {
      color: $primary;
      border-color: $primary;
      background: #fff;
    }
  }

  .primary-btn {
    border-radius: 10px;
    box-shadow: 0 6px 16px rgba(64, 158, 255, 0.28);

    &:hover {
      box-shadow: 0 8px 22px rgba(64, 158, 255, 0.38);
    }
  }

  .btn-icon {
    margin-right: 6px;
    vertical-align: middle;
  }

  .welcome-deco {
    position: absolute;
    right: -60px;
    top: -80px;
    width: 260px;
    height: 260px;
    border-radius: 50%;
    background: radial-gradient(circle at center, rgba(64, 158, 255, 0.12), rgba(64, 158, 255, 0) 70%);
    pointer-events: none;
    z-index: 1;
  }
}

@keyframes wave {
  0%, 60%, 100% { transform: rotate(0); }
  10%, 30% { transform: rotate(14deg); }
  20%, 40% { transform: rotate(-8deg); }
}

// ---------- 实时概览 ----------
.quick-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: $gap;
}

.quick-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid $border-light;
  border-radius: $radius-block;
  box-shadow: $shadow-card;
  transition: transform 0.25s ease, box-shadow 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-hover;
  }

  .quick-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    @include flex-center;
    flex-shrink: 0;
  }

  .quick-info {
    flex: 1;
    min-width: 0;
  }

  .quick-value {
    font-size: 18px;
    font-weight: 700;
    color: $text-main;
  }

  .quick-label {
    margin-top: 2px;
    font-size: 12px;
    color: $text-secondary;
  }

  .quick-trend {
    font-size: 12px;
    font-weight: 600;

    &.up { color: #52b788; }
    &.down { color: #f56c6c; }
  }
}

// ---------- 指标卡 ----------
.stat-card {
  padding: 16px;
  background: #fff;
  border: 1px solid $border-light;
  border-radius: $radius-block;
  box-shadow: $shadow-card;
  margin-bottom: 16px;
  transition: transform 0.25s ease, box-shadow 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-hover;
  }

  .stat-header {
    @include flex-between;
    margin-bottom: 10px;
  }

  .stat-label {
    font-size: 13px;
    color: $text-secondary;
  }

  .stat-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    @include flex-center;
    background: var(--accent-soft);
    color: var(--accent);
  }

  .stat-value {
    font-size: 22px;
    font-weight: 700;
    color: $text-main;
    margin-bottom: 6px;
  }

  .stat-trend {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 500;

    &.up {
      color: #52b788;
      background: rgba(82, 183, 136, 0.12);
    }

    &.down {
      color: #f56c6c;
      background: rgba(245, 108, 108, 0.12);
    }
  }
}

// ---------- 面板 ----------
.panel-card {
  border-radius: $radius-card;
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
    margin-left: 4px;
  }
}

// ---------- 图表 ----------
.chart-card {
  :deep(.el-card__body) {
    padding: 12px 18px 16px;
    overflow: hidden;
  }
}

.chart-wrap {
  position: relative;
  width: 100%;
  height: 300px;
}

.chart-box {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.chart-card.small-chart .chart-wrap {
  height: 280px;
}

// ---------- 待办 ----------
.todo-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: $radius-block;
  background: $bg-soft;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #fff;
    border-color: #dbe7fa;
    transform: translateX(3px);
    box-shadow: 0 6px 16px rgba(64, 158, 255, 0.1);
  }

  .todo-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    @include flex-center;
    flex-shrink: 0;
  }

  .todo-info {
    flex: 1;
    min-width: 0;
  }

  .todo-label {
    font-size: 13px;
    font-weight: 500;
    color: $text-main;
  }

  .todo-desc {
    margin-top: 2px;
    font-size: 12px;
    color: $text-secondary;
  }

  .todo-count {
    min-width: 32px;
    height: 24px;
    padding: 0 8px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    @include flex-center;
    flex-shrink: 0;
  }
}

// ---------- 快捷入口 ----------
.quick-entry-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.quick-entry {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 8px;
  border-radius: $radius-block;
  background: $bg-soft;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f5f9ff;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(64, 158, 255, 0.1);
  }

  .entry-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    @include flex-center;
  }

  .entry-label {
    font-size: 12px;
    color: $text-regular;
    font-weight: 500;
  }
}

// ---------- 热销商品 ----------
.top-goods-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.top-goods-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: $radius-block;
  background: $bg-soft;
  transition: background 0.2s ease;

  &:hover {
    background: #f5f9ff;
  }

  .rank-badge {
    width: 22px;
    height: 22px;
    line-height: 22px;
    text-align: center;
    border-radius: 6px;
    background: #f0f5ff;
    color: $primary;
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;

    &.rank-1 { color: #fff; background: #f56c6c; }
    &.rank-2 { color: #fff; background: #e6a23c; }
    &.rank-3 { color: #fff; background: #52b788; }
  }

  .goods-thumb {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    @include flex-center;
    color: $primary;
    flex-shrink: 0;
  }

  .goods-info {
    flex: 1;
    min-width: 0;
  }

  .goods-name {
    font-size: 13px;
    font-weight: 500;
    color: $text-main;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .goods-sales {
    margin-top: 2px;
    font-size: 12px;
    color: $text-secondary;
  }

  .goods-amount {
    font-size: 13px;
    font-weight: 600;
    color: $text-main;
    flex-shrink: 0;
  }
}

// ---------- 最近动态 ----------
.activity-timeline {
  padding: 4px 0;
  max-height: 280px;
  overflow-y: auto;

  :deep(.el-timeline-item__timestamp) {
    font-size: 12px;
    color: $text-secondary;
  }

  :deep(.el-timeline-item__content) {
    font-size: 13px;
    color: $text-regular;
    line-height: 1.6;
  }
}

// ---------- 响应式 ----------
@media (max-width: 1200px) {
  .quick-overview {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .console-page {
    padding: 12px;
  }

  .welcome-card {
    padding: 18px 16px;

    .welcome-greeting {
      font-size: 18px;
    }
  }

  .quick-overview {
    grid-template-columns: 1fr;
  }

  .quick-entry-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .chart-wrap {
    height: 240px !important;
  }

  .chart-card.small-chart .chart-wrap {
    height: 220px !important;
  }
}
</style>