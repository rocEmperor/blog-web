const DB_KEY = 'blog_vue_store'
const AUTH_KEY = 'blog_prototype_auth'
const TOKEN_KEY = 'blog_access_token'

const defaultDB = {
  user: {
    username: 'linxiaochuan',
    nickname: '林小川',
    email: 'user@example.com',
    bio: '产品与设计交叉背景，记录工作笔记与读书摘要。',
    phone: '',
  },
  posts: [
    { id: 1, title: '用文字记录产品迭代的日常', category: '产品设计', excerpt: '从需求到上线，团队如何保持节奏与透明度。', body: '本文是博客详情页原型。', visibility: 'public', likes: 128, author: '林小川', updatedAt: '2026-04-01' },
    { id: 2, title: '未发布的读书笔记草稿', category: '阅读', excerpt: '关于阅读体验的草稿内容。', body: '草稿内容。', visibility: 'private', likes: 0, author: '林小川', updatedAt: '2026-03-25' },
    { id: 3, title: '阅读体验：字距、行高与留白', category: '阅读', excerpt: '主流博客在排版上非常克制。', body: '排版是阅读体验的核心。', visibility: 'public', likes: 66, author: '林小川', updatedAt: '2026-03-20' },
  ],
  comments: {
    1: [
      { author: '周映辰', time: '2026-04-02 10:20', content: '排版很舒服，期待后端接口字段定义。' },
      { author: '访客甲', time: '2026-04-01 18:05', content: 'PRD 里流程图画得很清晰。' },
    ],
  },
}

const clone = (value) => JSON.parse(JSON.stringify(value))

export function readDB() {
  try {
    const raw = localStorage.getItem(DB_KEY)
    return raw ? JSON.parse(raw) : clone(defaultDB)
  } catch {
    return clone(defaultDB)
  }
}

export function writeDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
}

export function isLoggedIn() {
  return localStorage.getItem(AUTH_KEY) === '1'
}

export function setLoggedIn(value) {
  if (value) {
    localStorage.setItem(AUTH_KEY, '1')
    localStorage.setItem(TOKEN_KEY, 'mock-token')
  } else {
    localStorage.removeItem(AUTH_KEY)
    localStorage.removeItem(TOKEN_KEY)
  }
}
