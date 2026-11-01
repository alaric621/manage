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
        <div
          v-for="(val, vIdx) in spec.values"
          :key="vIdx"
          class="spec-value-item"
        >
          <!-- 规格值图片上传 -->
          <ElUpload
            :show-file-list="false"
            :before-upload="beforeUpload"
            :http-request="(opt: UploadRequestOptions) => handleValueImageUpload(opt, sIdx, vIdx)"
            accept="image/png,image/jpeg,image/webp"
          >
            <div class="value-image" :class="{ empty: !val.image }">
              <img v-if="val.image" :src="val.image" alt="" />
              <Icon v-else icon="solar:gallery-add-bold-duotone" width="14" />
            </div>
          </ElUpload>

          <span class="value-name">{{ val.name }}</span>

          <Icon
            icon="solar:close-circle-bold-duotone"
            width="14"
            class="value-remove"
            @click="removeSpecValue(sIdx, vIdx)"
          />
        </div>

        <ElInput
          v-if="spec.inputVisible"
          :ref="el => setSpecInputRef(el as InputInstance | null, sIdx)"
          v-model="spec.inputValue"
          size="small"
          style="width: 100px"
          placeholder="规格值"
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
import type { InputInstance, UploadRequestOptions } from 'element-plus'
import { Icon } from '@iconify/vue'
import { uploadImage } from '@/api/product'
import type { SpecItem } from '../types'

// ---------- Props ----------
const props = defineProps<{ modelValue: SpecItem[] }>()

// ---------- Emits ----------
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

// ---------- 规格值图片上传 ----------
function beforeUpload(file: File): boolean {
  const isImage = ['image/png', 'image/jpeg', 'image/webp'].includes(file.type)
  if (!isImage) {
    ElMessage.error('仅支持 PNG / JPG / WebP')
    return false
  }
  if (file.size / 1024 / 1024 >= 2) {
    ElMessage.error('图片不能超过 2MB')
    return false
  }
  return true
}

async function handleValueImageUpload(
  options: UploadRequestOptions,
  sIdx: number,
  vIdx: number
): Promise<void> {
  try {
    const url = await uploadImage(options.file as File)
    const list = [...props.modelValue]
    const spec = { ...list[sIdx] }
    const values = [...spec.values]
    const current = values[vIdx]
    if (!current) return
    values[vIdx] = { name: current.name, image: url }
    spec.values = values
    list[sIdx] = spec
    update(list)
    ElMessage.success('规格图已上传')
  } catch {
    ElMessage.error('上传失败')
  }
}

// ---------- 规格模板 ----------
function applySpecTemplate(command: string): void {
  const tpl = specTemplates[command]
  if (!tpl) return
  if (props.modelValue.some(s => s.name === tpl.name)) {
    ElMessage.warning(`规格「${tpl.name}」已存在`)
    return
  }
  update([
    ...props.modelValue,
    {
      name: tpl.name,
      values: tpl.values.map(name => ({ name, image: '' })),
      inputVisible: false,
      inputValue: ''
    }
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
  if (val && !spec.values.some(v => v.name === val)) {
    spec.values = [...spec.values, { name: val, image: '' }]
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
$border-light: #eef1f6;
$bg-soft: #f7f9fc;
$radius-block: 12px;

.spec-section {
  margin-bottom: 20px;
}

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
}

.spec-values {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-height: 32px;
}

.spec-value-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px 4px 4px;
  background: #fff;
  border: 1px solid $border-light;
  border-radius: 8px;
  transition: border-color 0.2s;

  &:hover {
    border-color: $primary;
  }

  .value-image {
    width: 26px;
    height: 26px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-soft;
    color: $text-secondary;
    cursor: pointer;
    overflow: hidden;

    &.empty {
      border: 1px dashed #cdd8e6;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .value-name {
    font-size: 13px;
    color: $text-main;
  }

  .value-remove {
    color: $text-secondary;
    cursor: pointer;

    &:hover {
      color: #f56c6c;
    }
  }
}

.add-value-btn {
  border-style: dashed;
}

.empty-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  color: $text-secondary;
  font-size: 13px;
  background: $bg-soft;
  border-radius: $radius-block;
}
</style>