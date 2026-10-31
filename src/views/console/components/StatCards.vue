<template>
  <ElRow :gutter="16">
    <ElCol v-for="s in statCards" :key="s.metric.key" :xs="12" :sm="12" :md="6">
      <MetricCard
        :metric="s.metric"
        type="area"
        :show-spark="true"
        :footer="s.footer"
        :selectable="s.selectable"
        :active="modelValue === s.metric.key"
        @select="handleSelect"
      />
    </ElCol>
  </ElRow>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MetricCard from './MetricCard.vue'
import type { MetricItem } from './MetricCard.vue'

// ---------- 类型 ----------
export type MetricType = 'sales' | 'orders' | 'visitors'

// ---------- v-model ----------
const modelValue = defineModel<MetricType>({ default: 'sales' })

// ---------- 指标数据 ----------
interface StatCardConfig {
  metric: MetricItem
  selectable: boolean
  footer: string
}

const statCards = computed<StatCardConfig[]>(() => [
  {
    selectable: true,
    footer: '较昨日',
    metric: {
      key: 'sales',
      label: '今日销售额',
      value: '¥86,420',
      trend: 12.8,
      icon: 'solar:wallet-money-bold-duotone',
      color: '#409eff',
      bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)',
      unit: '元',
      series: [52000, 61000, 58000, 72000, 86000, 98000, 86420]
    }
  },
  {
    selectable: true,
    footer: '较昨日',
    metric: {
      key: 'orders',
      label: '今日订单数',
      value: '1,286',
      trend: 5.2,
      icon: 'solar:cart-large-bold-duotone',
      color: '#52b788',
      bg: 'linear-gradient(135deg, #e6f7ee, #cdf0de)',
      unit: '单',
      series: [820, 960, 900, 1120, 1286, 1420, 1286]
    }
  },
  {
    selectable: true,
    footer: '较昨日',
    metric: {
      key: 'visitors',
      label: '今日访客数',
      value: '12,600',
      trend: 8.6,
      icon: 'solar:users-group-rounded-bold-duotone',
      color: '#e6a23c',
      bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)',
      unit: '人',
      series: [8600, 9200, 8800, 10200, 11800, 13200, 12600]
    }
  },
  {
    selectable: false,
    footer: '较昨日',
    metric: {
      key: 'avgPrice',
      label: '客单价',
      value: '¥268.50',
      trend: -2.4,
      icon: 'solar:graph-up-bold-duotone',
      color: '#f56c6c',
      bg: 'linear-gradient(135deg, #ffeaea, #ffd6d6)',
      unit: '元',
      series: [260, 270, 268, 272, 275, 270, 268.5]
    }
  }
])

function handleSelect(key: string): void {
  modelValue.value = key as MetricType
}
</script>