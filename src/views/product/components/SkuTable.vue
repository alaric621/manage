<template>
  <div v-if="rows.length" class="sku-table-wrap">
    <div class="sku-table-header">
      <span>SKU 组合（{{ rows.length }} 个）</span>
      <div class="sku-header-actions">
        <span class="sku-summary">
          总库存 <b>{{ totalStock }}</b> · 价格区间
          <b v-if="priceRange">¥{{ priceRange }}</b><b v-else>--</b>
        </span>
        <ElButton link type="primary" size="small" @click="batchFill">
          <Icon icon="solar:copy-bold-duotone" width="14" />批量填充
        </ElButton>
      </div>
    </div>

    <ElTable :data="rows" size="small" border class="sku-table">
      <ElTableColumn
        v-for="(spec, sIdx) in specs"
        :key="sIdx"
        :label="spec.name || `规格${sIdx + 1}`"
        width="120"
      >
        <template #default="{ row }">{{ row.specValues[sIdx] }}</template>
      </ElTableColumn>
      <ElTableColumn label="售价" width="130">
        <template #default="{ row }">
          <ElInputNumber
            v-model="row.price"
            :min="0"
            :precision="2"
            size="small"
            controls-position="right"
            style="width: 100%"
            @change="emitChange"
          />
        </template>
      </ElTableColumn>
      <ElTableColumn label="原价" width="130">
        <template #default="{ row }">
          <ElInputNumber
            v-model="row.originPrice"
            :min="0"
            :precision="2"
            size="small"
            controls-position="right"
            style="width: 100%"
            @change="emitChange"
          />
        </template>
      </ElTableColumn>
      <ElTableColumn label="库存" width="110">
        <template #default="{ row }">
          <ElInputNumber
            v-model="row.stock"
            :min="0"
            size="small"
            controls-position="right"
            style="width: 100%"
            @change="emitChange"
          />
        </template>
      </ElTableColumn>
      <ElTableColumn label="SKU 编码" width="150">
        <template #default="{ row }">
          <ElInput
            v-model="row.skuNo"
            size="small"
            placeholder="自动生成"
            @change="emitChange"
          />
        </template>
      </ElTableColumn>
      <ElTableColumn label="重量(kg)" width="110">
        <template #default="{ row }">
          <ElInputNumber
            v-model="row.weight"
            :min="0"
            :precision="2"
            size="small"
            controls-position="right"
            style="width: 100%"
            @change="emitChange"
          />
        </template>
      </ElTableColumn>
      <ElTableColumn label="操作" width="70" align="center">
        <template #default="{ $index }">
          <ElButton link type="danger" size="small" @click="removeRow($index)">
            <Icon icon="solar:trash-bin-trash-bold-duotone" width="14" />
          </ElButton>
        </template>
      </ElTableColumn>
    </ElTable>
  </div>

  <div v-else-if="specs.length" class="empty-tip">
    <Icon icon="solar:info-circle-bold-duotone" width="22" />
    <span>请为规格添加至少一个规格值，系统将自动生成 SKU 组合</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Icon } from '@iconify/vue'
import type { SkuRow, SpecItem } from '../types'

const props = defineProps<{
  rows: SkuRow[]
  specs: SpecItem[]
}>()

const emit = defineEmits<{
  (e: 'update:rows', value: SkuRow[]): void
  (e: 'change'): void
}>()

const totalStock = computed<number>(() =>
  props.rows.reduce((s, r) => s + (r.stock || 0), 0)
)

const priceRange = computed<string>(() => {
  const prices = props.rows.map(r => r.price).filter(p => p > 0)
  if (!prices.length) return ''
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return min === max ? min.toFixed(2) : `${min.toFixed(2)} ~ ${max.toFixed(2)}`
})

function emitChange(): void {
  emit('change')
}

function removeRow(idx: number): void {
  const list = [...props.rows]
  list.splice(idx, 1)
  emit('update:rows', list)
  emit('change')
}

function batchFill(): void {
  if (!props.rows.length) return
  const first = props.rows[0]
  const list = props.rows.map(row => ({
    ...row,
    price: first.price,
    originPrice: first.originPrice,
    stock: first.stock,
    weight: first.weight
  }))
  emit('update:rows', list)
  emit('change')
  ElMessage.success('已按第一行填充价格/库存/重量')
}
</script>

<style lang="scss" scoped>
$primary: #409eff;
$text-main: #1f2d3d;
$text-secondary: #8a94a6;
$bg-soft: #f7f9fc;
$radius-block: 12px;

.sku-table-wrap {
  .sku-table-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: 600;
    color: $text-main;
  }

  .sku-header-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .sku-summary {
    font-size: 12px;
    font-weight: 400;
    color: $text-secondary;

    b {
      color: $primary;
      font-weight: 600;
    }
  }
}

.sku-table {
  :deep(.el-table__header th) {
    background: #f8fafd;
    color: $text-secondary;
    font-weight: 500;
    font-size: 12px;
  }

  :deep(.el-table td) {
    padding: 6px 8px;
  }
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