import { createRouter, createWebHistory } from 'vue-router'
import user from "@/router/modules/user"
import system from "@/router/modules/system"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "basic",
      component: () => import("@/layout/BaseLayout.vue"),
      children: [
        ...user,
        ...system,
        {
          path: '/:pathMatch(.*)*',
          name: 'NotFound',
          component: () => import('@/views/notfound.vue'),
          meta: { title: '页面不存在' }
        }
      ]
    },
    {
      path: "/login",
      name: "login",
      component: () => import('@/views/user/login.vue')
    }

  ],
})

export default router
