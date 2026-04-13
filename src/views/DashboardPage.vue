<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useBlogStore } from '../composables/useBlogStore'

const { state, removePost } = useBlogStore()
const router = useRouter()
const q = ref('')
const page = ref(1)
const pageSize = 3
const deletingId = ref(null)
const rows = computed(() => state.posts.filter((p) => p.title.includes(q.value)))
const pageRows = computed(() => rows.value.slice((page.value - 1) * pageSize, page.value * pageSize))
const totalPages = computed(() => Math.max(1, Math.ceil(rows.value.length / pageSize)))

const pageTo = (value) => {
  if (value < 1 || value > totalPages.value) return
  page.value = value
}

const del = async (id) => {
  if (deletingId.value) return
  await ElMessageBox.confirm('确认删除该文章？', '提示')
  deletingId.value = id
  try {
    await removePost(id)
  } finally {
    deletingId.value = null
  }
}
</script>

<template>
  <div class="container home-juejin dashboard-juejin">
    <section class="home-juejin__feed dashboard-panel">
      <div class="dashboard-panel__inner">
        <nav class="dashboard-tabs" aria-label="工作台菜单">
          <a class="is-active" href="#">文章管理</a>
          <a href="#">草稿箱</a>
          <a href="#">数据概览</a>
        </nav>

        <div class="profile-hero dashboard-hero">
          <span class="avatar"></span>
          <div>
            <h1>林小川</h1>
            <p class="bio">工作台：管理您的全部文章（含仅自己可见的草稿/私密）。</p>
          </div>
        </div>

        <div class="page-title-row">
          <h1>文章管理</h1>
          <div class="dashboard-toolbar">
            <input v-model="q" class="dashboard-search" type="search" placeholder="搜索我的文章…" />
            <a class="dashboard-create" href="#" @click.prevent="router.push('/editor')">新建文章</a>
          </div>
        </div>

        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>标题</th>
                <th>状态</th>
                <th>更新于</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in pageRows" :key="row.id">
                <td><a href="#" @click.prevent="router.push(`/post/${row.id}`)">{{ row.title }}</a></td>
                <td><span class="badge" :class="row.visibility === 'public' ? 'badge--public' : 'badge--private'">{{ row.visibility === 'public' ? '公开' : '私密' }}</span></td>
                <td>{{ row.updatedAt }}</td>
                <td>
                  <div class="btn-group">
                    <a class="btn btn--sm btn--ghost" href="#" @click.prevent="router.push(`/editor/${row.id}`)">编辑</a>
                    <!-- <a class="btn btn--sm btn--ghost" href="#" @click.prevent="router.push(`/post/${row.id}`)">预览</a> -->
                    <button class="btn btn--sm btn--danger" type="button" :disabled="deletingId === row.id" @click="del(row.id)">
                      {{ deletingId === row.id ? '删除中...' : '删除' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <nav class="pagination" aria-label="文章分页">
          <a class="pagination__item" :class="{ 'is-disabled': page <= 1 }" href="#" @click.prevent="pageTo(page - 1)">上一页</a>
          <a
            v-for="n in totalPages"
            :key="n"
            class="pagination__item"
            :class="{ 'is-active': n === page }"
            href="#"
            @click.prevent="pageTo(n)"
          >
            {{ n }}
          </a>
          <a class="pagination__item" :class="{ 'is-disabled': page >= totalPages }" href="#" @click.prevent="pageTo(page + 1)">下一页</a>
        </nav>
      </div>
    </section>
  </div>
</template>
