<template>
  <div class="spec-section">
    <div class="spec-header">
      <span class="spec-title">规格定义</span>
      <div class="spec-header-actions">
        <ElDropdown trigger="click" @command="applySpecTemplate">
          <ElButton link type="primary" size="small">
            <Icon icon="solar:widget-bold-duotone" class="btn-icon" />快捷模板
          </ElButton>
          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem command="color">颜色</ElDropdownItem>
              <ElDropdownItem command="size">尺寸</ElDropdownItem>
              <ElDropdownItem command="capacity">容量</ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
        <ElButton link type="primary" size="small" @click="addSpec">
          <Icon icon="solar:add-circle-bold-duotone" class="btn-icon" />添加规格
        </ElButton>
      </div>
    </div>

    <div v-for="(spec, sIdx) in modelValue" :key="sIdx" class="spec-row">
      <ElInput
        v-model="spec.name"
        placeholder="规格名，如：颜色"
        style="width: 180px"
        @input="emitChange"
      />
      <div class="spec-values">
        <ElTag
          v-for="(val, vIdx) in spec.values"
          :key="vIdx"
          closable
          effect="light"
          round
          @close="removeSpecValue(sIdx, vIdx)"
        >
          {{ val }}
        </ElTag>
        <ElInput
          v-if="spec.inputVisible"
          :ref="el => setSpecInputRef(el as InputInstance | null, sIdx)"
          v-model="spec.inputValue"
          size="small"
          style="width: 100px"
          @keyup.enter="confirmSpecValue(sIdx)"
          @blur="confirmSpecValue(sIdx)"
        />
        <ElButton v-else size="small" class="add-value-btn" @click="showSpecInput(sIdx)">
          + 添加值
        </ElButton>
      </div>
      <ElButton link type="danger" @click="removeSpec(sIdx)">
        <Icon icon="solar:trash-bin-trash-bold-duotone" width="16" />
      </ElButton>
    </div>

    <div v-if="!modelValue.length" class="empty-tip">
      <Icon icon="solar:widget-bold-duotone" width="22" />
      <span>请点击「添加规格」定义商品规格（如颜色、尺寸）</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import type { InputInstance } from 'element-plus'
import { Icon } from '@iconify/vue'
import type { SpecItem } from '../types'

const props = defineProps<{ modelValue: SpecItem[] }>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: SpecItem[]): void
  (e: 'change'): void
}>()

const specInputRefs = ref<Record<number, InputInstance | null>>({})

const specTemplates: Record<string, { name: string; values: string[] }> = {
  color: { name: '颜色', values: ['黑色', '白色', '蓝色'] },
  size: { name: '尺寸', values: ['S', 'M', 'L', 'XL'] },
  capacity: { name: '容量', values: ['128G', '256G', '512G'] }
}

function setSpecInputRef(el: InputInstance | null, idx: number): void {
  specInputRefs.value[idx] = el
}

function update(list: SpecItem[]): void {
  emit('update:modelValue', list)
  emit('change')
}

function emitChange(): void {
  emit('change')
}

function applySpecTemplate(command: string): void {
  const tpl = specTemplates[command]
  if (!tpl) return
  if (props.modelValue.some(s => s.name === tpl.name)) {
    ElMessage.warning(`规格「${tpl.name}」已存在`)
    return
  }
  update([
    ...props.modelValue,
    { name: tpl.name, values: [...tpl.values], inputVisible: false, inputValue: '' }
  ])
}

function addSpec(): void {
  update([...props.modelValue, { name: '', values: [], inputVisible: false, inputValue: '' }])
}

function removeSpec(idx: number): void {
  const list = [...props.modelValue]
  list.splice(idx, 1)
  update(list)
}

function showSpecInput(sIdx: number): void {
  const list = [...props.modelValue]
  list[sIdx] = { ...list[sIdx], inputVisible: true }
  update(list)
  nextTick(() => {
    const el = specInputRefs.value[sIdx]
    const input = el?.$el?.querySelector?.('input') || el?.input
    input?.focus()
  })
}

function confirmSpecValue(sIdx: number): void {
  const list = [...props.modelValue]
  const spec = { ...list[sIdx] }
  const val = spec.inputValue.trim()
  if (val && !spec.values.includes(val)) {
    spec.values = [...spec.values, val]
  }
  spec.inputVisible = false
  spec.inputValue = ''
  list[sIdx] = spec
  update(list)
}

function removeSpecValue(sIdx: number, vIdx: number): void {
  const list = [...props.modelValue]
  const spec = { ...list[sIdx] }
  spec.values = spec.values.filter((_, i) => i !== vIdx)
  list[sIdx] = spec
  update(list)
}
</script>

<style lang="scss" scoped>
$primary: #409eff;
$text-main: #1f2d3d;
$text-secondary: #8a94a6;
$bg-soft: #f7f9fc;
$radius-block: 12px;

.spec-section {
  margin-bottom: 20px;

  .spec-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    .spec-title {
      font-size: 13px;
      font-weight: 600;
      color: $text-main;
    }
  }

  .spec-header-actions {
    display: flex;
    align-items: center;
    gap: 12px;

    .btn-icon {
      margin-right: 4px;
      vertical-align: middle;
    }
  }

  .spec-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
    border-radius: $radius-block;
    background: $bg-soft;
    margin-bottom: 10px;

    .spec-values {
      flex: 1;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      min-height: 32px;
    }

    .add-value-btn {
      border-style: dashed;
    }
  }
}

.empty-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  text-align: center;
  color: $text-secondary;
  font-size: 13px;
  background: $bg-soft;
  border-radius: $radius-block;
}
</style>