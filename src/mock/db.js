const DB_KEY = 'blog_vue_store'
const AUTH_KEY = 'blog_prototype_auth'
const TOKEN_KEY = 'blog_access_token'

const defaultAvatar =
  'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'

const defaultDB = {
  user: {
    username: 'linxiaochuan',
    nickname: '林小川',
    email: 'user@example.com',
    bio: '产品与设计交叉背景，记录工作笔记与读书摘要。',
    phone: '',
    avatar: defaultAvatar,
  },
  posts: [
    {
      id: 1,
      title: '用文字记录产品迭代的日常',
      categoryCode: '1',
      excerpt: '从需求到上线，团队如何保持节奏与透明度。',
      body: '<p>本文是博客详情页原型。</p>',
      visibility: 'open',
      likes: 128,
      commentsCount: 19,
      author: '林小川',
      updatedAt: '2026-04-01',
    },
    {
      id: 2,
      title: '未发布的读书笔记草稿',
      categoryCode: '7',
      excerpt: '关于阅读体验的草稿内容。',
      body: '<p>草稿内容。</p>',
      visibility: 'only_myself',
      likes: 0,
      commentsCount: 0,
      author: '林小川',
      updatedAt: '2026-03-25',
    },
    {
      id: 3,
      title: '阅读体验：字距、行高与留白',
      categoryCode: '7',
      excerpt: '主流博客在排版上非常克制。',
      body: '<p>排版是阅读体验的核心。</p>',
      visibility: 'open',
      likes: 66,
      commentsCount: 12,
      author: '林小川',
      updatedAt: '2026-03-20',
    },
  ],
  comments: {
    1: [
      {
        author: '周映辰',
        avatar: defaultAvatar,
        time: '2026-04-02 10:20',
        content: '排版很舒服，期待后端接口字段定义。',
      },
      {
        author: '访客甲',
        avatar: defaultAvatar,
        time: '2026-04-01 18:05',
        content: 'PRD 里流程图画得很清晰。',
      },
    ],
  },
}

const clone = (value) => JSON.parse(JSON.stringify(value))

function migrate(db) {
  let changed = false
  if (!db.posts) db.posts = []
  if (!db.comments) db.comments = {}
  if (!db.user) db.user = {}
  if (!db.user.avatar) {
    db.user.avatar = defaultAvatar
    changed = true
  }
  const legacyCategoryMap = {
    后端: '1',
    前端: '2',
    Android: '3',
    iOS: '4',
    人工智能: '5',
    工具开发: '6',
    阅读: '7',
    产品设计: '1',
  }
  for (const p of db.posts || []) {
    if (p.visibility === 'private' || p.visibility === 'public') {
      p.visibility = p.visibility === 'public' ? 'open' : 'only_myself'
      changed = true
    }
    if (!p.categoryCode && p.category) {
      p.categoryCode = legacyCategoryMap[p.category] || '1'
      changed = true
    }
    if (p.commentsCount == null) {
      p.commentsCount = 0
      changed = true
    }
    if (!p.body && p.excerpt) {
      p.body = `<p>${String(p.excerpt)}</p>`
      changed = true
    }
  }
  for (const list of Object.values(db.comments || {})) {
    for (const c of list) {
      if (!c.avatar) {
        c.avatar = defaultAvatar
        changed = true
      }
    }
  }
  if (changed) writeDB(db)
  return db
}

export function readDB() {
  try {
    const raw = localStorage.getItem(DB_KEY)
    const base = raw ? JSON.parse(raw) : clone(defaultDB)
    return migrate(base)
  } catch {
    return migrate(clone(defaultDB))
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
