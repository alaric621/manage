<script setup lang="ts">
import { Icon } from "@iconify/vue";
import Menuc, { type Menu } from "./Menu.vue"
import { getByMenu } from "@/api/system.ts";
const collapse = ref(false);
const menuList = ref<Menu[]>([])

onMounted(async () => {
      menuList.value = await getByMenu();
})
</script>

<template>
      <div class="container">
            <ElContainer>
                  <ElAside :class="{ collapse: collapse }">
                        <ElMenu router :collapse="collapse">
                                    <Menuc :menus="menuList"></Menuc>
                        </ElMenu>
                  </ElAside>
                  <ElContainer class="main-layout">
                        <ElHeader>
                              <Icon style="font-size: 1.5em; cursor: pointer;" icon="solar:list-broken"
                                    @click="collapse = !collapse"></Icon>
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

      .collapse {
            width: auto !important;
      }
      .el-menu {
            border: none;
      }
      .main-layout {
            display: flex;
            flex-direction: column;
            height: 100vh;
            padding:0;
            background: #edf2fa;
            box-sizing: border-box;
            .el-header {
                  background-color: inherit;
            }
            .el-main {
                  flex: 1;
                  height: 100%;
            }
      }

}
</style>
