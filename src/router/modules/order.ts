import type { RouteRecordRaw } from "vue-router";

const order: Array<RouteRecordRaw> = [
  // ---------- 订单列表 ----------
  {
    path: "/order/list",
    name: "OrderList",
    component: () => import("@/views/order/list.vue"),
    meta: { title: "订单列表", icon: "solar:list-bold-duotone" }
  },

  // ---------- 订单详情（列表进入，不在菜单显示） ----------
  {
    path: "/order/detail/:id",
    name: "OrderDetail",
    component: () => import("@/views/order/detail.vue"),
    meta: { title: "订单详情", hidden: true, activeMenu: "/order/list" }
  },

  // ---------- 售后/退款 ----------
  {
    path: "/order/refund",
    name: "OrderRefund",
    component: () => import("@/views/order/refund.vue"),
    meta: { title: "售后/退款", icon: "solar:refresh-circle-bold-duotone" }
  },

  // ---------- 发货管理 ----------
  {
    path: "/order/shipping",
    name: "OrderShipping",
    component: () => import("@/views/order/shipping.vue"),
    meta: { title: "发货管理", icon: "solar:delivery-bold-duotone" }
  },

  {
    path: "/order/review",
    name: "ProductReview",
    component: () => import("@/views/order/review.vue"),
    meta: { title: "商品评价", icon: "solar:star-bold-duotone" }
  }
];

export default order;