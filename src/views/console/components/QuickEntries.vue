<template>
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
        @click="handleClick(q.path)"
      >
        <div class="entry-icon" :style="{ background: q.bg, color: q.color }">
          <Icon :icon="q.icon" width="20" />
        </div>
        <span class="entry-label">{{ q.label }}</span>
      </div>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'

interface QuickEntry {
  label: string
  path: string
  icon: string
  color: string
  bg: string
}

const router = useRouter()

const quickEntries = computed<QuickEntry[]>(() => [
  { label: '商品管理', path: '/product/list', icon: 'solar:box-bold-duotone', color: '#409eff', bg: '#e8f3ff' },
  { label: '订单管理', path: '/order/list', icon: 'solar:document-bold-duotone', color: '#52b788', bg: '#e6f7ee' },
  { label: '会员管理', path: '/user/list', icon: 'solar:users-group-rounded-bold-duotone', color: '#e6a23c', bg: '#fff4e6' },
  { label: '营销管理', path: '/marketing/coupon', icon: 'solar:chart-2-bold-duotone', color: '#9254de', bg: '#f3e8ff' },
  { label: '数据统计', path: '/analytics/sales', icon: 'solar:graph-up-bold-duotone', color: '#13c2c2', bg: '#e6fffb' },
  { label: '系统设置', path: '/settings/general', icon: 'solar:settings-bold-duotone', color: '#8a94a6', bg: '#f5f7fa' }
])

function handleClick(path: string): void {
  router.push(path)
}
</script>

<style lang="scss" scoped>
$primary: #409eff;
$text-main: #1f2d3d;
$text-regular: #5a6472;
$border-light: #eef1f6;
$bg-soft: #f7f9fc;
$radius-card: 14px;
$radius-block: 12px;
$gap: 16px;
$shadow-card: 0 2px 8px rgba(31, 45, 61, 0.04);
$shadow-hover: 0 10px 28px rgba(31, 45, 61, 0.1);

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
}

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

@media (max-width: 768px) {
  .quick-entry-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>