<template>
  <div class="list-page analytics-sales-page">
    <!-- 时间范围切换 -->
    <ElCard class="panel-card filter-card" shadow="never">
      <div class="filter-bar">
        <div class="filter-left">
          <span class="filter-label">统计时间</span>
          <ElRadioGroup v-model="range" size="small" @change="handleRangeChange">
            <ElRadioButton label="today">今日</ElRadioButton>
            <ElRadioButton label="7d">近7天</ElRadioButton>
            <ElRadioButton label="30d">近30天</ElRadioButton>
            <ElRadioButton label="custom">自定义</ElRadioButton>
          </ElRadioGroup>
          <ElDatePicker
            v-if="range === 'custom'"
            v-model="customRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            size="small"
            style="width: 260px; margin-left: 12px"
            @change="fetchData"
          />
        </div>
        <div class="filter-right">
          <ElButton size="small" @click="fetchData">
            <Icon icon="solar:refresh-bold-duotone" class="btn-icon" />刷新
          </ElButton>
          <ElButton size="small" type="primary" @click="handleExport">
            <Icon icon="solar:download-bold-duotone" class="btn-icon" />导出报表
          </ElButton>
        </div>
      </div>
    </ElCard>

    <!-- 核心指标 -->
    <ElRow :gutter="16" class="stat-row">
      <ElCol v-for="s in stats" :key="s.label" :xs="12" :sm="12" :md="6">
        <div class="stat-card" :style="{ '--accent': s.color, '--accent-soft': s.bg }">
          <div class="stat-inner">
            <div class="stat-icon">
              <Icon :icon="s.icon" width="22" height="22" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ s.value }}</div>
              <div class="stat-label">{{ s.label }}</div>
            </div>
          </div>
          <div class="stat-trend" :class="s.trend >= 0 ? 'up' : 'down'">
            <Icon
              :icon="s.trend >= 0 ? 'solar:alt-arrow-up-bold-duotone' : 'solar:alt-arrow-down-bold-duotone'"
              width="14"
            />
            {{ Math.abs(s.trend) }}% 环比
          </div>
        </div>
      </ElCol>
    </ElRow>

    <!-- 销售趋势 -->
    <ElRow :gutter="16">
      <ElCol :xs="24" :md="16">
        <ElCard class="panel-card chart-card" shadow="never">
          <template #header>
            <div class="panel-header">
              <div class="panel-title">
                <span class="title-dot"></span>
                销售趋势
                <span class="title-sub">{{ rangeText }}</span>
              </div>
              <ElRadioGroup v-model="trendMetric" size="small" @change="renderTrendChart">
                <ElRadioButton label="amount">销售额</ElRadioButton>
                <ElRadioButton label="orders">订单数</ElRadioButton>
              </ElRadioGroup>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-box"></div>
        </ElCard>
      </ElCol>

      <ElCol :xs="24" :md="8">
        <ElCard class="panel-card chart-card" shadow="never">
          <template #header>
            <div class="panel-header">
              <div class="panel-title">
                <span class="title-dot"></span>
                支付方式占比
              </div>
            </div>
          </template>
          <div ref="payChartRef" class="chart-box"></div>
        </ElCard>
      </ElCol>
    </ElRow>

    <ElRow :gutter="16">
      <!-- 分类销售排行 -->
      <ElCol :xs="24" :md="12">
        <ElCard class="panel-card chart-card" shadow="never">
          <template #header>
            <div class="panel-header">
              <div class="panel-title">
                <span class="title-dot"></span>
                分类销售排行
              </div>
            </div>
          </template>
          <div ref="categoryChartRef" class="chart-box"></div>
        </ElCard>
      </ElCol>

      <!-- 销售 TOP10 商品 -->
      <ElCol :xs="24" :md="12">
        <ElCard class="panel-card" shadow="never">
          <template #header>
            <div class="panel-header">
              <div class="panel-title">
                <span class="title-dot"></span>
                热销商品 TOP10
              </div>
            </div>
          </template>
          <ElTable :data="topProducts" class="pretty-table" size="small" max-height="340">
            <ElTableColumn label="#" width="46" align="center">
              <template #default="{ $index }">
                <span class="rank-badge" :class="`rank-${$index + 1}`">{{ $index + 1 }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="商品" min-width="180">
              <template #default="{ row }">
                <div class="product-cell">
                  <div class="product-thumb" :style="{ background: row.thumb }">
                    <Icon :icon="row.icon" width="18" />
                  </div>
                  <span class="product-name">{{ row.name }}</span>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="sales" label="销量" width="80" align="right" />
            <ElTableColumn label="销售额" width="110" align="right">
              <template #default="{ row }">
                <span class="amount">¥ {{ row.amount.toLocaleString() }}</span>
              </template>
            </ElTableColumn>
          </ElTable>
        </ElCard>
      </ElCol>
    </ElRow>

    <!-- 每日数据明细 -->
    <ElCard class="panel-card" shadow="never">
      <template #header>
        <div class="panel-header">
          <div class="panel-title">
            <span class="title-dot"></span>
            每日销售明细
            <span class="title-sub">{{ rangeText }}</span>
          </div>
        </div>
      </template>
      <ElTable :data="dailyData" class="pretty-table" size="small">
        <ElTableColumn prop="date" label="日期" width="140" />
        <ElTableColumn label="销售额" width="140" align="right">
          <template #default="{ row }">¥ {{ row.amount.toLocaleString() }}</template>
        </ElTableColumn>
        <ElTableColumn prop="orders" label="订单数" width="100" align="right" />
        <ElTableColumn prop="customers" label="下单人数" width="110" align="right" />
        <ElTableColumn label="客单价" width="120" align="right">
          <template #default="{ row }">¥ {{ row.avgPrice.toFixed(2) }}</template>
        </ElTableColumn>
        <ElTableColumn label="退款额" width="120" align="right">
          <template #default="{ row }">
            <span class="refund">¥ {{ row.refund.toLocaleString() }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="环比" width="110" align="center">
          <template #default="{ row }">
            <span :class="row.growth >= 0 ? 'trend-up' : 'trend-down'">
              {{ row.growth >= 0 ? '+' : '' }}{{ row.growth }}%
            </span>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Icon } from '@iconify/vue'
import * as echarts from 'echarts'

// ---------- 类型 ----------
type RangeType = 'today' | '7d' | '30d' | 'custom'
type TrendMetric = 'amount' | 'orders'

interface DailyRow {
  date: string
  amount: number
  orders: number
  customers: number
  avgPrice: number
  refund: number
  growth: number
}

// ---------- 时间范围 ----------
const range = ref<RangeType>('7d')
const customRange = ref<[string, string] | null>(null)

const rangeText = computed(() => {
  const map: Record<RangeType, string> = {
    today: '今日',
    '7d': '近 7 天',
    '30d': '近 30 天',
    custom: '自定义'
  }
  return map[range.value]
})

function handleRangeChange(): void {
  if (range.value !== 'custom') fetchData()
}

// ---------- 概览 ----------
const stats = computed(() => {
  const data = dailyData.value
  const totalAmount = data.reduce((s, d) => s + d.amount, 0)
  const totalOrders = data.reduce((s, d) => s + d.orders, 0)
  const totalCustomers = data.reduce((s, d) => s + d.customers, 0)
  const avgPrice = totalOrders ? totalAmount / totalOrders : 0
  return [
    {
      label: '销售额',
      value: `¥ ${totalAmount.toLocaleString()}`,
      trend: 12.8,
      icon: 'solar:wallet-money-bold-duotone',
      color: '#409eff',
      bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)'
    },
    {
      label: '订单数',
      value: totalOrders.toLocaleString(),
      trend: 8.5,
      icon: 'solar:cart-large-bold-duotone',
      color: '#52b788',
      bg: 'linear-gradient(135deg, #e6f7ee, #cdf0de)'
    },
    {
      label: '下单人数',
      value: totalCustomers.toLocaleString(),
      trend: 5.2,
      icon: 'solar:users-group-rounded-bold-duotone',
      color: '#e6a23c',
      bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)'
    },
    {
      label: '客单价',
      value: `¥ ${avgPrice.toFixed(2)}`,
      trend: -2.1,
      icon: 'solar:chart-2-bold-duotone',
      color: '#9254de',
      bg: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)'
    }
  ]
})

