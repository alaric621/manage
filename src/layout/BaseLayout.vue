<script setup lang="ts">
import Menu from "./Menu.vue"
const menuList = [
      {
            title: "控制台",
            path: "/console",
      },
      {
            title: "会员管理",
            path: "/user"
      },
      {
            title:"权限管理",
            path:"/auths",
            children:[
                  { title:"管理员" ,path:"/system/user"},
                  { title:"菜单管理" ,path:"/system/menu"},
                  { title:"角色" ,path:"/system/role"},
                  { title:"部门管理" ,path:"/system/dp"},
            ]
      }
]


</script>

<template>
      <div class="container">
            <ElContainer>
                  <ElAside>
                        <ElMenu router> 
                              <Menu :menus="menuList"></Menu>
                        </ElMenu>
                  </ElAside>
                  <ElContainer>
                        <ElHeader>
                        </ElHeader>
                        <ElMain>
                              <RouterView />
                        </ElMain>
                  </ElContainer>
            </ElContainer>
      </div>
</template>
