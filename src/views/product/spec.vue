<template>
  <div class="spec-page">
    <ElRow :gutter="16">
      <!-- 左侧：规格模板 -->
      <ElCol :xs="24" :md="7">
        <ElCard class="panel-card" shadow="never">
          <template #header>
            <div class="panel-header">
              <div class="panel-title">
                <span class="title-dot"></span>
                规格模板
                <span class="title-sub">{{ templates.length }} 个</span>
              </div>
              <ElButton type="primary" size="small" @click="openTemplateDialog('create')">
                <Icon icon="solar:add-circle-bold-duotone" class="btn-icon" />新增
              </ElButton>
            </div>
          </template>

          <ElInput v-model="filterText" placeholder="搜索模板名称" clearable class="template-search">
            <template #prefix>
              <Icon icon="solar:magnifer-bold-duotone" width="16" />
            </template>
          </ElInput>

          <div class="template-list">
            <div
              v-for="tpl in filteredTemplates"
              :key="tpl.id"
              class="template-item"
              :class="{ active: currentTemplate?.id === tpl.id }"
              @click="selectTemplate(tpl)"
            >
              <div class="template-left">
                <div class="template-icon">
                  <Icon :icon="tpl.icon" width="18" />
                </div>
                <div class="template-meta">
                  <div class="template-name">{{ tpl.name }}</div>
                  <div class="template-sub">
                    {{ tpl.groups.length }} 个规格组 ·
                    {{ totalSkuCount(tpl) }} 个 SKU 组合
                  </div>
                </div>
              </div>
              <div class="template-right">
                <ElTag :type="tpl.status === 'on' ? 'success' : 'info'" size="small" effect="light" round>
                  {{ tpl.status === 'on' ? '启用' : '禁用' }}
                </ElTag>
                <ElDropdown trigger="click" @command="cmd => handleTemplateCommand(cmd, tpl)">
                  <ElButton link size="small">
                    <Icon icon="solar:menu-dots-bold-duotone" width="16" />
                  </ElButton>
                  <template #dropdown>
                    <ElDropdownMenu>
                      <ElDropdownItem command="edit">编辑模板</ElDropdownItem>
                      <ElDropdownItem command="duplicate">复制模板</ElDropdownItem>
                      <ElDropdownItem command="delete" divided>删除模板</ElDropdownItem>
                    </ElDropdownMenu>
                  </template>
                </ElDropdown>
              </div>
            </div>

            <ElEmpty v-if="!filteredTemplates.length" description="暂无规格模板" :image-size="60" />
          </div>
        </ElCard>
      </ElCol>

      <!-- 右侧：当前模板的规格组与规格值 -->
      <ElCol :xs="24" :md="17">
        <ElCard class="panel-card" shadow="never">
          <template #header>
            <div class="panel-header">
              <div class="panel-title">
                <span class="title-dot"></span>
                {{ currentTemplate ? currentTemplate.name : '规格模板' }}
                <span v-if="currentTemplate" class="title-sub">规格组与规格值</span>
              </div>
              <ElButton
                v-if="currentTemplate"
                type="primary"
                size="small"
                @click="openGroupDialog('create')"
              >
                <Icon icon="solar:add-circle-bold-duotone" class="btn-icon" />添加规格组
              </ElButton>
            </div>
          </template>

          <ElEmpty v-if="!currentTemplate" description="请从左侧选择一个规格模板" :image-size="80" />

          <template v-else>
            <!-- 模板概览 -->
            <div class="template-overview">
              <div class="overview-item">
                <span class="ov-label">规格组</span>
                <span class="ov-value">{{ currentTemplate.groups.length }}</span>
              </div>
              <div class="overview-divider"></div>
              <div class="overview-item">
                <span class="ov-label">SKU 组合</span>
                <span class="ov-value">{{ totalSkuCount(currentTemplate) }}</span>
              </div>
              <div class="overview-divider"></div>
              <div class="overview-item">
                <span class="ov-label">状态</span>
                <ElTag :type="currentTemplate.status === 'on' ? 'success' : 'info'" size="small" effect="light" round>
                  {{ currentTemplate.status === 'on' ? '启用' : '禁用' }}
                </ElTag>
              </div>
            </div>

            <!-- 规格组列表 -->
            <div v-if="!currentTemplate.groups.length" class="empty-groups">
              <Icon icon="solar:info-circle-bold-duotone" width="18" />
              该模板还没有规格组，点击「添加规格组」开始配置
            </div>

            <div v-else class="group-blocks">
              <div
                v-for="(group, gIdx) in currentTemplate.groups"
                :key="group.id"
                class="group-block"
              >
                <div class="group-block-header">
                  <div class="group-block-left">
                    <Icon :icon="group.icon" width="18" class="group-icon" />
                    <span class="group-name">{{ group.name }}</span>
                    <span class="group-count">{{ group.values.length }} 个规格值</span>
                  </div>
                  <div class="group-block-actions">
                    <ElButton link type="primary" size="small" @click="openGroupDialog('edit', gIdx)">
                      编辑
                    </ElButton>
                    <ElButton link type="primary" size="small" @click="openValueDialog(gIdx)">
                      添加值
                    </ElButton>
                    <ElPopconfirm title="确定移除该规格组？" @confirm="removeGroup(gIdx)">
                      <template #reference>
                        <ElButton link type="danger" size="small">移除</ElButton>
                      </template>
                    </ElPopconfirm>
                  </div>
                </div>

                <div class="group-block-body">
                  <ElTag
                    v-for="v in group.values"
                    :key="v"
                    closable
                    size="small"
                    effect="light"
                    round
                    :type="group.status === 'on' ? 'primary' : 'info'"
                    class="value-tag"
                    @close="removeValue(gIdx, v)"
                  >
                    {{ v }}
                  </ElTag>
                  <ElButton size="small" class="add-value-btn" @click="openValueDialog(gIdx)">
                    + 添加值
                  </ElButton>
                </div>
              </div>
            </div>

            <!-- SKU 组合预览 -->
            <div v-if="currentTemplate.groups.length && currentTemplate.groups.every(g => g.values.length)" class="sku-preview">
              <div class="sku-preview-header">
                <span>SKU 组合预览（{{ totalSkuCount(currentTemplate) }} 个）</span>
              </div>
              <ElTable :data="skuPreviewRows" size="small" border class="pretty-table" max-height="300">
                <ElTableColumn
                  v-for="(group, gIdx) in currentTemplate.groups"
                  :key="gIdx"
                  :label="group.name"
                  width="120"
                >
                  <template #default="{ row }">{{ row.values[gIdx] }}</template>
                </ElTableColumn>
              </ElTable>
            </div>
          </template>
        </ElCard>
      </ElCol>
    </ElRow>

    <!-- 模板弹窗 -->
    <ElDialog
      v-model="templateDialogVisible"
      :title="templateDialogMode === 'create' ? '新增规格模板' : '编辑规格模板'"
      width="480px"
      destroy-on-close
    >
      <ElForm ref="templateFormRef" :model="templateForm" :rules="templateRules" label-width="90px">
        <ElFormItem label="模板名称" prop="name">
          <ElInput v-model="templateForm.name" placeholder="如：颜色+尺码、容量+版本" maxlength="30" show-word-limit />
        </ElFormItem>
        <ElFormItem label="模板图标">
          <ElSelect v-model="templateForm.icon" placeholder="选择图标" style="width: 100%">
            <ElOption v-for="ic in iconOptions" :key="ic.value" :label="ic.label" :value="ic.value">
              <div class="icon-option">
                <Icon :icon="ic.value" width="18" />
                <span>{{ ic.label }}</span>
              </div>
            </ElOption>
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="排序">
          <ElInputNumber v-model="templateForm.sort" :min="0" :max="9999" controls-position="right" style="width: 100%" />
        </ElFormItem>
        <ElFormItem label="状态">
          <ElRadioGroup v-model="templateForm.status">
            <ElRadio value="on">启用</ElRadio>
            <ElRadio value="off">禁用</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="templateDialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="saving" @click="handleSaveTemplate">保存</ElButton>
      </template>
    </ElDialog>

    <!-- 规格组弹窗 -->
    <ElDialog
      v-model="groupDialogVisible"
      :title="groupDialogMode === 'create' ? '添加规格组' : '编辑规格组'"
      width="440px"
      destroy-on-close
    >
      <ElForm ref="groupFormRef" :model="groupForm" :rules="groupRules" label-width="90px">
        <ElFormItem label="规格组名" prop="name">
          <ElInput v-model="groupForm.name" placeholder="如：颜色、尺码、容量" maxlength="20" show-word-limit />
        </ElFormItem>
        <ElFormItem label="图标">
          <ElSelect v-model="groupForm.icon" placeholder="选择图标" style="width: 100%">
            <ElOption v-for="ic in groupIconOptions" :key="ic.value" :label="ic.label" :value="ic.value">
              <div class="icon-option">
                <Icon :icon="ic.value" width="18" />
                <span>{{ ic.label }}</span>
              </div>
            </ElOption>
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="状态">
          <ElRadioGroup v-model="groupForm.status">
            <ElRadio value="on">启用</ElRadio>
            <ElRadio value="off">禁用</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="groupDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSaveGroup">保存</ElButton>
      </template>
    </ElDialog>

    <!-- 添加规格值弹窗 -->
    <ElDialog v-model="valueDialogVisible" title="添加规格值" width="440px" destroy-on-close>
      <ElForm label-width="90px">
        <ElFormItem label="规格组">
          <span class="dialog-group-name">{{ editingGroupName }}</span>
        </ElFormItem>
        <ElFormItem label="单个添加">
          <ElInput
            v-model="valueForm.single"
            :placeholder="`输入${editingGroupName}值，如：红色`"
            maxlength="20"
            @keyup.enter="addSingleValue"
          />
        </ElFormItem>
        <ElFormItem label="批量添加">
          <ElInput
            v-model="valueForm.batch"
            type="textarea"
            :rows="4"
            placeholder="每行一个规格值，可一次添加多个"
          />
          <div class="form-tip">按行分割，空行忽略，重复值跳过</div>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="valueDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleAddValues">添加</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Icon } from '@iconify/vue'

