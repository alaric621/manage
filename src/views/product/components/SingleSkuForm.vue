<template>
  <ElRow :gutter="24">
    <ElCol :xs="24" :md="8">
      <ElFormItem label="售价" prop="single.price">
        <ElInputNumber
          v-model="model.price"
          :min="0"
          :precision="2"
          :step="1"
          controls-position="right"
          style="width: 100%"
        >
          <template #prefix>¥</template>
        </ElInputNumber>
      </ElFormItem>
    </ElCol>
    <ElCol :xs="24" :md="8">
      <ElFormItem label="原价">
        <ElInputNumber
          v-model="model.originPrice"
          :min="0"
          :precision="2"
          :step="1"
          controls-position="right"
          style="width: 100%"
        >
          <template #prefix>¥</template>
        </ElInputNumber>
      </ElFormItem>
    </ElCol>
    <ElCol :xs="24" :md="8">
      <ElFormItem label="成本价">
        <ElInputNumber
          v-model="model.costPrice"
          :min="0"
          :precision="2"
          :step="1"
          controls-position="right"
          style="width: 100%"
        >
          <template #prefix>¥</template>
        </ElInputNumber>
      </ElFormItem>
    </ElCol>
    <ElCol :xs="24" :md="8">
      <ElFormItem label="库存" prop="single.stock">
        <ElInputNumber
          v-model="model.stock"
          :min="0"
          controls-position="right"
          style="width: 100%"
        />
      </ElFormItem>
    </ElCol>
    <ElCol :xs="24" :md="8">
      <ElFormItem label="库存预警">
        <ElInputNumber
          v-model="model.warnStock"
          :min="0"
          controls-position="right"
          style="width: 100%"
        />
      </ElFormItem>
    </ElCol>
    <ElCol :xs="24" :md="8">
      <ElFormItem label="重量(kg)">
        <ElInputNumber
          v-model="model.weight"
          :min="0"
          :precision="2"
          controls-position="right"
          style="width: 100%"
        />
      </ElFormItem>
    </ElCol>
  </ElRow>
</template>

<script setup lang="ts">
import type { SingleSku } from '../types'

const model = defineModel<SingleSku>({ required: true })
</script>