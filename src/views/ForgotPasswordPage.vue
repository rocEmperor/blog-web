<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import AuthShell from '../components/AuthShell.vue'
import { useBlogStore } from '../composables/useBlogStore'
const { forgotPassword } = useBlogStore()
const email = ref('')
const submitting = ref(false)
const submit = async () => {
  if (submitting.value) return
  submitting.value = true
  try {
    await forgotPassword({ email: email.value })
    ElMessage.success(`重置邮件已发送到：${email.value || '您的邮箱'}`)
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
      <input id="reset-email" v-model="email" class="field-input" type="email" autocomplete="email" />
      <button class="btn btn-primary" type="submit" :disabled="submitting">{{ submitting ? '发送中...' : '发送重置邮件' }}</button>
      <router-link class="btn btn-ghost" to="/login">返回登录</router-link>
    </form>
  </AuthShell>
</template>
