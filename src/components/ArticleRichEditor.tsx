import { useEffect, useRef, useState, type ReactNode } from 'react'
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import { TableKit } from '@tiptap/extension-table'
import { TextStyleKit } from '@tiptap/extension-text-style'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Youtube from '@tiptap/extension-youtube'
import Typography from '@tiptap/extension-typography'
import * as Dialog from '@radix-ui/react-dialog'
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, CheckSquare, Code2, Eraser, Highlighter, ImagePlus, Italic, Link2, List, ListOrdered, Maximize2, Minus, Minimize2, Quote, Redo2, Strikethrough, Subscript as SubscriptIcon, Superscript as SuperscriptIcon, Table2, Underline, Undo2, Unlink, Video, X } from 'lucide-react'
import { isSafeArticleImage, isSafeArticleLink, youtubeVideoId, type ArticleDocument } from '../../shared/article-document'
import { uploadArticleImage } from '../lib/admin-api'
import './article-prose.css'
import './rich-editor.css'

const EditorialImage = Image.extend({
  addAttributes() { return { ...this.parent?.(), caption: { default: '', parseHTML: element => element.getAttribute('data-caption'), renderHTML: attrs => ({ 'data-caption': attrs.caption }) }, width: { default: null } } },
})

function Tool({ label, active, disabled, onClick, children }: { label: string; active?: boolean; disabled?: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" title={label} aria-label={label} aria-pressed={active} disabled={disabled} onMouseDown={event => event.preventDefault()} onClick={onClick}>{children}</button>
}

export function ArticleRichEditor({ content, csrf, onReady, onChange }: { content: ArticleDocument; csrf: string; onReady: (editor: Editor) => void; onChange: () => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] }, link: { openOnClick: false, autolink: true, protocols: ['https', 'http', 'mailto', 'tel'] } }),
      TextStyleKit, TextAlign.configure({ types: ['heading', 'paragraph'] }), Highlight.configure({ multicolor: true }),
      EditorialImage.configure({ allowBase64: false }), TableKit.configure({ table: { resizable: true } }),
      Subscript, Superscript, Placeholder.configure({ placeholder: 'Commencez votre article ici…' }),
      CharacterCount.configure({ limit: 300000 }), TaskList, TaskItem.configure({ nested: true }),
      Youtube.configure({ nocookie: true, autoplay: false }), Typography,
    ],
    content, immediatelyRender: true,
    editorProps: { attributes: { class: 'article-prose', role: 'textbox', 'aria-label': 'Contenu de l’article', 'aria-multiline': 'true' } },
    onUpdate: onChange,
  })
  useEffect(() => { if (editor) onReady(editor) }, [editor, onReady])
  if (!editor) return <div className="rich-editor-loading" role="status">Préparation de l’éditeur…</div>
  return <RichEditorSurface key={editor.instanceId} editor={editor} csrf={csrf} />
}

