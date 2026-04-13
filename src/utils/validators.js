/** 昵称：4-20 位，字母开头，字母 / 数字 / 下划线 */
export const NICKNAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]{3,19}$/

/** 登录/注册密码（注册、忘记密码）：8-20 位，须同时包含字母与数字 */
export const PASSWORD_LETTER_DIGIT_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/

/** 安全设置：当前密码 / 新密码：4-20 位，字母开头，字母 / 数字 / 下划线 */
export const SECURITY_PASSWORD_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]{3,19}$/

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** 个人简介：8-50 字（按字符长度计） */
export function validateBio(bio) {
  const s = String(bio || '').trim()
  if (s.length < 8 || s.length > 50) return '个人简介为必填，长度 8-50 字'
  return ''
}

export function validateNickname(nickname, fieldName = '昵称') {
  const s = String(nickname || '').trim()
  if (!s) return `${fieldName}为必填`
  if (!NICKNAME_PATTERN.test(s)) return `${fieldName}须 4-20 位，以字母开头，仅含字母、数字、下划线`
  return ''
}

export function validateEmail(email) {
  const s = String(email || '').trim()
  if (!s) return '邮箱为必填'
  if (!EMAIL_PATTERN.test(s)) return '邮箱格式不正确'
  return ''
}

export function validateRegisterPassword(password) {
  const s = String(password || '')
  if (!s) return '密码为必填'
  if (!PASSWORD_LETTER_DIGIT_PATTERN.test(s)) return '密码须 8-20 位，且同时包含字母与数字'
  return ''
}

export function validateSecurityPassword(password, fieldName = '密码') {
  const s = String(password || '')
  if (!s) return `${fieldName}为必填`
  if (!SECURITY_PASSWORD_PATTERN.test(s))
    return `${fieldName}须 4-20 位，以字母开头，仅含字母、数字、下划线`
  return ''
}

/** 手机号：非必填；填写则校验大陆 11 位 */
export function validatePhoneOptional(phone) {
  const s = String(phone || '').trim()
  if (!s) return ''
  if (!/^1[3-9]\d{9}$/.test(s)) return '手机号格式不正确'
  return ''
}

/** 文章标题：必填，4-30 字 */
export function validatePostTitle(title) {
  const s = String(title || '').trim()
  if (!s) return '标题为必填'
  if (s.length < 4 || s.length > 30) return '标题长度须为 4-30 字'
  return ''
}

/** 富文本正文：去掉标签后计数字数，最多 5000 */
export function plainTextFromHtml(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function validatePostBody(html) {
  const plain = plainTextFromHtml(html)
  if (!plain) return '正文为必填'
  if (plain.length > 5000) return `正文最多 5000 字（当前约 ${plain.length} 字）`
  return ''
}

/** 评论：1-300 字 */
export function validateComment(content) {
  const s = String(content || '').trim()
  if (!s) return '评论内容为必填'
  if (s.length < 1 || s.length > 300) return '评论长度须为 1-300 字'
  return ''
}
