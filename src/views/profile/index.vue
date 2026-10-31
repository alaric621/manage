<template>
  <div class="list-page profile-page">
    <ElRow :gutter="16">
      <!-- 左侧：管理员信息卡片 -->
      <ElCol :xs="24" :md="8">
        <ElCard class="panel-card profile-card" shadow="never">
          <div class="profile-header">
            <ElAvatar :size="80" :src="adminInfo.avatar" class="profile-avatar" />
            <div class="profile-name">{{ adminInfo.name }}</div>
            <div class="profile-role">
              <ElTag
                v-for="r in adminInfo.roles"
                :key="r"
                size="small"
                type="primary"
                effect="light"
                round
                style="margin-right: 4px"
              >
                {{ r }}
              </ElTag>
            </div>
            <div class="profile-signature">{{ adminInfo.signature || '这个人很懒，什么都没有留下' }}</div>
          </div>

          <ElDivider />

          <div class="profile-meta">
            <div class="meta-item">
              <Icon icon="solar:user-id-broken" width="16" />
              <span>账号：{{ adminInfo.account }}</span>
            </div>
            <div class="meta-item">
              <Icon icon="solar:buildings-broken" width="16" />
              <span>部门：{{ adminInfo.dept }}</span>
            </div>
            <div class="meta-item">
              <Icon icon="solar:letter-broken" width="16" />
              <span>{{ adminInfo.email }}</span>
            </div>
            <div class="meta-item">
              <Icon icon="solar:phone-broken" width="16" />
              <span>{{ adminInfo.phone }}</span>
            </div>
            <div class="meta-item">
              <Icon icon="solar:calendar-broken" width="16" />
              <span>{{ adminInfo.joinDate }} 加入</span>
            </div>
            <div class="meta-item">
              <Icon icon="solar:history-broken" width="16" />
              <span>最近登录：{{ adminInfo.lastLoginAt }}</span>
            </div>
          </div>

          <ElDivider />

          <div class="profile-stats">
            <div class="stat-item">
              <div class="stat-value">{{ adminInfo.loginCount }}</div>
              <div class="stat-label">登录次数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ adminInfo.operateCount }}</div>
              <div class="stat-label">操作记录</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ adminInfo.days }}</div>
              <div class="stat-label">在职天数</div>
            </div>
          </div>
        </ElCard>
      </ElCol>

      <!-- 右侧：Tabs -->
      <ElCol :xs="24" :md="16">
        <ElCard class="panel-card" shadow="never">
          <ElTabs v-model="activeTab">
            <!-- 基本资料 -->
            <ElTabPane label="基本资料" name="basic">
              <ElForm ref="basicFormRef" :model="basicForm" :rules="basicRules" label-width="100px" class="profile-form">
                <ElRow :gutter="16">
                  <ElCol :xs="24" :sm="12">
                    <ElFormItem label="姓名" prop="name">
                      <ElInput v-model="basicForm.name" placeholder="请输入姓名" />
                    </ElFormItem>
                  </ElCol>
                  <ElCol :xs="24" :sm="12">
                    <ElFormItem label="登录账号">
                      <ElInput v-model="basicForm.account" disabled />
                    </ElFormItem>
                  </ElCol>
                </ElRow>
                <ElRow :gutter="16">
                  <ElCol :xs="24" :sm="12">
                    <ElFormItem label="手机号" prop="phone">
                      <ElInput v-model="basicForm.phone" placeholder="请输入手机号" maxlength="11" />
                    </ElFormItem>
                  </ElCol>
                  <ElCol :xs="24" :sm="12">
                    <ElFormItem label="邮箱" prop="email">
                      <ElInput v-model="basicForm.email" placeholder="请输入邮箱" />
                    </ElFormItem>
                  </ElCol>
                </ElRow>
                <ElRow :gutter="16">
                  <ElCol :xs="24" :sm="12">
                    <ElFormItem label="部门">
                      <ElInput v-model="basicForm.dept" disabled />
                    </ElFormItem>
                  </ElCol>
                  <ElCol :xs="24" :sm="12">
                    <ElFormItem label="角色">
                      <ElInput v-model="basicForm.rolesText" disabled />
                    </ElFormItem>
                  </ElCol>
                </ElRow>
                <ElFormItem label="个性签名">
                  <ElInput
                    v-model="basicForm.signature"
                    type="textarea"
                    :rows="3"
                    maxlength="120"
                    show-word-limit
                    placeholder="介绍一下自己吧"
                  />
                </ElFormItem>
                <ElFormItem>
                  <ElButton type="primary" :loading="saving" @click="handleSaveBasic">保存修改</ElButton>
                  <ElButton @click="resetBasic">重置</ElButton>
                </ElFormItem>
              </ElForm>
            </ElTabPane>

            <!-- 修改密码 -->
            <ElTabPane label="修改密码" name="password">
              <ElForm ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px" class="profile-form">
                <ElFormItem label="当前密码" prop="oldPassword">
                  <ElInput v-model="passwordForm.oldPassword" type="password" show-password placeholder="请输入当前密码" />
                </ElFormItem>
                <ElFormItem label="新密码" prop="newPassword">
                  <ElInput v-model="passwordForm.newPassword" type="password" show-password placeholder="请输入新密码" />
                </ElFormItem>
                <ElFormItem label="确认新密码" prop="confirmPassword">
                  <ElInput v-model="passwordForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
                </ElFormItem>
                <ElFormItem>
                  <ElButton type="primary" :loading="savingPassword" @click="handleSavePassword">修改密码</ElButton>
                </ElFormItem>
              </ElForm>
            </ElTabPane>

            <!-- 我的权限 -->
            <ElTabPane label="我的权限" name="permission">
              <div class="permission-tips">
                <Icon icon="solar:info-circle-broken" width="14" />
                当前账号的权限由所属角色决定，如需调整请联系超级管理员
              </div>
              <div class="permission-groups">
                <div v-for="g in permissionGroups" :key="g.title" class="permission-group">
                  <div class="group-title">
                    <Icon :icon="g.icon" width="16" />
                    {{ g.title }}
                  </div>
                  <div class="group-items">
                    <ElTag
                      v-for="item in g.items"
                      :key="item"
                      size="small"
                      effect="light"
                      round
                      type="info"
                    >
                      {{ item }}
                    </ElTag>
                  </div>
                </div>
              </div>
            </ElTabPane>

            <!-- 登录记录 -->
            <ElTabPane label="登录记录" name="logs">
              <ElTable :data="loginLogs" class="pretty-table" size="small">
                <ElTableColumn prop="time" label="登录时间" width="180" />
                <ElTableColumn prop="ip" label="IP 地址" width="150" />
                <ElTableColumn prop="location" label="登录地点" min-width="160" />
                <ElTableColumn prop="device" label="设备" min-width="180" />
                <ElTableColumn label="结果" width="100">
                  <template #default="{ row }">
                    <ElTag :type="row.success ? 'success' : 'danger'" size="small" effect="light">
                      {{ row.success ? '成功' : '失败' }}
                    </ElTag>
                  </template>
                </ElTableColumn>
              </ElTable>
            </ElTabPane>

            <!-- 操作日志 -->
            <ElTabPane label="操作日志" name="operate">
              <ElTimeline class="profile-timeline">
                <ElTimelineItem
                  v-for="log in operateLogs"
                  :key="log.id"
                  :timestamp="log.time"
                  :type="log.type"
                  placement="top"
                >
                  <div class="log-content">
                    <div class="log-action">{{ log.action }}</div>
                    <div class="log-ip">IP：{{ log.ip }}</div>
                  </div>
                </ElTimelineItem>
              </ElTimeline>
            </ElTabPane>
          </ElTabs>
        </ElCard>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Icon } from '@iconify/vue'