function RichEditorSurface({ editor, csrf }: { editor: Editor; csrf: string }) {
  const [expanded, setExpanded] = useState(false)
  const [tool, setTool] = useState<'link' | 'image' | 'video' | null>(null)
  const [url, setUrl] = useState('')
  const [alt, setAlt] = useState('')
  const [caption, setCaption] = useState('')
  const [width, setWidth] = useState('')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const savedSelection = useRef({ from: 1, to: 1 })
  const state = useEditorState({ editor, selector: ({ editor: value }) => ({
    bold: value.isActive('bold'), italic: value.isActive('italic'), underline: value.isActive('underline'), strike: value.isActive('strike'),
    subscript: value.isActive('subscript'), superscript: value.isActive('superscript'), highlight: value.isActive('highlight'),
    bulletList: value.isActive('bulletList'), orderedList: value.isActive('orderedList'), taskList: value.isActive('taskList'),
    blockquote: value.isActive('blockquote'), codeBlock: value.isActive('codeBlock'), link: value.isActive('link'), table: value.isActive('table'), image: value.isActive('image'),
    alignment: value.getAttributes('paragraph').textAlign ?? value.getAttributes('heading').textAlign ?? 'left',
    heading: value.isActive('heading') ? String(value.getAttributes('heading').level) : 'paragraph',
    fontFamily: value.getAttributes('textStyle').fontFamily ?? '', fontSize: value.getAttributes('textStyle').fontSize ?? '',
    words: value.storage.characterCount?.words() ?? 0, characters: value.storage.characterCount?.characters() ?? 0,
    undo: value.can().undo(), redo: value.can().redo(),
  }) })

  const openTool = (value: 'link' | 'image' | 'video') => {
    savedSelection.current = { from: editor.state.selection.from, to: editor.state.selection.to }
    setError(''); setTool(value)
    setUrl(value === 'link' ? editor.getAttributes('link').href ?? '' : value === 'image' && state.image ? editor.getAttributes('image').src ?? '' : '')
    setAlt(value === 'image' && state.image ? editor.getAttributes('image').alt ?? '' : '')
    setCaption(value === 'image' && state.image ? editor.getAttributes('image').caption ?? '' : '')
    setWidth(value === 'image' && state.image ? String(editor.getAttributes('image').width ?? '') : '')
  }
  const insert = () => {
    const source = url.trim()
    const chain = editor.chain().focus().setTextSelection(savedSelection.current)
    if (tool === 'link') {
      if (!isSafeArticleLink(source)) { setError('Indiquez un lien HTTP, HTTPS, email ou téléphone valide.'); return }
      if (savedSelection.current.from === savedSelection.current.to) chain.insertContent({ type: 'text', text: source, marks: [{ type: 'link', attrs: { href: source, target: '_blank', rel: 'noopener noreferrer' } }] }).run()
      else chain.extendMarkRange('link').setLink({ href: source, target: '_blank' }).run()
    } else if (tool === 'image') {
      if (!isSafeArticleImage(source) || !alt.trim()) { setError('Choisissez une image et renseignez son texte alternatif.'); return }
      if (width && (!Number.isFinite(Number(width)) || Number(width) < 40 || Number(width) > 2400)) { setError('La largeur doit être comprise entre 40 et 2 400 pixels.'); return }
      const attributes = { src: source, alt: alt.trim(), caption: caption.trim(), width: width ? Number(width) : null }
      if (state.image) chain.updateAttributes('image', attributes).run()
      else chain.insertContent({ type: 'image', attrs: attributes }).run()
    } else if (tool === 'video') {
      if (!youtubeVideoId(source)) { setError('Utilisez un lien YouTube valide.'); return }
      chain.setYoutubeVideo({ src: source }).run()
    }
    setTool(null)
  }
  const upload = async (file?: File) => {
    if (!file) return
    setUploading(true); setError('')
    try { setUrl(await uploadArticleImage(file, csrf)) } catch (exception) { setError(exception instanceof Error ? exception.message : 'Téléversement impossible.') } finally { setUploading(false) }
  }

  return <div className={`rich-editor${expanded ? ' is-expanded' : ''}`}>
    <div className="rich-editor-toolbar" role="toolbar" aria-label="Mise en forme de l’article">
      <div className="rich-tool-row">
        <div className="rich-tool-group"><Tool label="Annuler (Ctrl+Z)" disabled={!state.undo} onClick={() => editor.chain().focus().undo().run()}><Undo2 size={17} /></Tool><Tool label="Rétablir (Ctrl+Maj+Z)" disabled={!state.redo} onClick={() => editor.chain().focus().redo().run()}><Redo2 size={17} /></Tool></div>
        <label className="rich-select"><span className="sr-only">Style du paragraphe</span><select value={state.heading} onChange={event => { const level = Number(event.target.value); if (level) editor.chain().focus().setHeading({ level: level as 2 | 3 | 4 }).run(); else editor.chain().focus().setParagraph().run() }}><option value="paragraph">Paragraphe</option><option value="2">Titre 2</option><option value="3">Titre 3</option><option value="4">Titre 4</option></select></label>
        <label className="rich-select"><span className="sr-only">Police</span><select value={state.fontFamily} onChange={event => event.target.value ? editor.chain().focus().setFontFamily(event.target.value).run() : editor.chain().focus().unsetFontFamily().run()}><option value="">Police éditoriale</option><option value="Georgia">Georgia</option><option value="Manrope">Manrope</option><option value="Arial">Arial</option><option value="monospace">Monospace</option></select></label>
        <label className="rich-select rich-size"><span className="sr-only">Taille du texte</span><select value={state.fontSize} onChange={event => event.target.value ? editor.chain().focus().setFontSize(event.target.value).run() : editor.chain().focus().unsetFontSize().run()}><option value="">Auto</option>{[12,14,16,18,20,24,28,32,40,48,64,72].map(size => <option value={`${size}px`} key={size}>{size}</option>)}</select></label>
        <Tool label={expanded ? 'Réduire l’éditeur' : 'Agrandir l’éditeur'} onClick={() => setExpanded(!expanded)}>{expanded ? <Minimize2 size={17} /> : <Maximize2 size={17} />}</Tool>
      </div>
      <div className="rich-tool-row">
        <div className="rich-tool-group">
          <Tool label="Gras (Ctrl+B)" active={state.bold} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={17} /></Tool>
          <Tool label="Italique (Ctrl+I)" active={state.italic} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={17} /></Tool>
          <Tool label="Souligné (Ctrl+U)" active={state.underline} onClick={() => editor.chain().focus().toggleUnderline().run()}><Underline size={17} /></Tool>
          <Tool label="Barré" active={state.strike} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={17} /></Tool>
          <Tool label="Indice" active={state.subscript} onClick={() => editor.chain().focus().toggleSubscript().run()}><SubscriptIcon size={17} /></Tool>
          <Tool label="Exposant" active={state.superscript} onClick={() => editor.chain().focus().toggleSuperscript().run()}><SuperscriptIcon size={17} /></Tool>
        </div>
        <div className="rich-tool-group"><label className="rich-color" title="Couleur du texte"><span>A</span><input type="color" aria-label="Couleur du texte" defaultValue="#071c35" onChange={event => editor.chain().focus().setColor(event.target.value).run()} /></label><Tool label="Surligner" active={state.highlight} onClick={() => editor.chain().focus().toggleHighlight({ color: '#fff0b3' }).run()}><Highlighter size={17} /></Tool><Tool label="Effacer la mise en forme" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}><Eraser size={17} /></Tool></div>
        <div className="rich-tool-group">{([{ id: 'left', label: 'Aligner à gauche', icon: AlignLeft }, { id: 'center', label: 'Centrer', icon: AlignCenter }, { id: 'right', label: 'Aligner à droite', icon: AlignRight }, { id: 'justify', label: 'Justifier', icon: AlignJustify }]).map(({ id, label, icon: Icon }) => <Tool key={id} label={label} active={state.alignment === id} onClick={() => editor.chain().focus().setTextAlign(id).run()}><Icon size={17} /></Tool>)}</div>
        <div className="rich-tool-group"><Tool label="Liste à puces" active={state.bulletList} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={17} /></Tool><Tool label="Liste numérotée" active={state.orderedList} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={17} /></Tool><Tool label="Liste de tâches" active={state.taskList} onClick={() => editor.chain().focus().toggleTaskList().run()}><CheckSquare size={17} /></Tool></div>
        <div className="rich-tool-group"><Tool label="Citation" active={state.blockquote} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={17} /></Tool><Tool label="Bloc de code" active={state.codeBlock} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code2 size={17} /></Tool><Tool label="Séparateur" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={17} /></Tool></div>
        <div className="rich-tool-group"><Tool label="Insérer ou modifier un lien" active={state.link} onClick={() => openTool('link')}><Link2 size={17} /></Tool>{state.link && <Tool label="Retirer le lien" onClick={() => editor.chain().focus().unsetLink().run()}><Unlink size={17} /></Tool>}<Tool label="Insérer ou modifier une image" active={state.image} onClick={() => openTool('image')}><ImagePlus size={17} /></Tool><Tool label="Insérer une vidéo YouTube" onClick={() => openTool('video')}><Video size={17} /></Tool><Tool label="Insérer un tableau" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><Table2 size={17} /></Tool></div>
      </div>
      {state.table && <div className="rich-table-tools" role="group" aria-label="Actions sur le tableau"><button type="button" onClick={() => editor.chain().focus().addRowAfter().run()}>+ Ligne</button><button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()}>+ Colonne</button><button type="button" onClick={() => editor.chain().focus().deleteRow().run()}>Retirer la ligne</button><button type="button" onClick={() => editor.chain().focus().deleteColumn().run()}>Retirer la colonne</button><button type="button" onClick={() => editor.chain().focus().mergeOrSplit().run()}>Fusionner / séparer</button><button type="button" onClick={() => editor.chain().focus().toggleHeaderRow().run()}>En-tête</button><button type="button" onClick={() => editor.chain().focus().deleteTable().run()}>Supprimer le tableau</button></div>}
    </div>
    <EditorContent editor={editor} className="rich-editor-canvas" />
    <div className="rich-editor-status"><span>{state.words} mots · {state.characters} caractères</span><span>Ctrl+B : gras · Ctrl+Z : annuler</span></div>
    <Dialog.Root open={tool !== null} onOpenChange={open => { if (!open) setTool(null) }}><Dialog.Portal><Dialog.Overlay className="rich-insert-overlay" /><Dialog.Content className="rich-insert-dialog"><div className="rich-insert-head"><Dialog.Title>{tool === 'image' ? 'Insérer une image' : tool === 'video' ? 'Insérer une vidéo' : 'Insérer un lien'}</Dialog.Title><Dialog.Close aria-label="Fermer"><X size={19} /></Dialog.Close></div><Dialog.Description>{tool === 'image' ? 'Ajoutez un visuel et sa description pour les lecteurs utilisant un lecteur d’écran.' : tool === 'video' ? 'Le lecteur sera chargé uniquement après un clic du lecteur.' : 'Sélectionnez le texte à relier, puis indiquez l’adresse de destination.'}</Dialog.Description>
      {tool === 'image' && <label className="rich-upload"><ImagePlus size={19} /><span>{uploading ? 'Téléversement…' : 'Importer une image'}</span><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={uploading} onChange={event => void upload(event.target.files?.[0])} /></label>}
      <label className="admin-form-field"><span>{tool === 'image' ? 'Source de l’image' : 'Adresse du lien'}</span><input value={url} onChange={event => setUrl(event.target.value)} placeholder={tool === 'image' ? 'https://… ou /images/…' : 'https://…'} autoFocus /></label>
      {tool === 'image' && <><label className="admin-form-field"><span>Texte alternatif</span><input value={alt} onChange={event => setAlt(event.target.value)} maxLength={500} /></label><label className="admin-form-field"><span>Légende (facultative)</span><input value={caption} onChange={event => setCaption(event.target.value)} maxLength={1000} /></label><label className="admin-form-field"><span>Largeur (facultative, en pixels)</span><input type="number" min="40" max="2400" value={width} onChange={event => setWidth(event.target.value)} /></label></>}
      {error && <p className="admin-editor-error" role="alert">{error}</p>}<div className="admin-dialog-actions"><Dialog.Close>Annuler</Dialog.Close><button type="button" disabled={uploading} onClick={insert}>Insérer</button></div>
    </Dialog.Content></Dialog.Portal></Dialog.Root>
  </div>
}