// ---------- 图表 ref ----------
const trendChartRef = ref<HTMLElement>()
const payChartRef = ref<HTMLElement>()
const categoryChartRef = ref<HTMLElement>()
let trendChart: echarts.ECharts | null = null
let payChart: echarts.ECharts | null = null
let categoryChart: echarts.ECharts | null = null

const trendMetric = ref<TrendMetric>('amount')

// ---------- 数据 ----------
const dailyData = ref<DailyRow[]>([
  { date: '2026-10-24', amount: 52000, orders: 820, customers: 720, avgPrice: 63.41, refund: 860, growth: 5.2 },
  { date: '2026-10-25', amount: 61000, orders: 960, customers: 850, avgPrice: 63.54, refund: 1200, growth: 17.3 },
  { date: '2026-10-26', amount: 58000, orders: 900, customers: 800, avgPrice: 64.44, refund: 680, growth: -4.9 },
  { date: '2026-10-27', amount: 72000, orders: 1120, customers: 980, avgPrice: 64.29, refund: 1500, growth: 24.1 },
  { date: '2026-10-28', amount: 86000, orders: 1286, customers: 1100, avgPrice: 66.88, refund: 980, growth: 19.4 },
  { date: '2026-10-29', amount: 98000, orders: 1420, customers: 1260, avgPrice: 69.01, refund: 1320, growth: 13.9 },
  { date: '2026-10-30', amount: 86420, orders: 1286, customers: 1180, avgPrice: 67.20, refund: 720, growth: -11.8 }
])

