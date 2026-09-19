import { createRouter, createWebHistory } from 'vue-router'
import user from "@/router/modules/user"


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
       path:"/",
       name:"basic",
       component:()=>import("@/layout/BaseLayout.vue"),
       children:[
         ...user   
       ]
    },
    {
      path:"/login",
      name:"login",
      component:()=>import('@/views/user/login.vue')
    }
    
  ],
})

export default router
