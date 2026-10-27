import { lazy, Suspense, useEffect, useRef, useState, type FormEvent } from 'react'
import type { Editor } from '@tiptap/react'
import { CheckCircle2, Eye, FileText, ImagePlus, PencilLine, Save, UploadCloud } from 'lucide-react'
import type { NewsArticle, SiteData } from '../../shared/content'
import { articleText, emptyArticleDocument, type ArticleDocument } from '../../shared/article-document'
import { adminRequest, uploadArticleImage } from '../lib/admin-api'
import { automaticContentId, DEFAULT_IMAGE_POSITION } from '../lib/admin-defaults'
import { ArticleDocumentView } from './ArticleDocumentView'

const ArticleRichEditor = lazy(() => import('./ArticleRichEditor').then(module => ({ default: module.ArticleRichEditor })))

export interface ArticleDraft { data: NewsArticle; published: boolean; featured: boolean; sortOrder: number }
export function blankArticle(category: string): ArticleDraft {
  return { published: false, featured: false, sortOrder: 100, data: { id: '', category, title: '', excerpt: '', image: '', imageAlt: '', imagePosition: '50% 50%', format: 'Article', author: 'La rédaction', href: '/actualites/', contentVersion: 2, content: emptyArticleDocument(), publishedAt: null } }
}

