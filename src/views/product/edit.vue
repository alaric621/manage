<template>
  <div class="product-edit-page" v-loading="loading" element-loading-text="加载商品数据中...">
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px" class="product-form">
      <!-- 基础信息 -->
      <SectionCard title="基础信息">
        <template #extra>
          <span class="header-tip">商品 ID：{{ productId }}</span>
        </template>
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
              <ElInput v-model="form.no" disabled />
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
                :rows="3"
                maxlength="120"
                show-word-limit
                placeholder="简要描述商品卖点"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>
      </SectionCard>

      <!-- 商品图片 -->
      <SectionCard title="商品图片">
        <template #extra>
          <span class="header-tip">建议 800×800px，最多 5 张，首张为主图</span>
        </template>
        <ElFormItem label-width="0">
          <ImageUploader v-model="form.images" :max="5" />
        </ElFormItem>
      </SectionCard>

      <!-- 规格与价格 -->
      <SectionCard title="规格与价格">
        <template #extra>
          <ElRadioGroup v-model="skuMode" size="small" @change="handleSkuModeChange">
            <ElRadioButton label="single">单规格</ElRadioButton>
            <ElRadioButton label="multi">多规格</ElRadioButton>
          </ElRadioGroup>
        </template>

        <SingleSkuForm v-if="skuMode === 'single'" v-model="form.single" />

        <template v-else>
          <SpecEditor v-model="form.specs" @change="rebuildSkuRows" />
          <SkuTable v-model:rows="skuRows" :specs="form.specs" @change="onSkuChange" />
        </template>
      </SectionCard>

      <!-- 商品详情 -->
      <SectionCard title="商品详情">
        <ElFormItem label-width="0">
          <ElInput v-model="form.detail" type="textarea" :rows="6" placeholder="请输入商品详情" />
        </ElFormItem>
      </SectionCard>

      <!-- 底部操作栏 -->
      <div class="footer-bar">
        <div class="footer-tip">
          <Icon icon="solar:info-circle-bold-duotone" width="15" />
          <span>{{ saveTip }}</span>
        </div>
        <div class="footer-actions">
          <ElButton size="large" @click="go('/product/list')">取消</ElButton>
          <ElButton size="large" :loading="saving" @click="handleSave('draft')">保存草稿</ElButton>
          <ElButton size="large" type="primary" :loading="saving" @click="handleSave('publish')">
            保存并上架
          </ElButton>
        </div>
      </div>
    </ElForm>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Icon } from '@iconify/vue'

import SectionCard from './components/SectionCard.vue'
import ImageUploader from './components/ImageUploader.vue'
import SingleSkuForm from './components/SingleSkuForm.vue'
import SpecEditor from './components/SpecEditor.vue'
import SkuTable from './components/SkuTable.vue'

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
const loading = ref(true)
const saving = ref(false)
const productId = computed<string>(() => String(route.params.id ?? ''))

// ---------- 选项 ----------
const categoryOptions: CategoryOption[] = [
  { value: 'digital', label: '数码', children: [{ value: 'audio', label: '音频设备' }, { value: 'watch', label: '智能穿戴' }] },
  { value: 'clothes', label: '服饰', children: [{ value: 'coat', label: '外套' }, { value: 'shirt', label: '衬衫' }] },
  { value: 'beauty', label: '美妆', children: [{ value: 'skin', label: '护肤' }, { value: 'makeup', label: '彩妆' }] },
  { value: 'food', label: '食品', children: [{ value: 'snack', label: '零食' }, { value: 'drink', label: '饮品' }] }
]
const brands: BrandOption[] = [
  { value: 'xiaomi', label: '小米' },
  { value: 'huawei', label: '华为' },
  { value: 'nike', label: 'Nike' },
  { value: 'local', label: '自有品牌' }
]
const tagOptions: string[] = ['新品', '热卖', '限时折扣', '包邮', '赠品']

