import type { RouteRecordRaw } from "vue-router";

const settings: Array<RouteRecordRaw> = [
  // ---------- 基础设置 ----------
  {
    path: "/settings/general",
    name: "SettingsGeneral",
    component: () => import("@/views/settings/general.vue"),
    meta: { title: "基础设置", icon: "solar:widget-bold-duotone" }
  },

  // ---------- 支付配置 ----------
  {
    path: "/settings/payment",
    name: "SettingsPayment",
    component: () => import("@/views/settings/payment.vue"),
    meta: { title: "支付配置", icon: "solar:card-bold-duotone" }
  },

  // ---------- 物流/运费 ----------
  {
    path: "/settings/shipping",
    name: "SettingsShipping",
    component: () => import("@/views/settings/shipping.vue"),
    meta: { title: "物流/运费", icon: "solar:delivery-bold-duotone" }
  }
];

export default settings;