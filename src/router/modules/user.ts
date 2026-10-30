import type { RouteRecordRaw } from "vue-router";

const user: Array<RouteRecordRaw> = [
  // ---------- 会员列表 ----------
  {
    path: "/user/list",
    name: "UserList",
    component: () => import("@/views/user/list.vue"),
    meta: { title: "会员列表", icon: "solar:users-group-rounded-bold-duotone" }
  },

//   // ---------- 会员详情（列表进入，不在菜单显示） ----------
//   {
//     path: "/user/detail/:id",
//     name: "UserDetail",
//     component: () => import("@/views/user/detail.vue"),
//     meta: { title: "会员详情", hidden: true, activeMenu: "/user/list" }
//   },

//   // ---------- 会员等级 ----------
  {
    path: "/user/level",
    name: "UserLevel",
    component: () => import("@/views/user/level.vue"),
    meta: { title: "会员等级", icon: "solar:ranking-bold-duotone" }
  },

  // ---------- 积分管理 ----------
  {
    path: "/user/points",
    name: "UserPoints",
    component: () => import("@/views/user/points.vue"),
    meta: { title: "积分管理", icon: "solar:gift-bold-duotone" }
  }
];

export default user;