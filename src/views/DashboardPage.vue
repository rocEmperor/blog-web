<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useBlogStore } from '../composables/useBlogStore'
import { visibilityLabel } from '../constants/blog'

const { state, removePost, loadMyPosts } = useBlogStore()
const router = useRouter()
const q = ref('')
const page = ref(1)
const pageSize = 10
const deletingId = ref(null)

const rows = computed(() => {
  return state.myPosts
})

const pageRows = computed(() => {
  return rows.value
})

const totalPages = computed(() => {
  const n = Math.ceil(state.myPostsTotal / pageSize)
  return n < 1 ? 1 : n
})

const isEmpty = computed(() => pageRows.value.length === 0)

const emptyTitle = computed(() => (q.value.trim() ? '未找到相关文章' : '暂无文章'))

const emptyDesc = computed(() =>
  q.value.trim() ? '试试其它关键词，或清空搜索后查看全部文章。' : '你还没有发布过文章，写第一篇与读者见面吧。',
)

watch(
  () => state.posts.length,
  () => {
    page.value = 1
  },
)

watch(page, async (p) => {
  if (p >= 1) {
    await loadMyPosts({ page: p - 1, size: pageSize, q: q.value.trim() })
  }
})

onMounted(async () => {
  await loadMyPosts({ page: 0, size: pageSize, q: q.value.trim() })
})

const pageTo = async (value) => {
  if (value < 1 || value > totalPages.value) return
  page.value = value
}

const onSearchEnter = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    page.value = 1
    loadMyPosts({ page: 0, size: pageSize, q: q.value.trim() })
  }
}

const clearSearch = async () => {
  q.value = ''
  page.value = 1
  await loadMyPosts({ page: 0, size: pageSize, q: '' })
}

const del = async (id) => {
  if (deletingId.value) return
  try {
    await ElMessageBox.confirm('确认删除该文章？', '提示', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  deletingId.value = id
  try {
    await removePost(id)
    await loadMyPosts({ page: page.value - 1, size: pageSize, q: q.value.trim() })
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
          <span class="avatar" aria-hidden="true"></span>
          <div>
            <h1>{{ state.user.nickname }}</h1>
            <p class="bio">工作台：管理您的全部文章（含仅自己可见）</p>
          </div>
        </div>

        <div class="page-title-row">
          <h1>文章管理</h1>
          <div class="dashboard-toolbar">
            <input
              v-model="q"
              class="dashboard-search"
              type="search"
              placeholder="按博客标题模糊查询，回车查询"
              @keydown="onSearchEnter"
            />
            <div class="dashboard-create" href="#" @click.prevent="router.push('/editor')">新建文章</div>
          </div>
        </div>

        <div class="table-wrap">
          <div v-if="isEmpty" class="dashboard-empty" role="status">
            <div class="dashboard-empty__icon" aria-hidden="true"></div>
            <p class="dashboard-empty__title">{{ emptyTitle }}</p>
            <p class="dashboard-empty__desc">{{ emptyDesc }}</p>
            <div class="dashboard-empty__actions">
              <a class="dashboard-create" href="#" @click.prevent="router.push('/editor')">新建文章</a>
              <button v-if="q.trim()" type="button" class="btn btn--ghost" @click="clearSearch">清空搜索</button>
            </div>
          </div>
          <table v-else class="data-table">
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
                <td>
                  <router-link :to="`/post/${row.id}`">{{ row.title }}</router-link>
                </td>
                <td>
                  <span class="badge" :class="row.visibility === 'open' ? 'badge--public' : 'badge--private'">
                    {{ visibilityLabel(row.visibility) }}
                  </span>
                </td>
                <td>{{ row.updatedAt }}</td>
                <td>
                  <div class="btn-group">
                    <router-link class="btn btn--sm btn--ghost" :to="`/editor/${row.id}`">编辑</router-link>
                    <button class="btn btn--sm btn--danger" type="button" :disabled="deletingId === row.id" @click="del(row.id)">
                      {{ deletingId === row.id ? '删除中...' : '删除' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <nav v-if="!isEmpty" class="pagination" aria-label="文章分页">
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

<style scoped>
.dashboard-empty {
  min-height: 280px;
  padding: 48px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: #fafafa;
  border: 1px dashed #e5e6eb;
  border-radius: 8px;
}

.dashboard-empty__icon {
  width: 56px;
  height: 64px;
  margin-bottom: 16px;
  border-radius: 8px;
  background: linear-gradient(180deg, #f7f8fa 0%, #e8f3ff 100%);
  border: 1px solid #e5e6eb;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
  position: relative;
}

.dashboard-empty__icon::before {
  content: '';
  position: absolute;
  left: 12px;
  right: 12px;
  top: 14px;
  height: 6px;
  border-radius: 2px;
  background: #c9cdd4;
  opacity: 0.45;
}

.dashboard-empty__icon::after {
  content: '';
  position: absolute;
  left: 12px;
  right: 20px;
  top: 28px;
  bottom: 14px;
  border-radius: 2px;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 5px,
    rgba(201, 205, 212, 0.35) 5px,
    rgba(201, 205, 212, 0.35) 6px
  );
}

.dashboard-empty__title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.dashboard-empty__desc {
  margin: 0 0 24px;
  font-size: 14px;
  color: #86909c;
  max-width: 360px;
  line-height: 1.6;
}

.dashboard-empty__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}
</style>
