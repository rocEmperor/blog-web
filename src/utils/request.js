import axios from 'axios'
import { appConfig } from '../config'

const request = axios.create({
  baseURL: appConfig.apiBaseURL,
  timeout: appConfig.requestTimeout,
})

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('blog_access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

request.interceptors.response.use(
  (response) => {
    const payload = response.data
    if (payload && typeof payload.code === 'number') {
      if (payload.code !== 200) {
        const err = new Error(payload.msg || '请求失败')
        err.code = payload.code
        return Promise.reject(err)
      }
      return payload.data
    }
    return payload
  },
  (error) => {
    const msg = error.response?.data?.msg || error.message || '网络错误'
    const err = new Error(msg)
    err.code = error.response?.data?.code
    return Promise.reject(err)
  },
)

export default request