// ---------- 管理员信息 ----------
const adminInfo = ref({
  name: 'Felix',
  account: 'admin',
  avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Felix',
  roles: ['超级管理员'],
  dept: '技术部',
  email: 'felix@shop.com',
  phone: '13812345678',
  signature: '做更好的产品',
  joinDate: '2025-01-01',
  lastLoginAt: '2026-10-31 09:12:30',
  loginCount: 286,
  operateCount: 1286,
  days: 306
})

// ---------- Tabs ----------
const activeTab = ref('basic')

// ---------- 基本资料 ----------
const basicFormRef = ref<FormInstance>()
const saving = ref(false)

const defaultBasicForm = () => ({
  name: adminInfo.value.name,
  account: adminInfo.value.account,
  phone: adminInfo.value.phone,
  email: adminInfo.value.email,
  dept: adminInfo.value.dept,
  rolesText: adminInfo.value.roles.join('、'),
  signature: adminInfo.value.signature
})

const basicForm = reactive(defaultBasicForm())

const basicRules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ]
}

async function handleSaveBasic(): Promise<void> {
  if (!basicFormRef.value) return
  try {
    await basicFormRef.value.validate()
  } catch {
    return
  }
  saving.value = true
  await new Promise(r => setTimeout(r, 500))
  saving.value = false
  ElMessage.success('资料已保存')
}

function resetBasic(): void {
  Object.assign(basicForm, defaultBasicForm())
  basicFormRef.value?.clearValidate()
}