// ---------- 类型 ----------
type ItemStatus = 'on' | 'off'
type DialogMode = 'create' | 'edit'

interface SpecGroup {
  id: number
  name: string
  icon: string
  status: ItemStatus
  values: string[]
}

interface SpecTemplate {
  id: number
  name: string
  icon: string
  sort: number
  status: ItemStatus
  groups: SpecGroup[]
}

interface TemplateForm {
  id: number | null
  name: string
  icon: string
  sort: number
  status: ItemStatus
}

interface GroupForm {
  name: string
  icon: string
  status: ItemStatus
}

interface ValueForm {
  single: string
  batch: string
}

// ---------- 图标 ----------
const iconOptions = [
  { label: '模板', value: 'solar:widget-bold-duotone' },
  { label: '滑块', value: 'solar:slider-vertical-bold-duotone' },
  { label: '调色板', value: 'solar:palette-bold-duotone' },
  { label: '尺子', value: 'solar:ruler-bold-duotone' },
  { label: '层级', value: 'solar:layers-bold-duotone' }
]

const groupIconOptions = [
  { label: '颜色', value: 'solar:palette-bold-duotone' },
  { label: '尺码', value: 'solar:ruler-bold-duotone' },
  { label: '容量', value: 'solar:battery-charge-bold-duotone' },
  { label: '版本', value: 'solar:widget-bold-duotone' },
  { label: '材质', value: 'solar:layers-bold-duotone' },
  { label: '默认', value: 'solar:slider-vertical-bold-duotone' }
]

