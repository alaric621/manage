import type { RouteRecordRaw } from "vue-router";

const permission: Array<RouteRecordRaw> = [
  // ---------- 角色管理 ----------
  {
    path: "/permission/role",
    name: "PermissionRole",
    component: () => import("@/views/permission/role.vue"),
    meta: { title: "角色管理", icon: "solar:users-group-rounded-bold-duotone" }
  },

  // ---------- 菜单权限 ----------
  {
    path: "/permission/menu",
    name: "PermissionMenu",
    component: () => import("@/views/permission/menu.vue"),
    meta: { title: "菜单权限", icon: "solar:menu-dots-bold-duotone" }
  },

  // ---------- 接口权限 ----------
  {
    path: "/permission/api",
    name: "PermissionApi",
    component: () => import("@/views/permission/api.vue"),
    meta: { title: "接口权限", icon: "solar:code-square-bold-duotone" }
  },

  // ---------- 操作日志 ----------
  {
    path: "/permission/log",
    name: "PermissionLog",
    component: () => import("@/views/permission/log.vue"),
    meta: { title: "操作日志", icon: "solar:history-bold-duotone" }
  },
  {
  path: "/permission/admin",
  name: "PermissionAdmin",
  component: () => import("@/views/permission/admin.vue"),
  meta: { title: "管理员管理", icon: "solar:user-id-bold-duotone" }
}
];

export default permission;