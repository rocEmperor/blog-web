const TOKEN_KEY = 'blog_access_token'

export function isLoggedIn() {
  return !!localStorage.getItem(TOKEN_KEY)
}

export function setLoggedIn(value, token) {
  if (value) {
    if (token != null && token !== '') {
      localStorage.setItem(TOKEN_KEY, token)
    }
    return
  }
  localStorage.removeItem(TOKEN_KEY)
}
