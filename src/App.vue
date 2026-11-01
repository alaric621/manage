<template>
  <ElConfigProvider :locale="zhCn">
    <RouterView />
  </ElConfigProvider>
</template>

<script setup lang="ts">
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

onMounted(async()=>{
  try {
    const res = await fetch('/api/user')
    const data = await res.json()
    console.log('Mock 返回:', data)
  } catch (err) {
    console.error(err)
  }
})
</script>
<style lang="scss" >
 *{
   margin:0;
   padding:0;
   
 }
</style>