const topProducts = ref([
  { name: '无线蓝牙耳机 Pro', sales: 1286, amount: 512400, icon: 'solar:headphones-round-sound-bold-duotone', thumb: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
  { name: '智能手表 S9', sales: 986, amount: 886400, icon: 'solar:watch-square-bold-duotone', thumb: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' },
  { name: '便携充电宝 20000mAh', sales: 872, amount: 112488, icon: 'solar:battery-charge-bold-duotone', thumb: 'linear-gradient(135deg, #fff4e6, #ffe4c4)' },
  { name: '轻薄羽绒服', sales: 756, amount: 452844, icon: 'solar:bag-smile-bold-duotone', thumb: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)' },
  { name: '保湿精华液 50ml', sales: 643, amount: 192257, icon: 'solar:magic-stick-3-bold-duotone', thumb: 'linear-gradient(135deg, #ffeaea, #ffd6d6)' },
  { name: '有机坚果礼盒', sales: 521, amount: 87528, icon: 'solar:gift-bold-duotone', thumb: 'linear-gradient(135deg, #fff9e6, #ffefc2)' },
  { name: '北欧风陶瓷餐具', sales: 398, amount: 102684, icon: 'solar:cup-bold-duotone', thumb: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
  { name: '婴儿纸尿裤 L 码', sales: 367, amount: 51013, icon: 'solar:hearts-bold-duotone', thumb: 'linear-gradient(135deg, #ffeaea, #ffd6d6)' },
  { name: '运动跑步鞋', sales: 312, amount: 155688, icon: 'solar:running-round-bold-duotone', thumb: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' },
  { name: '真皮手提包', sales: 286, amount: 228800, icon: 'solar:bag-smile-bold-duotone', thumb: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)' }
])

const tooltipStyle = {
  backgroundColor: 'rgba(255,255,255,0.98)',
  borderColor: '#eef1f6',
  borderWidth: 1,
  padding: [10, 14],
  textStyle: { color: '#1f2d3d', fontSize: 12 },
  extraCssText: 'box-shadow: 0 8px 24px rgba(31,45,61,0.12); border-radius: 10px;'
}

// ---------- 销售趋势图 ----------
function renderTrendChart(): void {
  if (!trendChart) return
  const data = dailyData.value
  const isAmount = trendMetric.value === 'amount'
  const series = isAmount ? data.map(d => d.amount) : data.map(d => d.orders)
  const unit = isAmount ? '¥' : ''

  trendChart.setOption({
    tooltip: {
      trigger: 'axis',
      ...tooltipStyle,
      axisPointer: { type: 'line', lineStyle: { color: '#c6d9f5', type: 'dashed' } },
      formatter: params => {
        const p = params[0]
        const label = isAmount ? `¥${p.value.toLocaleString()}` : p.value
        return `${p.axisValue}<br/>${isAmount ? '销售额' : '订单数'}：${label}`
      }
    },
    grid: { left: 10, right: 20, bottom: 6, top: 40, containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map(d => d.date.slice(5)),
      axisLine: { lineStyle: { color: '#eef1f6' } },
      axisTick: { show: false },
      axisLabel: { color: '#8a94a6', fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      name: isAmount ? '销售额' : '订单数',
      nameTextStyle: { color: '#b0b8c7', fontSize: 12 },
      axisLabel: {
        color: '#8a94a6',
        fontSize: 12,
        formatter: (v: number) => isAmount ? `¥${v}` : `${v}`
      },
      splitLine: { lineStyle: { color: '#f2f4f8' } }
    },
    series: [
      {
        name: isAmount ? '销售额' : '订单数',
        type: 'line',
        smooth: true,
        data: series,
        symbol: 'circle',
        symbolSize: 8,
        showSymbol: false,
        lineStyle: { width: 3, color: '#409eff' },
        itemStyle: { color: '#409eff', borderColor: '#fff', borderWidth: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64,158,255,0.28)' },
            { offset: 1, color: 'rgba(64,158,255,0.01)' }
          ])
        },
        markPoint: {
          symbol: 'pin',
          symbolSize: 36,
          itemStyle: { color: '#409eff' },
          label: { color: '#fff', fontSize: 11, formatter: '峰值' },
          data: [{ type: 'max', name: '峰值' }]
        },
        label: {
          show: true,
          position: 'top',
          formatter: (p: any) => isAmount ? `¥${p.value}` : p.value,
          color: '#8a94a6',
          fontSize: 11
        }
      }
    ]
  })
}

// ---------- 支付方式 ----------
function renderPayChart(): void {
  if (!payChart) return
  payChart.setOption({
    tooltip: { trigger: 'item', ...tooltipStyle, formatter: '{b}<br/>订单：{c}（{d}%）' },
    legend: { bottom: 0, left: 'center', icon: 'circle', itemWidth: 10, itemHeight: 10, textStyle: { color: '#8a94a6', fontSize: 12 } },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '45%'],
        itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 3 },
        label: { show: false },
        emphasis: { scale: true, scaleSize: 6 },
        data: [
          { value: 2860, name: '微信支付', itemStyle: { color: '#52b788' } },
          { value: 1920, name: '支付宝', itemStyle: { color: '#409eff' } },
          { value: 860, name: '银行卡', itemStyle: { color: '#e6a23c' } },
          { value: 320, name: '余额支付', itemStyle: { color: '#9254de' } }
        ]
      }
    ]
  })
}

