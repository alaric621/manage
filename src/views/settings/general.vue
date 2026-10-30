<template>
  <div class="settings-page general-page">
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="140px" class="settings-form">
      <!-- 商城信息 -->
      <ElCard class="panel-card" shadow="never">
        <template #header>
          <div class="panel-header">
            <div class="panel-title">
              <span class="title-dot"></span>
              商城信息
            </div>
            <ElTag size="small" type="success" effect="light" round>{{ shopStatusText }}</ElTag>
          </div>
        </template>

        <ElRow :gutter="32">
          <!-- 左：Logo + 基础信息 -->
          <ElCol :xs="24" :md="8">
            <div class="logo-section">
              <div class="logo-preview" :style="{ background: form.logo }">
                <img v-if="form.logoUrl" :src="form.logoUrl" alt="" class="logo-img" />
                <Icon v-else icon="solar:shop-bold-duotone" width="40" />
              </div>
              <ElUpload
                :show-file-list="false"
                :before-upload="beforeLogoUpload"
                :http-request="handleLogoUpload"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
              >
                <ElButton size="small" style="margin-top: 12px">
                  <Icon icon="solar:upload-bold-duotone" class="btn-icon" />
                  {{ form.logoUrl ? '更换 Logo' : '上传 Logo' }}
                </ElButton>
              </ElUpload>
              <ElButton v-if="form.logoUrl" size="small" type="danger" plain style="margin-top: 6px" @click="removeLogo">
                移除
              </ElButton>
              <span class="logo-tip">建议 200×200px</span>
            </div>
          </ElCol>

          <!-- 右：字段 -->
          <ElCol :xs="24" :md="16">
            <ElFormItem label="商城名称" prop="shopName">
              <ElInput v-model="form.shopName" placeholder="请输入商城名称" maxlength="30" show-word-limit />
            </ElFormItem>
            <ElFormItem label="商城简介">
              <ElInput v-model="form.shopDesc" type="textarea" :rows="2" maxlength="120" show-word-limit placeholder="简要介绍商城定位" />
            </ElFormItem>
            <ElRow :gutter="16">
              <ElCol :span="12">
                <ElFormItem label="客服电话" prop="servicePhone">
                  <ElInput v-model="form.servicePhone" placeholder="如：400-888-8888" />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="客服邮箱">
                  <ElInput v-model="form.serviceEmail" placeholder="如：service@shop.com" />
                </ElFormItem>
              </ElCol>
            </ElRow>
            <ElFormItem label="网站备案号">
              <ElInput v-model="form.icp" placeholder="如：粤ICP备xxxxxxxx号" />
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElCard>

      <!-- 交易设置 -->
      <ElCard class="panel-card" shadow="never">
        <template #header>
          <div class="panel-header">
            <div class="panel-title">
              <span class="title-dot"></span>
              交易设置
            </div>
          </div>
        </template>

        <ElRow :gutter="32">
          <ElCol :xs="24" :md="12">
            <ElFormItem label="订单自动取消">
              <div class="input-with-unit">
                <ElInputNumber v-model="form.orderAutoCancel" :min="0" :max="1440" controls-position="right" style="width: 180px" />
                <span class="unit">分钟</span>
              </div>
              <div class="form-tip">未付款订单超过该时间自动取消</div>
            </ElFormItem>
            <ElFormItem label="自动确认收货">
              <div class="input-with-unit">
                <ElInputNumber v-model="form.autoConfirmDays" :min="0" :max="30" controls-position="right" style="width: 180px" />
                <span class="unit">天</span>
              </div>
              <div class="form-tip">发货后该天数未操作自动确认收货</div>
            </ElFormItem>
            <ElFormItem label="售后期">
              <div class="input-with-unit">
                <ElInputNumber v-model="form.refundDays" :min="0" :max="30" controls-position="right" style="width: 180px" />
                <span class="unit">天</span>
              </div>
              <div class="form-tip">确认收货后可申请售后的天数</div>
            </ElFormItem>
          </ElCol>

          <ElCol :xs="24" :md="12">
            <ElFormItem label="允许游客下单">
              <ElSwitch v-model="form.guestOrder" />
              <div class="form-tip">开启后未登录用户也可提交订单</div>
            </ElFormItem>
            <ElFormItem label="下单需绑定手机">
              <ElSwitch v-model="form.orderNeedPhone" />
              <div class="form-tip">开启后下单前需绑定手机号</div>
            </ElFormItem>
            <ElFormItem label="库存扣减方式">
              <ElRadioGroup v-model="form.stockMode">
                <ElRadio value="order">下单减库存</ElRadio>
                <ElRadio value="pay">付款减库存</ElRadio>
              </ElRadioGroup>
              <div class="form-tip">下单减库存可能出现超卖，付款减库存更稳妥</div>
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElCard>

      <!-- 运营设置 -->
      <ElCard class="panel-card" shadow="never">
        <template #header>
          <div class="panel-header">
            <div class="panel-title">
              <span class="title-dot"></span>
              运营设置
            </div>
          </div>
        </template>

        <ElRow :gutter="32">
          <ElCol :xs="24" :md="12">
            <ElFormItem label="商城状态">
              <ElSwitch v-model="form.shopOpen" active-text="营业中" inactive-text="打烊中" />
              <div class="form-tip">关闭后前台商城显示维护页面</div>
            </ElFormItem>
            <ElFormItem label="维护提示">
              <ElInput v-model="form.maintenanceTip" type="textarea" :rows="2" maxlength="120" show-word-limit placeholder="商城维护期间显示给用户的提示" />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :md="12">
            <ElFormItem label="新用户注册送积分">
              <div class="input-with-unit">
                <ElInputNumber v-model="form.registerPoints" :min="0" :max="99999" controls-position="right" style="width: 180px" />
                <span class="unit">积分</span>
              </div>
            </ElFormItem>
            <ElFormItem label="新用户欢迎语">
              <ElInput v-model="form.welcomeText" type="textarea" :rows="2" maxlength="120" show-word-limit placeholder="新用户注册后显示的欢迎语" />
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElCard>

      <!-- 安全设置 -->
      <ElCard class="panel-card" shadow="never">
        <template #header>
          <div class="panel-header">
            <div class="panel-title">
              <span class="title-dot"></span>
              安全设置
            </div>
          </div>
        </template>

        <ElRow :gutter="32">
          <ElCol :xs="24" :md="12">
            <ElFormItem label="登录失败锁定">
              <ElSwitch v-model="form.loginLock" />
              <div class="form-tip">连续登录失败 5 次锁定 30 分钟</div>
            </ElFormItem>
            <ElFormItem label="异地登录提醒">
              <ElSwitch v-model="form.loginAlert" />
              <div class="form-tip">检测到异常 IP 登录时通知管理员</div>
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :md="12">
            <ElFormItem label="操作日志保留">
              <div class="input-with-unit">
                <ElInputNumber v-model="form.logRetainDays" :min="7" :max="365" controls-position="right" style="width: 180px" />
                <span class="unit">天</span>
              </div>
              <div class="form-tip">超过该天数的日志自动清理</div>
            </ElFormItem>
            <ElFormItem label="后台水印">
              <ElSwitch v-model="form.watermark" />
              <div class="form-tip">开启后后台页面显示管理员账号水印</div>
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElCard>

      <!-- 底部保存 -->
      <div class="footer-bar">
        <div class="footer-tip">
          <Icon icon="solar:info-circle-bold-duotone" width="14" />
          <span>修改后请点击保存生效</span>
        </div>
        <div class="footer-actions">
          <ElButton @click="handleReset">重置</ElButton>
          <ElButton type="primary" :loading="saving" @click="handleSave">保存设置</ElButton>
        </div>
      </div>
    </ElForm>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules, UploadRequestOptions } from 'element-plus'
