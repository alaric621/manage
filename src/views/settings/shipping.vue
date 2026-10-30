<template>
  <div class="settings-page shipping-page">
    <!-- 概览 -->
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

    <ElTabs v-model="activeTab" class="shipping-tabs">
      <!-- 物流公司 -->
      <ElTabPane label="物流公司" name="company">
        <ElCard class="panel-card" shadow="never">
          <template #header>
            <div class="panel-header">
              <div class="panel-title">
                <span class="title-dot"></span>
                物流公司
                <span class="title-sub">{{ companies.length }} 家</span>
              </div>
              <ElButton type="primary" size="small" @click="openCompanyDialog">
                <Icon icon="solar:add-circle-bold-duotone" class="btn-icon" />新增物流公司
              </ElButton>
            </div>
          </template>

          <ElTable :data="companies" class="pretty-table" row-key="id">
            <ElTableColumn label="物流公司" min-width="200">
              <template #default="{ row }">
                <div class="company-cell">
                  <div class="company-icon" :style="{ background: row.bg, color: row.color }">
                    <Icon icon="solar:delivery-bold-duotone" width="18" />
                  </div>
                  <div class="company-meta">
                    <div class="company-name">{{ row.name }}</div>
                    <div class="company-code">{{ row.code }}</div>
                  </div>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="phone" label="客服电话" width="160" />
            <ElTableColumn prop="website" label="官网" min-width="200" show-overflow-tooltip />
            <ElTableColumn label="是否默认" width="100" align="center">
              <template #default="{ row }">
                <ElTag v-if="row.isDefault" size="small" type="success" effect="light" round>默认</ElTag>
                <span v-else class="empty-text">--</span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="状态" width="90">
              <template #default="{ row }">
                <ElSwitch v-model="row.status" :active-value="'on'" :inactive-value="'off'" size="small" />
              </template>
            </ElTableColumn>
            <ElTableColumn label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <ElButton link type="primary" size="small" @click="setDefaultCompany(row)">设为默认</ElButton>
                <ElButton link type="primary" size="small" @click="editCompany(row)">编辑</ElButton>
                <ElPopconfirm title="确定删除该物流公司？" @confirm="removeCompany(row)">
                  <template #reference>
                    <ElButton link type="danger" size="small" :disabled="row.isDefault">删除</ElButton>
                  </template>
                </ElPopconfirm>
              </template>
            </ElTableColumn>
          </ElTable>
        </ElCard>
      </ElTabPane>

      <!-- 运费模板 -->
      <ElTabPane label="运费模板" name="template">
        <ElCard class="panel-card" shadow="never">
          <template #header>
            <div class="panel-header">
              <div class="panel-title">
                <span class="title-dot"></span>
                运费模板
                <span class="title-sub">{{ templates.length }} 个</span>
              </div>
              <ElButton type="primary" size="small" @click="openTemplateDialog()">
                <Icon icon="solar:add-circle-bold-duotone" class="btn-icon" />新增模板
              </ElButton>
            </div>
          </template>

          <ElTable :data="templates" class="pretty-table" row-key="id">
            <ElTableColumn prop="name" label="模板名称" min-width="180" />
            <ElTableColumn label="计费方式" width="120">
              <template #default="{ row }">
                <ElTag size="small" effect="light" round>{{ row.modeText }}</ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn label="规则摘要" min-width="280">
              <template #default="{ row }">
                <div class="rule-list">
                  <span v-for="(r, idx) in row.rules" :key="idx" class="rule-item">{{ r }}</span>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn label="商品数" width="90" align="center">
              <template #default="{ row }">{{ row.productCount }}</template>
            </ElTableColumn>
            <ElTableColumn label="状态" width="90">
              <template #default="{ row }">
                <ElSwitch v-model="row.status" :active-value="'on'" :inactive-value="'off'" size="small" />
              </template>
            </ElTableColumn>
            <ElTableColumn label="操作" width="160" fixed="right">
              <template #default="{ row }">
                <ElButton link type="primary" size="small" @click="openTemplateDialog(row)">编辑</ElButton>
                <ElPopconfirm title="确定删除该模板？" @confirm="removeTemplate(row)">
                  <template #reference>
                    <ElButton link type="danger" size="small" :disabled="row.isDefault">删除</ElButton>
                  </template>
                </ElPopconfirm>
              </template>
            </ElTableColumn>
          </ElTable>
        </ElCard>
      </ElTabPane>
    </ElTabs>

    <!-- 物流公司弹窗 -->
    <ElDialog v-model="companyDialogVisible" :title="companyForm.id ? '编辑物流公司' : '新增物流公司'" width="520px" destroy-on-close>
      <ElForm ref="companyFormRef" :model="companyForm" :rules="companyRules" label-width="100px">
        <ElFormItem label="公司名称" prop="name">
          <ElInput v-model="companyForm.name" placeholder="如：顺丰速运" maxlength="20" show-word-limit />
        </ElFormItem>
        <ElFormItem label="公司编码" prop="code">
          <ElInput v-model="companyForm.code" placeholder="如：SF" maxlength="10" />
        </ElFormItem>
        <ElFormItem label="客服电话">
          <ElInput v-model="companyForm.phone" placeholder="如：95338" />
        </ElFormItem>
        <ElFormItem label="官网">
          <ElInput v-model="companyForm.website" placeholder="https://www.sf-express.com" />
        </ElFormItem>
        <ElFormItem label="状态">
          <ElRadioGroup v-model="companyForm.status">
            <ElRadio value="on">启用</ElRadio>
            <ElRadio value="off">禁用</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="companyDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="saveCompany">保存</ElButton>
      </template>
    </ElDialog>

    <!-- 运费模板弹窗 -->
    <ElDialog v-model="templateDialogVisible" :title="templateForm.id ? '编辑运费模板' : '新增运费模板'" width="640px" destroy-on-close>
      <ElForm ref="templateFormRef" :model="templateForm" :rules="templateRules" label-width="100px">
        <ElFormItem label="模板名称" prop="name">
          <ElInput v-model="templateForm.name" placeholder="如：全国包邮模板" maxlength="30" show-word-limit />
        </ElFormItem>
        <ElFormItem label="计费方式" prop="mode">
          <ElRadioGroup v-model="templateForm.mode">
            <ElRadio value="quantity">按件数</ElRadio>
            <ElRadio value="weight">按重量</ElRadio>
            <ElRadio value="free">包邮</ElRadio>
          </ElRadioGroup>
        </ElFormItem>

        <!-- 按件数 / 按重量规则 -->
        <template v-if="templateForm.mode !== 'free'">
          <ElFormItem label="默认运费">
            <div class="fee-editor">
              <div class="fee-row">
                <span class="fee-label">{{ templateForm.mode === 'quantity' ? '首件' : '首重' }}</span>
                <ElInputNumber v-model="templateForm.firstUnit" :min="1" controls-position="right" style="width: 100px" />
                <span class="fee-unit">{{ templateForm.mode === 'quantity' ? '件' : 'kg' }}</span>
                <span class="fee-label">运费</span>
                <ElInputNumber v-model="templateForm.firstFee" :min="0" :precision="2" controls-position="right" style="width: 120px">
                  <template #prefix>¥</template>
                </ElInputNumber>
              </div>
              <div class="fee-row">
                <span class="fee-label">续{{ templateForm.mode === 'quantity' ? '件' : '重' }}</span>
                <ElInputNumber v-model="templateForm.addUnit" :min="1" controls-position="right" style="width: 100px" />
                <span class="fee-unit">{{ templateForm.mode === 'quantity' ? '件' : 'kg' }}</span>
                <span class="fee-label">加收</span>
                <ElInputNumber v-model="templateForm.addFee" :min="0" :precision="2" controls-position="right" style="width: 120px">
                  <template #prefix>¥</template>
                </ElInputNumber>
              </div>
            </div>
          </ElFormItem>

          <ElFormItem label="偏远地区">
            <div class="region-list">
              <ElTag v-for="(r, idx) in templateForm.remoteRegions" :key="idx" closable @close="removeRemote(idx)">
                {{ r }}
              </ElTag>
              <ElButton size="small" class="add-btn" @click="addRemote">+ 添加地区</ElButton>
            </div>
            <div class="form-tip">偏远地区可单独设置加价规则</div>
          </ElFormItem>
        </template>

        <ElFormItem label="说明">
          <ElInput v-model="templateForm.desc" type="textarea" :rows="2" maxlength="120" show-word-limit placeholder="模板说明" />
        </ElFormItem>
        <ElFormItem label="设为默认">
          <ElSwitch v-model="templateForm.isDefault" />
          <span class="form-tip">新商品默认使用该运费模板</span>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="templateDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="saveTemplate">保存</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Icon } from '@iconify/vue'