// ---------- 模板数据 ----------
const templates = ref<SpecTemplate[]>([
  {
    id: 1, name: '颜色 + 尺码', icon: 'solar:widget-bold-duotone', sort: 1, status: 'on',
    groups: [
      { id: 11, name: '颜色', icon: 'solar:palette-bold-duotone', status: 'on', values: ['黑色', '白色', '蓝色'] },
      { id: 12, name: '尺码', icon: 'solar:ruler-bold-duotone', status: 'on', values: ['S', 'M', 'L', 'XL'] }
    ]
  },
  {
    id: 2, name: '容量 + 版本', icon: 'solar:slider-vertical-bold-duotone', sort: 2, status: 'on',
    groups: [
      { id: 21, name: '容量', icon: 'solar:battery-charge-bold-duotone', status: 'on', values: ['64G', '128G', '256G'] },
      { id: 22, name: '版本', icon: 'solar:widget-bold-duotone', status: 'on', values: ['标准版', '降噪版'] }
    ]
  },
  {
    id: 3, name: '单规格模板', icon: 'solar:widget-bold-duotone', sort: 3, status: 'on',
    groups: [
      { id: 31, name: '规格', icon: 'solar:slider-vertical-bold-duotone', status: 'on', values: ['默认'] }
    ]
  }
])

