import type { RouteRecordRaw } from "vue-router";

const decoration: Array<RouteRecordRaw> = [
  // ---------- 页面管理 ----------
  {
    path: "/decoration/page",
    name: "DecorationPage",
    component: () => import("@/views/decoration/page.vue"),
    meta: { title: "页面管理", icon: "solar:documents-bold-duotone" }
  },

  // ---------- 轮播图/广告 ----------
  {
    path: "/decoration/banner",
    name: "DecorationBanner",
    component: () => import("@/views/decoration/banner.vue"),
    meta: { title: "轮播图/广告", icon: "solar:gallery-wide-bold-duotone" }
  },

  // ---------- 导航菜单 ----------
  {
    path: "/decoration/nav",
    name: "DecorationNav",
    component: () => import("@/views/decoration/nav.vue"),
    meta: { title: "导航菜单", icon: "solar:menu-dots-bold-duotone" }
  }
];

export default decoration;