import { Icon } from '@iconify/vue'

// ---------- 类型 ----------
type StockMode = 'order' | 'pay'

interface GeneralForm {
  shopName: string
  logo: string
  logoUrl: string
  shopDesc: string
  icp: string
  servicePhone: string
  serviceEmail: string
  orderAutoCancel: number
  autoConfirmDays: number
  refundDays: number
  guestOrder: boolean
  orderNeedPhone: boolean
  stockMode: StockMode
  shopOpen: boolean
  maintenanceTip: string
  registerPoints: number
  welcomeText: string
  loginLock: boolean
  loginAlert: boolean
  logRetainDays: number
  watermark: boolean
}

// ---------- 表单 ----------
const formRef = ref<FormInstance>()
const saving = ref(false)

const defaultForm = (): GeneralForm => ({
  shopName: '优选商城',
  logo: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)',
  logoUrl: '',
  shopDesc: '品质生活，从优选开始',
  icp: '粤ICP备12345678号',
  servicePhone: '400-888-8888',
  serviceEmail: 'service@shop.com',
  orderAutoCancel: 30,
  autoConfirmDays: 7,
  refundDays: 7,
  guestOrder: false,
  orderNeedPhone: true,
  stockMode: 'pay',
  shopOpen: true,
  maintenanceTip: '商城维护中，请稍后访问',
  registerPoints: 100,
  welcomeText: '欢迎加入优选商城，祝你购物愉快！',
  loginLock: true,
  loginAlert: true,
  logRetainDays: 90,
  watermark: false
})

