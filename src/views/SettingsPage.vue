<script setup>
import { reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useBlogStore } from '../composables/useBlogStore'

const { state, saveProfile: saveProfileApi, saveSecurity: saveSecurityApi, destroyAccount: destroyAccountApi, logout } = useBlogStore()
const tab = ref('profile')
const profile = reactive({ nickname: state.user.nickname, bio: state.user.bio, phone: state.user.phone })
const security = reactive({ email: state.user.email, current: '', next: '' })
const profileLoading = ref(false)
const securityLoading = ref(false)
const dangerLoading = ref(false)

watch(
  () => state.user,
  (value) => {
    profile.nickname = value.nickname || ''
    profile.bio = value.bio || ''
    profile.phone = value.phone || ''
    security.email = value.email || ''
  },
  { immediate: true, deep: true },
)

const saveProfile = async () => {
  if (profileLoading.value) return
  profileLoading.value = true
  try {
    await saveProfileApi({ ...profile })
    ElMessage.success('资料已保存')
  } finally {
    profileLoading.value = false
  }
}
const saveSecurity = async () => {
  if (securityLoading.value) return
  securityLoading.value = true
  try {
    await saveSecurityApi({ ...security })
    ElMessage.success('安全信息已更新')
  } finally {
    securityLoading.value = false
  }
}
const handleDestroyAccount = async () => {
  if (dangerLoading.value) return
  await ElMessageBox.confirm('此操作仅演示，确认执行？', '账号管理')
  dangerLoading.value = true
  try {
    await destroyAccountApi()
    await logout()
    ElMessage.success('已执行演示注销')
  } finally {
    dangerLoading.value = false
  }
}
</script>

<template>
  <div class="container home-juejin settings-juejin">
    <aside class="home-juejin__nav settings-sidenav">
      <a href="#" :class="{ 'is-active': tab === 'profile' }" @click.prevent="tab = 'profile'">资料与头像</a>
      <a href="#" :class="{ 'is-active': tab === 'security' }" @click.prevent="tab = 'security'">邮箱与密码</a>
      <a href="#" :class="{ 'is-active': tab === 'danger' }" @click.prevent="tab = 'danger'">账号管理</a>
    </aside>

    <section class="home-juejin__feed settings-panel">
      <div class="settings-panel__inner">
        <header class="settings-header">
          <h1>账号设置</h1>
          <p>更新头像、资料与安全信息。</p>
        </header>

        <section v-show="tab === 'profile'" class="settings-section">
          <h2>资料与头像</h2>
          <div class="avatar-upload">
            <span class="avatar"></span>
            <div>
              <button class="btn btn--ghost btn--sm" type="button">上传头像</button>
              <p class="field-hint">支持 JPG/PNG，建议不小于 200x200 像素。</p>
            </div>
          </div>

          <form class="form-stack mt-24" @submit.prevent="saveProfile">
            <div class="field">
              <label for="nickname">昵称</label>
              <input id="nickname" v-model="profile.nickname" type="text" />
            </div>
            <div class="field">
              <label for="bio">个人简介</label>
              <textarea id="bio" v-model="profile.bio" rows="3"></textarea>
            </div>
            <div class="field">
              <label for="phone">手机号</label>
              <input id="phone" v-model="profile.phone" type="tel" placeholder="选填" />
            </div>
            <button class="btn btn--primary" :disabled="profileLoading" type="submit">{{ profileLoading ? '保存中...' : '保存资料' }}</button>
          </form>
        </section>

        <section v-show="tab === 'security'" class="settings-section">
          <h2>邮箱与密码</h2>
          <form class="form-stack" @submit.prevent="saveSecurity">
            <div class="field">
              <label for="email">登录邮箱</label>
              <input id="email" v-model="security.email" type="email" />
            </div>
            <div class="field">
              <label for="current-pw">当前密码</label>
              <input id="current-pw" v-model="security.current" type="password" />
            </div>
            <div class="field">
              <label for="new-pw">新密码</label>
              <input id="new-pw" v-model="security.next" type="password" />
            </div>
            <button class="btn btn--primary" :disabled="securityLoading" type="submit">{{ securityLoading ? '更新中...' : '更新密码' }}</button>
          </form>
        </section>

        <section v-show="tab === 'danger'" class="settings-section">
          <h2>账号管理</h2>
          <p class="danger-text">注销后数据将根据合规要求处理，此按钮仅作流程占位。</p>
          <button class="btn btn--danger" :disabled="dangerLoading" type="button" @click="handleDestroyAccount">
            {{ dangerLoading ? '处理中...' : '注销账号' }}
          </button>
        </section>
      </div>
    </section>
  </div>
</template>
