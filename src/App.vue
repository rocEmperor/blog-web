<script setup>
import { computed, onMounted, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import SiteHeader from './components/SiteHeader.vue'
import { useBlogStore } from './composables/useBlogStore'

const route = useRoute()
const hideHeader = computed(() => route.meta.hideHeader)
const { bootstrap } = useBlogStore()

onMounted(async () => {
  await bootstrap()
})

watchEffect(() => {
  if (route.meta.hideHeader) {
    document.body.className = 'auth-page'
    return
  }
  const pageClass = String(route.meta.bodyClass || '').trim()
  document.body.className = pageClass ? `app-page ${pageClass}` : 'app-page'
})
</script>

<template>
  <div class="app-shell">
    <SiteHeader v-if="!hideHeader" />
    <main class="app-main"><router-view /></main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
}
</style>
