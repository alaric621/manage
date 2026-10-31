<template>
  <ElCard class="panel-card hot-goods-card" shadow="never">
    <template #header>
      <div class="panel-header">
        <div class="panel-title">
          <span class="title-dot"></span>
          热销商品 TOP5
        </div>
        <ElLink type="primary" :underline="false" @click="handleMore">
          全部 <Icon icon="solar:alt-arrow-right-bold-duotone" width="12" />
        </ElLink>
      </div>
    </template>

    <div class="top-goods-list">
      <div
        v-for="(g, idx) in topGoods"
        :key="g.name"
        class="top-goods-item"
        @click="handleClick(g)"
      >
        <span class="rank-badge" :class="`rank-${idx + 1}`">{{ idx + 1 }}</span>
        <div class="goods-thumb" :style="{ background: g.thumb }">
          <Icon :icon="g.icon" width="16" />
        </div>
        <div class="goods-info">
          <div class="goods-name">{{ g.name }}</div>
          <div class="goods-sales">销量 {{ g.sales }}</div>
        </div>
        <div class="goods-amount">¥{{ (g.amount / 1000).toFixed(1) }}k</div>
      </div>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'

interface TopGoods {
  name: string
  sales: number
  amount: number
  icon: string
  thumb: string
  id?: number
}

const router = useRouter()

const topGoods = ref<TopGoods[]>([
  { name: '无线蓝牙耳机 Pro', sales: 1286, amount: 512400, icon: 'solar:headphones-round-sound-bold-duotone', thumb: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)', id: 1 },
  { name: '智能手表 S9', sales: 986, amount: 886400, icon: 'solar:watch-square-bold-duotone', thumb: 'linear-gradient(135deg, #e6f7ee, #cdf0de)', id: 2 },
  { name: '便携充电宝 20000mAh', sales: 872, amount: 112488, icon: 'solar:battery-charge-bold-duotone', thumb: 'linear-gradient(135deg, #fff4e6, #ffe4c4)', id: 3 },
  { name: '轻薄羽绒服', sales: 756, amount: 452844, icon: 'solar:bag-smile-bold-duotone', thumb: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)', id: 4 },
  { name: '保湿精华液 50ml', sales: 643, amount: 192257, icon: 'solar:magic-stick-3-bold-duotone', thumb: 'linear-gradient(135deg, #ffeaea, #ffd6d6)', id: 5 }
])

function handleMore(): void {
  router.push('/product/list')
}

function handleClick(g: TopGoods): void {
  if (g.id) router.push(`/product/detail/${g.id}`)
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
$shadow-hover: 0 10px 28px rgba(31, 45, 61, 0.1);

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

.panel-card {
  border-radius: $radius-card;
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
}

.top-goods-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.top-goods-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: $radius-block;
  background: $bg-soft;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f5f9ff;
    transform: translateX(2px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.08);
  }

  .rank-badge {
    width: 22px;
    height: 22px;
    line-height: 22px;
    text-align: center;
    border-radius: 6px;
    background: #f0f5ff;
    color: $primary;
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;

    &.rank-1 { color: #fff; background: #f56c6c; }
    &.rank-2 { color: #fff; background: #e6a23c; }
    &.rank-3 { color: #fff; background: #52b788; }
  }

  .goods-thumb {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    @include flex-center;
    color: $primary;
    flex-shrink: 0;
  }

  .goods-info {
    flex: 1;
    min-width: 0;
  }

  .goods-name {
    font-size: 13px;
    font-weight: 500;
    color: $text-main;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .goods-sales {
    margin-top: 2px;
    font-size: 12px;
    color: $text-secondary;
  }

  .goods-amount {
    font-size: 13px;
    font-weight: 600;
    color: $text-main;
    flex-shrink: 0;
  }
}
</style>