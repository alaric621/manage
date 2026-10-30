<template>
  <div class="list-page level-page">
    <!-- 数据概览 -->
    <ElRow :gutter="16" class="stat-row">
      <ElCol v-for="s in stats" :key="s.label" :xs="12" :sm="12" :md="6">
        <div class="stat-card" :style="{ '--accent': s.color, '--accent-soft': s.bg }">
          <div class="stat-icon">
            <Icon :icon="s.icon" width="22" height="22" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ s.value }}</div>
            <div class="stat-label">{{ s.label }}</div>
          </div>
        </div>
      </ElCol>
    </ElRow>

    <!-- 列表区 -->
    <ElCard class="panel-card" shadow="never">
      <template #header>
        <div class="panel-header">
          <div class="panel-title">
            <span class="title-dot"></span>
            会员等级
            <span class="title-sub">共 {{ list.length }} 个等级</span>
          </div>
          <div class="panel-actions">
            <ElButton type="primary" size="small" @click="openCreate">
              <Icon icon="solar:add-circle-bold-duotone" class="btn-icon" />新增等级
            </ElButton>
          </div>
        </div>
      </template>

      <ElTable :data="list" class="pretty-table" row-key="id" v-loading="loading">
        <ElTableColumn label="等级" min-width="180">
          <template #default="{ row }">
            <div class="level-cell">
              <div class="level-badge" :style="{ background: row.bg, color: row.color }">
                <Icon :icon="row.icon" width="18" />
              </div>
              <div class="level-meta">
                <div class="level-name">{{ row.name }}</div>
                <div class="level-code">等级值：{{ row.value }}</div>
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="升级条件" min-width="220">
          <template #default="{ row }">
            <div class="condition-cell">
              <span class="condition-item">
                <Icon icon="solar:wallet-money-bold-duotone" width="14" />
                累计消费 ≥ ¥{{ row.thresholdAmount.toFixed(2) }}
              </span>
              <span class="condition-item">
                <Icon icon="solar:bag-check-bold-duotone" width="14" />
                订单数 ≥ {{ row.thresholdOrders }}
              </span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="等级权益" min-width="240">
          <template #default="{ row }">
            <div class="benefit-tags">
              <ElTag v-for="b in row.benefits" :key="b" size="small" effect="light" round>
                {{ b }}
              </ElTag>
              <span v-if="!row.benefits.length" class="empty-text">暂无权益</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="折扣" width="90" align="center">
          <template #default="{ row }">
            <span class="discount">{{ row.discount === 1 ? '无' : `${(row.discount * 10).toFixed(1)} 折` }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="会员数" width="100" align="center">
          <template #default="{ row }">{{ row.memberCount }}</template>
        </ElTableColumn>
        <ElTableColumn label="状态" width="90">
          <template #default="{ row }">
            <ElSwitch
              v-model="row.status"
              :active-value="'on'"
              :inactive-value="'off'"
              size="small"
              @change="handleStatusChange(row)"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="sort" label="排序" width="80" align="center" />
        <ElTableColumn label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <ElButton link type="primary" size="small" @click="openEdit(row)">编辑</ElButton>
            <ElPopconfirm title="确定删除该等级？" @confirm="handleDelete(row)">
              <template #reference>
                <ElButton link type="danger" size="small" :disabled="row.memberCount > 0">
                  删除
                </ElButton>
              </template>
            </ElPopconfirm>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>

    <!-- 新增/编辑弹窗 -->
    <ElDialog
      v-model="dialogVisible"
      :title="formMode === 'create' ? '新增会员等级' : '编辑会员等级'"
      width="560px"
      destroy-on-close
    >
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px">
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="等级名称" prop="name">
              <ElInput v-model="form.name" placeholder="如：金卡会员" maxlength="20" show-word-limit />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="等级值" prop="value">
              <ElInputNumber v-model="form.value" :min="1" :max="99" controls-position="right" style="width: 100%" />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElFormItem label="等级图标">
          <div class="icon-picker">
            <ElSelect v-model="form.icon" placeholder="选择图标" style="flex: 1">
              <ElOption v-for="ic in iconOptions" :key="ic.value" :label="ic.label" :value="ic.value">
                <div class="icon-option">
                  <Icon :icon="ic.value" width="18" />
                  <span>{{ ic.label }}</span>
                </div>
              </ElOption>
            </ElSelect>
            <div class="icon-preview" :style="{ background: form.bg, color: form.color }">
              <Icon :icon="form.icon" width="20" />
            </div>
          </div>
        </ElFormItem>
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="主题色">
              <ElColorPicker v-model="form.color" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="排序">
              <ElInputNumber v-model="form.sort" :min="0" :max="9999" controls-position="right" style="width: 100%" />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElFormItem label="升级条件">
          <div class="condition-editor">
            <div class="condition-row">
              <span class="condition-label">累计消费 ≥</span>
              <ElInputNumber v-model="form.thresholdAmount" :min="0" :precision="2" controls-position="right" style="width: 160px">
                <template #prefix>¥</template>
              </ElInputNumber>
            </div>
            <div class="condition-row">
              <span class="condition-label">订单数 ≥</span>
              <ElInputNumber v-model="form.thresholdOrders" :min="0" controls-position="right" style="width: 160px" />
            </div>
          </div>
        </ElFormItem>
        <ElFormItem label="折扣">
          <ElInputNumber v-model="form.discount" :min="0.1" :max="1" :step="0.05" :precision="2" controls-position="right" style="width: 160px" />
          <span class="form-tip">1 表示无折扣，0.9 表示 9 折</span>
        </ElFormItem>
        <ElFormItem label="等级权益">
          <div class="benefit-editor">
            <ElTag
              v-for="(b, idx) in form.benefits"
              :key="idx"
              closable
              effect="light"
              round
              @close="removeBenefit(idx)"
            >
              {{ b }}
            </ElTag>
            <ElInput
              v-if="benefitInputVisible"
              ref="benefitInputRef"
              v-model="benefitInputValue"
              size="small"
              style="width: 140px"
              @keyup.enter="confirmBenefit"
              @blur="confirmBenefit"
            />
            <ElButton v-else size="small" class="add-benefit-btn" @click="showBenefitInput">
              + 添加权益
            </ElButton>
          </div>
        </ElFormItem>
        <ElFormItem label="状态">
          <ElRadioGroup v-model="form.status">
            <ElRadio value="on">启用</ElRadio>
            <ElRadio value="off">禁用</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
      </ElForm>

      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="saving" @click="handleSave">保存</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules, InputInstance } from 'element-plus'