// ---------- 当前模板 ----------
const currentTemplate = ref<SpecTemplate | null>(templates.value[0] ?? null)

function selectTemplate(tpl: SpecTemplate): void {
  currentTemplate.value = tpl
}

// ---------- 搜索 ----------
const filterText = ref('')
const filteredTemplates = computed(() =>
  templates.value.filter(t => !filterText.value || t.name.includes(filterText.value))
)

// ---------- 计算 ----------
function totalSkuCount(tpl: SpecTemplate): number {
  if (!tpl.groups.length) return 0
  return tpl.groups.reduce((acc, g) => acc * Math.max(g.values.length, 1), 1)
}

const skuPreviewRows = computed<{ values: string[] }[]>(() => {
  if (!currentTemplate.value) return []
  const groups = currentTemplate.value.groups
  if (!groups.length || groups.some(g => !g.values.length)) return []
  return groups.reduce<{ values: string[] }[]>((acc, group) => {
    const next: { values: string[] }[] = []
    acc.forEach(row => {
      group.values.forEach(v => {
        next.push({ values: [...row.values, v] })
      })
    })
    return next
  }, [{ values: [] }])
})

// ---------- 模板弹窗 ----------
const templateDialogVisible = ref(false)
const templateDialogMode = ref<DialogMode>('create')
const templateFormRef = ref<FormInstance>()
const saving = ref(false)

const defaultTemplateForm = (): TemplateForm => ({
  id: null,
  name: '',
  icon: 'solar:widget-bold-duotone',
  sort: 0,
  status: 'on'
})
const templateForm = reactive<TemplateForm>(defaultTemplateForm())

const templateRules: FormRules<TemplateForm> = {
  name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }]
}

function openTemplateDialog(mode: DialogMode, tpl?: SpecTemplate): void {
  templateDialogMode.value = mode
  if (mode === 'create') {
    Object.assign(templateForm, defaultTemplateForm())
  } else if (tpl) {
    Object.assign(templateForm, {
      id: tpl.id,
      name: tpl.name,
      icon: tpl.icon,
      sort: tpl.sort,
      status: tpl.status
    })
  }
  templateDialogVisible.value = true
  nextTick(() => templateFormRef.value?.clearValidate())
}

function handleTemplateCommand(command: string, tpl: SpecTemplate): void {
  if (command === 'edit') {
    openTemplateDialog('edit', tpl)
  } else if (command === 'duplicate') {
    const copy: SpecTemplate = {
      ...tpl,
      id: Date.now(),
      name: `${tpl.name}（副本）`,
      groups: tpl.groups.map(g => ({ ...g, id: Date.now() + Math.random(), values: [...g.values] }))
    }
    templates.value.push(copy)
    ElMessage.success('模板已复制')
  } else if (command === 'delete') {
    ElMessageBox.confirm(`确定删除规格模板「${tpl.name}」吗？`, '提示', { type: 'warning' })
      .then(() => {
        const idx = templates.value.findIndex(t => t.id === tpl.id)
        if (idx > -1) templates.value.splice(idx, 1)
        if (currentTemplate.value?.id === tpl.id) {
          currentTemplate.value = templates.value[0] ?? null
        }
        ElMessage.success('删除成功')
      })
      .catch(() => {})
  }
}

