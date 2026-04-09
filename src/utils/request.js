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
  (response) => response.data,
  (error) => Promise.reject(error),
)

export default request
