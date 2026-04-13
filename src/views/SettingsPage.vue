<script setup>
import { reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useBlogStore } from '../composables/useBlogStore'
import {
  validateBio,
  validateEmail,
  validateNickname,
  validatePhoneOptional,
  validateSecurityPassword,
} from '../utils/validators'

const router = useRouter()
const {
  state,
  saveProfile: saveProfileApi,
  saveSecurity: saveSecurityApi,
  destroyAccount: destroyAccountApi,
  logout,
  uploadAvatar,
} = useBlogStore()
const tab = ref('profile')
const profile = reactive({ nickname: state.user.nickname, bio: state.user.bio, phone: state.user.phone })
const security = reactive({ email: state.user.email, current: '', next: '', confirmNext: '' })
const profileLoading = ref(false)
const securityLoading = ref(false)
const dangerLoading = ref(false)
const fileInputRef = ref(null)
const avatarPreview = ref(state.user.avatar || '')
const pendingAvatarUrl = ref('')

watch(
  () => state.user,
  (value) => {
    profile.nickname = value.nickname || ''
    profile.bio = value.bio || ''
    profile.phone = value.phone || ''
    security.email = value.email || ''
    if (!pendingAvatarUrl.value) avatarPreview.value = value.avatar || ''
  },
  { immediate: true, deep: true },
)

const saveProfile = async () => {
  if (profileLoading.value) return
  const e1 = validateNickname(profile.nickname)
  if (e1) return ElMessage.error(e1)
  const e2 = validateBio(profile.bio)
  if (e2) return ElMessage.error(e2)
  const e3 = validatePhoneOptional(profile.phone)
  if (e3) return ElMessage.error(e3)
  profileLoading.value = true
  try {
    const payload = {
      nickname: profile.nickname.trim(),
      bio: String(profile.bio || '').trim(),
      phone: String(profile.phone || '').trim(),
    }
    if (pendingAvatarUrl.value) payload.avatar = pendingAvatarUrl.value
    await saveProfileApi(payload)
    pendingAvatarUrl.value = ''
    ElMessage.success('设置成功')
  } catch (e) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    profileLoading.value = false
  }
}

const saveSecurity = async () => {
  if (securityLoading.value) return
  const e0 = validateEmail(security.email)
  if (e0) return ElMessage.error(e0)
  const e1 = validateSecurityPassword(security.current, '当前密码')
  if (e1) return ElMessage.error(e1)
  const e2 = validateSecurityPassword(security.next, '新密码')
  if (e2) return ElMessage.error(e2)
  if (security.next !== security.confirmNext) return ElMessage.error('两次输入的新密码不一致')
  securityLoading.value = true
  try {
    await saveSecurityApi({ email: security.email.trim(), current: security.current, next: security.next })
    security.current = ''
    security.next = ''
    security.confirmNext = ''
    ElMessage.success('设置成功')
  } catch (e) {
    ElMessage.error(e?.message || '更新失败')
  } finally {
    securityLoading.value = false
  }
}

const handleDestroyAccount = async () => {
  if (dangerLoading.value) return
  try {
    await ElMessageBox.confirm('是否注销该账号？此操作不可恢复。', '注销账号', {
      confirmButtonText: '确认注销',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  dangerLoading.value = true
  try {
    await destroyAccountApi()
    await logout()
    ElMessage.success('注销成功')
    router.push('/login')
  } catch (e) {
    ElMessage.error(e?.message || '注销失败')
  } finally {
    dangerLoading.value = false
  }
}

const openFilePicker = () => {
  fileInputRef.value?.click()
}

const onAvatarFileChange = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  const okType = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)
  if (!okType) {
    ElMessage.error('仅支持 png / jpg / jpeg 格式')
    event.target.value = ''
    return
  }
  try {
    const url = await uploadAvatar(file)
    pendingAvatarUrl.value = url
    avatarPreview.value = url
    ElMessage.success('头像已上传，保存资料后生效')
  } catch (e) {
    ElMessage.error(e?.message || '上传失败')
  } finally {
    event.target.value = ''
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
            <span
              class="avatar"
              :style="
                avatarPreview
                  ? { backgroundImage: `url(${avatarPreview})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : {}
              "
            ></span>
            <div>
              <input
                ref="fileInputRef"
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                style="display: none"
                @change="onAvatarFileChange"
              />
              <button class="btn btn--ghost btn--sm" type="button" :disabled="profileLoading" @click="openFilePicker">
                上传头像
              </button>
              <p class="field-hint">非必填；支持 png / jpg / jpeg，上传后由后端返回 URL（Mock 为占位头像）。</p>
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
            <button class="btn btn--primary" :disabled="profileLoading" type="submit">
              {{ profileLoading ? '保存中...' : '保存资料' }}
            </button>
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
            <div class="field">
              <label for="confirm-new-pw">确认新密码</label>
              <input id="confirm-new-pw" v-model="security.confirmNext" type="password" />
            </div>
            <button class="btn btn--primary" :disabled="securityLoading" type="submit">
              {{ securityLoading ? '更新中...' : '更新密码' }}
            </button>
          </form>
        </section>

        <section v-show="tab === 'danger'" class="settings-section">
          <h2>账号管理</h2>
          <p class="danger-text">注销后数据将根据合规要求处理，请谨慎操作。</p>
          <button class="btn btn--danger" :disabled="dangerLoading" type="button" @click="handleDestroyAccount">
            {{ dangerLoading ? '处理中...' : '注销账号' }}
          </button>
        </section>
      </div>
    </section>
  </div>
</template>