import { Icon } from '@iconify/vue'

// ---------- 类型 ----------
type ItemStatus = 'on' | 'off'
type FormMode = 'create' | 'edit'

interface LevelRow {
  id: number
  name: string
  value: number
  icon: string
  color: string
  bg: string
  thresholdAmount: number
  thresholdOrders: number
  benefits: string[]
  discount: number
  memberCount: number
  status: ItemStatus
  sort: number
}

interface LevelForm {
  id: number | null
  name: string
  value: number
  icon: string
  color: string
  bg: string
  thresholdAmount: number
  thresholdOrders: number
  benefits: string[]
  discount: number
  status: ItemStatus
  sort: number
}

// ---------- 概览 ----------
const stats = computed(() => {
  const total = mockData.length
  const enabled = mockData.filter(d => d.status === 'on').length
  const totalMembers = mockData.reduce((s, d) => s + d.memberCount, 0)
  const maxLevel = mockData.reduce((m, d) => Math.max(m, d.value), 0)
  return [
    { label: '等级总数', value: total, icon: 'solar:ranking-bold-duotone', color: '#409eff', bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
    { label: '启用中', value: enabled, icon: 'solar:check-circle-bold-duotone', color: '#52b788', bg: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' },
    { label: '覆盖会员', value: totalMembers, icon: 'solar:users-group-rounded-bold-duotone', color: '#e6a23c', bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)' },
    { label: '最高等级', value: `Lv.${maxLevel}`, icon: 'solar:medal-ribbon-bold-duotone', color: '#f56c6c', bg: 'linear-gradient(135deg, #ffeaea, #ffd6d6)' }
  ]
})

// ---------- 列表 ----------
const loading = ref(false)
const list = ref<LevelRow[]>([])

const mockData: LevelRow[] = [
  { id: 1, name: '普通会员', value: 1, icon: 'solar:user-bold-duotone', color: '#8a94a6', bg: 'linear-gradient(135deg, #f5f7fa, #e4e7ed)', thresholdAmount: 0, thresholdOrders: 0, benefits: ['基础会员权益'], discount: 1, memberCount: 1286, status: 'on', sort: 1 },
  { id: 2, name: '银卡会员', value: 2, icon: 'solar:medal-ribbon-bold-duotone', color: '#409eff', bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)', thresholdAmount: 1000, thresholdOrders: 5, benefits: ['9.8 折优惠', '积分 1.2 倍'], discount: 0.98, memberCount: 486, status: 'on', sort: 2 },
  { id: 3, name: '金卡会员', value: 3, icon: 'solar:medal-star-bold-duotone', color: '#e6a23c', bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)', thresholdAmount: 5000, thresholdOrders: 20, benefits: ['9.5 折优惠', '积分 1.5 倍', '专属客服'], discount: 0.95, memberCount: 128, status: 'on', sort: 3 },
  { id: 4, name: '钻石会员', value: 4, icon: 'solar:crown-bold-duotone', color: '#f56c6c', bg: 'linear-gradient(135deg, #ffeaea, #ffd6d6)', thresholdAmount: 20000, thresholdOrders: 60, benefits: ['9 折优惠', '积分 2 倍', '专属客服', '生日礼包', '优先发货'], discount: 0.9, memberCount: 36, status: 'on', sort: 4 }
]

const iconOptions = [
  { label: '普通用户', value: 'solar:user-bold-duotone' },
  { label: '奖牌', value: 'solar:medal-ribbon-bold-duotone' },
  { label: '星奖', value: 'solar:medal-star-bold-duotone' },
  { label: '皇冠', value: 'solar:crown-bold-duotone' },
  { label: '钻石', value: 'solar:diamond-bold-duotone' },
  { label: '星星', value: 'solar:star-bold-duotone' }
]

async function fetchList(): Promise<void> {
  loading.value = true
  await new Promise(r => setTimeout(r, 300))
  list.value = [...mockData].sort((a, b) => a.sort - b.sort)
  loading.value = false
}

// ---------- 弹窗 ----------
const dialogVisible = ref(false)
const formMode = ref<FormMode>('create')
const saving = ref(false)
const formRef = ref<FormInstance>()

const defaultForm = (): LevelForm => ({
  id: null,
  name: '',
  value: 1,
  icon: 'solar:medal-ribbon-bold-duotone',
  color: '#409eff',
  bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)',
  thresholdAmount: 0,
  thresholdOrders: 0,
  benefits: [],
  discount: 1,
  status: 'on',
  sort: 0
})

const form = reactive<LevelForm>(defaultForm())

const rules: FormRules<LevelForm> = {
  name: [{ required: true, message: '请输入等级名称', trigger: 'blur' }],
  value: [{ required: true, message: '请输入等级值', trigger: 'blur' }]
}

// 权益编辑器
const benefitInputVisible = ref(false)
const benefitInputValue = ref('')
const benefitInputRef = ref<InputInstance>()

function showBenefitInput(): void {
  benefitInputVisible.value = true
  nextTick(() => benefitInputRef.value?.focus())
}

function confirmBenefit(): void {
  const val = benefitInputValue.value.trim()
  if (val && !form.benefits.includes(val)) form.benefits.push(val)
  benefitInputVisible.value = false
  benefitInputValue.value = ''
}

function removeBenefit(idx: number): void {
  form.benefits.splice(idx, 1)
}

// ---------- 打开弹窗 ----------
function openCreate(): void {
  formMode.value = 'create'
  Object.assign(form, defaultForm())
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

function openEdit(row: LevelRow): void {
  formMode.value = 'edit'
  Object.assign(form, {
    id: row.id,
    name: row.name,
    value: row.value,
    icon: row.icon,
    color: row.color,
    bg: row.bg,
    thresholdAmount: row.thresholdAmount,
    thresholdOrders: row.thresholdOrders,
    benefits: [...row.benefits],
    discount: row.discount,
    status: row.status,
    sort: row.sort
  })
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

// ---------- 保存 ----------
async function handleSave(): Promise<void> {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  saving.value = true
  await new Promise(r => setTimeout(r, 300))
  saving.value = false

  // 根据主题色生成浅色背景
  const bg = `linear-gradient(135deg, ${form.color}1a, ${form.color}33)`

  if (formMode.value === 'create') {
    const newRow: LevelRow = {
      id: Date.now(),
      name: form.name,
      value: form.value,
      icon: form.icon,
      color: form.color,
      bg,
      thresholdAmount: form.thresholdAmount,
      thresholdOrders: form.thresholdOrders,
      benefits: [...form.benefits],
      discount: form.discount,
      memberCount: 0,
      status: form.status,
      sort: form.sort
    }
    mockData.push(newRow)
    ElMessage.success('等级已新增')
  } else if (form.id) {
    const idx = mockData.findIndex(d => d.id === form.id)
    if (idx > -1) {
      mockData[idx] = {
        ...mockData[idx],
        name: form.name,
        value: form.value,
        icon: form.icon,
        color: form.color,
        bg,
        thresholdAmount: form.thresholdAmount,
        thresholdOrders: form.thresholdOrders,
        benefits: [...form.benefits],
        discount: form.discount,
        status: form.status,
        sort: form.sort
      }
    }
    ElMessage.success('等级已更新')
  }

  dialogVisible.value = false
  fetchList()
}

function handleDelete(row: LevelRow): void {
  const idx = mockData.findIndex(d => d.id === row.id)
  if (idx > -1) mockData.splice(idx, 1)
  ElMessage.success('删除成功')
  fetchList()
}

function handleStatusChange(row: LevelRow): void {
  ElMessage.success(`等级已${row.status === 'on' ? '启用' : '禁用'}`)
}

onMounted(fetchList)
</script>

<style lang="scss" scoped>
// 仅保留会员等级页独有样式，通用样式由全局 .list-page 提供
.level-page {
  .level-cell {
    display: flex;
    align-items: center;
    gap: 12px;

    .level-badge {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .level-name {
      font-size: 13px;
      font-weight: 600;
      color: #1f2d3d;
    }

    .level-code {
      margin-top: 2px;
      font-size: 12px;
      color: #8a94a6;
    }
  }

  .condition-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .condition-item {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #5a6472;
    }
  }

  .benefit-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;

    .empty-text {
      font-size: 12px;
      color: #8a94a6;
    }
  }

  .discount {
    font-weight: 600;
    color: #409eff;
  }

  // 弹窗内
  .icon-picker {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
  }

  .icon-preview {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: 1px solid #eef1f6;
  }

  .icon-option {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .condition-editor {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
  }

  .condition-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .condition-label {
    font-size: 13px;
    color: #5a6472;
    min-width: 80px;
  }

  .form-tip {
    margin-left: 8px;
    font-size: 12px;
    color: #8a94a6;
  }

  .benefit-editor {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    min-height: 32px;

    .add-benefit-btn {
      border-style: dashed;
    }
  }
}
</style>