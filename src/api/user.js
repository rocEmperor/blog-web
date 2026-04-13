import request from '../utils/request'
import { readDB, writeDB, setLoggedIn } from '../mock/db'
import { appConfig } from '../config'

const useMock = appConfig.useMock
const sleep = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchProfileApi() {
  if (!useMock) return request.get('/user/profile')
  await sleep(120)
  const db = readDB()
  return { data: db.user }
}

export async function updateProfileApi(payload) {
  if (!useMock) return request.put('/user/profile', payload)
  await sleep()
  const db = readDB()
  db.user = { ...db.user, ...payload }
  writeDB(db)
  return { data: db.user }
}

/** 上传头像文件流，返回新图片 URL（Mock 返回可访问占位图） */
export async function uploadAvatarApi(file) {
  if (!useMock) {
    const fd = new FormData()
    fd.append('file', file)
    return request.post('/user/avatar', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }
  await sleep(300)
  const seed = encodeURIComponent(`${file.name}-${file.size}-${file.lastModified}`)
  return {
    data: {
      url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
    },
  }
}

export async function updateSecurityApi(payload) {
  if (!useMock) return request.put('/user/security', payload)
  await sleep()
  const db = readDB()
  db.user.email = payload.email
  writeDB(db)
  return { ok: true }
}

export async function deleteAccountApi() {
  if (!useMock) return request.delete('/user/account')
  await sleep()
  setLoggedIn(false)
  return { ok: true }
}