// ---------- 类型 ----------
type ItemStatus = 'on' | 'off'
type TabName = 'company' | 'template'
type TemplateMode = 'quantity' | 'weight' | 'free'

interface CompanyRow {
  id: number
  name: string
  code: string
  phone: string
  website: string
  isDefault: boolean
  status: ItemStatus
  bg: string
  color: string
}

interface CompanyForm {
  id: number | null
  name: string
  code: string
  phone: string
  website: string
  status: ItemStatus
}

interface TemplateRow {
  id: number
  name: string
  mode: TemplateMode
  modeText: string
  rules: string[]
  productCount: number
  status: ItemStatus
  isDefault: boolean
  desc: string
  firstUnit: number
  firstFee: number
  addUnit: number
  addFee: number
  remoteRegions: string[]
}

interface TemplateForm {
  id: number | null
  name: string
  mode: TemplateMode
  firstUnit: number
  firstFee: number
  addUnit: number
  addFee: number
  remoteRegions: string[]
  desc: string
  isDefault: boolean
}

// ---------- 概览 ----------
const stats = computed(() => {
  const companyCount = companies.value.length
  const templateCount = templates.value.length
  const enabled = companies.value.filter(c => c.status === 'on').length
  const totalProducts = templates.value.reduce((s, t) => s + t.productCount, 0)
  return [
    { label: '物流公司', value: companyCount, icon: 'solar:delivery-bold-duotone', color: '#409eff', bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
    { label: '已启用', value: enabled, icon: 'solar:check-circle-bold-duotone', color: '#52b788', bg: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' },
    { label: '运费模板', value: templateCount, icon: 'solar:documents-bold-duotone', color: '#e6a23c', bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)' },
    { label: '使用商品', value: totalProducts, icon: 'solar:box-bold-duotone', color: '#9254de', bg: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)' }
  ]
})

// ---------- Tabs ----------
const activeTab = ref<TabName>('company')

// ---------- 物流公司 ----------
const companies = ref<CompanyRow[]>([
  { id: 1, name: '顺丰速运', code: 'SF', phone: '95338', website: 'https://www.sf-express.com', isDefault: true, status: 'on', bg: '#e8f3ff', color: '#409eff' },
  { id: 2, name: '中通快递', code: 'ZTO', phone: '95311', website: 'https://www.zto.com', isDefault: false, status: 'on', bg: '#e6f7ee', color: '#52b788' },
  { id: 3, name: '圆通速递', code: 'YTO', phone: '95554', website: 'https://www.yto.net.cn', isDefault: false, status: 'on', bg: '#fff4e6', color: '#e6a23c' },
  { id: 4, name: '韵达快递', code: 'YD', phone: '95546', website: 'https://www.yundaex.com', isDefault: false, status: 'off', bg: '#f3e8ff', color: '#9254de' }
])

const companyDialogVisible = ref(false)
const companyFormRef = ref<FormInstance>()

const defaultCompanyForm = (): CompanyForm => ({
  id: null,
  name: '',
  code: '',
  phone: '',
  website: '',
  status: 'on'
})

const companyForm = reactive<CompanyForm>(defaultCompanyForm())

const companyRules: FormRules<CompanyForm> = {
  name: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入公司编码', trigger: 'blur' }]
}

function openCompanyDialog(): void {
  Object.assign(companyForm, defaultCompanyForm())
  companyDialogVisible.value = true
}

function editCompany(row: CompanyRow): void {
  Object.assign(companyForm, {
    id: row.id,
    name: row.name,
    code: row.code,
    phone: row.phone,
    website: row.website,
    status: row.status
  })
  companyDialogVisible.value = true
}

function saveCompany(): void {
  if (!companyFormRef.value) return
  companyFormRef.value.validate(valid => {
    if (!valid) return
    if (companyForm.id) {
      const idx = companies.value.findIndex(c => c.id === companyForm.id)
      if (idx > -1) {
        companies.value[idx] = {
          ...companies.value[idx],
          name: companyForm.name,
          code: companyForm.code,
          phone: companyForm.phone,
          website: companyForm.website,
          status: companyForm.status
        }
      }
      ElMessage.success('物流公司已更新')
    } else {
      companies.value.push({
        id: Date.now(),
        name: companyForm.name,
        code: companyForm.code,
        phone: companyForm.phone,
        website: companyForm.website,
        isDefault: false,
        status: companyForm.status,
        bg: '#e8f3ff',
        color: '#409eff'
      })
      ElMessage.success('物流公司已新增')
    }
    companyDialogVisible.value = false
  })
}

function setDefaultCompany(row: CompanyRow): void {
  companies.value.forEach(c => { c.isDefault = c.id === row.id })
  ElMessage.success(`已将 ${row.name} 设为默认物流`)
}

function removeCompany(row: CompanyRow): void {
  const idx = companies.value.findIndex(c => c.id === row.id)
  if (idx > -1) companies.value.splice(idx, 1)
  ElMessage.success('删除成功')
}

// ---------- 运费模板 ----------
const templates = ref<TemplateRow[]>([
  {
    id: 1, name: '全国包邮模板', mode: 'free', modeText: '包邮',
    rules: ['全国包邮'], productCount: 126, status: 'on', isDefault: true, desc: '全国包邮',
    firstUnit: 1, firstFee: 0, addUnit: 1, addFee: 0, remoteRegions: []
  },
  {
    id: 2, name: '按件数模板', mode: 'quantity', modeText: '按件数',
    rules: ['首件 1 件 ¥10', '续件 1 件 ¥5', '偏远地区加收 ¥10'],
    productCount: 86, status: 'on', isDefault: false, desc: '按件数计费',
    firstUnit: 1, firstFee: 10, addUnit: 1, addFee: 5, remoteRegions: ['新疆', '西藏', '内蒙古']
  },
  {
    id: 3, name: '按重量模板', mode: 'weight', modeText: '按重量',
    rules: ['首重 1kg ¥12', '续重 1kg ¥6'],
    productCount: 42, status: 'on', isDefault: false, desc: '按重量计费',
    firstUnit: 1, firstFee: 12, addUnit: 1, addFee: 6, remoteRegions: []
  }
])

const templateDialogVisible = ref(false)
const templateFormRef = ref<FormInstance>()

const defaultTemplateForm = (): TemplateForm => ({
  id: null,
  name: '',
  mode: 'quantity',
  firstUnit: 1,
  firstFee: 10,
  addUnit: 1,
  addFee: 5,
  remoteRegions: [],
  desc: '',
  isDefault: false
})

const templateForm = reactive<TemplateForm>(defaultTemplateForm())

const templateRules: FormRules<TemplateForm> = {
  name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  mode: [{ required: true, message: '请选择计费方式', trigger: 'change' }]
}

function openTemplateDialog(row?: TemplateRow): void {
  if (row) {
    Object.assign(templateForm, {
      id: row.id,
      name: row.name,
      mode: row.mode,
      firstUnit: row.firstUnit,
      firstFee: row.firstFee,
      addUnit: row.addUnit,
      addFee: row.addFee,
      remoteRegions: [...row.remoteRegions],
      desc: row.desc,
      isDefault: row.isDefault
    })
  } else {
    Object.assign(templateForm, defaultTemplateForm())
  }
  templateDialogVisible.value = true
}

function addRemote(): void {
  const region = window.prompt('请输入偏远地区名称')
  if (region && !templateForm.remoteRegions.includes(region)) {
    templateForm.remoteRegions.push(region)
  }
}

function removeRemote(idx: number): void {
  templateForm.remoteRegions.splice(idx, 1)
}

function saveTemplate(): void {
  if (!templateFormRef.value) return
  templateFormRef.value.validate(valid => {
    if (!valid) return
    const modeTextMap: Record<TemplateMode, string> = { quantity: '按件数', weight: '按重量', free: '包邮' }
    const rules: string[] = []
    if (templateForm.mode === 'free') {
      rules.push('全国包邮')
    } else {
      const unit = templateForm.mode === 'quantity' ? '件' : 'kg'
      rules.push(`首${templateForm.mode === 'quantity' ? '件' : '重'} ${templateForm.firstUnit}${unit} ¥${templateForm.firstFee}`)
      rules.push(`续${templateForm.mode === 'quantity' ? '件' : '重'} ${templateForm.addUnit}${unit} ¥${templateForm.addFee}`)
      if (templateForm.remoteRegions.length) {
        rules.push(`偏远地区：${templateForm.remoteRegions.join('、')}`)
      }
    }

    if (templateForm.id) {
      const idx = templates.value.findIndex(t => t.id === templateForm.id)
      if (idx > -1) {
        templates.value[idx] = {
          ...templates.value[idx],
          name: templateForm.name,
          mode: templateForm.mode,
          modeText: modeTextMap[templateForm.mode],
          rules,
          desc: templateForm.desc,
          firstUnit: templateForm.firstUnit,
          firstFee: templateForm.firstFee,
          addUnit: templateForm.addUnit,
          addFee: templateForm.addFee,
          remoteRegions: [...templateForm.remoteRegions],
          isDefault: templateForm.isDefault
        }
      }
      ElMessage.success('模板已更新')
    } else {
      templates.value.push({
        id: Date.now(),
        name: templateForm.name,
        mode: templateForm.mode,
        modeText: modeTextMap[templateForm.mode],
        rules,
        productCount: 0,
        status: 'on',
        isDefault: templateForm.isDefault,
        desc: templateForm.desc,
        firstUnit: templateForm.firstUnit,
        firstFee: templateForm.firstFee,
        addUnit: templateForm.addUnit,
        addFee: templateForm.addFee,
        remoteRegions: [...templateForm.remoteRegions]
      })
      ElMessage.success('模板已新增')
    }

    if (templateForm.isDefault) {
      templates.value.forEach(t => { if (t.id !== templateForm.id) t.isDefault = false })
    }

    templateDialogVisible.value = false
  })
}

function removeTemplate(row: TemplateRow): void {
  const idx = templates.value.findIndex(t => t.id === row.id)
  if (idx > -1) templates.value.splice(idx, 1)
  ElMessage.success('删除成功')
}
</script>

<style lang="scss" scoped>
$primary: #409eff;
$text-main: #1f2d3d;
$text-secondary: #8a94a6;
$border-light: #eef1f6;
$bg-soft: #f7f9fc;
$radius-card: 14px;
$radius-block: 12px;
$gap: 16px;
$shadow-card: 0 2px 8px rgba(31, 45, 61, 0.04);
$shadow-hover: 0 10px 28px rgba(31, 45, 61, 0.10);

@mixin flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.shipping-page {
  padding: $gap;
  min-height: 100%;

  .stat-row {
    margin-bottom: $gap;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: #fff;
    border: 1px solid $border-light;
    border-radius: $radius-card;
    box-shadow: $shadow-card;
    margin-bottom: $gap;
    transition: transform 0.25s ease, box-shadow 0.25s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: $shadow-hover;
    }

    .stat-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      @include flex-center;
      background: var(--accent-soft);
      color: var(--accent);
      flex-shrink: 0;
    }

    .stat-value {
      font-size: 20px;
      font-weight: 700;
      color: $text-main;
    }

    .stat-label {
      font-size: 12px;
      color: $text-secondary;
    }
  }
}

