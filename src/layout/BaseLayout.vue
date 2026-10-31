<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Menuc, { type Menu } from './Menu.vue'
import AppHeader from './AppHeader.vue'
import { getByMenu } from '@/api/system.ts'

const collapse = ref(false)
const menuList = ref<Menu[]>([])

const route = useRoute()
const activeMenu = computed(() => (route.meta?.activeMenu as string) || route.path)

const toggleCollapse = (): void => {
  collapse.value = !collapse.value
}

onMounted(async () => {
  menuList.value = await getByMenu()
})
</script>

<template>
  <div class="container">
    <ElContainer>
      <ElAside :class="{ collapse }">
        <ElScrollbar>
          <ElMenu
            persistent
            unique-opened
            router
            :collapse="collapse"
            :default-active="activeMenu"
          >
            <Menuc :menus="menuList"></Menuc>
          </ElMenu>
        </ElScrollbar>
      </ElAside>

      <ElContainer class="main-layout">
        <AppHeader :collapse="collapse" @toggle-collapse="toggleCollapse" />

        <ElMain>
          <ElScrollbar>
            <RouterView />
          </ElScrollbar>
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

  .el-main {
    padding: 0;
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

@media (prefers-color-scheme: dark) {
  .main-layout {
    background: #111827;
  }
}
</style>