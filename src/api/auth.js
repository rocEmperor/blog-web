import request from '../utils/request'
import { setLoggedIn } from '../utils/auth'
import { DEFAULT_AVATAR_URL } from '../constants/defaultAvatar'

function mapAuthUser(data) {
  return {
    username: data.username,
    nickname: data.username,
    email: data.email || '',
    bio: '',
    phone: '',
    avatar: DEFAULT_AVATAR_URL,
  }
}

export async function loginApi(payload) {
  const data = await request.post('/auth/login', {
    nickname: payload.nickname,
    password: payload.password,
  })
  setLoggedIn(true, data.token)
  return { token: data.token, user: mapAuthUser(data) }
}

export async function registerApi(payload) {
  await request.post('/auth/register', {
    nickname: payload.nickname,
    email: payload.email,
    password: payload.password,
  })
  return { ok: true }
}

export async function forgotPasswordSendCodeApi(email) {
  return request.post('/auth/forgot-password/send-code', { email })
}

export async function forgotPasswordResetApi({ email, code, newPassword }) {
  await request.post('/auth/forgot-password/reset', { email, code, newPassword })
  return { ok: true }
}

export async function logoutApi() {
  try {
    await request.post('/auth/logout')
  } finally {
    setLoggedIn(false)
  }
  return { ok: true }
}
