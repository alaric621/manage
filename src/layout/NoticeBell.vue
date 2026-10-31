<template>
  <ElPopover
    placement="bottom-end"
    :width="340"
    trigger="click"
    popper-class="notice-popover"
    @show="handleShow"
  >
    <template #reference>
      <ElBadge :value="unreadCount" :hidden="unreadCount === 0" class="notice-bell__badge">
        <Icon class="notice-bell__icon" icon="solar:bell-bing-broken" />
      </ElBadge>
    </template>

    <div class="notice-panel">
      <!-- 头部 -->
      <div class="notice-header">
        <span class="notice-title">通知消息</span>
        <ElButton
          link
          type="primary"
          size="small"
          :disabled="unreadCount === 0"
          @click="markAllRead"
        >
          全部已读
        </ElButton>
      </div>

      <!-- 列表 -->
      <ElScrollbar max-height="320px">
        <div v-if="notices.length === 0" class="notice-empty">
          <Icon icon="solar:bell-off-broken" width="36" />
          <span>暂无消息</span>
        </div>

        <div
          v-else
          v-for="n in notices"
          :key="n.id"
          class="notice-item"
          :class="{ unread: !n.read }"
          @click="handleRead(n)"
        >
          <div class="notice-icon" :style="{ background: n.bg, color: n.color }">
            <Icon :icon="n.icon" width="16" />
          </div>
          <div class="notice-content">
            <div class="notice-text">{{ n.text }}</div>
            <div class="notice-time">{{ n.time }}</div>
          </div>
          <span v-if="!n.read" class="notice-dot"></span>
        </div>
      </ElScrollbar>

      <!-- 底部 -->
      <div class="notice-footer">
        <ElButton link type="primary" size="small" @click="handleViewAll">
          查看全部
          <Icon icon="solar:alt-arrow-right-broken" width="12" style="margin-left: 2px;" />
        </ElButton>
      </div>
    </div>
  </ElPopover>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'

// ---------- 类型 ----------
interface Notice {
  id: number
  text: string
  time: string
  read: boolean
  icon: string
  color: string
  bg: string
}

// ---------- 路由 ----------
const router = useRouter()

// ---------- 数据 ----------
const notices = ref<Notice[]>([
  { id: 1, text: '新订单 SO20261031001 待发货', time: '5 分钟前', read: false, icon: 'solar:cart-large-bold-duotone', color: '#409eff', bg: '#e8f3ff' },
  { id: 2, text: '用户「张三」提交了售后申请', time: '32 分钟前', read: false, icon: 'solar:refresh-circle-bold-duotone', color: '#f56c6c', bg: '#ffeaea' },
  { id: 3, text: '库存预警：便携充电宝剩余 12 件', time: '1 小时前', read: false, icon: 'solar:danger-triangle-bold-duotone', color: '#e6a23c', bg: '#fff4e6' },
  { id: 4, text: '系统已完成今日数据备份', time: '2 小时前', read: true, icon: 'solar:check-circle-bold-duotone', color: '#52b788', bg: '#e6f7ee' }
])

// ---------- 未读数 ----------
const unreadCount = computed(() => notices.value.filter(n => !n.read).length)

// ---------- 操作 ----------
function handleRead(n: Notice): void {
  n.read = true
}

function markAllRead(): void {
  notices.value.forEach(n => (n.read = true))
}

function handleShow(): void {
  // TODO: 打开时拉取最新消息
}

function handleViewAll(): void {
  router.push('/message/list')
}
</script>

<style lang="scss" scoped>
.notice-bell__badge {
  cursor: pointer;
}

.notice-bell__icon {
  font-size: 1.35em;
  color: #4b5563;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #6366f1;
  }
}

.notice-panel {
  .notice-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 8px;
    margin-bottom: 4px;
    border-bottom: 1px solid #eef1f6;

    .notice-title {
      font-size: 14px;
      font-weight: 600;
      color: #1f2d3d;
    }
  }

  .notice-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 40px 0;
    font-size: 13px;
    color: #8a94a6;
  }

  .notice-item {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: #f7f9fc;
    }

    &.unread {
      background: #f5f9ff;

      .notice-text {
        font-weight: 500;
        color: #1f2d3d;
      }
    }

    .notice-icon {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .notice-content {
      flex: 1;
      min-width: 0;
    }

    .notice-text {
      font-size: 13px;
      color: #5a6472;
      line-height: 1.5;
    }

    .notice-time {
      margin-top: 2px;
      font-size: 11px;
      color: #8a94a6;
    }

    .notice-dot {
      position: absolute;
      top: 14px;
      right: 10px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #f56c6c;
    }
  }

  .notice-footer {
    padding-top: 8px;
    margin-top: 4px;
    border-top: 1px solid #eef1f6;
    text-align: center;
  }
}

@media (prefers-color-scheme: dark) {
  .notice-bell__icon {
    color: #d1d5db;

    &:hover {
      color: #818cf8;
    }
  }
}
</style>