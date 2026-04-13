<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useBlogStore } from '../composables/useBlogStore'
import AuthShell from '../components/AuthShell.vue'

const route = useRoute()
const router = useRouter()
const { login } = useBlogStore()
const form = reactive({ nickname: '', password: '' })
const submitting = ref(false)

const validateForm = () => {
  if (!String(form.nickname || '').trim()) return '昵称为必填'
  if (!String(form.password || '')) return '密码为必填'
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
    await login({ nickname: form.nickname.trim(), password: form.password })
    ElMessage.success('登录成功')
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    router.push(redirect && redirect.startsWith('/') ? redirect : '/')
  } catch (e) {
    ElMessage.error(e?.message || '登录失败，请稍后重试')
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
    card-lead="使用昵称与密码登录您的博客空间。"
  >
    <form class="auth-form" @submit.prevent="submit">
      <label class="field-label" for="login-nickname">昵称</label>
      <input id="login-nickname" v-model="form.nickname" class="field-input" type="text" autocomplete="username" />

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