async function handleSaveTemplate(): Promise<void> {
  if (!templateFormRef.value) return
  try {
    await templateFormRef.value.validate()
  } catch {
    return
  }
  saving.value = true
  await new Promise(r => setTimeout(r, 300))
  saving.value = false

  if (templateDialogMode.value === 'create') {
    const newTpl: SpecTemplate = {
      id: Date.now(),
      name: templateForm.name,
      icon: templateForm.icon,
      sort: templateForm.sort,
      status: templateForm.status,
      groups: []
    }
    templates.value.push(newTpl)
    currentTemplate.value = newTpl
    ElMessage.success('模板已新增')
  } else if (templateForm.id) {
    const target = templates.value.find(t => t.id === templateForm.id)
    if (target) {
      target.name = templateForm.name
      target.icon = templateForm.icon
      target.sort = templateForm.sort
      target.status = templateForm.status
    }
    ElMessage.success('模板已更新')
  }
  templateDialogVisible.value = false
}

// ---------- 规格组弹窗 ----------
const groupDialogVisible = ref(false)
const groupDialogMode = ref<DialogMode>('create')
const editingGroupIndex = ref<number>(-1)
const groupFormRef = ref<FormInstance>()

const defaultGroupForm = (): GroupForm => ({
  name: '',
  icon: 'solar:slider-vertical-bold-duotone',
  status: 'on'
})
const groupForm = reactive<GroupForm>(defaultGroupForm())

const groupRules: FormRules<GroupForm> = {
  name: [{ required: true, message: '请输入规格组名', trigger: 'blur' }]
}

function openGroupDialog(mode: DialogMode, index?: number): void {
  groupDialogMode.value = mode
  editingGroupIndex.value = index ?? -1
  if (mode === 'create') {
    Object.assign(groupForm, defaultGroupForm())
  } else if (mode === 'edit' && index !== undefined && currentTemplate.value) {
    const g = currentTemplate.value.groups[index]
    if (g) {
      Object.assign(groupForm, { name: g.name, icon: g.icon, status: g.status })
    }
  }
  groupDialogVisible.value = true
  nextTick(() => groupFormRef.value?.clearValidate())
}

async function handleSaveGroup(): Promise<void> {
  if (!groupFormRef.value || !currentTemplate.value) return
  try {
    await groupFormRef.value.validate()
  } catch {
    return
  }
  if (groupDialogMode.value === 'create') {
    currentTemplate.value.groups.push({
      id: Date.now(),
      name: groupForm.name,
      icon: groupForm.icon,
      status: groupForm.status,
      values: []
    })
    ElMessage.success('规格组已添加')
  } else if (editingGroupIndex.value > -1) {
    const g = currentTemplate.value.groups[editingGroupIndex.value]
    if (g) {
      g.name = groupForm.name
      g.icon = groupForm.icon
      g.status = groupForm.status
    }
    ElMessage.success('规格组已更新')
  }
  groupDialogVisible.value = false
}

function removeGroup(index: number): void {
  if (!currentTemplate.value) return
  currentTemplate.value.groups.splice(index, 1)
  ElMessage.success('规格组已移除')
}

// ---------- 规格值弹窗 ----------
const valueDialogVisible = ref(false)
const editingValueGroupIndex = ref<number>(-1)
const valueForm = reactive<ValueForm>({ single: '', batch: '' })

const editingGroupName = computed<string>(() => {
  if (!currentTemplate.value || editingValueGroupIndex.value < 0) return ''
  return currentTemplate.value.groups[editingValueGroupIndex.value]?.name || ''
})

function openValueDialog(groupIndex: number): void {
  editingValueGroupIndex.value = groupIndex
  valueForm.single = ''
  valueForm.batch = ''
  valueDialogVisible.value = true
}

function addSingleValue(): void {
  if (!currentTemplate.value || editingValueGroupIndex.value < 0) return
  const group = currentTemplate.value.groups[editingValueGroupIndex.value]
  if (!group) return
  const name = valueForm.single.trim()
  if (!name || group.values.includes(name)) return
  group.values.push(name)
  valueForm.single = ''
  ElMessage.success('已添加')
}

function handleAddValues(): void {
  if (!currentTemplate.value || editingValueGroupIndex.value < 0) return
  const group = currentTemplate.value.groups[editingValueGroupIndex.value]
  if (!group) return
  let added = 0
  const single = valueForm.single.trim()
  if (single && !group.values.includes(single)) {
    group.values.push(single)
    added++
  }
  valueForm.batch.split('\n').map(s => s.trim()).filter(Boolean).forEach(name => {
    if (!group.values.includes(name)) {
      group.values.push(name)
      added++
    }
  })
  if (added) {
    ElMessage.success(`已添加 ${added} 个规格值`)
    valueDialogVisible.value = false
  } else {
    ElMessage.warning('没有新增规格值（可能已存在）')
  }
}

