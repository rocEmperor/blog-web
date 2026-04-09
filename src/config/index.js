const mode = import.meta.env.MODE || 'development'

const resolveApiBaseURL = () => {
  if (mode === 'production') return import.meta.env.VITE_API_BASE_URL || 'https://api.example.com'
  if (mode === 'test') return import.meta.env.VITE_API_BASE_URL || 'https://api-test.example.com'
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
}

export const appConfig = {
  mode,
  apiBaseURL: resolveApiBaseURL(),
  useMock: String(import.meta.env.VITE_USE_MOCK || 'false') === 'true',
  requestTimeout: Number(import.meta.env.VITE_REQUEST_TIMEOUT || 12000),
}

export default appConfig
