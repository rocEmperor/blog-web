<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBlogStore } from '../composables/useBlogStore'

const route = useRoute()
const router = useRouter()
const { state, isLoggedIn, logout } = useBlogStore()
const loggingOut = ref(false)

const q = computed({
  get: () => String(route.query.q || ''),
  set: (value) => router.replace({ query: { ...route.query, q: value || undefined } }),
})

const defaultAvatar = 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c096878fae5298d45d3fpng.png'

const doLogout = async () => {
  if (loggingOut.value) return
  loggingOut.value = true
  try {
    await logout()
    router.push('/')
  } finally {
    loggingOut.value = false
  }
}
</script>

<template>
  <header class="site-header">
    <div class="site-header__inner">
      <router-link class="brand" to="/">博文</router-link>
      <div class="header-search">
        <input
          v-model="q"
          type="search"
          placeholder="按博客标题模糊查询，回车"
          aria-label="搜索文章"
          @keydown.enter.prevent
        />
      </div>
      <div class="header-right">
        <nav class="nav-main">
          <template v-if="isLoggedIn">
            <router-link to="/dashboard">我的博客</router-link>
            <router-link to="/settings">账号设置</router-link>
            <a href="#" @click.prevent="doLogout">{{ loggingOut ? '退出中...' : '退出' }}</a>
            <span class="nav-username">{{ state.user.nickname }}</span>
          </template>
          <template v-else>
            <router-link to="/login">登录</router-link>
            <router-link to="/register">注册</router-link>
          </template>
        </nav>
        <router-link v-if="isLoggedIn" class="header-user" to="/profile">
          <img class="header-user__avatar header-user__avatar--img" :src="state.user.avatar || defaultAvatar" alt="" />
        </router-link>
        <router-link v-else class="header-user header-user--guest" to="/login" title="登录">
          <img class="header-user__avatar header-user__avatar--img" :src="defaultAvatar" alt="默认头像" />
        </router-link>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header-right {
  justify-self: end;
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-main {
  justify-content: flex-end;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 14px;
}

.nav-username {
  font-size: 14px;
  color: #4e5969;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-user__avatar--img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}

.header-user--guest .header-user__avatar--img {
  opacity: 0.85;
}
</style>
