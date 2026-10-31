<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="not-found">
    <!-- 插画区域 -->
    <div class="not-found__illustration">
      <svg
        class="not-found__svg"
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="200" cy="200" r="160" fill="url(#gradient)" opacity="0.1" />
        <text
          x="200"
          y="220"
          text-anchor="middle"
          font-size="120"
          font-weight="800"
          fill="url(#textGradient)"
          font-family="Arial, sans-serif"
        >
          404
        </text>
        <circle cx="90" cy="100" r="12" fill="#818cf8" opacity="0.5" />
        <circle cx="320" cy="130" r="8" fill="#f472b6" opacity="0.5" />
        <circle cx="70" cy="300" r="10" fill="#34d399" opacity="0.5" />
        <circle cx="330" cy="290" r="14" fill="#fbbf24" opacity="0.5" />
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="400" y2="400">
            <stop offset="0%" stop-color="#6366f1" />
            <stop offset="100%" stop-color="#ec4899" />
          </linearGradient>
          <linearGradient id="textGradient" x1="0" y1="0" x2="400" y2="400">
            <stop offset="0%" stop-color="#6366f1" />
            <stop offset="100%" stop-color="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
    </div>

    <!-- 文字提示 -->
    <h1 class="not-found__title">页面走丢了</h1>
    <p class="not-found__desc">
      抱歉，你访问的页面不存在或已被移除，请检查网址是否正确。
    </p>

    <!-- 操作按钮 -->
    <div class="not-found__actions">
      <button class="btn btn--primary" @click="goHome">返回首页</button>
      <button class="btn btn--default" @click="goBack">返回上一页</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
// ===== 变量 =====
$primary-color: #6366f1;
$primary-hover: #4f46e5;
$secondary-color: #ec4899;
$text-color: #1f2937;
$text-muted: #6b7280;
$border-color: #d1d5db;
$bg-color: #f9fafb;
$white: #ffffff;

// ===== 页面容器 =====
.not-found {
  min-height: 100%;
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  // background-color: $bg-color;

  // ===== 插画 =====
  &__illustration {
    margin-bottom: 32px;
  }

  &__svg {
    width: 256px;
    height: 256px;

    @media (min-width: 640px) {
      width: 320px;
      height: 320px;
    }
  }

  // ===== 标题 =====
  &__title {
    margin: 0 0 12px;
    font-size: 24px;
    font-weight: 700;
    color: $text-color;

    @media (min-width: 640px) {
      font-size: 30px;
    }
  }

  // ===== 描述文字 =====
  &__desc {
    max-width: 448px;
    margin: 0 0 32px;
    font-size: 14px;
    line-height: 1.6;
    text-align: center;
    color: $text-muted;
  }

  // ===== 按钮组 =====
  &__actions {
    display: flex;
    flex-direction: column;
    gap: 16px;

    @media (min-width: 640px) {
      flex-direction: row;
    }
  }
}

// ===== 按钮 =====
.btn {
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.95);
  }

  // 主按钮
  &--primary {
    color: $white;
    background-color: $primary-color;
    box-shadow: 0 10px 15px -3px rgba($primary-color, 0.3);

    &:hover {
      background-color: $primary-hover;
    }
  }

  // 默认按钮
  &--default {
    color: $text-color;
    background-color: transparent;
    border: 1px solid $border-color;

    &:hover {
      background-color: #f3f4f6;
    }
  }
}

// ===== 深色模式 =====
@media (prefers-color-scheme: dark) {
  .not-found {
    background-color: #111827;

    &__title {
      color: #f3f4f6;
    }

    &__desc {
      color: #9ca3af;
    }
  }

  .btn--default {
    color: #e5e7eb;
    border-color: #4b5563;

    &:hover {
      background-color: #1f2937;
    }
  }
}
</style>