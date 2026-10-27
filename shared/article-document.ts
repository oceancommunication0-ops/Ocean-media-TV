export interface ArticleMark { type: string; attrs?: Record<string, unknown> }
export interface ArticleNode { type: string; attrs?: Record<string, unknown>; text?: string; marks?: ArticleMark[]; content?: ArticleNode[] }
export interface ArticleDocument { type: 'doc'; content: ArticleNode[] }
export const emptyArticleDocument = (): ArticleDocument => ({ type: 'doc', content: [{ type: 'paragraph' }] })

export function articleText(document: ArticleDocument): string {
  const collect = (node: ArticleNode): string => node.text ?? (node.content ?? []).map(collect).join(node.type === 'paragraph' || node.type === 'heading' ? '' : ' ')
  return document.content.map(collect).join(' ').trim()
}

export function isSafeArticleLink(value: string) {
  return /^(https?:\/\/|mailto:|tel:)/i.test(value) && !/[\s\u0000-\u001f]/.test(value)
}
export function isSafeArticleImage(value: string) {
  return /^\/images\/[\w./%-]+$/.test(value) || /^https:\/\/[^\s]+$/.test(value)
}
export function youtubeVideoId(value: string) {
  try {
    const url = new URL(value)
    if (!['www.youtube.com', 'youtube.com', 'youtu.be', 'www.youtube-nocookie.com'].includes(url.hostname)) return null
    const id = url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v') ?? url.pathname.match(/\/(?:embed|shorts)\/([\w-]+)/)?.[1]
    return id && /^[\w-]{11}$/.test(id) ? id : null
  } catch { return null }
}

