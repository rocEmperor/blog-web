/** 文章分类（与需求文档枚举一致） */
export const CATEGORY_OPTIONS = [
  { value: '1', label: '后端' },
  { value: '2', label: '前端' },
  { value: '3', label: 'Android' },
  { value: '4', label: 'iOS' },
  { value: '5', label: '人工智能' },
  { value: '6', label: '工具开发' },
  { value: '7', label: '阅读' },
]

const LABEL_BY_CODE = Object.fromEntries(CATEGORY_OPTIONS.map((o) => [o.value, o.label]))

export function categoryLabel(codeOrLabel) {
  if (!codeOrLabel) return ''
  return LABEL_BY_CODE[String(codeOrLabel)] || String(codeOrLabel)
}

/** 可见范围（需求：open / only_myself） */
export const VISIBILITY_OPTIONS = [
  { value: 'open', label: '公开' },
  { value: 'only_myself', label: '仅自己可见' },
]

export function visibilityLabel(value) {
  if (value === 'open' || value === 'public') return '公开'
  if (value === 'only_myself' || value === 'private') return '仅自己可见'
  const row = VISIBILITY_OPTIONS.find((o) => o.value === value)
  return row ? row.label : String(value || '')
}
