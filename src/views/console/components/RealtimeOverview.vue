<template>
  <div class="realtime-overview">
    <!-- 头部 -->
    <div class="overview-header">
      <div class="overview-title">
        <span class="title-dot"></span>
        实时概览
        <span class="title-sub">近 60 分钟</span>
      </div>
      <div class="overview-live">
        <span class="live-dot"></span>
        实时更新
      </div>
    </div>

    <!-- 卡片网格：每张卡片独立传入 type -->
    <div class="overview-grid">
      <MetricCard
        v-for="m in metrics"
        :key="m.key"
        :metric="m.metric"
        :type="m.type"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import MetricCard from './MetricCard.vue'
import type { MetricItem, ChartType } from './MetricCard.vue'

// ---------- 配置：每张卡片可指定独立 type ----------
interface MetricSlot {
  key: string
  metric: MetricItem
  type: ChartType
}

interface MetricConfig {
  key: string
  label: string
  value: string
  trend: number
  icon: string
  color: string
  bg: string
  unit: string
  base: number
  range: number
  type: ChartType
}

const metricConfigs: MetricConfig[] = [
  { key: 'visitors', label: '实时访客', value: '3,286', trend: 12.5, icon: 'solar:users-group-rounded-bold-duotone', color: '#409eff', bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)', unit: '人', base: 3000, range: 500, type: 'area' },
  { key: 'conversion', label: '支付转化率', value: '4.8%', trend: 0.6, icon: 'solar:graph-up-bold-duotone', color: '#52b788', bg: 'linear-gradient(135deg, #e6f7ee, #cdf0de)', unit: '%', base: 4.5, range: 0.8, type: 'bar' },
  { key: 'avgPrice', label: '客单价', value: '¥268.50', trend: -2.1, icon: 'solar:wallet-money-bold-duotone', color: '#e6a23c', bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)', unit: '元', base: 260, range: 30, type: 'line' },
  { key: 'refund', label: '退款率', value: '1.2%', trend: -0.3, icon: 'solar:refresh-circle-bold-duotone', color: '#f56c6c', bg: 'linear-gradient(135deg, #ffeaea, #ffd6d6)', unit: '%', base: 1.2, range: 0.4, type: 'area' }
]

// ---------- 生成迷你趋势数据 ----------
function generateSeries(base: number, range: number, points = 20): number[] {
  const arr: number[] = []
  for (let i = 0; i < points; i++) {
    arr.push(Number((base + (Math.random() - 0.5) * range * 2).toFixed(2)))
  }
  return arr
}

// ---------- 组装数据 ----------
function buildSlots(): MetricSlot[] {
  return metricConfigs.map(c => ({
    key: c.key,
    type: c.type,
    metric: {
      key: c.key,
      label: c.label,
      value: c.value,
      trend: c.trend,
      icon: c.icon,
      color: c.color,
      bg: c.bg,
      unit: c.unit,
      series: generateSeries(c.base, c.range)
    }
  }))
}

const metrics = ref<MetricSlot[]>(buildSlots())

// ---------- 自动刷新 ----------
let refreshTimer: number | null = null

function refreshAll(): void {
  metrics.value = metrics.value.map((slot, idx) => {
    const cfg = metricConfigs[idx]
    const delta = (Math.random() - 0.5) * 0.04
    const newTrend = Number((slot.metric.trend + delta).toFixed(1))
    return {
      ...slot,
      metric: {
        ...slot.metric,
        trend: Math.max(-20, Math.min(20, newTrend)),
        series: generateSeries(cfg.base, cfg.range)
      }
    }
  })
}

onMounted(() => {
  refreshTimer = window.setInterval(refreshAll, 30000)
})

onBeforeUnmount(() => {
  if (refreshTimer) window.clearInterval(refreshTimer)
})
</script>

<style lang="scss" scoped>
$primary: #409eff;
$text-main: #1f2d3d;
$text-secondary: #8a94a6;
$border-light: #eef1f6;
$radius-card: 14px;
$shadow-card: 0 2px 8px rgba(31, 45, 61, 0.04);

.realtime-overview {
  background: #fff;
  border: 1px solid $border-light;
  border-radius: $radius-card;
  box-shadow: $shadow-card;
  padding: 16px 20px;
  margin-bottom: 16px;
}

.overview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 14px;
}

.overview-title {
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

.overview-live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  font-size: 12px;
  color: #52b788;
  background: rgba(82, 183, 136, 0.1);
  border-radius: 999px;

  .live-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #52b788;
    box-shadow: 0 0 0 3px rgba(82, 183, 136, 0.18);
    animation: pulse 1.8s ease-in-out infinite;
  }
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 3px rgba(82, 183, 136, 0.18); }
  50% { box-shadow: 0 0 0 6px rgba(82, 183, 136, 0.06); }
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

@media (max-width: 1200px) {
  .overview-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .realtime-overview {
    padding: 14px;
  }

  .overview-grid {
    grid-template-columns: 1fr;
  }
}
</style>