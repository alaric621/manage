import type { RouteRecordRaw } from "vue-router";

const product: Array<RouteRecordRaw> = [
  // ---------- 商品列表 / 新增 / 编辑 / 详情 ----------
  {
    path: "/product/list",
    name: "ProductList",
    component: () => import("@/views/product/list.vue"),
    meta: { title: "商品列表", icon: "solar:box-bold-duotone" }
  },
  {
    path: "/product/create",
    name: "ProductCreate",
    component: () => import("@/views/product/create.vue"),
    meta: { title: "新增商品", hidden: true, activeMenu: "/product/list" }
  },
  {
    path: "/product/edit/:id",
    name: "ProductEdit",
    component: () => import("@/views/product/edit.vue"),
    meta: { title: "编辑商品", hidden: true, activeMenu: "/product/list" }
  },
  {
    path: "/product/detail/:id",
    name: "ProductDetail",
    component: () => import("@/views/product/detail.vue"),
    meta: { title: "商品详情", hidden: true, activeMenu: "/product/list" }
  },

  // ---------- 商品分类 ----------
  {
    path: "/product/category",
    name: "ProductCategory",
    component: () => import("@/views/product/category.vue"),
    meta: { title: "商品分类", icon: "solar:folder-bold-duotone" }
  },

  // ---------- 标签 ----------
  {
    path: "/product/tag",
    name: "ProductTag",
    component: () => import("@/views/product/tag.vue"),
    meta: { title: "标签", icon: "solar:tag-bold-duotone" }
  },

  // ---------- 规格 ----------
  {
    path: "/product/spec",
    name: "ProductSpec",
    component: () => import("@/views/product/spec.vue"),
    meta: { title: "规格", icon: "solar:slider-vertical-bold-duotone" }
  },

  // ---------- 品牌 ----------
  {
    path: "/product/brand",
    name: "ProductBrand",
    component: () => import("@/views/product/brand.vue"),
    meta: { title: "品牌", icon: "solar:medal-ribbon-bold-duotone" }
  },

  // ---------- 商品评价 ----------
  
];

export default product;