// Strict JSON allow-list. No HTML or executable style strings are stored or rendered.
export function isArticleDocument(value: unknown): value is ArticleDocument {
  let count = 0
  let textLength = 0
  const object = (input: unknown): input is Record<string, unknown> => Boolean(input && typeof input === 'object' && !Array.isArray(input))
  const color = (input: unknown) => input == null || (typeof input === 'string' && /^(#[0-9a-f]{3,8}|rgba?\([\d.,%\s]+\)|[a-z]{1,20})$/i.test(input))
  const blocks = ['paragraph', 'heading', 'blockquote', 'bulletList', 'orderedList', 'taskList', 'codeBlock', 'image', 'horizontalRule', 'table', 'youtube']
  const allowedChildren: Record<string, string[]> = {
    doc: blocks,
    paragraph: ['text', 'hardBreak'], heading: ['text', 'hardBreak'], codeBlock: ['text'],
    blockquote: blocks,
    bulletList: ['listItem'], orderedList: ['listItem'], taskList: ['taskItem'],
    listItem: blocks,
    taskItem: blocks,
    table: ['tableRow'], tableRow: ['tableCell', 'tableHeader'],
    tableCell: blocks,
    tableHeader: blocks,
    text: [], hardBreak: [], horizontalRule: [], image: [], youtube: [],
  }
  const mark = (input: unknown) => {
    if (!object(input) || typeof input.type !== 'string') return false
    if (['bold', 'italic', 'underline', 'strike', 'code', 'subscript', 'superscript'].includes(input.type)) return !input.attrs || (object(input.attrs) && Object.keys(input.attrs).length === 0)
    const attrs = input.attrs
    if (!object(attrs)) return false
    if (input.type === 'link') return typeof attrs.href === 'string' && attrs.href.length <= 2000 && isSafeArticleLink(attrs.href)
    if (input.type === 'highlight') return color(attrs.color)
    if (input.type === 'textStyle') return color(attrs.color) && color(attrs.backgroundColor)
      && (attrs.fontSize == null || (typeof attrs.fontSize === 'string' && /^(1[0-9]|[2-6][0-9]|7[0-2])px$/.test(attrs.fontSize)))
      && (attrs.fontFamily == null || ['Manrope', 'Georgia', 'Arial', 'monospace'].includes(String(attrs.fontFamily)))
      && (attrs.lineHeight == null || ['1', '1.25', '1.5', '1.75', '2'].includes(String(attrs.lineHeight)))
    return false
  }
  const visit = (input: unknown, depth: number, parent?: string): boolean => {
    if (!object(input) || typeof input.type !== 'string' || !Object.hasOwn(allowedChildren, input.type) || depth > 16 || ++count > 10000) return false
    if (parent && !allowedChildren[parent].includes(input.type)) return false
    if (input.type === 'text') { if (typeof input.text !== 'string' || !input.text.length) return false; textLength += input.text.length; if (textLength > 300000) return false }
    if (input.marks && (!Array.isArray(input.marks) || input.marks.length > 12 || !input.marks.every(mark))) return false
    const a = input.attrs ?? {}
    if (!object(a)) return false
    if (a.textAlign != null && !['left', 'center', 'right', 'justify'].includes(String(a.textAlign))) return false
    if (input.type === 'heading' && ![2, 3, 4].includes(Number(a.level))) return false
    if (input.type === 'image') {
      if (typeof a.src !== 'string' || !isSafeArticleImage(a.src) || typeof a.alt !== 'string' || !a.alt.trim() || a.alt.length > 500) return false
      if (a.caption != null && (typeof a.caption !== 'string' || a.caption.length > 1000)) return false
      if (a.width != null && (!Number.isFinite(Number(a.width)) || Number(a.width) < 40 || Number(a.width) > 2400)) return false
    }
    if (input.type === 'youtube' && (typeof a.src !== 'string' || !youtubeVideoId(a.src))) return false
    if (['tableCell', 'tableHeader'].includes(input.type)) {
      for (const name of ['colspan', 'rowspan']) if (a[name] != null && (!Number.isInteger(a[name]) || Number(a[name]) < 1 || Number(a[name]) > 20)) return false
      if (a.colwidth != null && (!Array.isArray(a.colwidth) || a.colwidth.length > 20 || a.colwidth.some(width => !Number.isFinite(width) || Number(width) < 0 || Number(width) > 2400))) return false
    }
    if (input.content != null && (!Array.isArray(input.content) || input.content.some(child => !visit(child, depth + 1, input.type as string)))) return false
    if (['doc', 'table', 'tableRow', 'bulletList', 'orderedList', 'taskList', 'listItem', 'taskItem', 'tableCell', 'tableHeader', 'blockquote'].includes(input.type) && (!Array.isArray(input.content) || !input.content.length)) return false
    return true
  }
  return object(value) && value.type === 'doc' && visit(value, 0) && articleText(value as unknown as ArticleDocument).length > 0
}

export function legacyArticleDocument(article: { paragraphs: readonly string[]; profile?: { sectionTitles?: readonly string[]; pullQuote?: string; keyPoints?: readonly string[]; inlineImage?: { src: string; alt: string; caption?: string } } }): ArticleDocument {
  const text = (value: string): ArticleNode => ({ type: 'paragraph', content: [{ type: 'text', text: value }] })
  const content: ArticleNode[] = []
  article.paragraphs.forEach((paragraph, index) => {
    const heading = index > 0 ? article.profile?.sectionTitles?.[index - 1] : null
    if (heading) content.push({ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: heading }] })
    content.push(text(paragraph))
    if (index === 1 && article.profile?.pullQuote) content.push({ type: 'blockquote', content: [text(article.profile.pullQuote)] })
    if (index === 2 && article.profile?.inlineImage) content.push({ type: 'image', attrs: { ...article.profile.inlineImage } })
  })
  if (article.profile?.keyPoints?.length) {
    content.push({ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Les repères à garder' }] })
    content.push({ type: 'bulletList', content: article.profile.keyPoints.map(point => ({ type: 'listItem', content: [text(point)] })) })
  }
  return { type: 'doc', content }
}
