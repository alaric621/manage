<template>
  <div
    class="metric-card"
    :style="{ '--accent': metric.color, '--accent-soft': metric.bg }"
  >
    <!-- 头部：图标 + 标签 -->
    <div class="card-header">
      <div class="card-icon">
        <Icon :icon="metric.icon" width="18" />
      </div>
      <span class="card-label">{{ metric.label }}</span>
    </div>

    <!-- 数值 + 涨跌 -->
    <div class="card-body">
      <span class="card-value">{{ metric.value }}</span>
      <span class="card-trend" :class="metric.trend >= 0 ? 'up' : 'down'">
        <Icon
          :icon="metric.trend >= 0 ? 'solar:alt-arrow-up-bold-duotone' : 'solar:alt-arrow-down-bold-duotone'"
          width="12"
        />
        {{ Math.abs(metric.trend) }}%
      </span>
    </div>

    <!-- 迷你趋势图 -->
    <div ref="chartRef" class="mini-chart"></div>

    <div class="card-footer">较上一时段</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import * as echarts from 'echarts'

// ---------- 类型 ----------
export type ChartType = 'line' | 'bar' | 'area'

export interface MetricItem {
  key: string
  label: string
  value: string
  trend: number
  icon: string
  color: string
  bg: string
  unit: string
  series: number[]
}

// ---------- Props ----------
const props = withDefaults(
  defineProps<{
    metric: MetricItem
    /** 图表形状：line / bar / area */
    type?: ChartType
  }>(),
  {
    type: 'area'
  }
)

// ---------- 图表 ----------
const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

function renderChart(): void {
  if (!chart || !props.metric.series.length) return
  const { color, series, label, unit } = props.metric

  let seriesConfig: any

  if (props.type === 'bar') {
    seriesConfig = {
      type: 'bar',
      data: series,
      barWidth: '60%',
      itemStyle: {
        borderRadius: [2, 2, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color },
          { offset: 1, color: `${color}66` }
        ])
      }
    }
  } else if (props.type === 'line') {
    seriesConfig = {
      type: 'line',
      data: series,
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 1.5, color }
    }
  } else {
    // area
    seriesConfig = {
      type: 'line',
      data: series,
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 1.5, color },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: `${color}33` },
          { offset: 1, color: `${color}00` }
        ])
      }
    }
  }

  chart.setOption({
    grid: { left: 0, right: 0, top: 4, bottom: 0 },
    xAxis: {
      type: 'category',
      show: false,
      boundaryGap: props.type === 'bar',
      data: series.map((_, i) => i)
    },
    yAxis: {
      type: 'value',
      show: false,
      min: 'dataMin',
      max: 'dataMax'
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#eef1f6',
      borderWidth: 1,
      padding: [6, 10],
      textStyle: { color: '#1f2d3d', fontSize: 11 },
      extraCssText: 'box-shadow: 0 4px 12px rgba(31,45,61,0.1); border-radius: 8px;',
      formatter: (params: any) => `${label}：${params[0].value}${unit}`,
      axisPointer: { type: props.type === 'bar' ? 'shadow' : 'none' }
    },
    series: [seriesConfig]
  }, true)
}

// ---------- 生命周期 ----------
function initChart(): void {
  nextTick(() => {
    if (chartRef.value && !chart) {
      chart = echarts.init(chartRef.value)
      renderChart()
    }
  })
}

function handleResize(): void {
  chart?.resize()
}

// 数据变化 → 重绘
watch(
  () => props.metric.series,
  () => renderChart(),
  { deep: true }
)

// type 变化 → 重绘
watch(
  () => props.type,
  () => renderChart()
)

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
  chart = null
})
</script>

<style lang="scss" scoped>
$text-main: #1f2d3d;
$text-secondary: #8a94a6;
$border-light: #eef1f6;
$radius-block: 12px;
$shadow-hover: 0 10px 28px rgba(31, 45, 61, 0.1);

.metric-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 14px 14px 10px;
  background: #fff;
//   border: 1px solid $border-light;
//   border-radius: $radius-block;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-hover;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
 //   background: linear-gradient(90deg, var(--accent), transparent 80%);
    opacity: 0.9;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  .card-icon {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--accent-soft);
    color: var(--accent);
    flex-shrink: 0;
  }

  .card-label {
    flex: 1;
    font-size: 12px;
    color: $text-secondary;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-body {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 4px;
  }

  .card-value {
    font-size: 20px;
    font-weight: 700;
    color: $text-main;
    white-space: nowrap;
  }

  .card-trend {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 1px 6px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    flex-shrink: 0;

    &.up {
      color: #52b788;
      background: rgba(82, 183, 136, 0.12);
    }

    &.down {
      color: #f56c6c;
      background: rgba(245, 108, 108, 0.12);
    }
  }

  .mini-chart {
    position: relative;
    width: 100%;
    height: 44px;
    margin: 6px 0 2px;
  }

  .card-footer {
    font-size: 11px;
    color: $text-secondary;
    margin-top: 2px;
  }
}
</style>