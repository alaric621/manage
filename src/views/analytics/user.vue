<template>
  <div class="list-page analytics-user-page">
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

    <ElRow :gutter="16">
      <!-- 会员增长趋势 -->
      <ElCol :xs="24" :md="16">
        <ElCard class="panel-card chart-card" shadow="never">
          <template #header>
            <div class="panel-header">
              <div class="panel-title">
                <span class="title-dot"></span>
                会员增长趋势
                <span class="title-sub">{{ rangeText }}</span>
              </div>
              <ElRadioGroup v-model="growthMetric" size="small" @change="renderGrowthChart">
                <ElRadioButton label="new">新增会员</ElRadioButton>
                <ElRadioButton label="total">累计会员</ElRadioButton>
              </ElRadioGroup>
            </div>
          </template>
          <div ref="growthChartRef" class="chart-box"></div>
        </ElCard>
      </ElCol>

      <!-- 会员等级分布 -->
      <ElCol :xs="24" :md="8">
        <ElCard class="panel-card chart-card" shadow="never">
          <template #header>
            <div class="panel-header">
              <div class="panel-title">
                <span class="title-dot"></span>
                会员等级分布
              </div>
            </div>
          </template>
          <div ref="levelChartRef" class="chart-box"></div>
        </ElCard>
      </ElCol>
    </ElRow>

    <ElRow :gutter="16">
      <!-- 性别 / 年龄分布 -->
      <ElCol :xs="24" :md="12">
        <ElCard class="panel-card chart-card" shadow="never">
          <template #header>
            <div class="panel-header">
              <div class="panel-title">
                <span class="title-dot"></span>
                年龄分布
              </div>
            </div>
          </template>
          <div ref="ageChartRef" class="chart-box"></div>
        </ElCard>
      </ElCol>

      <!-- 消费能力分布 -->
      <ElCol :xs="24" :md="12">
        <ElCard class="panel-card chart-card" shadow="never">
          <template #header>
            <div class="panel-header">
              <div class="panel-title">
                <span class="title-dot"></span>
                消费能力分布
              </div>
            </div>
          </template>
          <div ref="consumeChartRef" class="chart-box"></div>
        </ElCard>
      </ElCol>
    </ElRow>

    <!-- 活跃会员排行 -->
    <ElCard class="panel-card" shadow="never">
      <template #header>
        <div class="panel-header">
          <div class="panel-title">
            <span class="title-dot"></span>
            活跃会员排行
            <span class="title-sub">TOP 10</span>
          </div>
        </div>
      </template>
      <ElTable :data="topMembers" class="pretty-table" size="small">
        <ElTableColumn label="排名" width="70" align="center">
          <template #default="{ $index }">
            <span class="rank-badge" :class="`rank-${$index + 1}`">{{ $index + 1 }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="会员" min-width="200">
          <template #default="{ row }">
            <div class="member-cell">
              <div class="member-avatar" :style="{ background: row.avatarBg }">
                {{ row.name.charAt(0) }}
              </div>
              <div class="member-meta">
                <div class="member-name">
                  {{ row.name }}
                  <ElTag :type="row.levelTagType" size="small" effect="light" round>
                    {{ row.level }}
                  </ElTag>
                </div>
                <div class="member-phone">{{ maskPhone(row.phone) }}</div>
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="orderCount" label="订单数" width="90" align="right" />
        <ElTableColumn label="累计消费" width="130" align="right">
          <template #default="{ row }">
            <span class="amount">¥ {{ row.totalAmount.toLocaleString() }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="points" label="积分" width="100" align="right" />
        <ElTableColumn label="最后登录" width="170">
          <template #default="{ row }">{{ row.lastLogin }}</template>
        </ElTableColumn>
        <ElTableColumn label="活跃度" width="120" align="center">
          <template #default="{ row }">
            <div class="activity-bar">
              <span class="activity-bar-fill" :style="{ width: row.activity + '%' }"></span>
            </div>
            <span class="activity-text">{{ row.activity }}%</span>
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
type GrowthMetric = 'new' | 'total'

interface MemberRow {
  name: string
  phone: string
  avatarBg: string
  level: string
  levelTagType: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  orderCount: number
  totalAmount: number
  points: number
  lastLogin: string
  activity: number
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
const stats = computed(() => [
  { label: '会员总数', value: '12,860', trend: 5.2, icon: 'solar:users-group-rounded-bold-duotone', color: '#409eff', bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
  { label: '新增会员', value: '286', trend: 12.8, icon: 'solar:user-plus-bold-duotone', color: '#52b788', bg: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' },
  { label: '活跃会员', value: '4,860', trend: 8.6, icon: 'solar:user-check-bold-duotone', color: '#e6a23c', bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)' },
  { label: '复购率', value: '38.6%', trend: -2.1, icon: 'solar:refresh-circle-bold-duotone', color: '#9254de', bg: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)' }
])

// ---------- 图表 ref ----------
const growthChartRef = ref<HTMLElement>()
const levelChartRef = ref<HTMLElement>()
const ageChartRef = ref<HTMLElement>()
const consumeChartRef = ref<HTMLElement>()
let growthChart: echarts.ECharts | null = null
let levelChart: echarts.ECharts | null = null
let ageChart: echarts.ECharts | null = null
let consumeChart: echarts.ECharts | null = null

const growthMetric = ref<GrowthMetric>('new')

const tooltipStyle = {
  backgroundColor: 'rgba(255,255,255,0.98)',
  borderColor: '#eef1f6',
  borderWidth: 1,
  padding: [10, 14],
  textStyle: { color: '#1f2d3d', fontSize: 12 },
  extraCssText: 'box-shadow: 0 8px 24px rgba(31,45,61,0.12); border-radius: 10px;'
}

// ---------- 数据 ----------
const topMembers = ref<MemberRow[]>([
  { name: '张三', phone: '13812345678', avatarBg: '#409eff', level: '金卡', levelTagType: 'warning', orderCount: 36, totalAmount: 12860, points: 12860, lastLogin: '2026-10-30 09:12', activity: 96 },
  { name: '李四', phone: '13987654321', avatarBg: '#52b788', level: '钻石', levelTagType: 'danger', orderCount: 86, totalAmount: 35680, points: 35680, lastLogin: '2026-10-29 18:40', activity: 92 },
  { name: '赵六', phone: '13633334444', avatarBg: '#9254de', level: '银卡', levelTagType: 'primary', orderCount: 18, totalAmount: 3860, points: 3860, lastLogin: '2026-10-30 08:22', activity: 88 },
  { name: '周八', phone: '13477778888', avatarBg: '#13c2c2', level: '金卡', levelTagType: 'warning', orderCount: 42, totalAmount: 15600, points: 15600, lastLogin: '2026-10-30 07:50', activity: 86 },
  { name: '吴九', phone: '13222223333', avatarBg: '#e6a23c', level: '银卡', levelTagType: 'primary', orderCount: 22, totalAmount: 5680, points: 5680, lastLogin: '2026-10-29 20:15', activity: 82 },
  { name: '郑十', phone: '13111114444', avatarBg: '#f56c6c', level: '普通', levelTagType: 'info', orderCount: 6, totalAmount: 860, points: 860, lastLogin: '2026-10-29 14:20', activity: 76 },
  { name: '王五', phone: '13711112222', avatarBg: '#e6a23c', level: '普通', levelTagType: 'info', orderCount: 2, totalAmount: 520, points: 520, lastLogin: '2026-10-20 12:00', activity: 62 },
  { name: '孙七', phone: '13555556666', avatarBg: '#f56c6c', level: '普通', levelTagType: 'info', orderCount: 1, totalAmount: 86, points: 86, lastLogin: '2026-09-25 20:05', activity: 48 },
  { name: '钱十一', phone: '13333335555', avatarBg: '#409eff', level: '银卡', levelTagType: 'primary', orderCount: 16, totalAmount: 3280, points: 3280, lastLogin: '2026-10-28 16:30', activity: 72 },
  { name: '冯十二', phone: '13444446666', avatarBg: '#52b788', level: '金卡', levelTagType: 'warning', orderCount: 28, totalAmount: 9680, points: 9680, lastLogin: '2026-10-29 11:20', activity: 80 }
])

function maskPhone(phone: string): string {
  if (phone.length !== 11) return phone
  return `${phone.slice(0, 3)}****${phone.slice(7)}`
}

// ---------- 会员增长趋势 ----------
function renderGrowthChart(): void {
  if (!growthChart) return
  const isNew = growthMetric.value === 'new'
  const newData = [180, 220, 196, 248, 286, 260, 286]
  const totalData = [11860, 12080, 12276, 12524, 12810, 13070, 13356]
  const data = isNew ? newData : totalData

  growthChart.setOption({
    tooltip: {
      trigger: 'axis',
      ...tooltipStyle,
      axisPointer: { type: 'line', lineStyle: { color: '#c6d9f5', type: 'dashed' } }
    },
    grid: { left: 10, right: 20, bottom: 6, top: 40, containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisLine: { lineStyle: { color: '#eef1f6' } },
      axisTick: { show: false },
      axisLabel: { color: '#8a94a6', fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      name: isNew ? '新增会员' : '累计会员',
      nameTextStyle: { color: '#b0b8c7', fontSize: 12 },
      axisLabel: { color: '#8a94a6', fontSize: 12 },
      splitLine: { lineStyle: { color: '#f2f4f8' } }
    },
    series: [
      {
        name: isNew ? '新增会员' : '累计会员',
        type: 'line',
        smooth: true,
        data,
        symbol: 'circle',
        symbolSize: 8,
        showSymbol: false,
        lineStyle: { width: 3, color: '#52b788' },
        itemStyle: { color: '#52b788', borderColor: '#fff', borderWidth: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(82,183,136,0.3)' },
            { offset: 1, color: 'rgba(82,183,136,0.01)' }
          ])
        }
      }
    ]
  })
}

// ---------- 会员等级分布 ----------
function renderLevelChart(): void {
  if (!levelChart) return
  levelChart.setOption({
    tooltip: { trigger: 'item', ...tooltipStyle, formatter: '{b}<br/>会员：{c}（{d}%）' },
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
          { value: 1286, name: '普通会员', itemStyle: { color: '#8a94a6' } },
          { value: 486, name: '银卡会员', itemStyle: { color: '#409eff' } },
          { value: 128, name: '金卡会员', itemStyle: { color: '#e6a23c' } },
          { value: 36, name: '钻石会员', itemStyle: { color: '#f56c6c' } }
        ]
      }
    ]
  })
}

// ---------- 年龄分布 ----------
function renderAgeChart(): void {
  if (!ageChart) return
  ageChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(64,158,255,0.06)' } },
      ...tooltipStyle
    },
    grid: { left: 10, right: 20, bottom: 6, top: 20, containLabel: true },
    xAxis: {
      type: 'category',
      data: ['18-24', '25-30', '31-35', '36-40', '41-50', '50+'],
      axisLine: { lineStyle: { color: '#eef1f6' } },
      axisTick: { show: false },
      axisLabel: { color: '#8a94a6', fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      name: '人数',
      nameTextStyle: { color: '#b0b8c7', fontSize: 12 },
      axisLabel: { color: '#8a94a6', fontSize: 12 },
      splitLine: { lineStyle: { color: '#f2f4f8' } }
    },
    series: [
      {
        type: 'bar',
        barWidth: 22,
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#409eff' },
            { offset: 1, color: '#a8cfff' }
          ])
        },
        data: [2860, 4280, 3260, 1860, 1280, 486]
      }
    ]
  })
}

