<template>
  <div class="list-page analytics-product-page">
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
      <!-- 分类销售占比 -->
      <ElCol :xs="24" :md="12">
        <ElCard class="panel-card chart-card" shadow="never">
          <template #header>
            <div class="panel-header">
              <div class="panel-title">
                <span class="title-dot"></span>
                分类销售占比
              </div>
            </div>
          </template>
          <div ref="categoryChartRef" class="chart-box"></div>
        </ElCard>
      </ElCol>

      <!-- 价格区间分布 -->
      <ElCol :xs="24" :md="12">
        <ElCard class="panel-card chart-card" shadow="never">
          <template #header>
            <div class="panel-header">
              <div class="panel-title">
                <span class="title-dot"></span>
                价格区间销量分布
              </div>
            </div>
          </template>
          <div ref="priceChartRef" class="chart-box"></div>
        </ElCard>
      </ElCol>
    </ElRow>

    <ElRow :gutter="16">
      <!-- 商品转化漏斗 -->
      <ElCol :xs="24" :md="12">
        <ElCard class="panel-card chart-card" shadow="never">
          <template #header>
            <div class="panel-header">
              <div class="panel-title">
                <span class="title-dot"></span>
                商品转化漏斗
              </div>
            </div>
          </template>
          <div ref="funnelChartRef" class="chart-box"></div>
        </ElCard>
      </ElCol>

      <!-- 销量趋势 -->
      <ElCol :xs="24" :md="12">
        <ElCard class="panel-card chart-card" shadow="never">
          <template #header>
            <div class="panel-header">
              <div class="panel-title">
                <span class="title-dot"></span>
                销量趋势
                <span class="title-sub">{{ rangeText }}</span>
              </div>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-box"></div>
        </ElCard>
      </ElCol>
    </ElRow>

    <!-- 商品销售排行 -->
    <ElCard class="panel-card" shadow="never">
      <template #header>
        <div class="panel-header">
          <div class="panel-title">
            <span class="title-dot"></span>
            商品销售排行
            <span class="title-sub">TOP 10</span>
          </div>
        </div>
      </template>
      <ElTable :data="topProducts" class="pretty-table" size="small">
        <ElTableColumn label="排名" width="70" align="center">
          <template #default="{ $index }">
            <span class="rank-badge" :class="`rank-${$index + 1}`">{{ $index + 1 }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="商品" min-width="220">
          <template #default="{ row }">
            <div class="product-cell">
              <div class="product-thumb" :style="{ background: row.thumb }">
                <Icon :icon="row.icon" width="18" />
              </div>
              <div class="product-meta">
                <div class="product-name">{{ row.name }}</div>
                <div class="product-category">{{ row.category }}</div>
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="售价" width="100" align="right">
          <template #default="{ row }">¥ {{ row.price.toFixed(2) }}</template>
        </ElTableColumn>
        <ElTableColumn prop="sales" label="销量" width="90" align="right" />
        <ElTableColumn label="销售额" width="120" align="right">
          <template #default="{ row }">
            <span class="amount">¥ {{ row.amount.toLocaleString() }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="库存" width="90" align="right">
          <template #default="{ row }">
            <span :class="{ 'stock-low': row.stock < 100 }">{{ row.stock }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="转化率" width="100" align="center">
          <template #default="{ row }">
            <span class="rate">{{ row.rate }}%</span>
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

interface ProductRow {
  name: string
  category: string
  price: number
  sales: number
  amount: number
  stock: number
  rate: number
  growth: number
  icon: string
  thumb: string
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
  { label: '在售商品', value: '1,286', trend: 3.2, icon: 'solar:box-bold-duotone', color: '#409eff', bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
  { label: '动销商品', value: '986', trend: 8.6, icon: 'solar:cart-large-bold-duotone', color: '#52b788', bg: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' },
  { label: '滞销商品', value: '126', trend: -2.4, icon: 'solar:danger-triangle-bold-duotone', color: '#e6a23c', bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)' },
  { label: '库存预警', value: '36', trend: 5.8, icon: 'solar:bell-bing-bold-duotone', color: '#f56c6c', bg: 'linear-gradient(135deg, #ffeaea, #ffd6d6)' }
])

// ---------- 图表 ref ----------
const categoryChartRef = ref<HTMLElement>()
const priceChartRef = ref<HTMLElement>()
const funnelChartRef = ref<HTMLElement>()
const trendChartRef = ref<HTMLElement>()
let categoryChart: echarts.ECharts | null = null
let priceChart: echarts.ECharts | null = null
let funnelChart: echarts.ECharts | null = null
let trendChart: echarts.ECharts | null = null

const tooltipStyle = {
  backgroundColor: 'rgba(255,255,255,0.98)',
  borderColor: '#eef1f6',
  borderWidth: 1,
  padding: [10, 14],
  textStyle: { color: '#1f2d3d', fontSize: 12 },
  extraCssText: 'box-shadow: 0 8px 24px rgba(31,45,61,0.12); border-radius: 10px;'
}

// ---------- 数据 ----------
const topProducts = ref<ProductRow[]>([
  { name: '无线蓝牙耳机 Pro', category: '数码 / 音频', price: 399, sales: 1286, amount: 512400, stock: 1286, rate: 8.6, growth: 15.2, icon: 'solar:headphones-round-sound-bold-duotone', thumb: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
  { name: '智能手表 S9', category: '数码 / 穿戴', price: 899, sales: 986, amount: 886400, stock: 986, rate: 6.8, growth: 8.4, icon: 'solar:watch-square-bold-duotone', thumb: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' },
  { name: '便携充电宝 20000mAh', category: '数码 / 配件', price: 129, sales: 872, amount: 112488, stock: 72, rate: 12.4, growth: 22.6, icon: 'solar:battery-charge-bold-duotone', thumb: 'linear-gradient(135deg, #fff4e6, #ffe4c4)' },
  { name: '轻薄羽绒服', category: '服饰 / 外套', price: 599, sales: 756, amount: 452844, stock: 756, rate: 5.6, growth: -3.2, icon: 'solar:bag-smile-bold-duotone', thumb: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)' },
  { name: '保湿精华液 50ml', category: '美妆 / 护肤', price: 299, sales: 643, amount: 192257, stock: 643, rate: 9.8, growth: 12.4, icon: 'solar:magic-stick-3-bold-duotone', thumb: 'linear-gradient(135deg, #ffeaea, #ffd6d6)' },
  { name: '有机坚果礼盒', category: '食品 / 零食', price: 168, sales: 521, amount: 87528, stock: 45, rate: 7.2, growth: 4.6, icon: 'solar:gift-bold-duotone', thumb: 'linear-gradient(135deg, #fff9e6, #ffefc2)' },
  { name: '北欧风陶瓷餐具', category: '家居 / 餐厨', price: 258, sales: 398, amount: 102684, stock: 312, rate: 4.8, growth: -1.2, icon: 'solar:cup-bold-duotone', thumb: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
  { name: '婴儿纸尿裤 L 码', category: '母婴 / 用品', price: 139, sales: 367, amount: 51013, stock: 86, rate: 6.4, growth: 3.8, icon: 'solar:hearts-bold-duotone', thumb: 'linear-gradient(135deg, #ffeaea, #ffd6d6)' },
  { name: '运动跑步鞋', category: '服饰 / 鞋类', price: 499, sales: 312, amount: 155688, stock: 186, rate: 5.2, growth: 18.6, icon: 'solar:running-round-bold-duotone', thumb: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' },
  { name: '真皮手提包', category: '服饰 / 箱包', price: 800, sales: 286, amount: 228800, stock: 96, rate: 4.6, growth: 6.2, icon: 'solar:bag-smile-bold-duotone', thumb: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)' }
])

// ---------- 分类占比 ----------
function renderCategoryChart(): void {
  if (!categoryChart) return
  categoryChart.setOption({
    tooltip: { trigger: 'item', ...tooltipStyle, formatter: '{b}<br/>销售额：¥{c}（{d}%）' },
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
          { value: 428000, name: '数码', itemStyle: { color: '#409eff' } },
          { value: 296000, name: '服饰', itemStyle: { color: '#52b788' } },
          { value: 218000, name: '美妆', itemStyle: { color: '#e6a23c' } },
          { value: 165000, name: '食品', itemStyle: { color: '#9254de' } },
          { value: 132000, name: '家居', itemStyle: { color: '#13c2c2' } },
          { value: 88000, name: '母婴', itemStyle: { color: '#f56c6c' } }
        ]
      }
    ]
  })
}

// ---------- 价格区间分布 ----------
function renderPriceChart(): void {
  if (!priceChart) return
  priceChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(64,158,255,0.06)' } },
      ...tooltipStyle,
      formatter: '{b}<br/>销量：{c}'
    },
    grid: { left: 10, right: 20, bottom: 6, top: 20, containLabel: true },
    xAxis: {
      type: 'category',
      data: ['0-50', '50-100', '100-300', '300-500', '500-1000', '1000+'],
      axisLine: { lineStyle: { color: '#eef1f6' } },
      axisTick: { show: false },
      axisLabel: { color: '#8a94a6', fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      name: '销量',
      nameTextStyle: { color: '#b0b8c7', fontSize: 12 },
      axisLabel: { color: '#8a94a6', fontSize: 12 },
      splitLine: { lineStyle: { color: '#f2f4f8' } }
    },
    series: [
      {
        type: 'bar',
        barWidth: 24,
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#52b788' },
            { offset: 1, color: '#a8e6c7' }
          ])
        },
        data: [186, 428, 1860, 862, 326, 128]
      }
    ]
  })
}

