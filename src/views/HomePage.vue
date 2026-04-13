<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBlogStore } from '../composables/useBlogStore'
import { categoryLabel } from '../constants/blog'

const route = useRoute()
const router = useRouter()
const { state, isLoggedIn } = useBlogStore()

const categories = ['全部', '后端', '前端', 'Android', 'iOS', '人工智能', '工具开发', '阅读']
const currentCategory = ref('全部')
const visibleCount = ref(10)
const loadingMore = ref(false)

const categoryLabelToCode = {
  后端: '1',
  前端: '2',
  Android: '3',
  iOS: '4',
  人工智能: '5',
  工具开发: '6',
  阅读: '7',
}

const extraPosts = [
  {
    id: 101,
    title: '静态原型与后端对接时注意的几件事',
    author: '周映辰',
    categoryCode: '1',
    excerpt: '表单字段、分页与错误码，尽量在 PRD 里对齐。',
    likes: 84,
    commentsCount: 19,
    time: '1周前',
    visibility: 'open',
  },
  {
    id: 102,
    title: '一次组件库重构：从样式耦合到设计令牌',
    author: '陈听雨',
    categoryCode: '2',
    excerpt: '把历史样式变量迁移成设计令牌的过程记录。',
    likes: 152,
    commentsCount: 41,
    time: '3周前',
    visibility: 'open',
  },
  {
    id: 103,
    title: '接口权限设计的三个层次：路由、资源、字段',
    author: '周映辰',
    categoryCode: '1',
    excerpt: '从网关到服务内校验，再到字段级权限过滤。',
    likes: 118,
    commentsCount: 33,
    time: '1个月前',
    visibility: 'open',
  },
]

const list = computed(() => {
  const fromState = state.posts
    .filter((p) => p.visibility === 'open')
    .map((p) => ({
      ...p,
      time: p.updatedAt || '近期',
      commentsCount: p.commentsCount ?? 0,
    }))
  return [...fromState, ...extraPosts]
})

const filtered = computed(() => {
  const q = String(route.query.q || '').trim().toLowerCase()
  let base = list.value
  if (currentCategory.value !== '全部') {
    const code = categoryLabelToCode[currentCategory.value]
    base = base.filter((p) => String(p.categoryCode) === String(code))
  }
  if (!q) return base
  return base.filter((p) => String(p.title || '').toLowerCase().includes(q))
})

const displayedPosts = computed(() => filtered.value.slice(0, visibleCount.value))
const hasMore = computed(() => displayedPosts.value.length < filtered.value.length)

watch([currentCategory, () => route.query.q], () => {
  visibleCount.value = 10
})

const loadMore = () => {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  window.requestAnimationFrame(() => {
    visibleCount.value += 10
    loadingMore.value = false
  })
}

const goPost = (id, action) => {
  const target = `/post/${id}${action ? `?action=${action}` : ''}`
  if (!isLoggedIn.value) {
    router.push({ path: '/login', query: { redirect: target } })
    return
  }
  router.push(target)
}
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
      <p class="list-meta" style="padding: 20px 20px 0 20px;">共 {{ filtered.length }} 篇</p>
      <article v-for="post in displayedPosts" :key="post.id" class="juejin-item">
        <div class="juejin-item__meta">
          <router-link to="/profile">{{ post.author }}</router-link>
          <span>· {{ post.time || '近期' }}</span>
          <span>· {{ categoryLabel(post.categoryCode) }}</span>
        </div>
        <h2 class="juejin-item__title">
          <router-link :to="`/post/${post.id}`">{{ post.title }}</router-link>
        </h2>
        <p class="juejin-item__excerpt">{{ post.excerpt }}</p>
        <div class="juejin-item__stats">
          <span>👍 {{ post.likes || 0 }}</span>
          <span>💬 {{ post.commentsCount ?? 0 }}</span>
        </div>
        <div class="juejin-item__actions">
          <button type="button" class="action-link" @click.prevent="goPost(post.id, 'like')">点赞</button>
          <button type="button" class="action-link" @click.prevent="goPost(post.id, 'comment')">评论</button>
        </div>
      </article>
      <div v-if="!displayedPosts.length" class="empty-hint">暂无文章，试试其它分类或关键词。</div>
      <button v-if="hasMore" type="button" class="btn-load-more" :disabled="loadingMore" @click="loadMore">
        {{ loadingMore ? '加载中...' : '下拉加载更多' }}
      </button>
    </section>
  </div>
</template>

<style scoped>
.list-meta {
  font-size: 13px;
  color: #86909c;
  margin: 0 0 12px;
}
.juejin-item__actions {
  margin-top: 10px;
  display: flex;
  gap: 16px;
}
.action-link {
  border: none;
  background: none;
  padding: 0;
  font-size: 14px;
  color: #1e80ff;
  cursor: pointer;
}
.action-link:hover {
  text-decoration: underline;
}
.btn-load-more {
  display: block;
  width: 100%;
  margin: 16px 0 8px;
  padding: 10px;
  border: 1px dashed #c9cdd4;
  border-radius: 6px;
  background: #fafafa;
  cursor: pointer;
  color: #4e5969;
}
.btn-load-more:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.empty-hint {
  padding: 24px;
  text-align: center;
  color: #86909c;
}
</style>
