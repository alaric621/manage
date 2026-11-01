<template>
  <div class="product-create-page">
    <!-- 顶部固定操作条 -->
    <div class="top-bar">
      <div class="top-bar__left">
        <span class="top-bar__title">{{ isEdit ? '编辑商品' : '新增商品' }}</span>
        <ElTag v-if="isEdit" size="small" effect="light" type="primary">编辑中</ElTag>
      </div>
      <div class="top-bar__right">
        <ElButton @click="go('/product/list')">取消</ElButton>
        <ElButton :loading="saving" @click="handleSave('draft')">保存草稿</ElButton>
        <ElButton type="primary" :loading="saving" @click="handleSave('publish')">
          保存并上架
        </ElButton>
      </div>
    </div>

    <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px" class="product-form">
      <div class="form-layout">
        <!-- 左侧锚点导航 -->
        <aside class="form-sidebar">
          <div class="sidebar-progress">
            <div class="progress-header">
              <span class="progress-label">完成度</span>
              <span class="progress-percent">{{ completion }}%</span>
            </div>
            <ElProgress :percentage="completion" :stroke-width="6" :show-text="false" class="progress-line" />
          </div>

          <nav class="sidebar-nav">
            <a
              v-for="item in anchors"
              :key="item.key"
              class="nav-item"
              :class="{ active: activeAnchor === item.key }"
              @click="scrollTo(item.key)"
            >
              <Icon :icon="item.icon" width="16" />
              <span>{{ item.label }}</span>
              <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
            </a>
          </nav>
        </aside>

        <!-- 右侧表单内容 -->
        <main class="form-main">
          <!-- 基础信息 -->
          <section ref="basicSection" class="form-section" data-anchor="basic">
            <div class="section-header">
              <div class="section-title">
                <Icon icon="solar:document-text-bold-duotone" width="18" />
                基础信息
              </div>
              <ElTag v-if="form.name" size="small" effect="light" type="success">已填写</ElTag>
            </div>

            <ElRow :gutter="24">
              <ElCol :xs="24" :md="14">
                <ElFormItem label="商品名称" prop="name">
                  <ElInput v-model="form.name" placeholder="请输入商品名称" maxlength="60" show-word-limit clearable />
                </ElFormItem>
                <ElFormItem label="商品分类" prop="category">
                  <ElCascader
                    v-model="form.category"
                    :options="categoryOptions"
                    placeholder="请选择商品分类"
                    style="width: 100%"
                    clearable
                  />
                </ElFormItem>
                <ElFormItem label="品牌">
                  <ElSelect v-model="form.brand" placeholder="请选择品牌" clearable filterable style="width: 100%">
                    <ElOption v-for="b in brands" :key="b.value" :label="b.label" :value="b.value" />
                  </ElSelect>
                </ElFormItem>
                <ElFormItem label="商品标签">
                  <ElSelect
                    v-model="form.tags"
                    multiple
                    filterable
                    allow-create
                    default-first-option
                    placeholder="选择或输入标签"
                    style="width: 100%"
                  >
                    <ElOption v-for="t in tagOptions" :key="t" :label="t" :value="t" />
                  </ElSelect>
                </ElFormItem>
              </ElCol>
              <ElCol :xs="24" :md="10">
                <ElFormItem label="商品编号">
                  <ElInput v-model="form.no" disabled>
                    <template #append>
                      <ElButton size="small" @click="copyNo">复制</ElButton>
                    </template>
                  </ElInput>
                </ElFormItem>
                <ElFormItem label="上架状态">
                  <ElRadioGroup v-model="form.status">
                    <ElRadio value="on">立即上架</ElRadio>
                    <ElRadio value="off">暂不上架</ElRadio>
                  </ElRadioGroup>
                </ElFormItem>
                <ElFormItem label="排序">
                  <ElInputNumber v-model="form.sort" :min="0" :max="9999" controls-position="right" style="width: 100%" />
                </ElFormItem>
                <ElFormItem label="商品简介">
                  <ElInput
                    v-model="form.desc"
                    type="textarea"
                    :rows="4"
                    maxlength="120"
                    show-word-limit
                    placeholder="简要描述商品卖点"
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>
          </section>

          <!-- 商品图片 -->
          <section ref="imagesSection" class="form-section" data-anchor="images">
            <div class="section-header">
              <div class="section-title">
                <Icon icon="solar:gallery-bold-duotone" width="18" />
                商品图片
              </div>
              <span class="section-tip">建议 800×800px，最多 5 张，首张为主图</span>
            </div>

            <ElFormItem label-width="0">
              <ImageUploader v-model="form.images" :max="5" />
            </ElFormItem>
          </section>

          <!-- 规格与价格 -->
          <section ref="skuSection" class="form-section" data-anchor="sku">
            <div class="section-header">
              <div class="section-title">
                <Icon icon="solar:slider-vertical-bold-duotone" width="18" />
                规格与价格
              </div>
              <ElRadioGroup v-model="skuMode" size="small" @change="handleSkuModeChange">
                <ElRadioButton label="single">单规格</ElRadioButton>
                <ElRadioButton label="multi">多规格</ElRadioButton>
              </ElRadioGroup>
            </div>

            <SingleSkuForm v-if="skuMode === 'single'" v-model="form.single" />

            <template v-else>
              <SpecEditor v-model="form.specs" @change="rebuildSkuRows" />
              <SkuTable v-model:rows="skuRows" :specs="form.specs" @change="onSkuChange" />
            </template>
          </section>

          <!-- 商品详情 -->
          <section ref="detailSection" class="form-section" data-anchor="detail">
            <div class="section-header">
              <div class="section-title">
                <Icon icon="solar:document-add-bold-duotone" width="18" />
                商品详情
              </div>
              <span class="section-tip">支持纯文本，可后续接入富文本编辑器</span>
            </div>

            <div class="editor-wrap">
              <div class="editor-toolbar">
                <ElButton link size="small" @click="insertDetail('【商品卖点】')">插入卖点</ElButton>
                <ElButton link size="small" @click="insertDetail('【规格参数】')">插入参数</ElButton>
                <ElButton link size="small" @click="insertDetail('【售后说明】')">插入售后</ElButton>
              </div>
              <ElInput
                v-model="form.detail"
                type="textarea"
                :rows="12"
                placeholder="请输入商品详情（可粘贴富文本内容）"
              />
            </div>
          </section>
        </main>
      </div>
    </ElForm>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Icon } from '@iconify/vue'