export function AdminArticleForm({ initial, categories, creating, csrf, onSaved, onDirtyChange, onBusyChange }: { initial: ArticleDraft; categories: SiteData['categories']['articles']; creating: boolean; csrf: string; onSaved: () => void; onDirtyChange: (dirty: boolean) => void; onBusyChange: (busy: boolean) => void }) {
  const [title, setTitle] = useState(initial.data.title)
  const [idSuffix] = useState(() => crypto.randomUUID().slice(0, 8)); const slug = creating ? automaticContentId(title, idSuffix) : initial.data.id
  const [cover, setCover] = useState(initial.data.image)
  const [preview, setPreview] = useState(false)
  const [previewData, setPreviewData] = useState<{ title: string; excerpt: string; content: ArticleDocument }>({ title, excerpt: initial.data.excerpt, content: initial.data.content })
  const [editor, setEditor] = useState<Editor | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dirty, setDirty] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const change = () => { setDirty(true); onDirtyChange(true) }
  useEffect(() => {
    const prevent = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = '' } }
    window.addEventListener('beforeunload', prevent)
    return () => window.removeEventListener('beforeunload', prevent)
  }, [dirty])
  const showPreview = () => {
    if (formRef.current && editor) { const form = new FormData(formRef.current); setPreviewData({ title, excerpt: String(form.get('excerpt') ?? ''), content: editor.getJSON() as ArticleDocument }) }
    setPreview(true)
  }
  const upload = async (file?: File) => {
    if (!file) return
    setUploading(true); setError('')
    try { setCover(await uploadArticleImage(file, csrf)); change() }
    catch (exception) { setError(exception instanceof Error ? exception.message : 'Téléversement impossible.') }
    finally { setUploading(false) }
  }
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (saving || uploading || !editor) return
    const form = new FormData(event.currentTarget)
    const content = editor.getJSON() as ArticleDocument
    if (!articleText(content)) { setError('Rédigez le contenu de votre article avant de l’enregistrer.'); setPreview(false); return }
    const data: NewsArticle = {
      id: slug, title: title.trim(), category: String(form.get('category') ?? ''), excerpt: String(form.get('excerpt') ?? '').trim(),
      image: cover.trim(), imageAlt: String(form.get('imageAlt') ?? '').trim(), imagePosition: initial.data.image === cover ? initial.data.imagePosition : DEFAULT_IMAGE_POSITION,
      author: String(form.get('author') ?? '').trim(), format: initial.data.format || 'Article',
      href: `/actualites/${slug}`, contentVersion: 2, content,
      ...(initial.data.image === cover && initial.data.imageSrcSet ? { imageSrcSet: initial.data.imageSrcSet } : {}),
    }
    setSaving(true); onBusyChange(true); setError('')
    try {
      await adminRequest(creating ? '/admin/content/articles' : `/admin/content/articles/${initial.data.id}`, {
        method: creating ? 'POST' : 'PUT', csrf,
        body: { data, published: form.get('publication') === 'published', featured: form.get('featured') === 'on', sortOrder: Number(form.get('sortOrder')) },
      })
      setDirty(false); onDirtyChange(false); onSaved()
    } catch (exception) { setError(exception instanceof Error ? exception.message : 'Enregistrement impossible.'); setPreview(false) }
    finally { setSaving(false); onBusyChange(false) }
  }
  return <form id="admin-article-form" className="professional-article-form" onSubmit={submit} onChange={change} onInvalidCapture={() => setPreview(false)} ref={formRef}>
    <div className="article-writing-tabs"><div role="group" aria-label="Mode de l’éditeur"><button type="button" aria-pressed={!preview} onClick={() => setPreview(false)}><PencilLine size={16} />Rédaction</button><button type="button" aria-pressed={preview} onClick={showPreview}><Eye size={16} />Aperçu</button></div><span className={dirty ? 'is-dirty' : ''}><i />{dirty ? 'Modifications non enregistrées' : creating ? 'Nouvel article' : 'Version enregistrée'}</span></div>
    {error && <p className="admin-editor-error" role="alert">{error}</p>}
    <div className="professional-editor-layout" hidden={preview}>
      <div className="article-writing-main">
        <section className="article-title-panel"><label><span>TITRE DE L’ARTICLE</span><textarea aria-label="Titre de l’article" name="title" value={title} rows={2} maxLength={500} onChange={event => setTitle(event.target.value)} placeholder="Un titre qui donne envie de lire." required /></label><label><span>CHAPÔ</span><textarea aria-label="Résumé de l’article" name="excerpt" defaultValue={initial.data.excerpt} rows={3} maxLength={20000} placeholder="Présentez l’essentiel de votre sujet en quelques lignes…" required /></label></section>
        <div className="article-writing-label"><FileText size={17} /><span>VOTRE ARTICLE</span><small>Mise en forme et enrichissements</small></div>
        <Suspense fallback={<div className="rich-editor-loading" role="status">Préparation de l’éditeur…</div>}><ArticleRichEditor content={initial.data.content} csrf={csrf} onReady={setEditor} onChange={change} /></Suspense>
      </div>
      <aside className="article-writing-settings" aria-label="Paramètres de l’article">
        <section><div className="article-settings-heading"><CheckCircle2 size={17} /><h3>Publication</h3></div><label className="admin-article-field"><span>Visibilité</span><select name="publication" defaultValue={initial.published ? 'published' : 'draft'}><option value="draft">Brouillon</option><option value="published">Publié</option></select></label><p className="article-publication-hint">{initial.data.publishedAt ? `Publié le ${new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'Africa/Kinshasa' }).format(new Date(initial.data.publishedAt))}. La date initiale est conservée.` : 'La date sera définie automatiquement lors de la première publication.'}</p><label className="admin-check-card"><input name="featured" type="checkbox" defaultChecked={initial.featured} /><span><strong>Mettre à la une</strong><small>Donner la priorité à cet article sur l’accueil.</small></span></label></section>
        <section><div className="article-settings-heading"><PencilLine size={17} /><h3>Informations</h3></div><label className="admin-article-field"><span>Catégorie</span><select name="category" defaultValue={initial.data.category || categories[0]?.id} required><option value="" disabled>Choisir une catégorie</option>{categories.map(category => <option key={category.id} value={category.id}>{category.label}</option>)}</select></label>{!categories.length && <p className="article-publication-hint">Ajoutez une catégorie depuis la liste des actualités avant de publier.</p>}<label className="admin-article-field"><span>Auteur</span><input name="author" defaultValue={initial.data.author} maxLength={500} required /></label><label className="admin-article-field"><span>Priorité d’affichage</span><input name="sortOrder" type="number" min="0" max="1000000" defaultValue={initial.sortOrder} required /><small>À priorité égale, les plus récents apparaissent d’abord.</small></label></section>
        <section><div className="article-settings-heading"><ImagePlus size={17} /><h3>Image de couverture</h3></div>{cover && <img className="article-cover-preview" src={cover} alt="Aperçu de la couverture" />}<label className="article-cover-upload"><UploadCloud size={17} /><span>{uploading ? 'Téléversement…' : 'Importer une image'}</span><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={event => void upload(event.target.files?.[0])} disabled={uploading} /></label><label className="admin-article-field"><span>Source de l’image</span><input name="image" value={cover} onChange={event => setCover(event.target.value)} placeholder="/images/… ou https://…" required /></label><label className="admin-article-field"><span>Description de l’image</span><input name="imageAlt" defaultValue={initial.data.imageAlt} maxLength={500} placeholder="Décrivez le contenu du visuel" required /></label></section>
      </aside>
    </div>
    {preview && <section className="article-editor-preview" aria-label="Aperçu de l’article"><div className="article-preview-heading"><span>APERÇU ÉDITORIAL</span><h1>{previewData.title || 'Le titre de votre article'}</h1><p>{previewData.excerpt}</p></div>{cover && <img className="article-preview-cover" src={cover} alt="Couverture de l’article" />}<div className="article-preview-content"><ArticleDocumentView document={previewData.content} /></div></section>}
    <div className="article-form-save"><button type="submit" disabled={saving || uploading}><Save size={17} />{saving ? 'Enregistrement…' : creating ? 'Enregistrer l’article' : 'Enregistrer les modifications'}</button></div>
  </form>
}
