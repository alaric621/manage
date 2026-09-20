import type { Menu } from "@/layout/Menu.vue";


/**
 * 异步睡眠函数，等待指定毫秒数
 * @param {number} ms - 要等待的毫秒数
 * @returns {Promise<void>}
 */
function sleep(ms:number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * 获取系统菜单 
 * @returns Menus
 */
export async function getByMenu(): Promise<Menu[]> {
      // await sleep(3000)
      return [
            {
                  title: "控制台",
                  path: "/console",
                  icon: "solar:home-2-bold-duotone"
            },
            {
                  title: "会员管理",
                  path: "/user",
                  icon: "solar:user-bold-duotone"
            },
            {
                  title: "权限管理",
                  path: "/auths",
                  icon: "solar:shield-keyhole-bold-duotone",
                  children: [
                        { title: "管理员", path: "/system/user", icon: "solar:user-id-bold-duotone" },
                        { title: "菜单管理", path: "/system/menu", icon: "solar:menu-dots-bold-duotone" },
                        { title: "角色", path: "/system/role", icon: "solar:user-check-bold-duotone" },
                        { title: "部门管理", path: "/system/dp", icon: "solar:buildings-2-bold-duotone" }
                  ]
            }
      ]

}