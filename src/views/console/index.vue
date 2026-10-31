<template>
  <div class="console-page">
    <!-- 实时概览 -->
    <RealtimeOverview />

    <ElRow :gutter="16">
      <!-- 左：核心指标 -->
      <ElCol :xs="24" :md="16">
        <StatCards />
        <SalesTrend></SalesTrend>
      </ElCol>

      <!-- 右：待办 + 快捷入口 -->
      <ElCol :xs="24" :md="8">
        <TodoList />
        <QuickEntries />
      </ElCol>
    </ElRow>

    <ElRow :gutter="16">
      <ElCol :xs="24" :sm="12" :md="8">
        <OrderStatus />
      </ElCol>
      <ElCol :xs="24" :sm="12" :md="8">
        <HotGoods />
      </ElCol>
      <ElCol :xs="24" :md="8">
        <RecentActivity />
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
import RealtimeOverview from './components/RealtimeOverview.vue'
import StatCards from './components/StatCards.vue'
import TodoList from './components/TodoList.vue'
import QuickEntries from './components/QuickEntries.vue'
import OrderStatus from './components/OrderStatus.vue'
import HotGoods from './components/HotGoods.vue'
import RecentActivity from './components/RecentActivity.vue'
import SalesTrend from './components/SalesTrend.vue'
</script>

<style lang="scss" scoped>
$bg-soft: #f7f9fc;
$gap: 16px;

.console-page {
  padding: $gap;
  // background: $bg-soft;
  min-height: 100%;
}

@media (max-width: 768px) {
  .console-page {
    padding: 12px;
  }
}
</style>