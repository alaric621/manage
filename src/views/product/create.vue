<template>
  <div class="product-create-page">
    <!-- 顶部进度条 -->
    <div class="progress-bar">
      <div class="progress-inner">
        <div class="progress-text">
          <span class="progress-label">{{ isEdit ? '编辑商品' : '新增商品' }}</span>
          <span class="progress-tip">已完成 {{ completion }}%</span>
        </div>
        <ElProgress :percentage="completion" :stroke-width="6" :show-text="false" class="progress-line" />
      </div>
    </div>

    <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px" class="product-form">
      <!-- 基础信息 -->
      <SectionCard title="基础信息">
        <template #extra>
          <ElTag v-if="form.name" size="small" effect="light" round type="success">已填写</ElTag>
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
              <ElInput v-model="form.no" placeholder="自动生成" disabled />
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

        <!-- 单规格 -->
        <SingleSkuForm v-if="skuMode === 'single'" v-model="form.single" />

        <!-- 多规格 -->
        <template v-else>
          <SpecEditor v-model="form.specs" @change="rebuildSkuRows" />
          <SkuTable v-model:rows="skuRows" :specs="form.specs" @change="onSkuChange" />
        </template>
      </SectionCard>

      <!-- 商品详情 -->
      <SectionCard title="商品详情">
        <template #extra>
          <span class="header-tip">支持纯文本，可后续接入富文本编辑器</span>
        </template>
        <ElFormItem label-width="0">
          <div class="editor-wrap">
            <div class="editor-toolbar">
              <ElButton link size="small" @click="insertDetail('【商品卖点】')">插入卖点</ElButton>
              <ElButton link size="small" @click="insertDetail('【规格参数】')">插入参数</ElButton>
              <ElButton link size="small" @click="insertDetail('【售后说明】')">插入售后</ElButton>
            </div>
            <ElInput
              v-model="form.detail"
              type="textarea"
              :rows="6"
              placeholder="请输入商品详情（可粘贴富文本内容）"
            />
          </div>
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
const saving = ref(false)
const isEdit = computed<boolean>(() => !!route.params.id)

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
  // SKU 行数据变化时可由 SkuTable 内部通过 v-model:rows 同步，此处预留校验/统计扩展点
}

// ---------- 详情插入 ----------
function insertDetail(text: string): void {
  form.detail = form.detail ? `${form.detail}\n${text}` : text
}

// ---------- 保存提示 ----------
const saveTip = computed<string>(() =>
  completion.value < 100 ? '信息未填写完整，可先保存草稿' : '信息已填写完整，可直接保存并上架'
)

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
  await new Promise(r => setTimeout(r, 800))
  saving.value = false
  ElMessage.success(type === 'publish' ? '商品已保存并上架' : '草稿已保存')
  router.push('/product/list')
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

// ---------- 初始化 ----------
onMounted(() => {
  if (isEdit.value) {
    // TODO: 根据 route.params.id 拉取商品详情并回填 form
    ElMessage.info(`编辑商品 ID：${String(route.params.id)}`)
  }
})
</script>

<style lang="scss" scoped>
// ---------- 设计令牌 ----------
$primary: #409eff;
$text-main: #1f2d3d;
$text-secondary: #8a94a6;
$border-light: #eef1f6;
$bg-soft: #f7f9fc;
$radius-block: 12px;
$gap: 16px;
$shadow-card: 0 2px 8px rgba(31, 45, 61, 0.04);

// ---------- 页面 ----------
.product-create-page {
  padding: $gap;
  background: $bg-soft;
  // min-height: 100%;
  
  padding-bottom: 88px;
}

// ---------- 进度条 ----------
.progress-bar {
  max-width: 1200px;
  margin: 0 auto 14px;

  .progress-inner {
    background: #fff;
    border: 1px solid $border-light;
    border-radius: $radius-block;
    padding: 12px 18px;
    box-shadow: $shadow-card;
  }

  .progress-text {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 13px;
  }

  .progress-label {
    font-weight: 600;
    color: $text-main;
  }

  .progress-tip {
    color: $text-secondary;
  }

  .progress-line {
    :deep(.el-progress-bar__outer) {
      background: #eef4fd;
    }
  }
}

// ---------- 表单 ----------
.product-form {
  max-width: 1200px;
  margin: 0 auto;
}

.header-tip {
  font-size: 12px;
  color: $text-secondary;
}

// ---------- 详情编辑 ----------
.editor-wrap {
  width: 100%;

  .editor-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    margin-bottom: 8px;
    background: $bg-soft;
    border-radius: 10px;
  }
}

// ---------- 底部操作栏 ----------
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

// ---------- 响应式 ----------
@media (max-width: 768px) {
  .product-create-page {
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