// ---------- 分类排行 ----------
function renderCategoryChart(): void {
  if (!categoryChart) return
  categoryChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(64,158,255,0.06)' } },
      ...tooltipStyle,
      formatter: '{b}<br/>销售额：¥{c}'
    },
    grid: { left: 10, right: 24, bottom: 6, top: 20, containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#8a94a6', fontSize: 12, formatter: '¥{value}' },
      splitLine: { lineStyle: { color: '#f2f4f8' } }
    },
    yAxis: {
      type: 'category',
      data: ['数码', '服饰', '美妆', '食品', '家居', '母婴'],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#6b7686', fontSize: 12 }
    },
    series: [
      {
        type: 'bar',
        barWidth: 16,
        itemStyle: {
          borderRadius: [0, 8, 8, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#409eff' },
            { offset: 1, color: '#7cc0ff' }
          ])
        },
        data: [428000, 296000, 218000, 165000, 132000, 88000],
        label: {
          show: true,
          position: 'right',
          formatter: (p: any) => `¥${(p.value / 1000).toFixed(1)}k`,
          color: '#8a94a6',
          fontSize: 11
        }
      }
    ]
  })
}

// ---------- 数据获取 ----------
async function fetchData(): Promise<void> {
  await new Promise(r => setTimeout(r, 300))
  nextTick(() => {
    if (!trendChart) {
      trendChart = echarts.init(trendChartRef.value!)
      payChart = echarts.init(payChartRef.value!)
      categoryChart = echarts.init(categoryChartRef.value!)
    }
    renderTrendChart()
    renderPayChart()
    renderCategoryChart()
  })
}

