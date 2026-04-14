import request from '../utils/request'

export function formatPostDate(d) {
  if (d == null || d === '') return '近期'
  if (typeof d === 'string') return d.length >= 10 ? d.slice(0, 10) : d
  return '近期'
}

export function mapPublicItemToPost(row) {
  const time = formatPostDate(row.updatedAt)
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    categoryCode: row.categoryCode,
    excerpt: row.excerpt || '',
    likes: row.likes ?? 0,
    commentsCount: row.commentsCount ?? 0,
    visibility: 'open',
    updatedAt: time,
    time,
  }
}

export function mapDetailToPost(row) {
  if (!row) return null
  const time = formatPostDate(row.updatedAt)
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    categoryCode: row.categoryCode,
    body: row.body || '',
    likes: row.likes ?? 0,
    commentsCount: row.commentsCount ?? 0,
    likedByMe: !!row.likedByMe,
    visibility: row.visibility === 'private' ? 'only_myself' : row.visibility || 'open',
    updatedAt: time,
  }
}

export function mapMyRowToPost(row) {
  const time = formatPostDate(row.updatedAt)
  const vis = row.statusLabel === '公开' ? 'open' : 'only_myself'
  return {
    id: row.id,
    title: row.title,
    categoryCode: row.categoryCode,
    visibility: vis,
    statusLabel: row.statusLabel,
    updatedAt: time,
  }
}

function normalizePage(data) {
  if (!data) return { list: [], total: 0, page: 0, size: 10 }
  return {
    list: data.list || [],
    total: data.total ?? 0,
    page: data.page ?? 0,
    size: data.size ?? 10,
  }
}

/** 联调：公开文章分页（首页流） */
export async function fetchPublicPostsApi(params = {}) {
  const data = await request.get('/posts/public', {
    params: {
      page: params.page ?? 0,
      size: Math.min(params.size ?? 10, 100),
      q: params.q || undefined,
      categoryCode: params.categoryCode || undefined,
    },
  })
  return normalizePage(data)
}

/** 联调：我的文章分页 */
export async function fetchMyPostsApi(params = {}) {
  const data = await request.get('/users/me/posts', {
    params: {
      page: params.page ?? 0,
      size: Math.min(params.size ?? 10, 100),
      q: params.q || undefined,
    },
  })
  return normalizePage(data)
}

export async function fetchPostsApi(params = {}) {
  const r = await fetchPublicPostsApi({ page: 0, size: 200, ...params })
  return { data: r.list }
}

/** 文章详情（公开接口；仅自己可见需本人 Token） */
export async function fetchPostApi(id) {
  return request.get(`/posts/${id}`)
}

export async function savePostApi(post) {
  const body = {
    title: String(post.title || '').trim(),
    visibility: post.visibility || 'open',
    categoryCode: post.categoryCode || '1',
    body: post.body || '',
  }
  if (post.id) {
    return request.put(`/users/me/posts/${post.id}`, body)
  }
  return request.post('/users/me/posts', body)
}

export async function deletePostApi(id) {
  return request.delete(`/users/me/posts/${id}`)
}

export async function fetchCommentsApi(postId) {
  const data = await request.get(`/posts/${postId}/comments`)
  return { data: Array.isArray(data) ? data : [] }
}

export async function addCommentApi(postId, content, author, avatar) {
  return request.post(`/posts/${postId}/comments`, { content, author, avatar })
}

export async function deleteCommentApi(commentId, postId) {
  return request.delete(`/users/me/comments/${commentId}`, { data: { postId } })
}

export async function likePostApi(postId) {
  return request.post(`/posts/${postId}/like`)
}

export async function unlikePostApi(postId) {
  return request.delete(`/posts/${postId}/like`)
}
