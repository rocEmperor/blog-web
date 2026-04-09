import request from '../utils/request'
import { readDB, setLoggedIn } from '../mock/db'
import { appConfig } from '../config'

const useMock = appConfig.useMock
const sleep = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms))

export async function loginApi(payload) {
  if (!useMock) return request.post('/auth/login', payload)
  await sleep()
  const db = readDB()
  setLoggedIn(true)
  return { token: 'mock-token', user: db.user }
}

export async function registerApi(payload) {
  if (!useMock) return request.post('/auth/register', payload)
  await sleep()
  return { ok: true, payload }
}

export async function forgotPasswordApi(payload) {
  if (!useMock) return request.post('/auth/forgot-password', payload)
  await sleep()
  return { ok: true, payload }
}

export async function logoutApi() {
  if (!useMock) return request.post('/auth/logout')
  await sleep(100)
  setLoggedIn(false)
  return { ok: true }
}
