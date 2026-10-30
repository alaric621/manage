<template>
  <div class="settings-page payment-page">
    <!-- 概览 -->
    <ElRow :gutter="16" class="stat-row">
      <ElCol v-for="s in stats" :key="s.label" :xs="12" :sm="12" :md="6">
        <div class="stat-card" :style="{ '--accent': s.color, '--accent-soft': s.bg }">
          <div class="stat-icon">
            <Icon :icon="s.icon" width="22" height="22" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ s.value }}</div>
            <div class="stat-label">{{ s.label }}</div>
          </div>
        </div>
      </ElCol>
    </ElRow>

    <!-- 支付渠道配置 -->
    <ElCard class="panel-card" shadow="never">
      <template #header>
        <div class="panel-header">
          <div class="panel-title">
            <span class="title-dot"></span>
            支付渠道配置
            <span class="title-sub">安全参数为商户级配置，场景切换仅影响 AppID</span>
          </div>
        </div>
      </template>

      <ElTabs v-model="activeChannel" class="channel-tabs">
        <!-- 微信支付 -->
        <ElTabPane name="wechat">
          <template #label>
            <span class="tab-label">
              <Icon icon="solar:chat-round-bold-duotone" width="16" />
              微信支付
            </span>
          </template>

          <div class="channel-content">
            <!-- 场景切换：仅影响 AppID 的 label/placeholder -->
            <div class="scene-bar">
              <ElRadioGroup v-model="wechatScene" size="small" @change="onWechatSceneChange">
                <ElRadioButton label="miniapp">小程序</ElRadioButton>
                <ElRadioButton label="web">网站 JSAPI</ElRadioButton>
                <ElRadioButton label="app">App</ElRadioButton>
              </ElRadioGroup>
              <div class="scene-tip">
                <Icon icon="solar:info-circle-bold-duotone" width="14" />
                <span>{{ wechatSceneTip }}</span>
              </div>
            </div>

            <ElForm label-width="180px" class="channel-form">
              <ElDivider content-position="left">载体参数</ElDivider>

              <ElFormItem :label="wechatAppIdLabel" required>
                <ElInput v-model="wechatAppId" :placeholder="wechatAppIdPlaceholder" />
                <div class="form-tip">{{ wechatAppIdTip }}</div>
              </ElFormItem>

              <!-- 仅网站场景：支付授权目录 -->
              <ElFormItem v-if="wechatScene === 'web'" label="支付授权目录" required>
                <ElInput v-model="wechatAuthDir" placeholder="https://shop.yourshop.com/pay/" />
                <div class="form-tip">登记可调起支付的页面目录，需与实际 URL 一致</div>
              </ElFormItem>

              <ElDivider content-position="left">商户安全参数（所有场景共用）</ElDivider>

              <ElFormItem label="商户号 MchID" required>
                <ElInput v-model="wechatMchId" placeholder="微信支付商户号" />
                <div class="form-tip">商户平台 → 账户中心 → 商户信息</div>
              </ElFormItem>

              <ElFormItem label="APIv3 密钥" required>
                <ElInput v-model="wechatApiV3Key" type="password" show-password placeholder="32 位字符串" />
                <div class="form-tip">商户平台 → 账户中心 → API安全 → 设置APIv3密钥</div>
              </ElFormItem>

              <ElFormItem label="商户证书序列号" required>
                <ElInput v-model="wechatCertSerialNo" placeholder="40 位 16 进制字符串" />
                <div class="form-tip">从 apiclient_cert.pem 中获取</div>
              </ElFormItem>

              <ElFormItem label="商户 API 私钥" required>
                <ElInput
                  v-model="wechatPrivateKey"
                  type="textarea"
                  :rows="4"
                  placeholder="粘贴 apiclient_key.pem 内容（含 PEM 头尾）"
                />
                <div class="form-tip">仅用于请求签名，不会明文展示或导出</div>
              </ElFormItem>

              <ElDivider content-position="left">回调配置</ElDivider>

              <ElFormItem label="支付回调地址">
                <ElInput v-model="wechatNotifyUrl" placeholder="https://api.yourshop.com/pay/wechat/notify" />
                <div class="form-tip">公网可访问，需 HTTPS 且已 ICP 备案</div>
              </ElFormItem>
            </ElForm>
          </div>
        </ElTabPane>

        <!-- 支付宝 -->
        <ElTabPane name="alipay">
          <template #label>
            <span class="tab-label">
              <Icon icon="solar:wallet-money-bold-duotone" width="16" />
              支付宝
            </span>
          </template>

          <div class="channel-content">
            <div class="scene-bar">
              <ElRadioGroup v-model="alipayScene" size="small">
                <ElRadioButton label="miniapp">小程序</ElRadioButton>
                <ElRadioButton label="web">网站</ElRadioButton>
                <ElRadioButton label="app">App</ElRadioButton>
              </ElRadioGroup>
              <div class="scene-tip">
                <Icon icon="solar:info-circle-bold-duotone" width="14" />
                <span>密钥配置为应用级，场景切换不改变参数</span>
              </div>
            </div>

            <ElForm label-width="180px" class="channel-form">
              <ElDivider content-position="left">应用参数</ElDivider>

              <ElFormItem label="应用 APPID" required>
                <ElInput v-model="alipayAppId" placeholder="支付宝开放平台应用 APPID" />
                <div class="form-tip">创建应用后生成，是调用接口的唯一标识</div>
              </ElFormItem>

              <ElFormItem label="商户 UID（seller_id）">
                <ElInput v-model="alipaySellerId" placeholder="2088 开头的商户 UID" />
                <div class="form-tip">小程序 JSAPI 支付创建交易时建议传入，普通商户可留空</div>
              </ElFormItem>

              <ElDivider content-position="left">密钥配置</ElDivider>

              <ElFormItem label="加签方式">
                <ElRadioGroup v-model="alipaySignMode">
                  <ElRadio value="public-key">普通公钥</ElRadio>
                  <ElRadio value="cert">公钥证书</ElRadio>
                </ElRadioGroup>
              </ElFormItem>

              <template v-if="alipaySignMode === 'public-key'">
                <ElFormItem label="应用私钥" required>
                  <ElInput v-model="alipayPrivateKey" type="textarea" :rows="3" placeholder="开发者自行生成的应用私钥" />
                  <div class="form-tip">仅用于请求签名，丢失需重新生成</div>
                </ElFormItem>
                <ElFormItem label="支付宝公钥" required>
                  <ElInput v-model="alipayPublicKey" type="textarea" :rows="3" placeholder="上传应用公钥后从支付宝获取" />
                  <div class="form-tip">用于验签，不是自己生成的应用公钥</div>
                </ElFormItem>
              </template>

              <template v-else>
                <ElFormItem label="应用私钥" required>
                  <ElInput v-model="alipayPrivateKey" type="textarea" :rows="2" placeholder="应用私钥" />
                </ElFormItem>
                <ElFormItem label="应用公钥证书" required>
                  <ElInput v-model="alipayAppCertPath" placeholder="appCertPublicKey.crt" />
                </ElFormItem>
                <ElFormItem label="支付宝公钥证书" required>
                  <ElInput v-model="alipayCertPath" placeholder="alipayCertPublicKey_RSA2.crt" />
                </ElFormItem>
                <ElFormItem label="支付宝根证书" required>
                  <ElInput v-model="alipayRootCertPath" placeholder="alipayRootCert.crt" />
                </ElFormItem>
              </template>

              <ElDivider content-position="left">回调配置</ElDivider>

              <ElFormItem label="支付回调地址">
                <ElInput v-model="alipayNotifyUrl" placeholder="https://api.yourshop.com/pay/alipay/notify" />
                <div class="form-tip">支付宝异步通知接收地址，需公网可访问</div>
              </ElFormItem>
            </ElForm>
          </div>
        </ElTabPane>

        <!-- 银联 -->
        <ElTabPane name="union">
          <template #label>
            <span class="tab-label">
              <Icon icon="solar:card-bold-duotone" width="16" />
              银联/银行卡
            </span>
          </template>
          <div class="channel-content">
            <ElEmpty description="银联支付配置开发中" :image-size="80" />
          </div>
        </ElTabPane>
      </ElTabs>
    </ElCard>

    <!-- 通用支付配置 -->
    <ElCard class="panel-card" shadow="never">
      <template #header>
        <div class="panel-header">
          <div class="panel-title">
            <span class="title-dot"></span>
            通用支付配置
          </div>
        </div>
      </template>
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="160px" class="settings-form">
        <ElRow :gutter="24">
          <ElCol :xs="24" :md="12">
            <ElFormItem label="支付超时时间">
              <div class="input-with-unit">
                <ElInputNumber v-model="form.payTimeout" :min="1" :max="120" controls-position="right" style="width: 160px" />
                <span class="unit">分钟</span>
              </div>
            </ElFormItem>
            <ElFormItem label="自动退款">
              <ElSwitch v-model="form.autoRefund" />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :md="12">
            <ElFormItem label="退款方式">
              <ElRadioGroup v-model="form.refundMode">
                <ElRadio value="original">原路退回</ElRadio>
                <ElRadio value="balance">退回余额</ElRadio>
              </ElRadioGroup>
            </ElFormItem>
            <ElFormItem label="允许混合支付">
              <ElSwitch v-model="form.mixedPay" />
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
    </ElCard>

    <div class="footer-bar">
      <div class="footer-tip">
        <Icon icon="solar:info-circle-bold-duotone" width="14" />
        <span>参数涉及资金安全，请确认无误后保存</span>
      </div>
      <div class="footer-actions">
        <ElButton @click="handleReset">重置</ElButton>
        <ElButton type="primary" :loading="saving" @click="handleSave">保存配置</ElButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Icon } from '@iconify/vue'

