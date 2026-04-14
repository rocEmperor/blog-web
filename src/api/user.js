import request from '../utils/request'
import { setLoggedIn } from '../utils/auth'
import { DEFAULT_AVATAR_URL } from '../constants/defaultAvatar'

function mapMeToProfile(me) {
  return {
    nickname: me.nickname,
    username: me.nickname,
    email: me.email || '',
    bio: me.bio || '',
    phone: me.phone || '',
    avatar: me.avatarUrl || DEFAULT_AVATAR_URL,
  }
}

export async function fetchProfileApi() {
  const me = await request.get('/users/me')
  return { data: mapMeToProfile(me) }
}

export async function updateProfileApi(payload) {
  const body = {
    nickname: payload.nickname,
    bio: payload.bio,
    phone: payload.phone != null && String(payload.phone).trim() !== '' ? String(payload.phone).trim() : '',
    avatarUrl: payload.avatarUrl != null ? payload.avatarUrl : payload.avatar,
  }
  if (body.avatarUrl === undefined || body.avatarUrl === '') {
    delete body.avatarUrl
  }
  const me = await request.put('/users/me/profile', body)
  return { data: mapMeToProfile(me) }
}

export async function uploadAvatarApi(file) {
  const fd = new FormData()
  fd.append('file', file)
  const data = await request.post('/users/me/avatar', fd)
  return { data }
}

export async function updateSecurityApi(payload) {
  return request.put('/users/me/security', {
    email: payload.email,
    currentPassword: payload.currentPassword ?? payload.current,
    newPassword: payload.newPassword ?? payload.next,
  })
}

export async function deleteAccountApi(body) {
  const res = await request.delete('/users/me', { data: body || {} })
  setLoggedIn(false)
  return res
}
