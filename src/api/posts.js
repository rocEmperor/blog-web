import request from '../utils/request'
import { readDB, writeDB } from '../mock/db'
import { appConfig } from '../config'

const useMock = appConfig.useMock
const sleep = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms))
const today = () => new Date().toISOString().slice(0, 10)

export async function fetchPostsApi(params = {}) {
  if (!useMock) return request.get('/posts', { params })
  await sleep()
  const db = readDB()
  const q = String(params.q || '').trim().toLowerCase()
  const data = q ? db.posts.filter((p) => `${p.title}${p.author}`.toLowerCase().includes(q)) : db.posts
  return { data }
}

export async function fetchPostApi(id) {
  if (!useMock) return request.get(`/posts/${id}`)
  await sleep()
  const db = readDB()
  return { data: db.posts.find((item) => item.id === Number(id)) || null }
}

export async function savePostApi(post) {
  if (!useMock) return post.id ? request.put(`/posts/${post.id}`, post) : request.post('/posts', post)
  await sleep()
  const db = readDB()
  if (post.id) {
    const idx = db.posts.findIndex((item) => item.id === post.id)
    if (idx >= 0) db.posts[idx] = { ...db.posts[idx], ...post, updatedAt: today() }
  } else {
    const id = Math.max(0, ...db.posts.map((p) => p.id)) + 1
    db.posts.unshift({ ...post, id, updatedAt: today(), likes: 0 })
  }
  writeDB(db)
  return { ok: true }
}

export async function deletePostApi(id) {
  if (!useMock) return request.delete(`/posts/${id}`)
  await sleep()
  const db = readDB()
  db.posts = db.posts.filter((item) => item.id !== id)
  writeDB(db)
  return { ok: true }
}

export async function fetchCommentsApi(postId) {
  if (!useMock) return request.get(`/posts/${postId}/comments`)
  await sleep(120)
  const db = readDB()
  return { data: db.comments[postId] || [] }
}

export async function addCommentApi(postId, content, author) {
  if (!useMock) return request.post(`/posts/${postId}/comments`, { content })
  await sleep()
  const db = readDB()
  const row = { author, content, time: new Date().toLocaleString() }
  if (!db.comments[postId]) db.comments[postId] = []
  db.comments[postId].unshift(row)
  writeDB(db)
  return { data: row }
}