.shipping-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 16px;
  }

  :deep(.el-tabs__nav-wrap::after) {
    height: 1px;
    background: $border-light;
  }

  :deep(.el-tabs__item) {
    font-size: 14px;
    color: $text-secondary;

    &.is-active {
      color: $primary;
      font-weight: 600;
    }
  }
}

.panel-card {
  border-radius: $radius-card;
  border: 1px solid $border-light;
  box-shadow: $shadow-card;
  margin-bottom: $gap;

  :deep(.el-card__header) {
    padding: 14px 18px;
    border-bottom: 1px solid $border-light;
  }

  :deep(.el-card__body) {
    padding: 16px 18px;
  }
}

.panel-header {
  @include flex-between;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: $text-main;

  .title-dot {
    width: 6px;
    height: 16px;
    border-radius: 3px;
    background: linear-gradient(180deg, $primary, #7cc0ff);
  }

  .title-sub {
    font-size: 12px;
    font-weight: 400;
    color: $text-secondary;
    margin-left: 2px;
  }
}

.btn-icon {
  margin-right: 4px;
  vertical-align: middle;
}

// 物流公司
.company-cell {
  display: flex;
  align-items: center;
  gap: 10px;

  .company-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    @include flex-center;
    flex-shrink: 0;
  }

  .company-name {
    font-size: 13px;
    font-weight: 500;
    color: $text-main;
  }

  .company-code {
    margin-top: 2px;
    font-size: 12px;
    color: $text-secondary;
    font-family: monospace;
  }
}

.empty-text {
  color: $text-secondary;
  font-size: 12px;
}

// 运费模板
.rule-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  .rule-item {
    display: inline-block;
    padding: 2px 8px;
    font-size: 12px;
    color: $primary;
    background: rgba(64, 158, 255, 0.08);
    border-radius: 999px;
  }
}

// 运费编辑器
.fee-editor {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .fee-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .fee-label {
    font-size: 13px;
    color: $text-secondary;
  }

  .fee-unit {
    font-size: 12px;
    color: $text-secondary;
    margin-right: 12px;
  }
}

// 偏远地区
.region-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .add-btn {
    border-style: dashed;
  }
}

.form-tip {
  margin-top: 4px;
  margin-left: 8px;
  font-size: 12px;
  color: $text-secondary;
}

@media (max-width: 768px) {
  .shipping-page {
    padding: 12px;
  }

  .fee-row {
    flex-wrap: wrap;
  }
}
</style>