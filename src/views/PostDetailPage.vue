<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useBlogStore } from '../composables/useBlogStore'

const route = useRoute()
const { state, isLoggedIn, addComment, loadComments, loadPost } = useBlogStore()
const text = ref('')
const id = computed(() => Number(route.params.id))
const post = ref(null)
const comments = computed(() => state.comments[id.value] || [])
const submitting = ref(false)

const loadData = async () => {
  post.value = await loadPost(id.value)
  await loadComments(id.value)
}

onMounted(loadData)
watch(id, loadData)

const submit = async () => {
  if (submitting.value) return
  if (!text.value.trim()) return
  submitting.value = true
  try {
    await addComment(id.value, text.value.trim())
    text.value = ''
    ElMessage.success('评论已发布')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <article v-if="post" class="article-wrap">
    <header class="article-header">
      <h1>{{ post.title }}</h1>
      <div class="article-meta">
        <router-link to="/profile">{{ post.author }}</router-link>
        <span>·</span>
        <time>{{ post.updatedAt }}</time>
        <span>·</span>
        <span>约 5 分钟阅读</span>
      </div>
    </header>

    <div class="article-body">
      <p>本文是博客详情页原型：采用衬线正文与舒适行高，贴近主流阅读型博客的版式。上线后此处为服务端渲染的正文内容。</p>
      <h2>小标题示例</h2>
      <p>Phase 1 不包含管理后台；游客可浏览、搜索，登录用户可发表评论、点赞与转发。若需交互，请先登录账号后体验完整能力。</p>
      <p>图片、代码块等富文本元素可在接入编辑器后由 Markdown 或 WYSIWYG 生成。</p>
    </div>

    <div class="interaction-bar">
      <template v-if="isLoggedIn">
        <button class="btn btn--sm" type="button">♥ 点赞 {{ post.likes || 0 }}</button>
        <button class="btn btn--sm" type="button">转发</button>
      </template>
      <p v-else class="guest-hint"><router-link to="/login">登录</router-link> 或 <router-link to="/register">注册</router-link></p>
    </div>

    <section class="comments">
      <h2>评论</h2>
      <template v-if="isLoggedIn">
        <form class="comment-form form-stack" @submit.prevent="submit">
          <div class="field">
            <label for="comment-body">发表看法</label>
            <textarea id="comment-body" v-model="text" placeholder="友善发言，共建讨论氛围…"></textarea>
          </div>
          <button class="btn btn--primary" type="submit" :disabled="submitting">{{ submitting ? '发布中...' : '发布评论' }}</button>
        </form>
      </template>
      <p v-else class="guest-hint">请 <router-link to="/login">登录</router-link> 后查看并参与评论。</p>
      <ul class="comment-list">
        <li v-for="(comment, i) in comments" :key="i" class="comment-item">
          <div class="comment-item__head">
            <span class="avatar avatar--sm"></span>
            <span class="comment-item__author">{{ comment.author }}</span>
            <span class="comment-item__time">{{ comment.time }}</span>
          </div>
          <p>{{ comment.content }}</p>
        </li>
      </ul>
    </section>
  </article>
</template>
