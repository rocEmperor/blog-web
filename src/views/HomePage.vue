<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useBlogStore } from '../composables/useBlogStore'

const route = useRoute()
const { state } = useBlogStore()
const currentCategory = ref('推荐')
const categories = ['推荐', '后端', '前端', 'Android', 'iOS', '人工智能', '工具开发', '阅读']
const extraPosts = [
  { id: 101, title: '静态原型与后端对接时注意的几件事', author: '周映辰', category: '后端', excerpt: '表单字段、分页与错误码，尽量在 PRD 里对齐。', likes: 84, comments: 19, time: '1周前' },
  { id: 102, title: '一次组件库重构：从样式耦合到设计令牌', author: '陈听雨', category: '前端', excerpt: '把历史样式变量迁移成设计令牌的过程记录。', likes: 152, comments: 41, time: '3周前' },
  { id: 103, title: '接口权限设计的三个层次：路由、资源、字段', author: '周映辰', category: '后端', excerpt: '从网关到服务内校验，再到字段级权限过滤。', likes: 118, comments: 33, time: '1个月前' },
]

const list = computed(() => {
  const fromState = state.posts
    .filter((p) => p.visibility === 'public')
    .map((p) => ({ ...p, time: '3天前', comments: 12 }))
  return [...fromState, ...extraPosts]
})

const posts = computed(() => {
  const q = String(route.query.q || '').trim().toLowerCase()
  let base = list.value
  if (currentCategory.value !== '推荐') {
    base = base.filter((p) => p.category === currentCategory.value)
  }
  return q ? base.filter((p) => `${p.title}${p.author}`.toLowerCase().includes(q)) : base
})
</script>

<template>
  <div class="container home-juejin">
    <aside class="home-juejin__nav">
      <a
        v-for="category in categories"
        :key="category"
        href="#"
        :class="{ 'is-active': currentCategory === category }"
        @click.prevent="currentCategory = category"
      >
        {{ category }}
      </a>
    </aside>
    <section class="home-juejin__feed">
      <article v-for="post in posts" :key="post.id" class="juejin-item">
        <div class="juejin-item__meta">
          <router-link to="/profile">{{ post.author }}</router-link>
          <span>· {{ post.time || '3天前' }}</span>
          <span>· {{ post.category }}</span>
        </div>
        <h2 class="juejin-item__title">
          <router-link :to="`/post/${post.id}`">{{ post.title }}</router-link>
        </h2>
        <p class="juejin-item__excerpt">{{ post.excerpt }}</p>
        <div class="juejin-item__stats">
          <span>👍 {{ post.likes || 0 }}</span>
          <span>💬 {{ post.comments || 0 }}</span>
        </div>
      </article>
    </section>
  </div>
</template>
