<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { ElMessage, ElMessageBox } from "element-plus";
import Menuc, { type Menu } from "./Menu.vue";
import { getByMenu } from "@/api/system.ts";

const collapse = ref(false);
const menuList = ref<Menu[]>([]);

const route = useRoute();
const router = useRouter();

// 面包屑：根据当前路由的 matched 生成
const breadcrumbs = computed(() => {
  return route.matched
    .filter((item) => item.meta?.title)
    .map((item) => ({
      title: item.meta.title as string,
      path: item.path,
    }));
});

// 当前页面标题
const currentTitle = computed(() => {
  return (route.meta?.title as string) || "";
});

// 用户信息（可换成 store / 接口）
const userInfo = ref({
  name: "Felix",
  avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=Felix",
});

// 未读消息数
const unreadCount = ref(3);

// 折叠切换，图标同步变化
const toggleCollapse = () => {
  collapse.value = !collapse.value;
};

// 用户下拉菜单操作
const handleCommand = async (command: string) => {
  switch (command) {
    case "profile":
      router.push("/profile");
      break;
    case "settings":
      router.push("/settings");
      break;
    case "logout":
      try {
        await ElMessageBox.confirm("确定要退出登录吗？", "提示", {
          type: "warning",
          confirmButtonText: "确定",
          cancelButtonText: "取消",
        });
        // TODO: 调用退出登录接口，清除 token
        ElMessage.success("已退出登录");
        router.push("/login");
      } catch {
        // 用户取消
      }
      break;
  }
};

onMounted(async () => {
  menuList.value = await getByMenu();
});
</script>

<template>
  <div class="container">
    <ElContainer>
      <ElAside :class="{ collapse: collapse }">
        <ElScrollbar>
          <ElMenu unique-opened router :collapse="collapse">
            <Menuc :menus="menuList"></Menuc>
          </ElMenu>
        </ElScrollbar>
      </ElAside>

      <ElContainer class="main-layout">
        <ElHeader class="header">
          <!-- 左侧：折叠按钮 + 面包屑 -->
          <div class="header__left">
            <Icon class="header__collapse-btn"
              :icon="collapse ? 'solar:list-cross-minimalistic-broken' : 'solar:list-broken'" @click="toggleCollapse" />

            <ElBreadcrumb class="header__breadcrumb" separator="/">
              <ElBreadcrumbItem :to="{ path: '/console' }">首页</ElBreadcrumbItem>
              <ElBreadcrumbItem v-for="item in breadcrumbs" :key="item.path">
                {{ item.title }}
              </ElBreadcrumbItem>
            </ElBreadcrumb>
          </div>

          <!-- 右侧：搜索 + 通知 + 用户 -->
          <div class="header__right">
            <!-- 搜索 -->
            <ElInput class="header__search" placeholder="搜索菜单..." :prefix-icon="undefined" clearable>
              <template #prefix>
                <Icon icon="solar:magnifer-broken" />
              </template>
            </ElInput>

            <!-- 通知 -->
            <ElBadge :value="unreadCount" :hidden="unreadCount === 0" class="header__badge">
              <Icon class="header__icon" icon="solar:bell-bing-broken" />
            </ElBadge>

            <!-- 全屏 -->
            <Icon class="header__icon" icon="solar:maximize-square-broken" />

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

        <ElMain>
          <RouterView />
        </ElMain>
      </ElContainer>
    </ElContainer>
  </div>
</template>

<style lang="scss" scoped>
.container {
  height: 100vh;
  overflow: hidden;
  box-sizing: border-box;
  .el-aside {
    height: 100vh;
  }
  .collapse {
    width: auto !important;
  }
  .el-main{
    padding:0;
  }
  .el-menu {
    border: none;
  }

  .main-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: 0;
    background: #edf2fa;
    box-sizing: border-box;

    .el-main {
      flex: 1;
      height: 100%;
    }
  }
}

// ===== Header =====
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 20px;
  background-color: inherit;
  box-sizing: border-box;

  // 左侧
  &__left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__collapse-btn {
    font-size: 1.5em;
    cursor: pointer;
    color: #4b5563;
    transition: color 0.2s;

    &:hover {
      color: #6366f1;
    }
  }

  &__breadcrumb {
    font-size: 14px;
  }

  // 右侧
  &__right {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  &__search {
    width: 200px;

    :deep(.el-input__wrapper) {
      border-radius: 8px;
      background-color: #f3f4f6;
      box-shadow: none;
    }
  }

  &__badge {
    cursor: pointer;
  }

  &__icon {
    font-size: 1.35em;
    color: #4b5563;
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: #6366f1;
    }
  }

  // 用户区
  &__user {
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

  &__username {
    font-size: 14px;
    color: #374151;
    font-weight: 500;
  }

  &__arrow {
    font-size: 1em;
    color: #9ca3af;
  }
}

// ===== 深色模式 =====
@media (prefers-color-scheme: dark) {
  .main-layout {
    background: #111827;
  }

  .header {
    background-color: #1f2937;
    border-bottom-color: #374151;

    &__collapse-btn,
    &__icon {
      color: #d1d5db;

      &:hover {
        color: #818cf8;
      }
    }

    &__username {
      color: #e5e7eb;
    }

    &__user:hover {
      background-color: #374151;
    }

    &__search :deep(.el-input__wrapper) {
      background-color: #374151;
    }
  }
}
</style>