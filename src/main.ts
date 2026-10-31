import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import '@/styles/list-page.scss'
import 'element-plus/theme-chalk/el-message.css'
import 'element-plus/theme-chalk/el-message-box.css'
import 'element-plus/theme-chalk/el-loading.css'
const app = createApp(App)

app.use(router)

app.mount('#app')
