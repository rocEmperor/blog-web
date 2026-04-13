<script setup>
import { computed, ref } from 'vue'
import { useBlogStore } from '../composables/useBlogStore'
import { categoryLabel } from '../constants/blog'

const { state, bootstrap } = useBlogStore()
const page = ref(1)
const pageSize = 10
const refreshing = ref(false)

const publicPosts = computed(() => state.posts.filter((p) => p.visibility === 'open'))

const totalPages = computed(() => Math.max(1, Math.ceil(publicPosts.value.length / pageSize)))
const pageRows = computed(() => publicPosts.value.slice((page.value - 1) * pageSize, page.value * pageSize))

const pageTo = (n) => {
  if (n < 1 || n > totalPages.value) return
  page.value = n
}

const pullRefresh = async () => {
  if (refreshing.value) return
  refreshing.value = true
  try {
    await bootstrap()
    page.value = 1
  } finally {
    refreshing.value = false
  }
}
</script>

<template>
  <div class="container profile-single">
    <section class="home-juejin__feed profile-feed">
      <div class="profile-feed__inner">
        <section class="profile-tab">
          <h2 class="profile-tab__title">个人信息</h2>
          <div class="profile-hero profile-hero--compact">
            <img v-if="state.user.avatar" class="avatar avatar--img" :src="state.user.avatar" alt="" />
            <span v-else class="avatar" aria-hidden="true"></span>
            <div>
              <h1>{{ state.user.nickname }}</h1>
              <p class="bio">{{ state.user.bio }}</p>
            </div>
          </div>
        </section>

        <section class="profile-tab">
          <div class="profile-tab__head">
            <h2 class="profile-tab__title">公开文章</h2>
            <button type="button" class="btn-refresh" :disabled="refreshing" @click="pullRefresh">
              {{ refreshing ? '刷新中...' : '下拉刷新' }}
            </button>
          </div>
          <article v-for="post in pageRows" :key="post.id" class="juejin-item">
            <div class="juejin-item__meta">
              <span>{{ post.updatedAt }}</span>
              <span>· {{ categoryLabel(post.categoryCode) }}</span>
            </div>
            <h3 class="juejin-item__title">
              <router-link :to="`/post/${post.id}`">{{ post.title }}</router-link>
            </h3>
            <p class="juejin-item__excerpt">{{ post.excerpt }}</p>
          </article>
          <p v-if="!pageRows.length" class="empty-hint">暂无公开文章</p>
          <nav class="pagination profile-pagination" aria-label="公开文章分页">
            <a class="pagination__item" :class="{ 'is-disabled': page <= 1 }" href="#" @click.prevent="pageTo(page - 1)">上一页</a>
            <span class="pagination__info">{{ page }} / {{ totalPages }}</span>
            <a class="pagination__item" :class="{ 'is-disabled': page >= totalPages }" href="#" @click.prevent="pageTo(page + 1)">下一页</a>
          </nav>
        </section>
      </div>
    </section>
  </div>
</template>

<style scoped>
.avatar--img {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
}
.profile-tab__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}
.btn-refresh {
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #e5e6eb;
  background: #fff;
  cursor: pointer;
  color: #4e5969;
}
.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.profile-pagination {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
}
.pagination__info {
  font-size: 14px;
  color: #86909c;
}
.empty-hint {
  color: #86909c;
  padding: 16px 0;
}
</style>