// ---------- 转化漏斗 ----------
function renderFunnelChart(): void {
  if (!funnelChart) return
  funnelChart.setOption({
    tooltip: { trigger: 'item', ...tooltipStyle, formatter: '{b}：{c}' },
    series: [
      {
        type: 'funnel',
        left: '10%',
        right: '10%',
        top: 20,
        bottom: 20,
        minSize: '20%',
        label: {
          show: true,
          position: 'inside',
          formatter: '{b}\n{c}',
          color: '#fff',
          fontSize: 12
        },
        itemStyle: { borderColor: '#fff', borderWidth: 2 },
        data: [
          { value: 18600, name: '商品曝光', itemStyle: { color: '#409eff' } },
          { value: 8420, name: '点击详情', itemStyle: { color: '#52b788' } },
          { value: 3260, name: '加入购物车', itemStyle: { color: '#e6a23c' } },
          { value: 1286, name: '提交订单', itemStyle: { color: '#9254de' } },
          { value: 986, name: '完成支付', itemStyle: { color: '#f56c6c' } }
        ]
      }
    ]
  })
}

// ---------- 销量趋势 ----------
function renderTrendChart(): void {
  if (!trendChart) return
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
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisLine: { lineStyle: { color: '#eef1f6' } },
      axisTick: { show: false },
      axisLabel: { color: '#8a94a6', fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      name: '销量',
      nameTextStyle: { color: '#b0b8c7', fontSize: 12 },
      axisLabel: { color: '#8a94a6', fontSize: 12 },
      splitLine: { lineStyle: { color: '#f2f4f8' } }
    },
    series: [
      {
        name: '销量',
        type: 'line',
        smooth: true,
        data: [820, 960, 900, 1120, 1286, 1420, 1286],
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
        }
      },
      {
        name: '销售额（百元）',
        type: 'line',
        smooth: true,
        data: [520, 610, 580, 720, 860, 980, 864],
        symbol: 'circle',
        symbolSize: 8,
        showSymbol: false,
        lineStyle: { width: 3, color: '#52b788' },
        itemStyle: { color: '#52b788', borderColor: '#fff', borderWidth: 2 }
      }
    ]
  })
}

