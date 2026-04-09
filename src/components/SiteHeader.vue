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
        <input v-model="q" type="search" placeholder="搜索文章 / 作者" aria-label="搜索文章" />
      </div>
      <div class="header-right">
        <nav class="nav-main">
          <router-link to="/dashboard">我的博客</router-link>
          <router-link to="/login">登录</router-link>
          <router-link to="/register">注册</router-link>
          <template v-if="isLoggedIn">
            <router-link to="/settings">账号设置</router-link>
            <a href="#" @click.prevent="doLogout">{{ loggingOut ? '退出中...' : '退出' }}</a>
          </template>
        </nav>
        <template v-if="isLoggedIn">
          <router-link class="header-user" to="/profile">
            <span class="header-user__avatar">林</span>
            <span class="header-user__name">{{ state.user.nickname }}</span>
          </router-link>
        </template>
        <span v-else class="header-user__avatar">👤</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header-right {
  justify-self: end;
  margin-left: auto;
}

.nav-main {
  justify-content: flex-end;
}

</style>
