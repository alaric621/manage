<script setup lang="ts">
const userinfo = reactive({
   username:"",
   password:"",
   code:""
})

const handleLogin = async () => {
}
</script>

<template>
  <div class="login-wrapper">
    <!-- 主题切换 -->

    <!-- 装饰背景 -->
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>

    <div class="login-container">
      <!-- 左侧：功能引导区 -->
      <div class="hero-section">
        <div class="hero-content">
          <div class="brand-tag">商城管理系统 v1.0</div>
          <h1>管理商城，<br />助力业务增长</h1>
          <p>全面覆盖订单、商品与用户管理，让经营决策更科学、更高效。</p>

          <ul class="feature-list">
            <li>
              <IconMdiCartOutline /> <span>智能订单处理</span>
            </li>
            <li>
              <IconMdiPackageVariantClosed /> <span>数字化仓储管理</span>
            </li>
            <li>
              <IconMdiChartBar /> <span>多维数据洞察</span>
            </li>
          </ul>
        </div>
      </div>
      <!-- 右侧：登录卡片区 -->
      <div class="form-section">
        <div class="login-card">
          <div class="login-header">
            <div class="logo-wrapper">
              <IconMdiStorefront />
            </div>
            <h2>后台登录</h2>
            <p>请输入您的管理员账号以继续</p>
          </div>

          <form class="login-form" @submit.prevent="handleLogin">
            <div class="form-group">
              <label>管理账号</label>
              <div class="input-wrapper">
                <IconMdiAccount class="input-icon" />
                <input v-model="userinfo.username" placeholder="请输入用户名密码" required />
              </div>
            </div>

            <div class="form-group">
              <label>访问密码</label>
              <div class="input-wrapper">
                <IconMdiLock class="input-icon" />
                <input v-model="userinfo.password" type="请输入密码" placeholder="••••••••" required />
              </div>
            </div>

            <!-- <div class="form-group">
              <label>安全验证</label>
              <SliderCaptcha @success="handleCaptchaSuccess" />
            </div> -->
            <ElButton size="large"    type="primary">立即登录</ElButton>
            <!-- <button class="login-btn" :disabled="submitting || !captchaPassed">
              <IconMdiLoading v-if="submitting" class="animate-spin" />
              <span v-else>立即登录</span>
            </button> -->
          </form>
          <!-- <div class="login-footer">
            <p>测试账号: <code>admin / 123456</code></p>
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  height: 100vh;
  transition: background-color 0.3s;

  // @include useTheme using ($themeMap) {
  //   background-color: theme($themeMap, 'bg', 'base');
  // }
}

.theme-toggle {
  position: absolute;
  top: 24px;
  right: 24px;
  width: 40px;
  height: 40px;
  backdrop-filter: blur(10px);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  z-index: 10;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  // @include useTheme using ($themeMap) {
  //   background: theme($themeMap, 'component', 'card', 'bg');
  //   border: 1px solid theme($themeMap, 'border', 'base');
  //   color: theme($themeMap, 'text', 'secondary');
  // }
}

.theme-toggle:hover {
  transform: translateY(-2px);
}

/* 动态背景装饰 */
.blob {
  position: absolute;
  width: 500px;
  height: 500px;
  filter: blur(80px);
  border-radius: 50%;
  z-index: 0;
  transition: opacity 0.3s;
}

.blob-1 {
  top: -100px;
  right: -100px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%);
}

.blob-2 {
  bottom: -150px;
  left: -100px;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(2, 132, 199, 0.05) 100%);
}

[data-theme="dark"] .blob {
  opacity: 0.1;
}

.login-container {
  position: relative;
  z-index: 1;
  width: 1000px;
  max-width: 90vw;
  height: 600px;
  display: flex;
  backdrop-filter: blur(25px);
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

}

/* 左侧 Hero 区 */
.hero-section {
  flex: 1.2;

  background: linear-gradient(225deg, #1e293b 0%, #0f172a 100%);
  padding: 60px;
  display: flex;
  align-items: center;
  color: #fff;
}

@media (max-width: 900px) {
  .hero-section {
    display: none;
  }
  .login-container {
    width: 440px;
    height: auto;
  }
}

.brand-tag {
  display: inline-block;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;
  color: #38bdf8;
  margin-bottom: 24px;
}

.hero-content h1 {
  font-size: 42px;
  line-height: 1.2;
  margin-bottom: 20px;
}

.hero-content p {
  font-size: 16px;
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 40px;
}

.feature-list {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 16px;
}

.feature-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #cbd5e1;
  font-size: 15px;
}

.feature-list li svg {
  color: #3b82f6;
}

/* 右侧 Form 区 */
.form-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-card {
  width: 100%;
  max-width: 360px;
  border-radius: 0;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-wrapper {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  border-radius: 15px;
  justify-content: center;
  font-size: 28px;
  margin: 0 auto 16px;
  transition: all 0.3s;


}

.login-header h2 {
  font-size: 24px;
  margin: 0 0 6px;
  transition: color 0.3s;


}
.login-header p {
  font-size: 14px;
  margin: 0;
  transition: color 0.3s;


}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-group label {
  font-size: 13px;
  font-weight: 600;
  transition: color 0.3s;


}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.input-icon {
  position: absolute;
  left: 14px;
  font-size: 18px;
  transition: color 0.3s;


}
.input-wrapper input {
  width: 100%;
  padding: 12px 12px 12px 44px;
  font-size: 14px;
  transition: all 0.3s;


}
.input-wrapper input:focus {
  outline: none;
  background: transparent;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);


}

.login-btn {
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;


}
.login-btn:hover:not(:disabled) {
  transform: translateY(-1px);

}
.login-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-footer {
  margin-top: 32px;
  text-align: center;
  font-size: 12px;
  transition: color 0.3s;


}
code {
  padding: 2px 4px;
  border-radius: 4px;
  transition: background-color 0.3s;
}
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