// ---------- 数据获取 ----------
async function fetchData(): Promise<void> {
  await new Promise(r => setTimeout(r, 300))
  nextTick(() => {
    if (!categoryChart) {
      categoryChart = echarts.init(categoryChartRef.value!)
      priceChart = echarts.init(priceChartRef.value!)
      funnelChart = echarts.init(funnelChartRef.value!)
      trendChart = echarts.init(trendChartRef.value!)
    }
    renderCategoryChart()
    renderPriceChart()
    renderFunnelChart()
    renderTrendChart()
  })
}

function handleExport(): void {
  ElMessage.success('报表导出任务已提交，请稍后在导出记录中下载')
}

function handleResize(): void {
  categoryChart?.resize()
  priceChart?.resize()
  funnelChart?.resize()
  trendChart?.resize()
}

onMounted(() => {
  fetchData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  categoryChart?.dispose()
  priceChart?.dispose()
  funnelChart?.dispose()
  trendChart?.dispose()
})
</script>

<style lang="scss" scoped>
.analytics-product-page {
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
    gap: 10px;

    .product-thumb {
      width: 36px;
      height: 36px;
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
      font-weight: 500;
    }

    .product-category {
      margin-top: 2px;
      font-size: 12px;
      color: #8a94a6;
    }
  }

  .amount {
    font-weight: 600;
    color: #1f2d3d;
  }

  .stock-low {
    color: #f56c6c;
    font-weight: 600;
  }

  .rate {
    color: #409eff;
    font-weight: 600;
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
  .analytics-product-page {
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