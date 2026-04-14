<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AuthShell from '../components/AuthShell.vue'
import { useBlogStore } from '../composables/useBlogStore'
import { validateEmail, validateRegisterPassword } from '../utils/validators'

const router = useRouter()
const { sendForgotPasswordCode, forgotPasswordReset } = useBlogStore()
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
  const err = validateEmail(form.email)
  if (err) {
    ElMessage.warning(err)
    return
  }
  sendingCode.value = true
  try {
    await sendForgotPasswordCode(form.email.trim())
    ElMessage.success(`验证码已发送：${form.email.trim()}`)
  } catch (e) {
    ElMessage.error(e?.message || '发送失败')
  } finally {
    sendingCode.value = false
  }
}

const validateForm = () => {
  const e1 = validateEmail(form.email)
  if (e1) return e1
  if (!String(form.code || '').trim()) return '验证码为必填'
  const e2 = validateRegisterPassword(form.password)
  if (e2) return e2
  if (form.password !== form.confirmPassword) return '两次输入的密码不一致'
  return ''
}

const submit = async () => {
  if (submitting.value) return
  const err = validateForm()
  if (err) {
    ElMessage.error(err)
    return
  }
  submitting.value = true
  try {
    await forgotPasswordReset({ email: form.email.trim(), code: form.code.trim(), password: form.password })
    ElMessage.success('重置密码成功')
    router.push('/login')
  } catch (e) {
    ElMessage.error(e?.message || '重置失败，请稍后重试')
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
      <p class="field-hint">8-20 位，须同时包含字母与数字。</p>
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
