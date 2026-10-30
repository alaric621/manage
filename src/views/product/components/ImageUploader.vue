<template>
  <div class="image-uploader">
    <div v-for="(img, idx) in modelValue" :key="idx" class="image-item">
      <div class="image-preview" :style="{ background: img.bg }">
        <Icon :icon="img.icon" width="30" height="30" />
        <span v-if="idx === 0" class="main-badge">主图</span>
        <div class="image-mask">
          <ElButton circle size="small" @click="setMainImage(idx)">
            <Icon icon="solar:star-bold-duotone" width="16" />
          </ElButton>
          <ElButton circle size="small" type="danger" @click="removeImage(idx)">
            <Icon icon="solar:trash-bin-trash-bold-duotone" width="16" />
          </ElButton>
        </div>
      </div>
    </div>
    <div v-if="modelValue.length < max" class="image-upload-btn" @click="addImage">
      <Icon icon="solar:add-circle-bold-duotone" width="26" height="26" />
      <span>添加图片</span>
      <span class="upload-count">{{ modelValue.length }}/{{ max }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { ProductImage } from '../types'

const props = withDefaults(
  defineProps<{
    modelValue: ProductImage[]
    max?: number
  }>(),
  { max: 5 }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: ProductImage[]): void
}>()

const imagePool: ProductImage[] = [
  { icon: 'solar:headphones-round-sound-bold-duotone', bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
  { icon: 'solar:watch-square-bold-duotone', bg: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' },
  { icon: 'solar:bag-smile-bold-duotone', bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)' },
  { icon: 'solar:magic-stick-3-bold-duotone', bg: 'linear-gradient(135deg, #ffeaea, #ffd6d6)' }
]

function update(list: ProductImage[]): void {
  emit('update:modelValue', list)
}

function addImage(): void {
  if (props.modelValue.length >= props.max) return
  const pick = imagePool[props.modelValue.length % imagePool.length]
  update([...props.modelValue, { ...pick }])
}

function removeImage(idx: number): void {
  const list = [...props.modelValue]
  list.splice(idx, 1)
  update(list)
}

function setMainImage(idx: number): void {
  if (idx === 0) return
  const list = [...props.modelValue]
  const [img] = list.splice(idx, 1)
  list.unshift(img)
  update(list)
}
</script>

<style lang="scss" scoped>
$primary: #409eff;
$border-light: #eef1f6;
$text-secondary: #8a94a6;

.image-uploader {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.image-item {
  .image-preview {
    position: relative;
    width: 110px;
    height: 110px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $primary;
    border: 1px solid $border-light;
    overflow: hidden;

    .main-badge {
      position: absolute;
      top: 6px;
      left: 6px;
      padding: 1px 8px;
      font-size: 11px;
      color: #fff;
      background: $primary;
      border-radius: 999px;
      z-index: 2;
    }

    .image-mask {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: rgba(31, 45, 61, 0.45);
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    &:hover .image-mask {
      opacity: 1;
    }
  }
}

.image-upload-btn {
  width: 110px;
  height: 110px;
  border: 1px dashed #cdd8e6;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: $text-secondary;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  .upload-count {
    font-size: 11px;
    color: #b0b8c7;
  }

  &:hover {
    border-color: $primary;
    color: $primary;
    background: #f5f9ff;
  }
}
</style>