// ---------- 消费能力分布 ----------
function renderConsumeChart(): void {
  if (!consumeChart) return
  consumeChart.setOption({
    tooltip: { trigger: 'item', ...tooltipStyle, formatter: '{b}<br/>会员：{c}（{d}%）' },
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
          { value: 5860, name: '0-500 元', itemStyle: { color: '#909399' } },
          { value: 3260, name: '500-2000 元', itemStyle: { color: '#409eff' } },
          { value: 1860, name: '2000-5000 元', itemStyle: { color: '#52b788' } },
          { value: 1280, name: '5000-20000 元', itemStyle: { color: '#e6a23c' } },
          { value: 600, name: '20000 元以上', itemStyle: { color: '#f56c6c' } }
        ]
      }
    ]
  })
}

// ---------- 数据获取 ----------
async function fetchData(): Promise<void> {
  await new Promise(r => setTimeout(r, 300))
  nextTick(() => {
    if (!growthChart) {
      growthChart = echarts.init(growthChartRef.value!)
      levelChart = echarts.init(levelChartRef.value!)
      ageChart = echarts.init(ageChartRef.value!)
      consumeChart = echarts.init(consumeChartRef.value!)
    }
    renderGrowthChart()
    renderLevelChart()
    renderAgeChart()
    renderConsumeChart()
  })
}

function handleExport(): void {
  ElMessage.success('报表导出任务已提交，请稍后在导出记录中下载')
}

function handleResize(): void {
  growthChart?.resize()
  levelChart?.resize()
  ageChart?.resize()
  consumeChart?.resize()
}

onMounted(() => {
  fetchData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  growthChart?.dispose()
  levelChart?.dispose()
  ageChart?.dispose()
  consumeChart?.dispose()
})
</script>

<style lang="scss" scoped>
.analytics-user-page {
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

  .member-cell {
    display: flex;
    align-items: center;
    gap: 10px;

    .member-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .member-name {
      display: flex;
      align-items: center;
      gap: 6px;
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

  .amount {
    font-weight: 600;
    color: #1f2d3d;
  }

  // 活跃度
  .activity-bar {
    width: 100%;
    height: 6px;
    background: #eef1f6;
    border-radius: 999px;
    overflow: hidden;
    margin-bottom: 4px;
  }

  .activity-bar-fill {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, #52b788, #7dd3a8);
    border-radius: 999px;
  }

  .activity-text {
    font-size: 12px;
    color: #52b788;
    font-weight: 500;
  }
}

@media (max-width: 768px) {
  .analytics-user-page {
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