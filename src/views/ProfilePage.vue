<script setup>
import { computed } from 'vue'
import { useBlogStore } from '../composables/useBlogStore'
const { state } = useBlogStore()
const publicPosts = computed(() => state.posts.filter((p) => p.visibility === 'public'))
</script>

<template>
  <div class="container profile-single">
    <section class="home-juejin__feed profile-feed">
      <div class="profile-feed__inner">
        <section class="profile-tab">
          <h2 class="profile-tab__title">个人信息</h2>
          <div class="profile-hero profile-hero--compact">
            <span class="avatar" aria-hidden="true"></span>
            <div>
              <h1>{{ state.user.nickname }}</h1>
              <p class="bio">
                {{ state.user.bio }}，记录工作笔记与博客排版。此为对外公开信息，不含隐私数据。
              </p>
            </div>
          </div>
        </section>

        <section class="profile-tab">
          <h2 class="profile-tab__title">公开文章</h2>
          <article v-for="post in publicPosts" :key="post.id" class="juejin-item">
            <div class="juejin-item__meta">
              <span>{{ post.updatedAt }}</span>
              <span>· 公开</span>
            </div>
            <h3 class="juejin-item__title">
              <router-link :to="`/post/${post.id}`">{{ post.title }}</router-link>
            </h3>
            <p class="juejin-item__excerpt">{{ post.excerpt }}</p>
          </article>
        </section>
      </div>
    </section>
  </div>
</template>
