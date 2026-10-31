import type { RouteRecordRaw } from "vue-router";
const user: Array<RouteRecordRaw> = [
      
      { path: "/console", component: () => import("@/views/console/index.vue") },
      { path: "/system/menu", component: () => import("@/views/system/menu/index.vue") },
      { path: "/system/user", component: () => import("@/views/system/user/index.vue") },
      { path: "/system/role", component: () => import("@/views/system/role/index.vue") },
];

export default user;