// ---------- 修改密码 ----------
const passwordFormRef = ref<FormInstance>()
const savingPassword = ref(false)

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordRules: FormRules = {
  oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

async function handleSavePassword(): Promise<void> {
  if (!passwordFormRef.value) return
  try {
    await passwordFormRef.value.validate()
  } catch {
    return
  }
  savingPassword.value = true
  await new Promise(r => setTimeout(r, 500))
  savingPassword.value = false
  ElMessage.success('密码已修改')
  passwordFormRef.value.resetFields()
}

// ---------- 我的权限 ----------
const permissionGroups = ref([
  {
    title: '商品管理',
    icon: 'solar:cart-large-bold-duotone',
    items: ['商品列表', '商品分类', '标签', '规格', '品牌', '商品评价']
  },
  {
    title: '订单管理',
    icon: 'solar:document-bold-duotone',
    items: ['订单列表', '发货管理', '售后/退款']
  },
  {
    title: '会员管理',
    icon: 'solar:user-bold-duotone',
    items: ['会员列表', '会员等级', '积分管理']
  },
  {
    title: '权限管理',
    icon: 'solar:shield-keyhole-bold-duotone',
    items: ['管理员', '角色管理', '菜单权限', '接口权限', '操作日志']
  }
])

// ---------- 登录记录 ----------
const loginLogs = ref([
  { id: 1, time: '2026-10-31 09:12:30', ip: '192.168.1.10', location: '广东省 深圳市', device: 'Chrome / Windows 11', success: true },
  { id: 2, time: '2026-10-30 18:40:12', ip: '192.168.1.10', location: '广东省 深圳市', device: 'Chrome / Windows 11', success: true },
  { id: 3, time: '2026-10-30 09:05:20', ip: '192.168.1.10', location: '广东省 深圳市', device: 'Chrome / Windows 11', success: true },
  { id: 4, time: '2026-10-29 22:18:05', ip: '10.0.0.22', location: '广东省 广州市', device: 'Safari / macOS', success: false },
  { id: 5, time: '2026-10-29 14:30:44', ip: '192.168.1.10', location: '广东省 深圳市', device: 'Chrome / Windows 11', success: true }
])

// ---------- 操作日志 ----------
const operateLogs = ref([
  { id: 1, action: '新增商品「无线蓝牙耳机 Pro」', ip: '192.168.1.10', time: '2026-10-31 09:30:15', type: 'primary' as const },
  { id: 2, action: '审核通过 12 条商品评价', ip: '192.168.1.10', time: '2026-10-31 10:05:42', type: 'info' as const },
  { id: 3, action: '修改角色「运营专员」权限', ip: '192.168.1.10', time: '2026-10-31 11:20:08', type: 'warning' as const },
  { id: 4, action: '导出订单报表', ip: '192.168.1.10', time: '2026-10-31 14:08:30', type: 'info' as const },
  { id: 5, action: '处理订单 SO20261031001 发货', ip: '192.168.1.10', time: '2026-10-31 15:22:10', type: 'success' as const }
])

onMounted(() => {
  // TODO: 拉取当前登录管理员信息
})
</script>

<style lang="scss" scoped>
.profile-page {
  .profile-card {
    :deep(.el-card__body) {
      padding: 24px 20px;
    }
  }

  .profile-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .profile-avatar {
    border: 3px solid #eef1f6;
    box-shadow: 0 4px 12px rgba(31, 45, 61, 0.08);
  }

  .profile-name {
    margin-top: 12px;
    font-size: 18px;
    font-weight: 600;
    color: #1f2d3d;
  }

  .profile-role {
    margin-top: 6px;
  }

  .profile-signature {
    margin-top: 10px;
    font-size: 13px;
    color: #8a94a6;
    line-height: 1.5;
  }

  .profile-meta {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #5a6472;

      svg {
        color: #8a94a6;
        flex-shrink: 0;
      }
    }
  }

  .profile-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    text-align: center;

    .stat-value {
      font-size: 20px;
      font-weight: 700;
      color: #409eff;
    }

    .stat-label {
      margin-top: 2px;
      font-size: 12px;
      color: #8a94a6;
    }
  }

  .profile-form {
    max-width: 640px;
    padding-top: 8px;
  }

  // 我的权限
  .permission-tips {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 12px;
    margin-bottom: 16px;
    font-size: 12px;
    color: #8a94a6;
    background: #f7f9fc;
    border-radius: 8px;
  }

  .permission-groups {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .permission-group {
    .group-title {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #1f2d3d;

      svg {
        color: #409eff;
      }
    }

    .group-items {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }

  // 日志
  .profile-timeline {
    max-height: 480px;
    overflow-y: auto;
    padding: 8px 4px;

    .log-content {
      padding: 8px 12px;
      background: #f7f9fc;
      border-radius: 8px;
    }

    .log-action {
      font-size: 13px;
      color: #1f2d3d;
    }

    .log-ip {
      margin-top: 4px;
      font-size: 12px;
      color: #8a94a6;
      font-family: monospace;
    }
  }
}

@media (max-width: 768px) {
  .profile-page {
    .profile-stats {
      gap: 4px;
    }

    .stat-value {
      font-size: 18px;
    }
  }
}
</style>