import ImageUploader from './components/ImageUploader.vue'
import SingleSkuForm from './components/SingleSkuForm.vue'
import SpecEditor from './components/SpecEditor.vue'
import SkuTable from './components/SkuTable.vue'

import {
  getCategories,
  getBrands,
  getTags,
  getProductDetail,
  saveProduct
} from '@/api/product'

import type {
  BrandOption,
  CategoryOption,
  ProductForm,
  SaveType,
  SkuMode,
  SkuRow,
  SpecItem
} from './types'

const router = useRouter()
const route = useRoute()
const formRef = ref<FormInstance>()
const saving = ref(false)
const isEdit = computed<boolean>(() => !!route.params.id)

// ---------- 选项 ----------
const categoryOptions = ref<CategoryOption[]>([])
const brands = ref<BrandOption[]>([])
const tagOptions = ref<string[]>([])

// ---------- 表单 ----------
const form = reactive<ProductForm>({
  name: '',
  category: [],
  brand: '',
  tags: [],
  no: 'SP' + Date.now(),
  status: 'on',
  sort: 0,
  desc: '',
  images: [],
  single: { price: 0, originPrice: 0, costPrice: 0, stock: 0, warnStock: 10, weight: 0 },
  specs: [],
  detail: ''
})

const rules: FormRules<ProductForm> = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
  'single.price': [{ required: true, message: '请输入售价', trigger: 'blur' }],
  'single.stock': [{ required: true, message: '请输入库存', trigger: 'blur' }]
}

// ---------- 填写进度 ----------
const completion = computed<number>(() => {
  let score = 0
  if (form.name) score += 20
  if (form.category.length) score += 20
  if (form.images.length) score += 20
  if (skuMode.value === 'single'
    ? form.single.price > 0 && form.single.stock > 0
    : skuRows.value.length) score += 20
  if (form.detail) score += 20
  return score
})

