import type { Menu } from "@/layout/Menu.vue";


/**
 * 异步睡眠函数，等待指定毫秒数
 * @param {number} ms - 要等待的毫秒数
 * @returns {Promise<void>}
 */
function sleep(ms: number) {
      return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * 获取系统菜单 
 * @returns Menus
 */
export async function getByMenu(): Promise<Menu[]> {
      // await sleep(3000)
       return     [
                  {
                        "title": "控制台",
                        "path": "/console",
                        "icon": "solar:home-2-bold-duotone"
                  },
                  {
                        "title": "商品管理",
                        "path": "/product",
                        "icon": "solar:cart-large-bold-duotone",
                        "children": [
                              { "title": "商品列表", "path": "/product/list", "icon": "solar:box-bold-duotone" },
                              { "title": "商品分类", "path": "/product/category", "icon": "solar:folder-bold-duotone" },
                              { "title": "标签", "path": "/product/tag", "icon": "solar:tag-bold-duotone" },
                              { "title": "规格", "path": "/product/spec", "icon": "solar:slider-vertical-bold-duotone" },
                              { "title": "品牌", "path": "/product/brand", "icon": "solar:medal-ribbon-bold-duotone" },
                        ]
                  },
                  {
                        "title": "订单管理",
                        "path": "/order",
                        "icon": "solar:document-bold-duotone",
                        "children": [
                              { "title": "订单列表", "path": "/order/list", "icon": "solar:list-bold-duotone" },
                              { "title": "售后/退款", "path": "/order/refund", "icon": "solar:refresh-circle-bold-duotone" },
                              { "title": "发货管理", "path": "/order/shipping", "icon": "solar:delivery-bold-duotone" },
                              { "title": "评价管理", "path": "/order/review", "icon": "solar:chat-round-dots-bold-duotone" }
                        ]
                  },
                  {
                        "title": "会员管理",
                        "path": "/user",
                        "icon": "solar:user-bold-duotone",
                        "children": [
                              { "title": "会员列表", "path": "/user/list", "icon": "solar:users-group-rounded-bold-duotone" },
                              { "title": "会员等级", "path": "/user/level", "icon": "solar:ranking-bold-duotone" },
                              { "title": "积分管理", "path": "/user/points", "icon": "solar:gift-bold-duotone" }
                        ]
                  },
                  {
                        "title": "营销管理",
                        "path": "/marketing",
                        "icon": "solar:chart-2-bold-duotone",
                        "children": [
                              { "title": "优惠券", "path": "/marketing/coupon", "icon": "solar:ticket-bold-duotone" },
                              { "title": "秒杀/限时折扣", "path": "/marketing/flash-sale", "icon": "solar:lightning-bold-duotone" },
                              { "title": "满减活动", "path": "/marketing/full-reduction", "icon": "solar:sale-bold-duotone" },
                              { "title": "拼团", "path": "/marketing/group-buy", "icon": "solar:users-group-two-rounded-bold-duotone" }
                        ]
                  },
                  {
                        "title": "店铺装修",
                        "path": "/decoration",
                        "icon": "solar:palette-bold-duotone",
                        "children": [
                              { "title": "页面管理", "path": "/decoration/page", "icon": "solar:documents-bold-duotone" },
                              { "title": "轮播图/广告", "path": "/decoration/banner", "icon": "solar:gallery-wide-bold-duotone" },
                              { "title": "导航菜单", "path": "/decoration/nav", "icon": "solar:menu-dots-bold-duotone" }
                        ]
                  },
                  {
                        "title": "权限管理",
                        "path": "/permission",
                        "icon": "solar:shield-keyhole-bold-duotone",
                        "children": [
                              { "title": "管理员", "path": "/permission/admin", "icon": "solar:user-id-bold-duotone" },
                              { "title": "角色管理", "path": "/permission/role", "icon": "solar:users-group-rounded-bold-duotone" },
                              { "title": "菜单权限", "path": "/permission/menu", "icon": "solar:menu-dots-bold-duotone" },
                              { "title": "接口权限", "path": "/permission/api", "icon": "solar:code-square-bold-duotone" },
                              { "title": "操作日志", "path": "/permission/log", "icon": "solar:history-bold-duotone" }
                        ]
                  },
                  {
                        "title": "数据统计",
                        "path": "/analytics",
                        "icon": "solar:chart-bold-duotone",
                        "children": [
                              { "title": "销售概览", "path": "/analytics/sales", "icon": "solar:graph-up-bold-duotone" },
                              { "title": "商品分析", "path": "/analytics/product", "icon": "solar:pie-chart-bold-duotone" },
                              { "title": "会员分析", "path": "/analytics/user", "icon": "solar:user-check-bold-duotone" }
                        ]
                  },
                  {
                        "title": "系统设置",
                        "path": "/settings",
                        "icon": "solar:settings-bold-duotone",
                        "children": [
                              { "title": "基础设置", "path": "/settings/general", "icon": "solar:widget-bold-duotone" },
                              { "title": "支付配置", "path": "/settings/payment", "icon": "solar:card-bold-duotone" },
                              { "title": "物流/运费", "path": "/settings/shipping", "icon": "solar:delivery-bold-duotone" },
                        ]
                  }
            ]

      // return [
      //       {
      //             "title": "控制台",
      //             "path": "/console",
      //             "icon": "solar:home-2-bold-duotone"
      //       },
      //       {
      //             "title": "用户管理",
      //             "path": "/user",
      //             "icon": "solar:user-bold-duotone",
      //             "children": [
      //                   { "title": "用户列表", "path": "/user/list", "icon": "solar:users-group-rounded-bold-duotone" },
      //                   { "title": "实名认证", "path": "/user/verify", "icon": "solar:user-id-bold-duotone" },
      //                   { "title": "封禁/黑名单", "path": "/user/blacklist", "icon": "solar:user-block-bold-duotone" },
      //                   { "title": "用户标签", "path": "/user/tag", "icon": "solar:tag-bold-duotone" },
      //                   { "title": "在线状态", "path": "/user/online", "icon": "solar:wi-fi-bold-duotone" }
      //             ]
      //       },
      //       {
      //             "title": "消息管理",
      //             "path": "/message",
      //             "icon": "solar:chat-round-bold-duotone",
      //             "children": [
      //                   { "title": "消息记录", "path": "/message/list", "icon": "solar:chat-line-bold-duotone" },
      //                   { "title": "撤回/删除记录", "path": "/message/recall", "icon": "solar:refresh-circle-bold-duotone" },
      //                   { "title": "敏感词过滤", "path": "/message/sensitive", "icon": "solar:shield-warning-bold-duotone" },
      //                   { "title": "消息推送", "path": "/message/push", "icon": "solar:bell-bing-bold-duotone" },
      //                   { "title": "系统通知", "path": "/message/notice", "icon": "solar:chart-square-outline" }
      //             ]
      //       },
      //       {
      //             "title": "群组管理",
      //             "path": "/group",
      //             "icon": "solar:users-group-two-rounded-bold-duotone",
      //             "children": [
      //                   { "title": "群组列表", "path": "/group/list", "icon": "solar:list-bold-duotone" },
      //                   { "title": "群成员", "path": "/group/member", "icon": "solar:users-group-rounded-bold-duotone" },
      //                   { "title": "群公告", "path": "/group/notice", "icon": "solar:document-text-bold-duotone" },
      //                   { "title": "解散/禁言", "path": "/group/ban", "icon": "solar:forbidden-circle-bold-duotone" }
      //             ]
      //       },
      //       {
      //             "title": "内容审核",
      //             "path": "/audit",
      //             "icon": "solar:shield-check-bold-duotone",
      //             "children": [
      //                   { "title": "文字审核", "path": "/audit/text", "icon": "solar:text-bold-duotone" },
      //                   { "title": "图片审核", "path": "/audit/image", "icon": "solar:gallery-bold-duotone" },
      //                   { "title": "语音/视频审核", "path": "/audit/media", "icon": "solar:video-frame-bold-duotone" },
      //                   { "title": "举报处理", "path": "/audit/report", "icon": "solar:flag-bold-duotone" },
      //                   { "title": "违规记录", "path": "/audit/violation", "icon": "solar:danger-triangle-bold-duotone" }
      //             ]
      //       },
      //       {
      //             "title": "运营管理",
      //             "path": "/operation",
      //             "icon": "solar:chart-square-outline",
      //             "children": [
      //                   { "title": "表情包管理", "path": "/operation/emoji", "icon": "solar:emoji-funny-circle-bold-duotone" },
      //                   { "title": "活动/公告", "path": "/operation/activity", "icon": "solar:gift-bold-duotone" },
      //                   { "title": "广告位", "path": "/operation/ads", "icon": "solar:gallery-wide-bold-duotone" },
      //                   { "title": "版本更新", "path": "/operation/version", "icon": "solar:refresh-bold-duotone" }
      //             ]
      //       },
      //       {
      //             "title": "数据统计",
      //             "path": "/analytics",
      //             "icon": "solar:chart-bold-duotone",
      //             "children": [
      //                   { "title": "用户增长", "path": "/analytics/user", "icon": "solar:graph-up-bold-duotone" },
      //                   { "title": "消息量统计", "path": "/analytics/message", "icon": "solar:pie-chart-bold-duotone" },
      //                   { "title": "活跃度分析", "path": "/analytics/active", "icon": "solar:chart-2-bold-duotone" }
      //             ]
      //       },
      //       {
      //             "title": "权限管理",
      //             "path": "/permission",
      //             "icon": "solar:shield-keyhole-bold-duotone",
      //             "children": [
      //                   { "title": "角色管理", "path": "/permission/role", "icon": "solar:users-group-rounded-bold-duotone" },
      //                   { "title": "菜单权限", "path": "/permission/menu", "icon": "solar:menu-dots-bold-duotone" },
      //                   { "title": "接口权限", "path": "/permission/api", "icon": "solar:code-square-bold-duotone" },
      //                   { "title": "操作日志", "path": "/permission/log", "icon": "solar:history-bold-duotone" }
      //             ]
      //       },
      //       {
      //             "title": "系统设置",
      //             "path": "/settings",
      //             "icon": "solar:settings-bold-duotone",
      //             "children": [
      //                   { "title": "基础设置", "path": "/settings/general", "icon": "solar:widget-bold-duotone" },
      //                   { "title": "推送配置", "path": "/settings/push", "icon": "solar:bell-bold-duotone" },
      //                   { "title": "存储配置", "path": "/settings/storage", "icon": "solar:server-bold-duotone" },
      //                   { "title": "操作员管理", "path": "/settings/admin", "icon": "solar:user-id-bold-duotone" }
      //             ]
      //       }
      // ]
}