import { computed, reactive, ref } from 'vue'
import {
  forgotPasswordResetApi,
  forgotPasswordSendCodeApi,
  loginApi,
  logoutApi,
  registerApi,
} from '../api/auth'
import {
  addCommentApi,
  deleteCommentApi,
  deletePostApi,
  fetchCommentsApi,
  fetchMyPostsApi,
  fetchPostApi,
  fetchPublicPostsApi,
  mapDetailToPost,
  mapMyRowToPost,
  mapPublicItemToPost,
  likePostApi,
  savePostApi,
  unlikePostApi,
} from '../api/posts'
import { deleteAccountApi, fetchProfileApi, updateProfileApi, updateSecurityApi, uploadAvatarApi } from '../api/user'
import { appConfig } from '../config'
import { DEFAULT_AVATAR_URL } from '../constants/defaultAvatar'
import { isLoggedIn as readLoginState, setLoggedIn } from '../utils/auth'

/** 与 localStorage 中的 Token 同步： bump 后 isLoggedIn 会重新读取 */
const authEpoch = ref(0)

function notifyAuthChanged() {
  authEpoch.value++
}

const state = reactive({
  user: {
    username: '',
    nickname: '',
    email: '',
    bio: '',
    phone: '',
    avatar: '',
  },
  posts: [],
  myPosts: [],
  myPostsTotal: 0,
  comments: {},
})

function resolveMediaUrl(url) {
  if (!url || typeof url !== 'string') return ''
  const u = url.trim()
  if (!u) return ''
  if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:') || u.startsWith('blob:')) {
    return u
  }
  const base = String(appConfig.apiBaseURL || '').replace(/\/$/, '')
  return u.startsWith('/') ? `${base}${u}` : `${base}/${u}`
}

function normalizeProfile(user) {
  const raw = user.avatar || user.avatarUrl || ''
  const resolved = resolveMediaUrl(raw)
  return {
    username: user.username || user.nickname || '',
    nickname: user.nickname || user.username || '',
    email: user.email || '',
    bio: user.bio || '',
    phone: user.phone || '',
    avatar: resolved || DEFAULT_AVATAR_URL,
  }
}

const emptyUser = () => ({
  username: '',
  nickname: '',
  email: '',
  bio: '',
  phone: '',
  avatar: '',
})

async function reloadPostFeeds() {
  try {
    const pub = await fetchPublicPostsApi({ page: 0, size: 200 })
    state.posts = pub.list.map(mapPublicItemToPost)
  } catch {
    state.posts = []
  }
  if (readLoginState()) {
    try {
      const mine = await fetchMyPostsApi({ page: 0, size: 200, q: '' })
      state.myPosts = mine.list.map(mapMyRowToPost)
      state.myPostsTotal = mine.total
    } catch {
      state.myPosts = []
      state.myPostsTotal = 0
    }
  } else {
    state.myPosts = []
    state.myPostsTotal = 0
  }
}

async function loadMyPosts({ page, size, q } = {}) {
  const res = await fetchMyPostsApi({ page: page ?? 0, size: size ?? 10, q: q ?? '' })
  state.myPosts = res.list.map(mapMyRowToPost)
  state.myPostsTotal = res.total
}

async function bootstrap() {
  if (readLoginState()) {
    try {
      const profileRes = await fetchProfileApi()
      state.user = normalizeProfile(profileRes.data)
    } catch {
      setLoggedIn(false)
      state.user = emptyUser()
    }
  } else {
    state.user = emptyUser()
  }
  try {
    await reloadPostFeeds()
  } catch {
    state.posts = []
    state.myPosts = []
    state.myPostsTotal = 0
  }
  notifyAuthChanged()
}

async function login(payload) {
  const res = await loginApi(payload)
  try {
    const profileRes = await fetchProfileApi()
    state.user = normalizeProfile(profileRes.data)
  } catch {
    state.user = normalizeProfile(res.user)
  }
  try {
    await reloadPostFeeds()
  } catch {
    /* ignore */
  }
  notifyAuthChanged()
  return res
}

async function register(payload) {
  return registerApi(payload)
}

async function sendForgotPasswordCode(email) {
  return forgotPasswordSendCodeApi(email)
}

async function forgotPasswordReset(payload) {
  return forgotPasswordResetApi({
    email: payload.email,
    code: payload.code,
    newPassword: payload.password,
  })
}

async function logout() {
  await logoutApi()
  state.user = emptyUser()
  state.myPosts = []
  state.myPostsTotal = 0
  try {
    const pub = await fetchPublicPostsApi({ page: 0, size: 200 })
    state.posts = pub.list.map(mapPublicItemToPost)
  } catch {
    state.posts = []
  }
  notifyAuthChanged()
}

async function addComment(postId, content) {
  await addCommentApi(postId, content, state.user.nickname || '访客', state.user.avatar || DEFAULT_AVATAR_URL)
  const res = await fetchCommentsApi(postId)
  state.comments[postId] = res.data
}

async function deleteComment(commentId, postId) {
  await deleteCommentApi(commentId, postId)
  const res = await fetchCommentsApi(postId)
  state.comments[postId] = res.data
}

async function toggleLike(postId, liked) {
  const res = liked ? await unlikePostApi(postId) : await likePostApi(postId)
  return res
}

async function uploadAvatar(file) {
  const res = await uploadAvatarApi(file)
  const url = res?.data?.url ?? res?.url ?? ''
  return url
}

async function loadComments(postId) {
  const res = await fetchCommentsApi(postId)
  state.comments[postId] = res.data
}

async function upsertPost(post) {
  await savePostApi(post)
  await reloadPostFeeds()
}

async function removePost(id) {
  await deletePostApi(id)
  try {
    const pub = await fetchPublicPostsApi({ page: 0, size: 200 })
    state.posts = pub.list.map(mapPublicItemToPost)
  } catch {
    /* ignore */
  }
}

async function loadPost(id) {
  const raw = await fetchPostApi(id)
  return mapDetailToPost(raw)
}

async function saveProfile(payload) {
  const res = await updateProfileApi(payload)
  state.user = normalizeProfile(res.data)
}

async function saveSecurity(payload) {
  await updateSecurityApi(payload)
  try {
    const profileRes = await fetchProfileApi()
    state.user = normalizeProfile(profileRes.data)
  } catch {
    /* ignore */
  }
}

async function destroyAccount() {
  await deleteAccountApi()
  notifyAuthChanged()
}

export function useBlogStore() {
  return {
    state,
    isLoggedIn: computed(() => {
      authEpoch.value
      return readLoginState()
    }),
    bootstrap,
    login,
    register,
    sendForgotPasswordCode,
    forgotPasswordReset,
    logout,
    loadPost,
    loadComments,
    loadMyPosts,
    saveProfile,
    saveSecurity,
    destroyAccount,
    addComment,
    deleteComment,
    toggleLike,
    uploadAvatar,
    upsertPost,
    removePost,
  }
}