const form = reactive<GeneralForm>(defaultForm())

const rules: FormRules<GeneralForm> = {
  shopName: [{ required: true, message: '请输入商城名称', trigger: 'blur' }],
  servicePhone: [
    { required: true, message: '请输入客服电话', trigger: 'blur' },
    { pattern: /^[\d\-+() ]{7,20}$/, message: '电话格式不正确', trigger: 'blur' }
  ]
}

const shopStatusText = computed(() => (form.shopOpen ? '营业中' : '打烊中'))

// ---------- Logo 上传 ----------
function beforeLogoUpload(file: File): boolean {
  const isImage = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'].includes(file.type)
  if (!isImage) {
    ElMessage.error('仅支持 PNG / JPG / SVG / WebP 格式')
    return false
  }
  if (file.size / 1024 / 1024 >= 2) {
    ElMessage.error('Logo 大小不能超过 2MB')
    return false
  }
  return true
}

function handleLogoUpload(options: UploadRequestOptions): void {
  // TODO: 替换为真实上传接口
  const reader = new FileReader()
  reader.onload = e => {
    form.logoUrl = String(e.target?.result || '')
    ElMessage.success('Logo 已上传')
  }
  reader.readAsDataURL(options.file)
}

function removeLogo(): void {
  form.logoUrl = ''
}

// ---------- 保存/重置 ----------
async function handleSave(): Promise<void> {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    ElMessage.warning('请完善必填信息')
    return
  }
  saving.value = true
  await new Promise(r => setTimeout(r, 500))
  saving.value = false
  ElMessage.success('设置已保存')
}

function handleReset(): void {
  Object.assign(form, defaultForm())
  nextTick(() => formRef.value?.clearValidate())
  ElMessage.info('已恢复默认配置')
}

onMounted(() => {
  // TODO: 拉取已有配置回填 form
})
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
$shadow-hover: 0 10px 28px rgba(31, 45, 61, 0.10);

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

.settings-page {
  padding: $gap;
  min-height: 100%;
  padding-bottom: 88px;
}

.settings-form {
  margin: 0 auto;
}

.panel-card {
//   border-radius: $radius-card;
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
    padding: 20px 18px;
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

.btn-icon {
  margin-right: 4px;
  vertical-align: middle;
}

// Logo
.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: $bg-soft;
  border-radius: $radius-block;
}

.logo-preview {
  width: 100px;
  height: 100px;
  border-radius: 16px;
  @include flex-center;
  color: $primary;
  border: 1px solid $border-light;
  overflow: hidden;
  box-shadow: $shadow-card;

  .logo-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.logo-tip {
  margin-top: 8px;
  font-size: 12px;
  color: $text-secondary;
}

// 输入带单位
.input-with-unit {
  display: flex;
  align-items: center;
  gap: 8px;

  .unit {
    font-size: 13px;
    color: $text-secondary;
  }
}

.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: $text-secondary;
}

// 底部
.footer-bar {
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  @include flex-between;
  padding: 14px 24px;
  background: rgba(255, 255, 255, 0.92);
  border-top: 1px solid $border-light;
  backdrop-filter: blur(8px);
  box-shadow: 0 -4px 16px rgba(31, 45, 61, 0.06);

  .footer-tip {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: $text-secondary;
  }

  .footer-actions {
    display: flex;
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .settings-page {
    padding: 12px;
  }

  .logo-section {
    margin-bottom: 16px;
  }

  .footer-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
}
</style>