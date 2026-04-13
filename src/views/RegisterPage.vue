<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AuthShell from '../components/AuthShell.vue'
import { useBlogStore } from '../composables/useBlogStore'
import {
  validateEmail,
  validateNickname,
  validateRegisterPassword,
} from '../utils/validators'

const router = useRouter()
const { register } = useBlogStore()
const form = reactive({ email: '', nickname: '', password: '', password2: '' })
const submitting = ref(false)

const validateForm = () => {
  const e1 = validateNickname(form.nickname)
  if (e1) return e1
  const e2 = validateEmail(form.email)
  if (e2) return e2
  const e3 = validateRegisterPassword(form.password)
  if (e3) return e3
  if (form.password !== form.password2) return '两次输入的密码不一致'
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
    await register({
      email: form.email.trim(),
      nickname: form.nickname.trim(),
      password: form.password,
    })
    ElMessage.success('注册成功')
    router.push('/login')
  } catch (e) {
    ElMessage.error(e?.message || '注册失败，请稍后重试')
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
      <label class="field-label" for="reg-nickname">昵称</label>
      <input id="reg-nickname" v-model="form.nickname" class="field-input" type="text" autocomplete="username" />
      <p class="field-hint">4-20 位，字母开头，仅字母、数字、下划线。</p>

      <label class="field-label" for="reg-email">邮箱</label>
      <input id="reg-email" v-model="form.email" class="field-input" type="email" autocomplete="email" />

      <label class="field-label" for="reg-password">密码</label>
      <input id="reg-password" v-model="form.password" class="field-input" type="password" autocomplete="new-password" />
      <p class="field-hint">8-20 位，须同时包含字母与数字。</p>

      <label class="field-label" for="reg-password2">确认密码</label>
      <input id="reg-password2" v-model="form.password2" class="field-input" type="password" autocomplete="new-password" />

      <button class="btn btn-primary" type="submit" :disabled="submitting">{{ submitting ? '注册中...' : '注册' }}</button>
      <p class="auth-footer">已有账号？ <router-link to="/login">登录</router-link></p>
    </form>
  </AuthShell>
</template>