// ---------- 锚点导航 ----------
const basicSection = ref<HTMLElement>()
const imagesSection = ref<HTMLElement>()
const skuSection = ref<HTMLElement>()
const detailSection = ref<HTMLElement>()
const activeAnchor = ref('basic')

const anchors = computed(() => [
  { key: 'basic', label: '基础信息', icon: 'solar:document-text-bold-duotone', badge: '' },
  { key: 'images', label: '商品图片', icon: 'solar:gallery-bold-duotone', badge: form.images.length ? String(form.images.length) : '' },
  { key: 'sku', label: '规格与价格', icon: 'solar:slider-vertical-bold-duotone', badge: skuMode.value === 'multi' && skuRows.value.length ? String(skuRows.value.length) : '' },
  { key: 'detail', label: '商品详情', icon: 'solar:document-add-bold-duotone', badge: '' }
])

function scrollTo(key: string): void {
  const sectionMap: Record<string, HTMLElement | undefined> = {
    basic: basicSection.value,
    images: imagesSection.value,
    sku: skuSection.value,
    detail: detailSection.value
  }
  const el = sectionMap[key]
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeAnchor.value = key
  }
}

function handleScroll(): void {
  const sections = [
    { key: 'basic', el: basicSection.value },
    { key: 'images', el: imagesSection.value },
    { key: 'sku', el: skuSection.value },
    { key: 'detail', el: detailSection.value }
  ].filter(s => s.el)

  const scrollTop = window.scrollY + 120
  let current = 'basic'
  for (const s of sections) {
    if (s.el && s.el.offsetTop <= scrollTop) {
      current = s.key
    }
  }
  activeAnchor.value = current
}

// ---------- SKU 模式 ----------
const skuMode = ref<SkuMode>('single')
const skuRows = ref<SkuRow[]>([])

function handleSkuModeChange(mode: SkuMode): void {
  if (mode === 'multi' && !form.specs.length) {
    ElMessage.info('已切换为多规格，请定义规格与规格值')
  }
}

// ---------- SKU 笛卡尔积 ----------
function cartesian(specs: SpecItem[]): string[][] {
  return specs.reduce<string[][]>((acc, spec) => {
    if (!spec.values.length) return acc
    const next: string[][] = []
    acc.forEach(combo => {
      spec.values.forEach(val => {
        next.push([...combo, val.name])
      })
    })
    return next
  }, [[]])
}

function rebuildSkuRows(): void {
  const validSpecs = form.specs.filter(s => s.values.length)
  if (!validSpecs.length) {
    skuRows.value = []
    return
  }
  const combos = cartesian(validSpecs)
  const oldMap = new Map(skuRows.value.map(r => [r.specValues.join('|'), r]))
  skuRows.value = combos.map((values, idx) => {
    const key = values.join('|')
    const old = oldMap.get(key)
    return old || {
      specValues: values,
      price: 0,
      originPrice: 0,
      stock: 0,
      skuNo: `SKU${Date.now()}${idx}`,
      weight: 0,
      image: ''
    }
  })
}

function onSkuChange(): void {
  // 预留扩展点
}

// ---------- 复制编号 ----------
function copyNo(): void {
  navigator.clipboard.writeText(form.no)
    .then(() => ElMessage.success('已复制商品编号'))
    .catch(() => ElMessage.error('复制失败'))
}

// ---------- 详情插入 ----------
function insertDetail(text: string): void {
  form.detail = form.detail ? `${form.detail}\n${text}` : text
}