// ---------- 类型 ----------
type WechatScene = 'miniapp' | 'web' | 'app'
type AlipayScene = 'miniapp' | 'web' | 'app'
type SignMode = 'public-key' | 'cert'

interface PaymentForm {
  payTimeout: number
  autoRefund: boolean
  refundMode: 'original' | 'balance'
  mixedPay: boolean
}

// ---------- 渠道 ----------
const activeChannel = ref<'wechat' | 'alipay' | 'union'>('wechat')

// ---------- 微信 ----------
const wechatScene = ref<WechatScene>('miniapp')

// 载体参数（随场景变化）
const wechatAppId = ref('')
const wechatAuthDir = ref('')

// 商户安全参数（所有场景共用）
const wechatMchId = ref('')
const wechatApiV3Key = ref('')
const wechatCertSerialNo = ref('')
const wechatPrivateKey = ref('')
const wechatNotifyUrl = ref('')

const wechatAppIdLabel = computed(() => {
  const map: Record<WechatScene, string> = {
    miniapp: '小程序 AppID',
    web: '公众号 AppID',
    app: '移动应用 AppID'
  }
  return map[wechatScene.value]
})

const wechatAppIdPlaceholder = computed(() => {
  const map: Record<WechatScene, string> = {
    miniapp: 'wx 开头的小程序 AppID',
    web: 'wx 开头的公众号 AppID',
    app: '开放平台移动应用 AppID'
  }
  return map[wechatScene.value]
})

