import { Fragment, useState, type CSSProperties, type ReactNode } from 'react'
import { Play } from 'lucide-react'
import { isSafeArticleImage, isSafeArticleLink, youtubeVideoId, type ArticleDocument, type ArticleNode } from '../../shared/article-document'
import './article-prose.css'

function VideoBlock({ src }: { src: string }) {
  const [playing, setPlaying] = useState(false)
  const id = youtubeVideoId(src)
  if (!id) return null
  return <div className="article-embed">{playing
    ? <iframe src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=0`} title="Vidéo intégrée à l’article" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
    : <button type="button" onClick={() => setPlaying(true)} aria-label="Charger le lecteur YouTube"><img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="Miniature de la vidéo" loading="lazy" /><span><Play size={24} fill="currentColor" aria-hidden="true" />Voir la vidéo</span></button>}</div>
}

function renderNode(node: ArticleNode, key: number): ReactNode {
  const a = node.attrs ?? {}
  const content = node.content?.map(renderNode)
  const style: CSSProperties = { textAlign: a.textAlign as CSSProperties['textAlign'] }
  if (node.type === 'text') {
    let result: ReactNode = node.text
    for (const mark of node.marks ?? []) {
      const attrs = mark.attrs ?? {}
      switch (mark.type) {
        case 'bold': result = <strong>{result}</strong>; break
        case 'italic': result = <em>{result}</em>; break
        case 'underline': result = <u>{result}</u>; break
        case 'strike': result = <s>{result}</s>; break
        case 'code': result = <code>{result}</code>; break
        case 'subscript': result = <sub>{result}</sub>; break
        case 'superscript': result = <sup>{result}</sup>; break
        case 'highlight': result = <mark style={{ backgroundColor: String(attrs.color ?? '#fff0b3') }}>{result}</mark>; break
        case 'textStyle': result = <span style={{ color: attrs.color as string | undefined, backgroundColor: attrs.backgroundColor as string | undefined, fontFamily: attrs.fontFamily as string | undefined, fontSize: attrs.fontSize as string | undefined, lineHeight: attrs.lineHeight as string | undefined }}>{result}</span>; break
        case 'link': if (isSafeArticleLink(String(attrs.href))) result = <a href={String(attrs.href)} target="_blank" rel="noopener noreferrer">{result}</a>; break
      }
    }
    return <Fragment key={key}>{result}</Fragment>
  }
  switch (node.type) {
    case 'paragraph': return <p key={key} style={style}>{content?.length ? content : <br />}</p>
    case 'heading': return a.level === 3 ? <h3 key={key} style={style}>{content}</h3> : a.level === 4 ? <h4 key={key} style={style}>{content}</h4> : <h2 key={key} style={style}>{content}</h2>
    case 'blockquote': return <blockquote key={key}>{content}</blockquote>
    case 'bulletList': return <ul key={key}>{content}</ul>
    case 'orderedList': return <ol key={key} start={Number(a.start) || 1}>{content}</ol>
    case 'listItem': return <li key={key}>{content}</li>
    case 'taskList': return <ul key={key} data-type="taskList">{content}</ul>
    case 'taskItem': return <li key={key} data-type="taskItem"><label><input type="checkbox" checked={Boolean(a.checked)} disabled aria-label={a.checked ? 'Élément terminé' : 'Élément à faire'} /></label><div>{content}</div></li>
    case 'hardBreak': return <br key={key} />
    case 'horizontalRule': return <hr key={key} />
    case 'codeBlock': return <pre key={key}><code>{content}</code></pre>
    case 'image': return isSafeArticleImage(String(a.src)) ? <figure key={key} className="article-rich-image" style={{ width: a.width ? `${Number(a.width)}px` : undefined, maxWidth: '100%' }}><img src={String(a.src)} alt={String(a.alt ?? '')} title={a.title ? String(a.title) : undefined} loading="lazy" decoding="async" />{a.caption ? <figcaption>{String(a.caption)}</figcaption> : null}</figure> : null
    case 'youtube': return <VideoBlock key={key} src={String(a.src)} />
    case 'table': return <div key={key} className="article-table-scroll" role="region" aria-label="Tableau de l’article" tabIndex={0}><table><tbody>{content}</tbody></table></div>
    case 'tableRow': return <tr key={key}>{content}</tr>
    case 'tableCell': return <td key={key} colSpan={Number(a.colspan) || 1} rowSpan={Number(a.rowspan) || 1}>{content}</td>
    case 'tableHeader': return <th key={key} colSpan={Number(a.colspan) || 1} rowSpan={Number(a.rowspan) || 1}>{content}</th>
    default: return null
  }
}

export function ArticleDocumentView({ document }: { document: ArticleDocument }) {
  return <div className="article-prose article-document">{document.content.map(renderNode)}</div>
}