// ---------- 保存 ----------
async function handleSave(type: SaveType): Promise<void> {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    ElMessage.warning('请完善必填信息')
    return
  }
  if (skuMode.value === 'multi' && !skuRows.value.length) {
    ElMessage.warning('请先定义规格并生成 SKU 组合')
    return
  }
  saving.value = true
  try {
    const res = await saveProduct(
      {
        ...form,
        id: isEdit.value ? Number(route.params.id) : undefined,
        skuMode: skuMode.value,
        skuRows: skuRows.value
      },
      type
    )
    ElMessage.success(res.message)
    router.push('/product/list')
  } catch {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

function go(path: string): void {
  router.push(path)
}

// ---------- 离开拦截 ----------
const isDirty = computed<boolean>(() =>
  !!form.name || form.images.length > 0 || !!form.detail
)

onBeforeRouteLeave(async () => {
  if (!isDirty.value || saving.value) return true
  try {
    await ElMessageBox.confirm('当前有未保存的内容，确定离开吗？', '提示', {
      type: 'warning',
      confirmButtonText: '离开',
      cancelButtonText: '留下'
    })
    return true
  } catch {
    return false
  }
})

// ---------- 加载详情 ----------
async function loadDetail(id: number): Promise<void> {
  try {
    const detail = await getProductDetail(id)
    if (!detail) {
      ElMessage.error('商品不存在')
      return
    }
    Object.assign(form, {
      name: detail.name,
      category: detail.category,
      brand: detail.brand,
      tags: detail.tags,
      no: detail.no,
      status: detail.status,
      sort: detail.sort,
      desc: detail.desc,
      images: detail.images,
      single: detail.single,
      specs: detail.specs,
      detail: detail.detail
    })
    skuMode.value = detail.skuMode
    skuRows.value = detail.skuRows
  } catch {
    ElMessage.error('加载商品详情失败')
  }
}

// ---------- 初始化 ----------
onMounted(async () => {
  const [cats, brs, tags] = await Promise.all([getCategories(), getBrands(), getTags()])
  categoryOptions.value = cats
  brands.value = brs
  tagOptions.value = tags

  if (isEdit.value) {
    await loadDetail(Number(route.params.id))
  }

  nextTick(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style lang="scss" scoped>
$primary: #409eff;
$text-main: #1f2d3d;
$text-secondary: #8a94a6;
$border-light: #eef1f6;
$bg-soft: #f7f9fc;
$gap: 16px;

@mixin flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.product-create-page {
  padding: $gap;
  background: $bg-soft;
  min-height: 100%;
  box-sizing: border-box;
}

.top-bar {
  position: sticky;
  top: 18px;
  z-index: 20;
  @include flex-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px 20px;
  margin-bottom: $gap;
  background: #fff;
  border: 1px solid $border-light;

  &__left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__title {
    font-size: 18px;
    font-weight: 600;
    color: $text-main;
  }

  &__right {
    display: flex;
    gap: 8px;
  }
}

.form-layout {
  display: flex;
  gap: $gap;
  align-items: flex-start;
}

.form-sidebar {
  width: 200px;
  flex-shrink: 0;
  position: sticky;
  top: 76px;
  background: #fff;
  border: 1px solid $border-light;
  padding: 16px;
}

.sidebar-progress {
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid $border-light;

  .progress-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .progress-label {
    font-size: 12px;
    color: $text-secondary;
  }

  .progress-percent {
    font-size: 14px;
    font-weight: 700;
    color: $primary;
  }

  .progress-line {
    :deep(.el-progress-bar__outer) {
      background: #eef4fd;
    }

    :deep(.el-progress-bar__inner) {
      background: $primary;
    }
  }
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  font-size: 13px;
  color: $text-secondary;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    background: $bg-soft;
    color: $primary;
  }

  &.active {
    background: #e8f3ff;
    color: $primary;
    font-weight: 600;
  }

  .nav-badge {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    font-size: 11px;
    font-weight: 600;
    color: #fff;
    background: $primary;
  }
}

.form-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: $gap;
}

.form-section {
  background: #fff;
  border: 1px solid $border-light;
  padding: 20px 24px;
  scroll-margin-top: 76px;
}

.section-header {
  @include flex-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid $border-light;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: $text-main;

  svg {
    color: $primary;
  }
}

.section-tip {
  font-size: 12px;
  color: $text-secondary;
}

.editor-wrap {
  width: 100%;

  .editor-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    margin-bottom: 8px;
    background: $bg-soft;
    border: 1px solid $border-light;
  }
}

@media (max-width: 1024px) {
  .form-sidebar {
    display: none;
  }
}

@media (max-width: 768px) {
  .product-create-page {
    padding: 12px;
  }

  .top-bar {
    padding: 10px 14px;

    &__title {
      font-size: 16px;
    }

    &__right {
      width: 100%;
      justify-content: flex-end;
    }
  }

  .form-section {
    padding: 16px;
    scroll-margin-top: 120px;
  }
}
</style>