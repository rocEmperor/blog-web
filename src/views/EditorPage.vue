<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useBlogStore } from '../composables/useBlogStore'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

/** 与首页分类一致（不含「推荐」筛选项） */
const postCategories = ['产品设计', '后端', '前端', 'Android', 'iOS', '人工智能', '工具开发', '阅读']

const route = useRoute()
const router = useRouter()
const { state, upsertPost } = useBlogStore()
const editing = computed(() => state.posts.find((p) => p.id === Number(route.params.id)))
const form = reactive({
  id: editing.value?.id,
  title: editing.value?.title || '',
  visibility: editing.value?.visibility || 'public',
  category: editing.value?.category || '产品设计',
  excerpt: editing.value?.excerpt || '',
  body: editing.value?.body || '',
})
const editorHtml = ref(form.body || '')
const submitting = ref(false)
watch(editorHtml, (value) => {
  form.body = value
})
watch(
  editing,
  (value) => {
    if (!value) return
    form.id = value.id
    form.title = value.title
    form.visibility = value.visibility
    form.category = value.category
    form.excerpt = value.excerpt
    form.body = value.body
    editorHtml.value = value.body
  },
  { immediate: true },
)

const save = async () => {
  if (submitting.value) return
  submitting.value = true
  try {
    await upsertPost({ ...form })
    ElMessage.success('保存成功')
    router.push('/dashboard')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="container editor-layout">
    <div class="page-title-row">
      <h1>{{ form.id ? '编辑文章' : '编辑文章' }}</h1>
      <div class="btn-group editor-actions">
        <el-button :disabled="submitting" @click="router.push('/dashboard')">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="save">发布</el-button>
      </div>
    </div>

    <form class="form-stack" @submit.prevent="save">
      <div class="field">
        <label for="post-title">标题</label>
        <input id="post-title" v-model="form.title" type="text" />
      </div>

      <div class="field">
        <label for="post-visibility">可见范围</label>
        <el-select id="post-visibility" v-model="form.visibility" style="width: 100%">
          <el-option value="public" label="公开" />
          <el-option value="private" label="仅自己可见" />
        </el-select>
      </div>

      <div class="field">
        <label for="post-category">文章分类</label>
        <el-select id="post-category" v-model="form.category" placeholder="请选择分类" style="width: 100%">
          <el-option v-for="c in postCategories" :key="c" :value="c" :label="c" />
        </el-select>
      </div>

      <div class="field">
        <label for="post-body">正文（富文本编辑器）</label>
        <div class="editor-box">
          <QuillEditor id="post-body" v-model:content="editorHtml" content-type="html" theme="snow" toolbar="full" />
        </div>
      </div>
    </form>
  </div>
</template>