const wechatAppIdTip = computed(() => {
  const map: Record<WechatScene, string> = {
    miniapp: '与商户号绑定的已认证小程序 AppID',
    web: '已认证服务号，且已与商户号绑定',
    app: '微信开放平台创建移动应用后获得'
  }
  return map[wechatScene.value]
})

const wechatSceneTip = computed(() => {
  const map: Record<WechatScene, string> = {
    miniapp: '小程序支付需在商户平台绑定小程序 AppID',
    web: '网站 JSAPI 支付需配置支付授权目录',
    app: 'App 支付需在开放平台创建移动应用并绑定商户号'
  }
  return map[wechatScene.value]
})

function onWechatSceneChange(): void {
  // 场景切换仅重置载体参数，安全参数保留
  wechatAppId.value = ''
  wechatAuthDir.value = ''
}

// ---------- 支付宝 ----------
const alipayScene = ref<AlipayScene>('web')
const alipayAppId = ref('')
const alipaySellerId = ref('')
const alipaySignMode = ref<SignMode>('public-key')
const alipayPrivateKey = ref('')
const alipayPublicKey = ref('')
const alipayAppCertPath = ref('')
const alipayCertPath = ref('')
const alipayRootCertPath = ref('')
const alipayNotifyUrl = ref('')

// ---------- 概览 ----------
const stats = computed(() => {
  const wechatOk = !!(wechatMchId.value && wechatApiV3Key.value && wechatAppId.value)
  const alipayOk = !!(alipayAppId.value && alipayPrivateKey.value)
  const configured = [wechatOk, alipayOk].filter(Boolean).length
  return [
    { label: '已配置渠道', value: `${configured} / 2`, icon: 'solar:card-bold-duotone', color: '#409eff', bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
    { label: '微信支付', value: wechatOk ? '已配置' : '未配置', icon: 'solar:chat-round-bold-duotone', color: '#52b788', bg: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' },
    { label: '支付宝', value: alipayOk ? '已配置' : '未配置', icon: 'solar:wallet-money-bold-duotone', color: '#e6a23c', bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)' },
    { label: '支付成功率', value: '98.6%', icon: 'solar:graph-up-bold-duotone', color: '#9254de', bg: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)' }
  ]
})

// ---------- 通用配置 ----------
const formRef = ref<FormInstance>()
const saving = ref(false)

const form = reactive<PaymentForm>({
  payTimeout: 30,
  autoRefund: true,
  refundMode: 'original',
  mixedPay: false
})

const rules: FormRules<PaymentForm> = {
  payTimeout: [{ required: true, message: '请输入支付超时时间', trigger: 'blur' }]
}

// ---------- 保存/重置 ----------
async function handleSave(): Promise<void> {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    ElMessage.warning('请完善通用配置')
    return
  }
  saving.value = true
  await new Promise(r => setTimeout(r, 500))
  saving.value = false
  ElMessage.success('支付配置已保存')
}

function handleReset(): void {
  Object.assign(form, { payTimeout: 30, autoRefund: true, refundMode: 'original', mixedPay: false })
  formRef.value?.clearValidate()
  ElMessage.info('已恢复默认配置')
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

.payment-page {
  padding: $gap;
  min-height: 100%;
  padding-bottom: 88px;

  .stat-row {
    margin-bottom: $gap;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: #fff;
    border: 1px solid $border-light;
    border-radius: $radius-card;
    box-shadow: $shadow-card;
    margin-bottom: $gap;
    transition: transform 0.25s ease, box-shadow 0.25s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: $shadow-hover;
    }

    .stat-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      @include flex-center;
      background: var(--accent-soft);
      color: var(--accent);
      flex-shrink: 0;
    }

    .stat-value {
      font-size: 20px;
      font-weight: 700;
      color: $text-main;
    }

    .stat-label {
      font-size: 12px;
      color: $text-secondary;
    }
  }
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
    padding: 18px;
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

  .title-sub {
    font-size: 12px;
    font-weight: 400;
    color: $text-secondary;
    margin-left: 4px;
  }
}

.channel-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 0;
  }

  :deep(.el-tabs__nav-wrap::after) {
    height: 1px;
    background: $border-light;
  }

  :deep(.el-tabs__item) {
    font-size: 14px;
    color: $text-secondary;

    &.is-active {
      color: $primary;
      font-weight: 600;
    }
  }

  .tab-label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
}

.scene-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: $bg-soft;
  border-radius: $radius-block;

  .scene-tip {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: $text-secondary;
  }
}

.channel-content {
  padding: 20px 0 8px;
}

.channel-form {
  max-width: 760px;

  :deep(.el-divider__text) {
    font-size: 13px;
    font-weight: 600;
    color: $text-main;
    background: #fff;
  }
}

.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: $text-secondary;
  line-height: 1.5;
}

.settings-form {
  max-width: 900px;
}

.input-with-unit {
  display: flex;
  align-items: center;
  gap: 8px;

  .unit {
    font-size: 13px;
    color: $text-secondary;
  }
}

.footer-bar {
  position: fixed;
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
  .payment-page {
    padding: 12px;
  }

  .footer-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
}
</style>