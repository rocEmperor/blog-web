<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import AuthShell from '../components/AuthShell.vue'
import { useBlogStore } from '../composables/useBlogStore'
const { forgotPassword } = useBlogStore()
const form = reactive({
  email: '',
  code: '',
  password: '',
  confirmPassword: '',
})
const submitting = ref(false)
const sendingCode = ref(false)

const sendCode = async () => {
  if (sendingCode.value) return
  if (!form.email) {
    ElMessage.warning('请先输入邮箱')
    return
  }
  sendingCode.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 700))
    ElMessage.success(`验证码已发送到：${form.email}`)
  } finally {
    sendingCode.value = false
  }
}

const submit = async () => {
  if (submitting.value) return
  if (!form.code) {
    ElMessage.error('请输入验证码')
    return
  }
  if (form.password !== form.confirmPassword) {
    ElMessage.error('两次输入的新密码不一致')
    return
  }
  submitting.value = true
  try {
    await forgotPassword({ email: form.email, password: form.password })
    ElMessage.success(`重置请求已提交：${form.email || '您的邮箱'}`)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AuthShell
    hero-title="安全找回访问权限"
    hero-lead="我们将向您的注册邮箱发送重置链接，按邮件指引即可设置新密码。"
    card-title="重置密码"
    card-lead="输入注册时使用的邮箱地址。"
  >
    <form class="auth-form" @submit.prevent="submit">
      <label class="field-label" for="reset-email">邮箱</label>
      <div class="email-row">
        <input id="reset-email" v-model="form.email" class="field-input email-input" type="email" autocomplete="email" />
        <button class="btn btn-ghost code-btn" type="button" :disabled="sendingCode" @click="sendCode">
          {{ sendingCode ? '发送中...' : '发送验证码' }}
        </button>
      </div>
      <label class="field-label" for="reset-code">验证码</label>
      <input id="reset-code" v-model="form.code" class="field-input" type="text" autocomplete="one-time-code" />
      <label class="field-label" for="reset-password">新密码</label>
      <input
        id="reset-password"
        v-model="form.password"
        class="field-input"
        type="password"
        autocomplete="new-password"
      />
      <label class="field-label" for="reset-confirm-password">确认新密码</label>
      <input
        id="reset-confirm-password"
        v-model="form.confirmPassword"
        class="field-input"
        type="password"
        autocomplete="new-password"
      />
      <button class="btn btn-primary" type="submit" :disabled="submitting">{{ submitting ? '重置中...' : '重置密码' }}</button>
      <router-link class="btn btn-ghost" to="/login">返回登录</router-link>
    </form>
  </AuthShell>
</template>

<style scoped>
.email-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 6px;
}

.email-input {
  margin-bottom: 0;
  flex: 1;
}

.code-btn {
  margin-top: 0;
  min-width: 92px;
  height: 38px;
  white-space: nowrap;
}
</style>
