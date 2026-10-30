import { createRouter, createWebHistory } from 'vue-router'
import user from "@/router/modules/user"
import system from "@/router/modules/system"
import product from "@/router/modules/product"
import order from "@/router/modules/order"
import marketing from "@/router/modules/marketing"
import decoration from "@/router/modules/decoration"
import permission from "@/router/modules/permission"
import analytics from "@/router/modules/analytics"
import settings from '@/router/modules/settings'
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
        ...product,
        ...order,
        ...marketing,
        ...decoration,
        ...permission,
        ...analytics,
        ...settings,
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
