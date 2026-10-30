import type { RouteRecordRaw } from "vue-router";

const analytics: Array<RouteRecordRaw> = [
  // ---------- 销售概览 ----------
  {
    path: "/analytics/sales",
    name: "AnalyticsSales",
    component: () => import("@/views/analytics/sales.vue"),
    meta: { title: "销售概览", icon: "solar:graph-up-bold-duotone" }
  },

  // ---------- 商品分析 ----------
  {
    path: "/analytics/product",
    name: "AnalyticsProduct",
    component: () => import("@/views/analytics/product.vue"),
    meta: { title: "商品分析", icon: "solar:pie-chart-bold-duotone" }
  },

  // ---------- 会员分析 ----------
  {
    path: "/analytics/user",
    name: "AnalyticsUser",
    component: () => import("@/views/analytics/user.vue"),
    meta: { title: "会员分析", icon: "solar:user-check-bold-duotone" }
  }
];

export default analytics;