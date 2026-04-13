import { computed, reactive } from 'vue'
import { forgotPasswordApi, loginApi, logoutApi, registerApi } from '../api/auth'
import { addCommentApi, deletePostApi, fetchCommentsApi, fetchPostApi, fetchPostsApi, savePostApi } from '../api/posts'
import { deleteAccountApi, fetchProfileApi, updateProfileApi, updateSecurityApi, uploadAvatarApi } from '../api/user'
import { isLoggedIn as readLoginState } from '../mock/db'

const state = reactive({
  user: {
    username: '',
    nickname: '',
    email: '',
    bio: '',
    phone: '',
  },
  posts: [],
  comments: {},
})

async function bootstrap() {
  const [profileRes, postsRes] = await Promise.all([fetchProfileApi(), fetchPostsApi()])
  state.user = profileRes.data
  state.posts = postsRes.data
}

async function login(payload) {
  const res = await loginApi(payload)
  state.user = res.user
  return res
}

async function register(payload) {
  return registerApi(payload)
}

async function forgotPassword(payload) {
  return forgotPasswordApi(payload)
}

async function logout() {
  await logoutApi()
}

async function addComment(postId, content) {
  await addCommentApi(postId, content, state.user.nickname || '访客', state.user.avatar || '')
  const res = await fetchCommentsApi(postId)
  state.comments[postId] = res.data
}

async function uploadAvatar(file) {
  const res = await uploadAvatarApi(file)
  return res.data?.url || ''
}

async function loadComments(postId) {
  const res = await fetchCommentsApi(postId)
  state.comments[postId] = res.data
}

async function upsertPost(post) {
  await savePostApi(post)
  const res = await fetchPostsApi()
  state.posts = res.data
}

async function removePost(id) {
  await deletePostApi(id)
  const res = await fetchPostsApi()
  state.posts = res.data
}

async function loadPost(id) {
  const res = await fetchPostApi(id)
  return res.data
}

async function saveProfile(payload) {
  const res = await updateProfileApi(payload)
  state.user = res.data
}

async function saveSecurity(payload) {
  await updateSecurityApi(payload)
}

async function destroyAccount() {
  await deleteAccountApi()
}

export function useBlogStore() {
  return {
    state,
    isLoggedIn: computed(() => readLoginState()),
    bootstrap,
    login,
    register,
    forgotPassword,
    logout,
    loadPost,
    loadComments,
    saveProfile,
    saveSecurity,
    destroyAccount,
    addComment,
    uploadAvatar,
    upsertPost,
    removePost,
  }
}
