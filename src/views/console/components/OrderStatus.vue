<template>
  <ElCard class="panel-card chart-card small-chart" shadow="never">
    <template #header>
      <div class="panel-header">
        <div class="panel-title">
          <span class="title-dot"></span>
          订单状态分布
        </div>
        <div class="header-extra">
          <ElTag size="small" effect="plain" round>总 {{ totalOrders.toLocaleString() }}</ElTag>
        </div>
      </div>
    </template>
    <div class="chart-wrap">
      <div ref="chartRef" class="chart-box"></div>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'

// ---------- 类型 ----------
interface OrderStatusItem {
  name: string
  value: number
  color: string
}

// ---------- 数据 ----------
const statusData: OrderStatusItem[] = [
  { name: '待付款', value: 820, color: '#e6a23c' },
  { name: '待发货', value: 1100, color: '#409eff' },
  { name: '已发货', value: 960, color: '#52b788' },
  { name: '已完成', value: 2400, color: '#909399' },
  { name: '售后中', value: 18, color: '#f56c6c' }
]

const totalOrders = computed(() => statusData.reduce((s, d) => s + d.value, 0))

// ---------- 图表 ----------
const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

const tooltipStyle = {
  backgroundColor: 'rgba(255,255,255,0.98)',
  borderColor: '#eef1f6',
  borderWidth: 1,
  padding: [10, 14],
  textStyle: { color: '#1f2d3d', fontSize: 12 },
  extraCssText: 'box-shadow: 0 8px 24px rgba(31,45,61,0.12); border-radius: 10px;'
}

function renderChart(): void {
  if (!chart) return

  chart.setOption({
    tooltip: {
      trigger: 'item',
      ...tooltipStyle,
      formatter: '{b}<br/>订单：{c}（{d}%）'
    },
    legend: {
      bottom: 0,
      left: 'center',
      icon: 'circle',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 12,
      textStyle: { color: '#8a94a6', fontSize: 12 }
    },
    title: {
      text: totalOrders.value.toLocaleString(),
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
        data: statusData.map(d => ({
          value: d.value,
          name: d.name,
          itemStyle: { color: d.color }
        }))
      }
    ]
  })
}

function initChart(): void {
  nextTick(() => {
    if (chartRef.value && !chart) {
      chart = echarts.init(chartRef.value)
      renderChart()
    }
  })
}

let resizeTimer: number | null = null
function handleResize(): void {
  if (resizeTimer) window.clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(() => chart?.resize(), 200)
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (resizeTimer) window.clearTimeout(resizeTimer)
  chart?.dispose()
  chart = null
})
</script>

<style lang="scss" scoped>
$primary: #409eff;
$text-main: #1f2d3d;
$text-secondary: #8a94a6;
$border-light: #eef1f6;
$radius-card: 14px;
$gap: 16px;
$shadow-card: 0 2px 8px rgba(31, 45, 61, 0.04);
$shadow-hover: 0 10px 28px rgba(31, 45, 61, 0.1);

@mixin flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

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
    padding: 12px 18px 16px;
    overflow: hidden;
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
}

.header-extra {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: $text-secondary;
}

.chart-wrap {
  position: relative;
  width: 100%;
  height: 280px;
}

.chart-box {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

@media (max-width: 768px) {
  .chart-wrap {
    height: 220px !important;
  }
}
</style>