function handleExport(): void {
  ElMessage.success('报表导出任务已提交，请稍后在导出记录中下载')
}

function handleResize(): void {
  trendChart?.resize()
  payChart?.resize()
  categoryChart?.resize()
}

onMounted(() => {
  fetchData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  payChart?.dispose()
  categoryChart?.dispose()
})
</script>

<style lang="scss" scoped>
.analytics-sales-page {
  .filter-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
  }

  .filter-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .filter-label {
    font-size: 13px;
    color: #8a94a6;
  }

  .filter-right {
    display: flex;
    gap: 8px;
  }

  // 概览卡
  .stat-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 16px;
    background: #fff;
    border: 1px solid #eef1f6;
    border-radius: 14px;
    box-shadow: 0 2px 8px rgba(31, 45, 61, 0.04);
    margin-bottom: 16px;
    transition: transform 0.25s ease, box-shadow 0.25s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 28px rgba(31, 45, 61, 0.1);
    }

    .stat-inner {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .stat-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--accent-soft);
      color: var(--accent);
      flex-shrink: 0;
    }

    .stat-value {
      font-size: 20px;
      font-weight: 700;
      color: #1f2d3d;
    }

    .stat-label {
      font-size: 12px;
      color: #8a94a6;
    }

    .stat-trend {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding-top: 8px;
      border-top: 1px dashed #eef1f6;
      font-size: 12px;

      &.up { color: #52b788; }
      &.down { color: #f56c6c; }
    }
  }

  // 图表
  .chart-card {
    .chart-box {
      width: 100%;
      height: 300px;
    }
  }

  // 排行
  .rank-badge {
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

    &.rank-1 { color: #fff; background: #f56c6c; }
    &.rank-2 { color: #fff; background: #e6a23c; }
    &.rank-3 { color: #fff; background: #52b788; }
  }

  .product-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .product-thumb {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #409eff;
      flex-shrink: 0;
    }

    .product-name {
      font-size: 13px;
      color: #1f2d3d;
    }
  }

  .amount {
    font-weight: 600;
    color: #1f2d3d;
  }

  .refund {
    color: #f56c6c;
  }

  .trend-up {
    color: #52b788;
    font-weight: 600;
  }

  .trend-down {
    color: #f56c6c;
    font-weight: 600;
  }
}

@media (max-width: 768px) {
  .analytics-sales-page {
    .chart-card .chart-box {
      height: 240px;
    }

    .filter-bar {
      flex-direction: column;
      align-items: stretch;
    }

    .filter-left {
      flex-wrap: wrap;
    }
  }
}
</style>