<script setup lang="ts">
type Menu = {
  title:string,
  path:string
  children?:Array<Menu>
}
defineProps<{
      menus: Array<Menu>
}>()
defineOptions({
      name:"Menus"
})
</script>

<template>
      <template   v-for="menu in menus">
            <ElMenuItem v-if="!menu.children && !Array.isArray(menu.children)" :index="menu.path">
                   {{ menu.title }}
            </ElMenuItem>
            <ElSubMenu :index="Math.random().toString()"v-else>
                  <template #title>{{menu.title}}</template>
                   <Menus  :menus="menu.children" />
            </ElSubMenu>
      </template>
      
      
</template>
