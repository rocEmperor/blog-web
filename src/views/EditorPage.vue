<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useBlogStore } from '../composables/useBlogStore'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { CATEGORY_OPTIONS, VISIBILITY_OPTIONS } from '../constants/blog'
import { validatePostBody, validatePostTitle } from '../utils/validators'

const route = useRoute()
const router = useRouter()
const { state, upsertPost, loadPost } = useBlogStore()
const editing = computed(() => state.posts.find((p) => p.id === Number(route.params.id)))

const form = reactive({
  id: editing.value?.id,
  title: editing.value?.title || '',
  visibility: editing.value?.visibility || 'open',
  categoryCode: editing.value?.categoryCode || '1',
  excerpt: editing.value?.excerpt || '',
  body: editing.value?.body || '',
})
const editorHtml = ref(form.body || '')
const submitting = ref(false)

watch(editorHtml, (value) => {
  form.body = value
})

function applyPostToForm(value) {
  if (!value) return
  form.id = value.id
  form.title = value.title
  form.visibility = value.visibility === 'private' ? 'only_myself' : value.visibility || 'open'
  form.categoryCode = value.categoryCode || '1'
  form.excerpt = value.excerpt || ''
  form.body = value.body || ''
  editorHtml.value = value.body || ''
}

watch(
  editing,
  (value) => {
    if (!value) return
    applyPostToForm(value)
  },
  { immediate: true },
)

async function loadRemoteEditorPost() {
  const pid = Number(route.params.id)
  if (!Number.isFinite(pid) || pid <= 0) return
  try {
    const data = await loadPost(pid)
    if (!data) {
      ElMessage.error('文章不存在')
      router.push('/dashboard')
      return
    }
    applyPostToForm(data)
  } catch (e) {
    ElMessage.error(e?.message || '加载失败')
    router.push('/dashboard')
  }
}

watch(
  () => route.params.id,
  (id) => {
    if (id) {
      loadRemoteEditorPost()
    }
  },
  { immediate: true },
)

const validateForm = () => {
  const e1 = validatePostTitle(form.title)
  if (e1) return e1
  if (!form.visibility) return '请选择可见范围'
  if (!form.categoryCode) return '请选择文章分类'
  const e2 = validatePostBody(form.body)
  if (e2) return e2
  return ''
}

const save = async () => {
  if (submitting.value) return
  const err = validateForm()
  if (err) {
    ElMessage.error(err)
    return
  }
  submitting.value = true
  try {
    await upsertPost({ ...form })
    ElMessage.success(form.id ? '保存成功' : '新建成功')
    router.push('/dashboard')
  } catch (e) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="container editor-layout">
    <div class="page-title-row">
      <h1>{{ form.id ? '编辑博客文章' : '新建博客文章' }}</h1>
      <div class="btn-group editor-actions">
        <el-button :disabled="submitting" @click="router.push('/dashboard')">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="save">{{ form.id ? '保存' : '发布' }}</el-button>
      </div>
    </div>

    <form class="form-stack" @submit.prevent="save">
      <div class="field">
        <label for="post-title">标题</label>
        <input id="post-title" v-model="form.title" type="text" maxlength="30" />
        <p style="margin-top: 10px;" class="field-hint">必填，4-30 字。</p>
      </div>

      <div class="field">
        <label for="post-visibility">可见范围</label>
        <el-select id="post-visibility" v-model="form.visibility" placeholder="请选择" style="width: 100%">
          <el-option v-for="o in VISIBILITY_OPTIONS" :key="o.value" :value="o.value" :label="o.label" />
        </el-select>
      </div>

      <div class="field">
        <label for="post-category">文章分类</label>
        <el-select id="post-category" v-model="form.categoryCode" placeholder="请选择分类" style="width: 100%">
          <el-option v-for="c in CATEGORY_OPTIONS" :key="c.value" :value="c.value" :label="c.label" />
        </el-select>
      </div>

      <div class="field">
        <label for="post-body">正文（富文本）</label>
        <div class="editor-box">
          <QuillEditor id="post-body" v-model:content="editorHtml" content-type="html" theme="snow" toolbar="full" />
        </div>
        <p style="margin-top: 10px;" class="field-hint">必填，纯文本最多 5000 字（含标点）。</p>
      </div>
    </form>
  </div>
</template>
