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
