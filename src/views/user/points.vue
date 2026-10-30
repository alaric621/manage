<template>
  <div class="list-page points-page">
    <!-- 数据概览 -->
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

    <ElTabs v-model="activeTab" class="points-tabs">
      <!-- 积分记录 -->
      <ElTabPane label="积分记录" name="records">
        <ElCard class="panel-card filter-card" shadow="never">
          <ElForm :model="query" inline class="filter-form" @submit.prevent>
            <ElFormItem label="会员">
              <ElInput
                v-model="query.keyword"
                placeholder="会员昵称/手机号/编号"
                clearable
                style="width: 220px"
                @keyup.enter="handleSearch"
              >
                <template #prefix>
                  <Icon icon="solar:magnifer-bold-duotone" width="16" />
                </template>
              </ElInput>
            </ElFormItem>
            <ElFormItem label="变动类型">
              <ElSelect v-model="query.type" placeholder="全部类型" clearable style="width: 150px">
                <ElOption label="获得" value="earn" />
                <ElOption label="消耗" value="spend" />
                <ElOption label="过期" value="expire" />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="来源">
              <ElSelect v-model="query.source" placeholder="全部来源" clearable style="width: 150px">
                <ElOption v-for="s in sourceOptions" :key="s.value" :label="s.label" :value="s.value" />
              </ElSelect>
            </ElFormItem>
            <ElFormItem>
              <ElButton type="primary" @click="handleSearch">
                <Icon icon="solar:magnifer-bold-duotone" class="btn-icon" />查询
              </ElButton>
              <ElButton @click="handleReset">
                <Icon icon="solar:refresh-bold-duotone" class="btn-icon" />重置
              </ElButton>
            </ElFormItem>
          </ElForm>
        </ElCard>

        <ElCard class="panel-card" shadow="never">
          <template #header>
            <div class="panel-header">
              <div class="panel-title">
                <span class="title-dot"></span>
                积分记录
                <span class="title-sub">共 {{ total }} 条</span>
              </div>
              <div class="panel-actions">
                <ElButton type="primary" size="small" @click="openAdjust">
                  <Icon icon="solar:add-circle-bold-duotone" class="btn-icon" />手动调整
                </ElButton>
              </div>
            </div>
          </template>

          <ElTable v-loading="loading" :data="list" class="pretty-table" row-key="id">
            <ElTableColumn label="会员" width="180">
              <template #default="{ row }">
                <div class="member-cell">
                  <div class="member-avatar" :style="{ background: row.avatarBg }">
                    {{ row.memberName.charAt(0) }}
                  </div>
                  <div class="member-meta">
                    <div class="member-name">{{ row.memberName }}</div>
                    <div class="member-phone">{{ maskPhone(row.memberPhone) }}</div>
                  </div>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn label="变动类型" width="100">
              <template #default="{ row }">
                <ElTag size="small" effect="light" round :type="row.typeTag">
                  {{ row.typeText }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn label="变动积分" width="110" align="right">
              <template #default="{ row }">
                <span :class="row.points >= 0 ? 'points-earn' : 'points-spend'">
                  {{ row.points >= 0 ? '+' : '' }}{{ row.points }}
                </span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="变动后余额" width="120" align="right">
              <template #default="{ row }">{{ row.balance }}</template>
            </ElTableColumn>
            <ElTableColumn label="来源" width="120">
              <template #default="{ row }">
                <span class="source-text">{{ row.sourceText }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="remark" label="备注" min-width="180" show-overflow-tooltip />
            <ElTableColumn prop="createdAt" label="时间" width="170" />
          </ElTable>

          <div class="pagination-wrap">
            <ElPagination
              v-model:current-page="page.current"
              v-model:page-size="page.size"
              :total="total"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              background
              @size-change="fetchList"
              @current-change="fetchList"
            />
          </div>
        </ElCard>
      </ElTabPane>

      <!-- 积分规则 -->
      <ElTabPane label="积分规则" name="rules">
        <ElCard class="panel-card" shadow="never">
          <template #header>
            <div class="panel-header">
              <div class="panel-title">
                <span class="title-dot"></span>
                积分规则
                <span class="title-sub">配置积分获取与消耗规则</span>
              </div>
              <div class="panel-actions">
                <ElButton type="primary" size="small" :loading="ruleSaving" @click="handleSaveRules">
                  <Icon icon="solar:check-circle-bold-duotone" class="btn-icon" />保存规则
                </ElButton>
              </div>
            </div>
          </template>

          <ElForm :model="ruleForm" label-width="160px" class="rule-form">
            <ElDivider content-position="left">积分获取</ElDivider>
            <ElRow :gutter="24">
              <ElCol :xs="24" :md="12">
                <ElFormItem label="消费获得积分">
                  <div class="input-with-unit">
                    <span class="unit">每消费</span>
                    <ElInputNumber v-model="ruleForm.consumeAmount" :min="1" controls-position="right" style="width: 120px">
                      <template #prefix>¥</template>
                    </ElInputNumber>
                    <span class="unit">获得</span>
                    <ElInputNumber v-model="ruleForm.consumePoints" :min="0" controls-position="right" style="width: 120px" />
                    <span class="unit">积分</span>
                  </div>
                </ElFormItem>
                <ElFormItem label="注册赠送积分">
                  <ElInputNumber v-model="ruleForm.registerPoints" :min="0" controls-position="right" style="width: 160px" />
                </ElFormItem>
                <ElFormItem label="签到赠送积分">
                  <ElInputNumber v-model="ruleForm.signInPoints" :min="0" controls-position="right" style="width: 160px" />
                </ElFormItem>
                <ElFormItem label="评价赠送积分">
                  <ElInputNumber v-model="ruleForm.reviewPoints" :min="0" controls-position="right" style="width: 160px" />
                </ElFormItem>
              </ElCol>
              <ElCol :xs="24" :md="12">
                <ElFormItem label="分享赠送积分">
                  <ElInputNumber v-model="ruleForm.sharePoints" :min="0" controls-position="right" style="width: 160px" />
                </ElFormItem>
                <ElFormItem label="邀请好友赠送">
                  <ElInputNumber v-model="ruleForm.invitePoints" :min="0" controls-position="right" style="width: 160px" />
                </ElFormItem>
                <ElFormItem label="生日赠送积分">
                  <ElInputNumber v-model="ruleForm.birthdayPoints" :min="0" controls-position="right" style="width: 160px" />
                </ElFormItem>
              </ElCol>
            </ElRow>

            <ElDivider content-position="left">积分消耗</ElDivider>
            <ElRow :gutter="24">
              <ElCol :xs="24" :md="12">
                <ElFormItem label="积分抵扣比例">
                  <div class="input-with-unit">
                    <ElInputNumber v-model="ruleForm.deductPoints" :min="1" controls-position="right" style="width: 120px" />
                    <span class="unit">积分抵扣</span>
                    <ElInputNumber v-model="ruleForm.deductAmount" :min="0" :precision="2" controls-position="right" style="width: 120px">
                      <template #prefix>¥</template>
                    </ElInputNumber>
                  </div>
                  <div class="form-tip">如 100 积分抵扣 1 元</div>
                </ElFormItem>
                <ElFormItem label="单笔最多抵扣">
                  <ElInputNumber v-model="ruleForm.maxDeductPercent" :min="0" :max="100" controls-position="right" style="width: 160px">
                    <template #suffix>%</template>
                  </ElInputNumber>
                  <div class="form-tip">单笔订单最多抵扣金额占比</div>
                </ElFormItem>
              </ElCol>
              <ElCol :xs="24" :md="12">
                <ElFormItem label="积分有效期">
                  <div class="input-with-unit">
                    <ElInputNumber v-model="ruleForm.validDays" :min="0" :max="3650" controls-position="right" style="width: 160px" />
                    <span class="unit">天</span>
                  </div>
                  <div class="form-tip">0 表示永不过期</div>
                </ElFormItem>
                <ElFormItem label="过期前提醒">
                  <div class="input-with-unit">
                    <ElInputNumber v-model="ruleForm.remindDays" :min="0" :max="60" controls-position="right" style="width: 160px" />
                    <span class="unit">天</span>
                  </div>
                  <div class="form-tip">积分过期前多少天提醒会员</div>
                </ElFormItem>
              </ElCol>
            </ElRow>
          </ElForm>
        </ElCard>
      </ElTabPane>
    </ElTabs>

    <!-- 手动调整弹窗 -->
    <ElDialog v-model="adjustVisible" title="手动调整积分" width="480px" destroy-on-close>
      <ElForm ref="adjustFormRef" :model="adjustForm" :rules="adjustRules" label-width="90px">
        <ElFormItem label="会员" prop="memberName">
          <ElInput v-model="adjustForm.memberName" placeholder="输入会员昵称/手机号" />
        </ElFormItem>
        <ElFormItem label="调整类型" prop="type">
          <ElRadioGroup v-model="adjustForm.type">
            <ElRadio value="earn">增加积分</ElRadio>
            <ElRadio value="spend">扣减积分</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem label="积分数量" prop="points">
          <ElInputNumber v-model="adjustForm.points" :min="1" controls-position="right" style="width: 100%" />
        </ElFormItem>
        <ElFormItem label="备注" prop="remark">
          <ElInput v-model="adjustForm.remark" type="textarea" :rows="2" maxlength="80" show-word-limit placeholder="调整原因" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="adjustVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="adjusting" @click="handleAdjust">确认调整</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Icon } from '@iconify/vue'

// ---------- 类型 ----------
type PointType = 'earn' | 'spend' | 'expire'
type TabName = 'records' | 'rules'

interface PointRecord {
  id: number
  memberName: string
  memberPhone: string
  avatarBg: string
  type: PointType
  points: number
  balance: number
  source: string
  sourceText: string
  remark: string
  createdAt: string
}

interface PointView extends PointRecord {
  typeText: string
  typeTag: 'success' | 'danger' | 'info'
}

interface QueryState {
  keyword: string
  type: '' | PointType
  source: string
}

interface RuleForm {
  consumeAmount: number
  consumePoints: number
  registerPoints: number
  signInPoints: number
  reviewPoints: number
  sharePoints: number
  invitePoints: number
  birthdayPoints: number
  deductPoints: number
  deductAmount: number
  maxDeductPercent: number
  validDays: number
  remindDays: number
}

interface AdjustForm {
  memberName: string
  type: 'earn' | 'spend'
  points: number
  remark: string
}

// ---------- Tabs ----------
const activeTab = ref<TabName>('records')

// ---------- 概览 ----------
const stats = computed(() => {
  const total = mockData.reduce((s, d) => s + Math.abs(d.points), 0)
  const earned = mockData.filter(d => d.type === 'earn').reduce((s, d) => s + d.points, 0)
  const spent = mockData.filter(d => d.type === 'spend').reduce((s, d) => s + Math.abs(d.points), 0)
  const members = new Set(mockData.map(d => d.memberName)).size
  return [
    { label: '积分总量', value: total.toLocaleString(), icon: 'solar:gift-bold-duotone', color: '#409eff', bg: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
    { label: '累计发放', value: earned.toLocaleString(), icon: 'solar:add-circle-bold-duotone', color: '#52b788', bg: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' },
    { label: '累计消耗', value: spent.toLocaleString(), icon: 'solar:minus-circle-bold-duotone', color: '#e6a23c', bg: 'linear-gradient(135deg, #fff4e6, #ffe4c4)' },
    { label: '涉及会员', value: members, icon: 'solar:users-group-rounded-bold-duotone', color: '#9254de', bg: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)' }
  ]
})

// ---------- 来源选项 ----------
const sourceOptions = [
  { label: '消费', value: 'consume' },
  { label: '注册', value: 'register' },
  { label: '签到', value: 'signin' },
  { label: '评价', value: 'review' },
  { label: '分享', value: 'share' },
  { label: '邀请', value: 'invite' },
  { label: '生日', value: 'birthday' },
  { label: '手动调整', value: 'manual' },
  { label: '积分抵扣', value: 'deduct' },
  { label: '过期', value: 'expire' }
]

const sourceMap: Record<string, string> = {
  consume: '消费',
  register: '注册',
  signin: '签到',
  review: '评价',
  share: '分享',
  invite: '邀请',
  birthday: '生日',
  manual: '手动调整',
  deduct: '积分抵扣',
  expire: '过期'
}

// ---------- 查询 ----------
const query = reactive<QueryState>({ keyword: '', type: '', source: '' })

// ---------- 列表 ----------
const loading = ref(false)
const list = ref<PointView[]>([])
const total = ref(0)
const page = reactive({ current: 1, size: 10 })

const mockData: PointRecord[] = [
  { id: 1, memberName: '张三', memberPhone: '13812345678', avatarBg: '#409eff', type: 'earn', points: 1286, balance: 12860, source: 'consume', sourceText: '消费', remark: '订单 SO20261030001 消费获得', createdAt: '2026-10-30 10:12' },
  { id: 2, memberName: '李四', memberPhone: '13987654321', avatarBg: '#52b788', type: 'spend', points: -500, balance: 35680, source: 'deduct', sourceText: '积分抵扣', remark: '订单抵扣 5 元', createdAt: '2026-10-29 18:40' },
  { id: 3, memberName: '王五', memberPhone: '13711112222', avatarBg: '#e6a23c', type: 'earn', points: 100, balance: 520, source: 'register', sourceText: '注册', remark: '新用户注册赠送', createdAt: '2026-10-29 12:00' },
  { id: 4, memberName: '赵六', memberPhone: '13633334444', avatarBg: '#9254de', type: 'earn', points: 50, balance: 3860, source: 'signin', sourceText: '签到', remark: '每日签到', createdAt: '2026-10-29 08:20' },
  { id: 5, memberName: '张三', memberPhone: '13812345678', avatarBg: '#409eff', type: 'expire', points: -200, balance: 12660, source: 'expire', sourceText: '过期', remark: '积分过期清理', createdAt: '2026-10-28 00:00' },
  { id: 6, memberName: '孙七', memberPhone: '13555556666', avatarBg: '#f56c6c', type: 'earn', points: 20, balance: 86, source: 'review', sourceText: '评价', remark: '商品评价赠送', createdAt: '2026-10-27 16:00' }
]

const typeMap: Record<PointType, { text: string; tag: 'success' | 'danger' | 'info' }> = {
  earn: { text: '获得', tag: 'success' },
  spend: { text: '消耗', tag: 'danger' },
  expire: { text: '过期', tag: 'info' }
}

function decorate(rows: PointRecord[]): PointView[] {
  return rows.map(r => {
    const t = typeMap[r.type]
    return {
      ...r,
      typeText: t.text,
      typeTag: t.tag
    }
  })
}

function maskPhone(phone: string): string {
  if (phone.length !== 11) return phone
  return `${phone.slice(0, 3)}****${phone.slice(7)}`
}

async function fetchList(): Promise<void> {
  loading.value = true
  try {
    await new Promise(r => setTimeout(r, 300))
    let data = [...mockData]
    if (query.keyword) {
      const k = query.keyword.toLowerCase()
      data = data.filter(d =>
        d.memberName.toLowerCase().includes(k) ||
        d.memberPhone.includes(query.keyword)
      )
    }
    if (query.type) {
      data = data.filter(d => d.type === query.type)
    }
    if (query.source) {
      data = data.filter(d => d.source === query.source)
    }
    total.value = data.length
    const start = (page.current - 1) * page.size
    list.value = decorate(data.slice(start, start + page.size))
  } finally {
    loading.value = false
  }
}

function handleSearch(): void {
  page.current = 1
  fetchList()
}

function handleReset(): void {
  query.keyword = ''
  query.type = ''
  query.source = ''
  page.current = 1
  fetchList()
}

// ---------- 规则 ----------
const ruleSaving = ref(false)

const ruleForm = reactive<RuleForm>({
  consumeAmount: 1,
  consumePoints: 10,
  registerPoints: 100,
  signInPoints: 5,
  reviewPoints: 20,
  sharePoints: 10,
  invitePoints: 50,
  birthdayPoints: 200,
  deductPoints: 100,
  deductAmount: 1,
  maxDeductPercent: 30,
  validDays: 365,
  remindDays: 7
})

async function handleSaveRules(): Promise<void> {
  ruleSaving.value = true
  await new Promise(r => setTimeout(r, 500))
  ruleSaving.value = false
  ElMessage.success('积分规则已保存')
}

// ---------- 手动调整 ----------
const adjustVisible = ref(false)
const adjusting = ref(false)
const adjustFormRef = ref<FormInstance>()

const adjustForm = reactive<AdjustForm>({
  memberName: '',
  type: 'earn',
  points: 100,
  remark: ''
})

const adjustRules: FormRules<AdjustForm> = {
  memberName: [{ required: true, message: '请输入会员', trigger: 'blur' }],
  points: [{ required: true, message: '请输入积分数量', trigger: 'blur' }],
  remark: [{ required: true, message: '请输入调整原因', trigger: 'blur' }]
}

function openAdjust(): void {
  adjustForm.memberName = ''
  adjustForm.type = 'earn'
  adjustForm.points = 100
  adjustForm.remark = ''
  adjustVisible.value = true
}

async function handleAdjust(): Promise<void> {
  if (!adjustFormRef.value) return
  try {
    await adjustFormRef.value.validate()
  } catch {
    return
  }
  adjusting.value = true
  await new Promise(r => setTimeout(r, 400))
  adjusting.value = false
  ElMessage.success('积分调整成功')
  adjustVisible.value = false
  fetchList()
}

onMounted(fetchList)
</script>

<style lang="scss" scoped>
.points-page {
  .points-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 16px;
    }

    :deep(.el-tabs__nav-wrap::after) {
      height: 1px;
      background: #eef1f6;
    }

    :deep(.el-tabs__item) {
      font-size: 14px;
      color: #8a94a6;

      &.is-active {
        color: #409eff;
        font-weight: 600;
      }
    }
  }

  // 会员单元格
  .member-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .member-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .member-name {
      font-size: 13px;
      font-weight: 500;
      color: #1f2d3d;
    }

    .member-phone {
      margin-top: 2px;
      font-size: 12px;
      color: #8a94a6;
    }
  }

  // 积分
  .points-earn {
    color: #52b788;
    font-weight: 600;
  }

  .points-spend {
    color: #f56c6c;
    font-weight: 600;
  }

  .source-text {
    font-size: 13px;
    color: #5a6472;
  }

  // 规则表单
  .rule-form {
    max-width: 1000px;

    :deep(.el-divider__text) {
      font-size: 13px;
      font-weight: 600;
      color: #1f2d3d;
    }
  }

  .input-with-unit {
    display: flex;
    align-items: center;
    gap: 8px;

    .unit {
      font-size: 13px;
      color: #8a94a6;
    }
  }

  .form-tip {
    margin-top: 4px;
    font-size: 12px;
    color: #8a94a6;
  }
}
</style>