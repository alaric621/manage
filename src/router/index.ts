import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
       path:"/",
       name:"basic",
       components:()=>import("@/layout/BaseLayout.vue")
    }
  ],
})

export default router
