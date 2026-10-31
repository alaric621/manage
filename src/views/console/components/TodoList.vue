<template>
  <ElCard class="panel-card todo-card" shadow="never">
    <template #header>
      <div class="panel-header">
        <div class="panel-title">
          <span class="title-dot"></span>
          待办事项
        </div>
        <ElTag size="small" type="danger" effect="light" round>
          {{ totalTodo }} 项
        </ElTag>
      </div>
    </template>
    <div class="todo-list">
      <div
        v-for="t in todos"
        :key="t.label"
        class="todo-item"
        @click="handleClick(t.path)"
      >
        <div class="todo-icon" :style="{ background: t.bg, color: t.color }">
          <Icon :icon="t.icon" width="18" />
        </div>
        <div class="todo-info">
          <div class="todo-label">{{ t.label }}</div>
          <div class="todo-desc">{{ t.desc }}</div>
        </div>
        <div class="todo-count" :style="{ color: t.color, background: t.bg }">
          {{ t.count }}
        </div>
      </div>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'

interface TodoItem {
  label: string
  desc: string
  count: number
  icon: string
  color: string
  bg: string
  path: string
}

const router = useRouter()

const todos = computed<TodoItem[]>(() => [
  { label: '待发货订单', desc: '请尽快处理发货', count: 128, icon: 'solar:delivery-bold-duotone', color: '#409eff', bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)', path: '/order/shipping' },
  { label: '待处理售后', desc: '用户售后申请待审核', count: 18, icon: 'solar:refresh-circle-bold-duotone', color: '#f56c6c', bg: 'linear-gradient(135deg, #ffeaea, #ffd6d6)', path: '/order/refund' },
  { label: '待审核评价', desc: '商品评价待审核', count: 36, icon: 'solar:star-bold-duotone', color: '#e6a23c', bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)', path: '/product/review' },
  { label: '库存预警商品', desc: '库存低于预警值', count: 12, icon: 'solar:danger-triangle-bold-duotone', color: '#52b788', bg: 'linear-gradient(135deg, #e6f7ee, #cdf0de)', path: '/product/list' }
])

const totalTodo = computed(() => todos.value.reduce((s, t) => s + t.count, 0))

function handleClick(path: string): void {
  router.push(path)
}
</script>

<style lang="scss" scoped>
$primary: #409eff;
$text-main: #1f2d3d;
$text-secondary: #8a94a6;
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

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: $radius-block;
  background: $bg-soft;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #fff;
    border-color: #dbe7fa;
    transform: translateX(3px);
    box-shadow: 0 6px 16px rgba(64, 158, 255, 0.1);
  }

  .todo-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    @include flex-center;
    flex-shrink: 0;
  }

  .todo-info {
    flex: 1;
    min-width: 0;
  }

  .todo-label {
    font-size: 13px;
    font-weight: 500;
    color: $text-main;
  }

  .todo-desc {
    margin-top: 2px;
    font-size: 12px;
    color: $text-secondary;
  }

  .todo-count {
    min-width: 32px;
    height: 24px;
    padding: 0 8px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    @include flex-center;
    flex-shrink: 0;
  }
}
</style>