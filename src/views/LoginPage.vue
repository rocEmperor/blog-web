<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useBlogStore } from '../composables/useBlogStore'
import AuthShell from '../components/AuthShell.vue'

const router = useRouter()
const { login } = useBlogStore()
const form = reactive({ id: '', password: '' })
const submitting = ref(false)
const submit = async () => {
  if (submitting.value) return
  submitting.value = true
  try {
    await login({ id: form.id, password: form.password })
    ElMessage.success('登录成功')
    router.push('/')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AuthShell
    hero-title="记录思考，分享灵感"
    hero-lead="登录后即可撰写文章、管理个人空间，并与站内作者互动交流。"
    card-title="登录"
    card-lead="使用邮箱或用户名与密码登录您的博客空间。"
  >
    <form class="auth-form" @submit.prevent="submit">
      <label class="field-label" for="login-id">邮箱或用户名</label>
      <input id="login-id" v-model="form.id" class="field-input" type="text" autocomplete="username" />

      <label class="field-label" for="login-password">密码</label>
      <input
        id="login-password"
        v-model="form.password"
        class="field-input"
        type="password"
        autocomplete="current-password"
      />

      <button class="btn btn-primary" type="submit" :disabled="submitting">{{ submitting ? '登录中...' : '登录' }}</button>
      <router-link class="btn btn-ghost" to="/forgot-password">忘记密码</router-link>
      <p class="auth-footer">还没有账号？ <router-link to="/register">注册</router-link></p>
    </form>
  </AuthShell>
</template>
