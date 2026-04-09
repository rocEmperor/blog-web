<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AuthShell from '../components/AuthShell.vue'
import { useBlogStore } from '../composables/useBlogStore'

const router = useRouter()
const { register } = useBlogStore()
const form = reactive({ email: '', nickname: '', password: '', password2: '' })
const submitting = ref(false)
const submit = async () => {
  if (submitting.value) return
  if (form.password !== form.password2) return ElMessage.error('两次密码不一致')
  submitting.value = true
  try {
    await register({ ...form })
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AuthShell
    hero-title="属于自己的写作角落"
    hero-lead="注册即拥有独立空间，内容与他人隔离，专注表达与沉淀。"
    card-title="创建账号"
    card-lead="填写基本信息即可完成注册。"
  >
    <form class="auth-form" @submit.prevent="submit">
      <label class="field-label" for="reg-email">邮箱</label>
      <input id="reg-email" v-model="form.email" class="field-input" type="email" autocomplete="email" />

      <label class="field-label" for="reg-nickname">昵称</label>
      <input id="reg-nickname" v-model="form.nickname" class="field-input" type="text" />
      <p class="field-hint">将展示在文章与评论旁。</p>

      <label class="field-label" for="reg-password">密码</label>
      <input id="reg-password" v-model="form.password" class="field-input" type="password" autocomplete="new-password" />
      <p class="field-hint">至少 8 位字符。</p>

      <label class="field-label" for="reg-password2">确认密码</label>
      <input id="reg-password2" v-model="form.password2" class="field-input" type="password" autocomplete="new-password" />

      <button class="btn btn-primary" type="submit" :disabled="submitting">{{ submitting ? '注册中...' : '注册' }}</button>
      <p class="auth-footer">已有账号？ <router-link to="/login">登录</router-link></p>
    </form>
  </AuthShell>
</template>
