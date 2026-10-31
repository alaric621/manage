<template>
  <ElCard class="panel-card chart-card" shadow="never">
    <template #header>
      <div class="panel-header">
        <div class="panel-title">
          <span class="title-dot"></span>
          {{ metricLabel }}趋势
          <span class="title-sub">{{ rangeText }}</span>
          <ElTag v-if="hasCompare" size="small" type="primary" effect="light" round class="compare-tag">
            对比上期
          </ElTag>
        </div>
        <div class="header-actions">
          <div class="compare-switch">
            <ElSwitch v-model="hasCompare" size="small" @change="renderChart" />
            <span class="compare-label">对比上期</span>
          </div>
          <ElRadioGroup v-model="range" size="small" @change="renderChart">
            <ElRadioButton label="7d">近7天</ElRadioButton>
            <ElRadioButton label="30d">近30天</ElRadioButton>
          </ElRadioGroup>
        </div>
      </div>
    </template>

    <div class="chart-wrap">
      <div ref="chartRef" class="chart-box"></div>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'

// ---------- 类型 ----------
type RangeType = '7d' | '30d'
type MetricType = 'sales' | 'orders' | 'visitors'

interface TrendData {
  x: string[]
  sales: number[]
  orders: number[]
  visitors: number[]
}

// ---------- Props ----------
const props = withDefaults(
  defineProps<{
    metric?: MetricType
  }>(),
  {
    metric: 'sales'
  }
)

// ---------- 状态 ----------
const range = ref<RangeType>('7d')
const hasCompare = ref(false)
const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

// ---------- 数据 ----------
const data7d: TrendData = {
  x: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  sales: [52000, 61000, 58000, 72000, 86000, 98000, 86420],
  orders: [820, 960, 900, 1120, 1286, 1420, 1286],
  visitors: [8600, 9200, 8800, 10200, 11800, 13200, 12600]
}

const data30d: TrendData = {
  x: Array.from({ length: 30 }, (_, i) => `${i + 1}日`),
  sales: Array.from({ length: 30 }, () => Math.round(50000 + Math.random() * 50000)),
  orders: Array.from({ length: 30 }, () => Math.round(800 + Math.random() * 800)),
  visitors: Array.from({ length: 30 }, () => Math.round(8000 + Math.random() * 6000))
}

const prevData7d: TrendData = {
  x: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  sales: [46000, 55000, 52000, 64000, 76000, 88000, 78000],
  orders: [720, 860, 820, 1020, 1120, 1260, 1140],
  visitors: [7800, 8400, 8000, 9200, 10800, 11800, 11200]
}

const prevData30d: TrendData = {
  x: Array.from({ length: 30 }, (_, i) => `${i + 1}日`),
  sales: Array.from({ length: 30 }, () => Math.round(45000 + Math.random() * 45000)),
  orders: Array.from({ length: 30 }, () => Math.round(700 + Math.random() * 700)),
  visitors: Array.from({ length: 30 }, () => Math.round(7000 + Math.random() * 5000))
}

const currentData = computed<TrendData>(() => (range.value === '7d' ? data7d : data30d))
const prevData = computed<TrendData>(() => (range.value === '7d' ? prevData7d : prevData30d))
const rangeText = computed(() => (range.value === '7d' ? '近 7 天' : '近 30 天'))

const metricLabel = computed(() => {
  const map: Record<MetricType, string> = { sales: '销售额', orders: '订单数', visitors: '访客数' }
  return map[props.metric]
})

const metricUnit = computed(() => {
  const map: Record<MetricType, string> = { sales: '元', orders: '单', visitors: '人' }
  return map[props.metric]
})

const metricColor = computed(() => {
  const map: Record<MetricType, string> = { sales: '#409eff', orders: '#52b788', visitors: '#e6a23c' }
  return map[props.metric]
})

const currentSeries = computed(() => {
  const d = currentData.value
  return props.metric === 'sales' ? d.sales : props.metric === 'orders' ? d.orders : d.visitors
})

const prevSeries = computed(() => {
  const d = prevData.value
  return props.metric === 'sales' ? d.sales : props.metric === 'orders' ? d.orders : d.visitors
})

