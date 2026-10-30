import type { RouteRecordRaw } from "vue-router";

const marketing: Array<RouteRecordRaw> = [
  // ---------- 优惠券 ----------
  {
    path: "/marketing/coupon",
    name: "MarketingCoupon",
    component: () => import("@/views/marketing/coupon.vue"),
    meta: { title: "优惠券", icon: "solar:ticket-bold-duotone" }
  },

  // ---------- 秒杀 / 限时折扣 ----------
  {
    path: "/marketing/flash-sale",
    name: "MarketingFlashSale",
    component: () => import("@/views/marketing/flash-sale.vue"),
    meta: { title: "秒杀/限时折扣", icon: "solar:lightning-bold-duotone" }
  },

  // ---------- 满减活动 ----------
  {
    path: "/marketing/full-reduction",
    name: "MarketingFullReduction",
    component: () => import("@/views/marketing/full-reduction.vue"),
    meta: { title: "满减活动", icon: "solar:sale-bold-duotone" }
  },

  // ---------- 拼团 ----------
  {
    path: "/marketing/group-buy",
    name: "MarketingGroupBuy",
    component: () => import("@/views/marketing/group-buy.vue"),
    meta: { title: "拼团", icon: "solar:users-group-two-rounded-bold-duotone" }
  }
];

export default marketing;