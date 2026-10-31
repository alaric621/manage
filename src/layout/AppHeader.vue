<template>
  <ElHeader class="app-header">
    <!-- 左侧：折叠按钮 + 面包屑 -->
    <div class="header__left">
      <Icon
        class="header__collapse-btn"
        :icon="collapse ? 'solar:list-cross-minimalistic-broken' : 'solar:list-broken'"
        @click="emit('toggle-collapse')"
      />

      <ElBreadcrumb class="header__breadcrumb" separator="/">
        <ElBreadcrumbItem :to="{ path: '/console' }">首页</ElBreadcrumbItem>
        <ElBreadcrumbItem v-for="item in breadcrumbs" :key="item.path">
          {{ item.title }}
        </ElBreadcrumbItem>
      </ElBreadcrumb>
    </div>

    <!-- 右侧：搜索 + 通知 + 全屏 + 用户 -->
    <div class="header__right">
      <ElInput class="header__search" placeholder="搜索菜单..." clearable>
        <template #prefix>
          <Icon icon="solar:magnifer-broken" />
        </template>
      </ElInput>

      <!-- 通知 -->
      <NoticeBell />

      <!-- 全屏 -->
      <Icon
        class="header__icon"
        :icon="isFullscreen ? 'solar:minimize-square-broken' : 'solar:maximize-square-broken'"
        :title="isFullscreen ? '退出全屏' : '全屏'"
        @click="toggleFullscreen"
      />

      <!-- 用户下拉 -->
      <ElDropdown trigger="click" @command="handleCommand">
        <div class="header__user">
          <ElAvatar :size="32" :src="userInfo.avatar" />
          <span class="header__username">{{ userInfo.name }}</span>
          <Icon class="header__arrow" icon="solar:alt-arrow-down-broken" />
        </div>
        <template #dropdown>
          <ElDropdownMenu>
            <ElDropdownItem command="profile">
              <Icon icon="solar:user-circle-broken" style="margin-right: 6px;" />
              个人中心
            </ElDropdownItem>
            <ElDropdownItem command="settings">
              <Icon icon="solar:settings-broken" style="margin-right: 6px;" />
              系统设置
            </ElDropdownItem>
            <ElDropdownItem divided command="logout">
              <Icon icon="solar:logout-2-broken" style="margin-right: 6px;" />
              退出登录
            </ElDropdownItem>
          </ElDropdownMenu>
        </template>
      </ElDropdown>
    </div>
  </ElHeader>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFullscreen } from '@vueuse/core'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Icon } from '@iconify/vue'
import NoticeBell from './NoticeBell.vue'

// ---------- Props ----------
withDefaults(
  defineProps<{
    collapse?: boolean
  }>(),
  {
    collapse: false
  }
)

// ---------- Emits ----------
const emit = defineEmits<{
  (e: 'toggle-collapse'): void
}>()

// ---------- 路由 ----------
const route = useRoute()
const router = useRouter()

// ---------- 面包屑 ----------
const breadcrumbs = computed(() => {
  return route.matched
    .filter(item => item.meta?.title)
    .map(item => ({
      title: item.meta.title as string,
      path: item.path
    }))
})

// ---------- 全屏 ----------
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()

// ---------- 用户信息 ----------
const userInfo = ref({
  name: 'Felix',
  avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Felix'
})

// ---------- 下拉命令 ----------
async function handleCommand(command: string): Promise<void> {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings/general')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          type: 'warning',
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        })
        // TODO: 调用退出登录接口，清除 token
        ElMessage.success('已退出登录')
        router.push('/login')
      } catch {
        // 用户取消
      }
      break
  }
}
</script>

<style lang="scss" scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 20px;
  background-color: inherit;
  box-sizing: border-box;
}

// 左侧
.header__left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header__collapse-btn {
  font-size: 1.5em;
  cursor: pointer;
  color: #4b5563;
  transition: color 0.2s;

  &:hover {
    color: #6366f1;
  }
}

.header__breadcrumb {
  font-size: 14px;
}

// 右侧
.header__right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header__search {
  width: 200px;

  :deep(.el-input__wrapper) {
    border-radius: 8px;
    background-color: #f3f4f6;
    box-shadow: none;
  }
}

.header__icon {
  font-size: 1.35em;
  color: #4b5563;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #6366f1;
  }
}

// 用户区
.header__user {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f3f4f6;
  }
}

.header__username {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.header__arrow {
  font-size: 1em;
  color: #9ca3af;
}

// 深色模式
@media (prefers-color-scheme: dark) {
  .app-header {
    background-color: #1f2937;
    border-bottom-color: #374151;
  }

  .header__collapse-btn,
  .header__icon {
    color: #d1d5db;

    &:hover {
      color: #818cf8;
    }
  }

  .header__username {
    color: #e5e7eb;
  }

  .header__user:hover {
    background-color: #374151;
  }

  .header__search :deep(.el-input__wrapper) {
    background-color: #374151;
  }
}
</style>