// ---------- 图表 ----------
function renderChart(): void {
  if (!chart) return
  const series = currentSeries.value
  const prev = prevSeries.value
  const data = currentData.value
  const color = metricColor.value
  const isSales = props.metric === 'sales'
  const avg = series.reduce((s, v) => s + v, 0) / series.length

  const seriesList: any[] = [
    {
      name: metricLabel.value,
      type: 'line',
      smooth: true,
      data: series,
      symbol: 'circle',
      symbolSize: 8,
      showSymbol: false,
      lineStyle: {
        width: 3,
        color,
        shadowBlur: 8,
        shadowColor: `${color}33`,
        shadowOffsetY: 4
      },
      itemStyle: { color, borderColor: '#fff', borderWidth: 2 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: `${color}44` },
          { offset: 1, color: `${color}03` }
        ])
      },
      markPoint: {
        symbol: 'circle',
        symbolSize: 10,
        itemStyle: {
          color: '#f56c6c',
          borderColor: '#fff',
          borderWidth: 2,
          shadowBlur: 8,
          shadowColor: 'rgba(245,108,108,0.4)'
        },
        label: {
          show: true,
          position: 'top',
          formatter: (p: any) => isSales ? `¥${p.value.toLocaleString()}` : p.value.toLocaleString(),
          color: '#f56c6c',
          fontSize: 11,
          fontWeight: 600
        },
        data: [{ type: 'max', name: '峰值' }]
      },
      markLine: {
        silent: true,
        symbol: 'none',
        lineStyle: { color: '#c0c4cc', type: 'dashed', width: 1 },
        label: {
          show: true,
          position: 'insideEndTop',
          formatter: `均值 ${isSales ? '¥' : ''}${Math.round(avg).toLocaleString()}`,
          color: '#8a94a6',
          fontSize: 11,
          backgroundColor: 'rgba(255,255,255,0.9)',
          padding: [2, 6],
          borderRadius: 4
        },
        data: [{ yAxis: avg }]
      }
    }
  ]

  if (hasCompare.value) {
    seriesList.push({
      name: '上期',
      type: 'line',
      smooth: true,
      data: prev,
      symbol: 'none',
      lineStyle: { width: 2, color: '#c0c4cc', type: 'dashed' },
      itemStyle: { color: '#c0c4cc' }
    })
  }

  chart.setOption({
    toolbox: {
      right: 12,
      top: 4,
      itemSize: 14,
      itemGap: 14,
      feature: {
        magicType: {
          type: ['line', 'bar', 'stack'],
          title: { line: '折线', bar: '柱状', stack: '堆叠' }
        },
        dataView: {
          readOnly: true,
          title: '数据',
          lang: ['数据视图', '关闭', '刷新']
        },
        saveAsImage: {
          title: '保存',
          name: `${metricLabel.value}趋势`,
          pixelRatio: 2
        }
      },
      iconStyle: { borderColor: '#b0b8c7', borderWidth: 1.2 },
      emphasis: { iconStyle: { borderColor: color, borderWidth: 1.5 } }
    },
    legend: {
      left: 0,
      top: 0,
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 16,
      textStyle: { color: '#8a94a6', fontSize: 12 },
      data: hasCompare.value
        ? [{ name: metricLabel.value }, { name: '上期' }]
        : [{ name: metricLabel.value }]
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.98)',
      borderColor: '#eef1f6',
      borderWidth: 1,
      padding: [10, 14],
      textStyle: { color: '#1f2d3d', fontSize: 12 },
      extraCssText: 'box-shadow: 0 8px 24px rgba(31,45,61,0.12); border-radius: 10px;',
      axisPointer: { type: 'line', lineStyle: { color: '#c6d9f5', type: 'dashed', width: 1 } },
      formatter: (params: any[]) => {
        const lines = [
          `<div style="font-weight:600;margin-bottom:6px;color:#1f2d3d">${params[0].axisValue}</div>`
        ]
        params.forEach(p => {
          const val = isSales ? '¥' + p.value.toLocaleString() : p.value.toLocaleString()
          lines.push(
            `<div style="display:flex;align-items:center;gap:8px;padding:2px 0">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color}"></span>
              <span style="color:#8a94a6;flex:1">${p.seriesName}</span>
              <span style="font-weight:600;color:#1f2d3d;margin-left:12px">${val} ${metricUnit.value}</span>
            </div>`
          )
        })
        return lines.join('')
      }
    },
    dataZoom: range.value === '30d'
      ? [
          { type: 'inside', start: 0, end: 100 },
          {
            type: 'slider',
            height: 18,
            bottom: 4,
            start: 0,
            end: 100,
            borderColor: '#eef1f6',
            backgroundColor: '#f7f9fc',
            fillerColor: 'rgba(64,158,255,0.12)',
            handleStyle: { color: '#fff', borderColor: '#409eff', borderWidth: 2 },
            moveHandleStyle: { color: '#409eff' },
            textStyle: { color: '#8a94a6', fontSize: 11 }
          }
        ]
      : [],
    grid: {
      left: 4,
      right: 16,
      bottom: range.value === '30d' ? 44 : 6,
      top: 44,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.x,
      axisLine: { lineStyle: { color: '#eef1f6' } },
      axisTick: { show: false },
      axisLabel: { color: '#8a94a6', fontSize: 12, margin: 12 }
    },
    yAxis: {
      type: 'value',
      name: metricLabel.value,
      nameTextStyle: { color: '#b0b8c7', fontSize: 12, padding: [0, 0, 8, 0] },
      axisLabel: {
        color: '#8a94a6',
        fontSize: 12,
        margin: 12,
        formatter: (v: number) => isSales ? `¥${v}` : v
      },
      splitLine: { lineStyle: { color: '#f2f4f8', type: 'dashed' } }
    },
    series: seriesList
  }, true)
}

// ---------- 初始化 ----------
function initChart(): void {
  nextTick(() => {
    if (chartRef.value && !chart) {
      chart = echarts.init(chartRef.value)
      renderChart()
    }
  })
}

// metric 变化 → 重绘
watch(
  () => props.metric,
  () => renderChart()
)

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
  flex-wrap: wrap;
  gap: 8px;
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
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 400;
    color: $text-secondary;
    background: #f7f9fc;
    border-radius: 999px;
  }

  .compare-tag {
    margin-left: 4px;
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.compare-switch {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  .compare-label {
    font-size: 12px;
    color: $text-secondary;
  }
}

.chart-wrap {
  position: relative;
  width: 100%;
  height: 320px;
}

.chart-box {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

@media (max-width: 768px) {
  .panel-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .chart-wrap {
    height: 260px;
  }
}
</style>