function removeValue(groupIndex: number, value: string): void {
  if (!currentTemplate.value) return
  const group = currentTemplate.value.groups[groupIndex]
  if (!group) return
  const idx = group.values.indexOf(value)
  if (idx > -1) group.values.splice(idx, 1)
}

onMounted(() => {
  if (!currentTemplate.value && templates.value.length) {
    currentTemplate.value = templates.value[0]
  }
})
</script>

<style lang="scss" scoped>
$primary: #409eff;
$text-main: #1f2d3d;
$text-secondary: #8a94a6;
$text-regular: #5a6472;
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

.spec-page {
  padding: $gap;
  min-height: 100%;
}

.panel-card {
  border: 1px solid $border-light;
  box-shadow: $shadow-card;
  margin-bottom: $gap;
  transition: box-shadow 0.25s ease;

  &:hover {
    box-shadow: $shadow-hover;
  }

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

// ---------- 模板列表 ----------
.template-search {
  margin-bottom: 12px;
}

.template-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 560px;
  overflow-y: auto;
}

.template-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: $radius-block;
  border: 1px solid transparent;
  background: $bg-soft;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f5f9ff;
    border-color: #dbe7fa;
  }

  &.active {
    background: #e8f3ff;
    border-color: #bcd9ff;
  }

  .template-left {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .template-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    @include flex-center;
    background: #fff;
    color: $primary;
    flex-shrink: 0;
  }

  .template-name {
    font-size: 13px;
    font-weight: 600;
    color: $text-main;
  }

  .template-sub {
    margin-top: 2px;
    font-size: 12px;
    color: $text-secondary;
  }

  .template-right {
    display: flex;
    align-items: center;
    gap: 6px;
  }
}

// ---------- 模板概览 ----------
.template-overview {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  background: $bg-soft;
  border-radius: $radius-block;
  margin-bottom: 16px;

  .overview-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ov-label {
    font-size: 12px;
    color: $text-secondary;
  }

  .ov-value {
    font-size: 16px;
    font-weight: 700;
    color: $primary;
  }

  .overview-divider {
    width: 1px;
    height: 18px;
    background: $border-light;
  }
}

// ---------- 规格组块 ----------
.group-blocks {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.group-block {
  border: 1px solid $border-light;
  border-radius: $radius-block;
  overflow: hidden;

  .group-block-header {
    @include flex-between;
    padding: 10px 14px;
    background: #f8fafd;
    border-bottom: 1px solid $border-light;
  }

  .group-block-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .group-icon {
    color: $primary;
  }

  .group-name {
    font-size: 13px;
    font-weight: 600;
    color: $text-main;
  }

  .group-count {
    font-size: 12px;
    color: $text-secondary;
  }

  .group-block-actions {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .group-block-body {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding: 12px 14px;
  }

  .add-value-btn {
    border-style: dashed;
  }
}

.empty-groups {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 24px;
  font-size: 13px;
  color: $text-secondary;
  background: $bg-soft;
  border-radius: $radius-block;
  margin-bottom: 16px;
}

// ---------- SKU 预览 ----------
.sku-preview {
  .sku-preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    font-weight: 600;
    color: $text-main;
    margin-bottom: 10px;
  }
}

.pretty-table {
  :deep(.el-table__header th) {
    background: #f8fafd;
    color: $text-secondary;
    font-weight: 500;
    font-size: 12px;
  }

  :deep(.el-table td) {
    border-bottom: 1px solid $border-light;
    color: $text-regular;
  }
}

.icon-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dialog-group-name {
  font-size: 13px;
  font-weight: 600;
  color: $primary;
}

.form-tip {
  margin-top: 6px;
  font-size: 12px;
  color: $text-secondary;
}

@media (max-width: 768px) {
  .spec-page {
    padding: 12px;
  }

  .template-list {
    max-height: none;
  }

  .template-overview {
    flex-wrap: wrap;
    gap: 10px;
  }

  .group-block-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>