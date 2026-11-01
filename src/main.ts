import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import '@/asserts/main.scss'
import 'element-plus/theme-chalk/el-message.css'
import 'element-plus/theme-chalk/el-message-box.css'
import 'element-plus/theme-chalk/el-loading.css'

async function bootstrap() {
  // 仅开发环境启用 Mock，生产构建时整块被 Tree-shaking 剔除
  if (import.meta.env.DEV) {
    const { network } = await import('virtual:msw')
    const { handlers } = await import('@model/handlers.ts')
    network.configure({ handlers })
    await network.enable()
  }

  const app = createApp(App)
  app.use(router)
  app.mount('#app')
}

bootstrap()