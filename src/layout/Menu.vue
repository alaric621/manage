<script setup lang="ts">
import { Icon } from "@iconify/vue"

export  type Menu = {
      title: string,
      path: string
      children?: Array<Menu>
      icon?:string
}
defineProps<{
      menus: Array<Menu>
}>()
defineOptions({
      name: "Menus"
})
</script>

<template>
      <template v-for="menu in menus">
            <ElMenuItem v-if="!menu.children && !Array.isArray(menu.children)" :index="menu.path">
                  <el-icon v-if="menu?.icon">
                              <Icon  :icon="menu.icon" />
                        </el-icon>
                  <template #title>
                        {{ menu.title }}
                  </template>
            </ElMenuItem>
            <ElSubMenu :index="Math.random().toString()" v-else>
                  <template #title> 
                        <ElIcon v-if="menu?.icon"> <Icon  :icon="menu.icon" /> </ElIcon>
                        <span> {{ menu.title }} </span>
                  </template>
                  <!-- 子节点 -->
                   <Menus :menus="menu.children" />
            </ElSubMenu>
      </template>


</template>