// ---------- 表单 ----------
const form = reactive<ProductForm>({
  name: '',
  category: [],
  brand: '',
  tags: [],
  no: '',
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

// ---------- SKU ----------
const skuMode = ref<SkuMode>('single')
const skuRows = ref<SkuRow[]>([])

function handleSkuModeChange(mode: SkuMode): void {
  if (mode === 'multi' && !form.specs.length) {
    ElMessage.info('已切换为多规格，请定义规格与规格值')
  }
}

function cartesian(specs: SpecItem[]): string[][] {
  return specs.reduce<string[][]>((acc, spec) => {
    if (!spec.values.length) return acc
    const next: string[][] = []
    acc.forEach(combo => {
      spec.values.forEach(val => {
        next.push([...combo, val])
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
      weight: 0
    }
  })
}

function onSkuChange(): void {
  // 预留扩展：SKU 变化时做汇总校验
}

// ---------- 保存提示 ----------
const saveTip = computed<string>(() => {
  if (!form.name) return '商品名称为必填项'
  if (!form.category.length) return '请选择商品分类'
  return '修改后可保存草稿或直接上架'
})

// ---------- 加载详情 ----------
interface ProductDetailResponse {
  name: string
  category: string[]
  brand: string
  tags: string[]
  no: string
  status: 'on' | 'off'
  sort: number
  desc: string
  images: { icon: string; bg: string }[]
  skuMode: SkuMode
  single: ProductForm['single']
  specs: SpecItem[]
  skuRows: SkuRow[]
  detail: string
}

async function fetchDetail(): Promise<void> {
  loading.value = true
  try {
    // TODO: 替换为真实接口：const data = await api.getProductDetail(productId.value)
    // 模拟数据
    await new Promise(r => setTimeout(r, 600))
    const mock: ProductDetailResponse = {
      name: '无线蓝牙耳机 Pro',
      category: ['digital', 'audio'],
      brand: 'xiaomi',
      tags: ['新品', '热卖'],
      no: 'SP20261030001',
      status: 'on',
      sort: 10,
      desc: '主动降噪，长续航，高清通话',
      images: [
        { icon: 'solar:headphones-round-sound-bold-duotone', bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
        { icon: 'solar:bag-smile-bold-duotone', bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)' }
      ],
      skuMode: 'multi',
      single: { price: 399, originPrice: 499, costPrice: 260, stock: 1286, warnStock: 100, weight: 0.35 },
      specs: [
        { name: '颜色', values: ['黑色', '白色'], inputVisible: false, inputValue: '' },
        { name: '版本', values: ['标准版', '降噪版'], inputVisible: false, inputValue: '' }
      ],
      skuRows: [
        { specValues: ['黑色', '标准版'], price: 399, originPrice: 499, stock: 500, skuNo: 'SKU-BLK-STD', weight: 0.35 },
        { specValues: ['黑色', '降噪版'], price: 499, originPrice: 599, stock: 300, skuNo: 'SKU-BLK-ANC', weight: 0.38 },
        { specValues: ['白色', '标准版'], price: 399, originPrice: 499, stock: 286, skuNo: 'SKU-WHT-STD', weight: 0.35 },
        { specValues: ['白色', '降噪版'], price: 499, originPrice: 599, stock: 200, skuNo: 'SKU-WHT-ANC', weight: 0.38 }
      ],
      detail: '【商品卖点】主动降噪\n【规格参数】蓝牙 5.3\n【售后说明】7 天无理由'
    }
    applyDetail(mock)
  } catch (e) {
    ElMessage.error('加载商品详情失败')
  } finally {
    loading.value = false
  }
}

function applyDetail(data: ProductDetailResponse): void {
  form.name = data.name
  form.category = [...data.category]
  form.brand = data.brand
  form.tags = [...data.tags]
  form.no = data.no
  form.status = data.status
  form.sort = data.sort
  form.desc = data.desc
  form.images = data.images.map(i => ({ ...i }))
  form.single = { ...data.single }
  form.specs = data.specs.map(s => ({ ...s, values: [...s.values] }))
  form.detail = data.detail

  skuMode.value = data.skuMode
  skuRows.value = data.skuRows.map(r => ({ ...r, specValues: [...r.specValues] }))
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
  const payload = {
    id: productId.value,
    ...form,
    skuMode: skuMode.value,
    skuRows: skuRows.value
  }
  // TODO: 调用更新接口 await api.updateProduct(payload)
  console.log('update payload:', payload)
  await new Promise(r => setTimeout(r, 800))
  saving.value = false
  ElMessage.success(type === 'publish' ? '商品已更新并上架' : '商品已保存')
  router.push('/product/list')
}

function go(path: string): void {
  router.push(path)
}

// ---------- 离开拦截 ----------
let initialSnapshot = ''
const isDirty = computed<boolean>(() =>
  JSON.stringify(form) !== initialSnapshot || skuRows.value.length > 0
)

onBeforeRouteLeave(async () => {
  if (!isDirty.value || saving.value) return true
  try {
    await ElMessageBox.confirm('当前有未保存的修改，确定离开吗？', '提示', {
      type: 'warning',
      confirmButtonText: '离开',
      cancelButtonText: '留下'
    })
    return true
  } catch {
    return false
  }
})

onMounted(async () => {
  await fetchDetail()
  initialSnapshot = JSON.stringify(form)
})
</script>

<style lang="scss" scoped>
$primary: #409eff;
$text-main: #1f2d3d;
$text-secondary: #8a94a6;
$border-light: #eef1f6;
$bg-soft: #f7f9fc;
$radius-block: 12px;
$gap: 16px;

.product-edit-page {
  padding: $gap;
  background: $bg-soft;
  min-height: 100%;
  padding-bottom: 88px;
}

.product-form {
  max-width: 1200px;
  margin: 0 auto;
}

.header-tip {
  font-size: 12px;
  color: $text-secondary;
}

.footer-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  background: rgba(255, 255, 255, 0.92);
  border-top: 1px solid $border-light;
  backdrop-filter: blur(8px);
  box-shadow: 0 -4px 16px rgba(31, 45, 61, 0.06);

  .footer-tip {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: $text-secondary;
  }

  .footer-actions {
    display: flex;
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .product-edit-page {
    padding: 12px;
  }

  .footer-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .footer-actions {
    justify-content: flex-end;
  }
}
</style>