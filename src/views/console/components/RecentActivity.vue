<template>
  <ElCard class="panel-card activity-card" shadow="never">
    <template #header>
      <div class="panel-header">
        <div class="panel-title">
          <span class="title-dot"></span>
          最近动态
        </div>
        <ElLink type="primary" :underline="false" @click="handleMore">
          全部 <Icon icon="solar:alt-arrow-right-bold-duotone" width="12" />
        </ElLink>
      </div>
    </template>

    <ElTimeline class="activity-timeline">
      <ElTimelineItem
        v-for="(a, idx) in activities"
        :key="idx"
        :timestamp="a.time"
        :type="a.type"
        placement="top"
      >
        {{ a.content }}
      </ElTimelineItem>
    </ElTimeline>
  </ElCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'

interface ActivityItem {
  content: string
  time: string
  type: 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

const router = useRouter()

const activities = ref<ActivityItem[]>([
  { content: '管理员 admin 处理了订单 SO20261030001 的发货', time: '10 分钟前', type: 'success' },
  { content: '用户「张三」提交了售后申请', time: '32 分钟前', type: 'warning' },
  { content: '审核通过 12 条商品评价', time: '1 小时前', type: 'primary' },
  { content: '新增优惠券「双十二满减券」', time: '2 小时前', type: 'info' },
  { content: '角色「运营专员」权限已更新', time: '昨天 18:20', type: 'info' }
])

function handleMore(): void {
  router.push('/permission/log')
}
</script>

<style lang="scss" scoped>
$primary: #409eff;
$text-main: #1f2d3d;
$text-secondary: #8a94a6;
$text-regular: #5a6472;
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

.activity-timeline {
  padding: 4px 0;
  max-height: 280px;
  overflow-y: auto;

  :deep(.el-timeline-item__timestamp) {
    font-size: 12px;
    color: $text-secondary;
  }

  :deep(.el-timeline-item__content) {
    font-size: 13px;
    color: $text-regular;
    line-height: 1.6;
  }
}
</style>