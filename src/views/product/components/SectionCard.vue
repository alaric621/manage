<template>
  <ElCard class="panel-card" shadow="never">
    <template #header>
      <div class="panel-header">
        <div class="panel-title">
          <span class="title-dot"></span>
          {{ title }}
        </div>
        <slot name="extra" />
      </div>
    </template>
    <slot />
  </ElCard>
</template>

<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<style lang="scss" scoped>
$primary: #409eff;
$text-main: #1f2d3d;
$border-light: #eef1f6;
$radius-card: 14px;
$shadow-card: 0 2px 8px rgba(31, 45, 61, 0.04);
$shadow-hover: 0 10px 28px rgba(31, 45, 61, 0.10);

.panel-card {
  border-radius: $radius-card;
  border: 1px solid $border-light;
  box-shadow: $shadow-card;
  margin-bottom: 16px;
  transition: box-shadow 0.25s ease;

  &:hover {
    box-shadow: $shadow-hover;
  }

  :deep(.el-card__header) {
    padding: 14px 18px;
    border-bottom: 1px solid $border-light;
  }

  :deep(.el-card__body) {
    padding: 18px;
  }
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
</style>