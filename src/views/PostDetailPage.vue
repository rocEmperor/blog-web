<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useBlogStore } from '../composables/useBlogStore'
import { categoryLabel } from '../constants/blog'
import { validateComment } from '../utils/validators'
import { DEFAULT_AVATAR_URL } from '../constants/defaultAvatar'

const route = useRoute()
const router = useRouter()
const { state, isLoggedIn, addComment, deleteComment, toggleLike, loadComments, loadPost } = useBlogStore()
const text = ref('')
const id = computed(() => Number(route.params.id))
const post = ref(null)
const comments = computed(() => state.comments[id.value] || [])
const submitting = ref(false)
const liking = ref(false)

const loadData = async () => {
  try {
    post.value = await loadPost(id.value)
  } catch (e) {
    post.value = null
    ElMessage.error(e?.message || '无法加载文章')
  }
  try {
    await loadComments(id.value)
  } catch {
    /* 评论接口未实现或非公开文 */
  }
}

onMounted(loadData)
watch(id, loadData)

watch(
  () => route.query.action,
  (action) => {
    if (action === 'comment' && isLoggedIn.value) {
      window.requestAnimationFrame(() => {
        document.getElementById('comment-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  },
  { immediate: true },
)

const submit = async () => {
  if (submitting.value) return
  const err = validateComment(text.value)
  if (err) {
    ElMessage.error(err)
    return
  }
  submitting.value = true
  try {
    await addComment(id.value, text.value.trim())
    text.value = ''
    ElMessage.success('评论已发布')
    await loadComments(id.value)
  } catch (e) {
    ElMessage.error(e?.message || '发布失败')
  } finally {
    submitting.value = false
  }
}

const onToggleLike = async () => {
  if (!isLoggedIn.value || !post.value || liking.value) return
  liking.value = true
  try {
    const res = await toggleLike(id.value, !!post.value.likedByMe)
    post.value.likes = res.likeCount ?? post.value.likes
    post.value.likedByMe = !!res.liked
  } catch (e) {
    ElMessage.error(e?.message || '操作失败')
  } finally {
    liking.value = false
  }
}

const removeComment = async (commentId) => {
  try {
    await deleteComment(commentId, id.value)
    if (post.value) {
      post.value.commentsCount = Math.max(0, (post.value.commentsCount || 0) - 1)
    }
    ElMessage.success('评论已删除')
  } catch (e) {
    ElMessage.error(e?.message || '删除失败')
  }
}

const goLoginForInteract = () => {
  router.push({ path: '/login', query: { redirect: route.fullPath } })
}

const goPostWithAction = (action) => {
  if (!isLoggedIn.value) {
    router.push({ path: '/login', query: { redirect: `/post/${id.value}?action=${action}` } })
    return
  }
  router.push({ path: `/post/${id.value}`, query: { action } })
}
</script>

<template>
  <p v-if="!post" class="empty-hint" style="padding: 24px">文章不存在或无权查看。</p>
  <article v-else class="article-wrap">
    <header class="article-header">
      <h1>{{ post.title }}</h1>
      <div class="article-meta">
        <router-link to="/profile">{{ post.author }}</router-link>
        <span>·</span>
        <time>{{ post.updatedAt }}</time>
        <span>·</span>
        <span>{{ categoryLabel(post.categoryCode) }}</span>
        <span>·</span>
        <span>👍 {{ post.likes || 0 }}</span>
      </div>
    </header>

    <div class="article-body article-body--html" v-html="post.body || ''"></div>

    <div class="interaction-bar">
      <template v-if="isLoggedIn">
        <button class="btn btn--sm" type="button" :disabled="liking" @click="onToggleLike">
          {{ post.likedByMe ? '♥ 已点赞' : '♡ 点赞' }} {{ post.likes || 0 }}
        </button>
        <button class="btn btn--sm" type="button" @click="goPostWithAction('comment')">评论</button>
      </template>
      <template v-else>
        <button class="btn btn--sm" type="button" @click="goLoginForInteract">点赞 / 评论（需登录）</button>
      </template>
    </div>

    <section id="comment-section" class="comments">
      <h2>评论</h2>
      <template v-if="isLoggedIn">
        <form class="comment-form form-stack" @submit.prevent="submit">
          <div class="field">
            <label for="comment-body">发表评论</label>
            <textarea id="comment-body" v-model="text" maxlength="300" placeholder="1-300 字"></textarea>
          </div>
          <button class="btn btn--primary" type="submit" :disabled="submitting">{{ submitting ? '发布中...' : '发布评论' }}</button>
        </form>
      </template>
      <p v-else class="guest-hint">请 <router-link :to="{ path: '/login', query: { redirect: route.fullPath } }">登录</router-link> 后发表评论。</p>
      <ul class="comment-list">
        <li v-for="(comment, i) in comments" :key="comment.id || i" class="comment-item">
          <div class="comment-item__head">
            <img
              class="avatar avatar--sm avatar--img"
              :src="comment.avatar || DEFAULT_AVATAR_URL"
              :alt="comment.author"
            />
            <span class="comment-item__author">{{ comment.author }}</span>
            <span class="comment-item__time">{{ comment.time }}</span>
          </div>
          <p>{{ comment.content }}</p>
          <button v-if="comment.canDelete" type="button" class="action-link" @click="removeComment(comment.id)">删除</button>
        </li>
      </ul>
    </section>
  </article>
</template>

<style scoped>
.article-body--html :deep(p) {
  margin: 0 0 12px;
  line-height: 1.75;
}
.avatar--img {
  object-fit: cover;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  vertical-align: middle;
}
</style>
