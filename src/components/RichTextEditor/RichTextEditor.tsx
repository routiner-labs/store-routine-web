'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChangeEvent, JSX, PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import {
  LiaImageSolid,
  LiaBoldSolid,
  LiaItalicSolid,
  LiaUnderlineSolid,
  LiaHeadingSolid,
  LiaListUlSolid,
  LiaListOlSolid,
  LiaAlignLeftSolid,
  LiaAlignCenterSolid,
  LiaAlignRightSolid,
  LiaFontSolid,
  LiaHighlighterSolid,
  LiaPaletteSolid,
} from 'react-icons/lia'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html'
import { $createHeadingNode, $isHeadingNode, HeadingNode, QuoteNode } from '@lexical/rich-text'
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
  REMOVE_LIST_COMMAND,
} from '@lexical/list'
import {
  $setBlocksType,
  $patchStyleText,
  $getSelectionStyleValueForProperty,
} from '@lexical/selection'
import {
  $createParagraphNode,
  $findMatchingParent,
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $insertNodes,
  $isDecoratorNode,
  $isElementNode,
  $isNodeSelection,
  $isRangeSelection,
  $isRootNode,
  CLICK_COMMAND,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  DecoratorNode,
  DRAGOVER_COMMAND,
  DRAGSTART_COMMAND,
  DROP_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  type ElementFormatType,
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type EditorState,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from 'lexical'
import { mergeRegister } from '@lexical/utils'
import { useEscClose } from '@/lib/useEscClose'
import CategoryColorPicker from '@/components/CategoryColorPicker'
import styles from './RichTextEditor.module.css'

/* ── 이미지 노드 (게시글 블록 이미지, 드래그로 가로 크기 조절 + 정렬) ── */
type SerializedImageNode = Spread<
  { src: string; width?: number; format?: ElementFormatType },
  SerializedLexicalNode
>

// style/attribute의 폭 문자열에서 px 값만 안전하게 파싱 ("400px" | "400" → 400, "50%" → undefined)
function parseImgWidth(raw: string): number | undefined {
  const m = raw.trim().match(/^(\d+(?:\.\d+)?)(?:px)?$/)
  return m ? Number(m[1]) : undefined
}

class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string
  __width?: number // 저장된 가로 폭(px). 없으면 원본 크기(최대 100%)
  __format: ElementFormatType // 정렬(''=왼쪽 | 'center' | 'right')

  static getType(): string {
    return 'image'
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__width, node.__format, node.__key)
  }

  constructor(src: string, width?: number, format: ElementFormatType = '', key?: NodeKey) {
    super(key)
    this.__src = src
    this.__width = width
    this.__format = format
  }

  isInline(): boolean {
    return false
  }

  setWidth(width: number): void {
    this.getWritable().__width = width
  }

  setFormat(format: ElementFormatType): void {
    this.getWritable().__format = format
  }

  getFormatType(): ElementFormatType {
    return this.__format
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div')
    div.style.display = 'block'
    if (this.__format) div.style.textAlign = this.__format
    return div
  }

  updateDOM(prevNode: ImageNode, dom: HTMLElement): false {
    if (prevNode.__format !== this.__format) {
      dom.style.textAlign = this.__format || ''
    }
    return false
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: () => ({
        conversion: (element: HTMLElement): DOMConversionOutput => {
          const img = element as HTMLImageElement
          const width = parseImgWidth(img.style.width || img.getAttribute('width') || '')
          const format = (img.getAttribute('data-align') || '') as ElementFormatType
          return { node: new ImageNode(img.getAttribute('src') ?? '', width, format) }
        },
        priority: 0,
      }),
    }
  }

  exportDOM(): DOMExportOutput {
    const img = document.createElement('img')
    img.setAttribute('src', this.__src)
    if (this.__width) img.style.width = `${this.__width}px`
    // 정렬은 뷰어(별도 CSS 없이)에서도 보이도록 img를 block으로 두고 margin으로 처리 + data-align으로 재편집 시 복원
    if (this.__format) {
      img.setAttribute('data-align', this.__format)
      img.style.display = 'block'
      if (this.__format === 'center') {
        img.style.marginLeft = 'auto'
        img.style.marginRight = 'auto'
      } else if (this.__format === 'right') {
        img.style.marginLeft = 'auto'
      }
    }
    return { element: img }
  }

  static importJSON(json: SerializedImageNode): ImageNode {
    return new ImageNode(json.src, json.width, json.format ?? '')
  }

  exportJSON(): SerializedImageNode {
    return { ...super.exportJSON(), src: this.__src, width: this.__width, format: this.__format }
  }

  decorate(): JSX.Element {
    return <ResizableImage nodeKey={this.getKey()} src={this.__src} width={this.__width} />
  }
}

function $createImageNode(src: string): ImageNode {
  return new ImageNode(src)
}

function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode
}

/* 드래그 핸들로 가로 폭을 조절하는 이미지.
   드래그 중엔 리렌더 없이 DOM을 직접 조작(라이브 프리뷰)하고, pointerup에서만 노드에 폭을 커밋한다.
   커밋 후 width prop이 같은 값으로 갱신되므로 React 재조정은 무변화(스냅백 없음). */
function ResizableImage({ nodeKey, src, width }: { nodeKey: NodeKey; src: string; width?: number }) {
  const [editor] = useLexicalComposerContext()
  const wrapRef = useRef<HTMLSpanElement>(null)
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey)

  // 이미지를 클릭하면 노드 선택(→ 툴바 정렬 버튼이 이 이미지에 적용됨)
  useEffect(() => {
    return editor.registerCommand<MouseEvent>(
      CLICK_COMMAND,
      (event) => {
        if (wrapRef.current?.contains(event.target as Node)) {
          if (!event.shiftKey) clearSelection()
          setSelected(true)
          return true
        }
        return false
      },
      COMMAND_PRIORITY_LOW,
    )
  }, [editor, clearSelection, setSelected])

  function startResize(e: ReactPointerEvent) {
    e.preventDefault()
    const wrap = wrapRef.current
    if (!wrap) return
    const left = wrap.getBoundingClientRect().left
    const maxWidth = wrap.parentElement?.getBoundingClientRect().width ?? 9999
    let finalWidth: number | null = null
    wrap.classList.add(styles.imgWrapResizing)

    function onMove(ev: PointerEvent) {
      const w = Math.round(Math.min(maxWidth, Math.max(48, ev.clientX - left)))
      finalWidth = w
      wrap!.style.width = `${w}px`
    }
    function onUp() {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      wrap!.classList.remove(styles.imgWrapResizing)
      if (finalWidth != null) {
        editor.update(() => {
          const node = $getNodeByKey(nodeKey)
          if ($isImageNode(node)) node.setWidth(finalWidth as number)
        })
      }
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return (
    <span
      ref={wrapRef}
      className={`${styles.imgWrap} ${isSelected ? styles.imgWrapSelected : ''}`}
      style={width ? { width: `${width}px` } : undefined}
      data-image-key={nodeKey}
    >
      {/* 이미지 본체를 드래그하면 위치 이동(ImageDragDropPlugin이 처리), 우하단 핸들은 크기 조절 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" draggable />
      <span
        className={styles.imgHandle}
        onPointerDown={startResize}
        role="separator"
        aria-label="이미지 크기 조절"
      />
    </span>
  )
}

/* 이미지 정렬(FORMAT_ELEMENT_COMMAND) + 드래그 위치 이동(DRAGSTART/OVER/DROP)을 담당하는 플러그인 */
const IMAGE_DRAG_FORMAT = 'application/x-lexical-image-key'

function getDropRange(x: number, y: number): Range | null {
  if (document.caretRangeFromPoint) {
    return document.caretRangeFromPoint(x, y)
  }
  const pos = (
    document as Document & {
      caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null
    }
  ).caretPositionFromPoint?.(x, y)
  if (pos) {
    const range = document.createRange()
    range.setStart(pos.offsetNode, pos.offset)
    return range
  }
  return null
}

function ImagePlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return mergeRegister(
      // 정렬: 기본 핸들러는 이미지(DecoratorNode)에 정렬을 못 걸어서, 이미지·요소를 직접 처리한다
      editor.registerCommand<ElementFormatType>(
        FORMAT_ELEMENT_COMMAND,
        (format) => {
          const selection = $getSelection()
          if (!$isRangeSelection(selection) && !$isNodeSelection(selection)) return false
          let handled = false
          for (const node of selection.getNodes()) {
            if ($isImageNode(node)) {
              node.setFormat(format)
              handled = true
            } else {
              const element = $findMatchingParent(
                node,
                (p) => $isElementNode(p) && !p.isInline() && !$isRootNode(p),
              )
              if ($isElementNode(element)) {
                element.setFormat(format)
                handled = true
              }
            }
          }
          return handled // 처리했으면 기본 핸들러 스킵(중복 방지), 아니면 기본 동작
        },
        COMMAND_PRIORITY_HIGH,
      ),
      editor.registerCommand<DragEvent>(
        DRAGSTART_COMMAND,
        (event) => {
          const target = event.target as HTMLElement | null
          const wrap = target?.closest?.('[data-image-key]') as HTMLElement | null
          const key = wrap?.dataset.imageKey
          if (!key || !event.dataTransfer) return false
          event.dataTransfer.setData(IMAGE_DRAG_FORMAT, key)
          event.dataTransfer.effectAllowed = 'move'
          return true
        },
        COMMAND_PRIORITY_HIGH,
      ),
      editor.registerCommand<DragEvent>(
        DRAGOVER_COMMAND,
        (event) => {
          if (!event.dataTransfer?.types.includes(IMAGE_DRAG_FORMAT)) return false
          event.preventDefault() // 드롭 허용
          return true
        },
        COMMAND_PRIORITY_HIGH,
      ),
      editor.registerCommand<DragEvent>(
        DROP_COMMAND,
        (event) => {
          const key = event.dataTransfer?.getData(IMAGE_DRAG_FORMAT)
          if (!key) return false
          event.preventDefault()
          const range = getDropRange(event.clientX, event.clientY)
          editor.update(() => {
            const node = $getNodeByKey(key)
            if (!$isImageNode(node) || !range) return
            const targetNode = $getNearestNodeFromDOMNode(range.startContainer)
            const targetBlock = targetNode?.getTopLevelElement()
            if (!targetBlock || targetBlock.getKey() === node.getKey()) return
            const el = editor.getElementByKey(targetBlock.getKey())
            const rect = el?.getBoundingClientRect()
            const after = rect ? event.clientY > rect.top + rect.height / 2 : true
            if (after) targetBlock.insertAfter(node)
            else targetBlock.insertBefore(node)
          })
          return true
        },
        COMMAND_PRIORITY_HIGH,
      ),
    )
  }, [editor])

  return null
}

/* ── 변경 시 HTML 직렬화 ── */
function OnChangeHtmlPlugin({ onChange }: { onChange: (html: string) => void }) {
  const [editor] = useLexicalComposerContext()
  const handle = useCallback(
    (editorState: EditorState) => {
      editorState.read(() => {
        onChange($generateHtmlFromNodes(editor, null))
      })
    },
    [editor, onChange],
  )
  return <OnChangePlugin onChange={handle} ignoreSelectionChange />
}

/* ── 글자색 / 배경색 팔레트 ── */
const TEXT_COLORS = [
  '#111827', '#ef4444', '#f97316', '#eab308',
  '#16a34a', '#2563eb', '#7c3aed', '#db2777',
]
const HIGHLIGHT_COLORS = [
  '#fef08a', '#fde68a', '#fecaca', '#bbf7d0',
  '#bfdbfe', '#ddd6fe', '#fbcfe8', '#e5e7eb',
]

/* 툴바 버튼 + 팔레트(포털 드롭다운). 에디터 프레임의 overflow:hidden에 잘리지 않도록 body에 띄운다.
   프리셋 스와치로 빠르게 고르거나, "직접 선택"으로 스펙트럼 팔레트를 열어 임의 색을 고른다. */
function ColorMenuButton({
  icon,
  label,
  colors,
  value,
  barColor,
  renderPickerPreview,
  onSelect,
  onClear,
}: {
  icon: ReactNode
  label: string
  colors: string[]
  value: string
  barColor: string
  renderPickerPreview: (hex: string) => ReactNode
  onSelect: (color: string) => void
  onClear: () => void
}) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null)

  const close = () => setOpen(false)
  useEscClose(open, close)

  function toggle() {
    if (open) {
      close()
      return
    }
    const r = triggerRef.current?.getBoundingClientRect()
    if (r) setPos({ left: r.left, top: r.bottom + 4 })
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      const t = e.target as Node
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return
      close()
    }
    function onReposition() {
      close()
    }
    window.addEventListener('pointerdown', onPointerDown, true)
    window.addEventListener('scroll', onReposition, true)
    window.addEventListener('resize', onReposition)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown, true)
      window.removeEventListener('scroll', onReposition, true)
      window.removeEventListener('resize', onReposition)
    }
  }, [open])

  return (
    <div className={styles.colorControl}>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.toolBtn} ${styles.colorBtn} ${open ? styles.toolActive : ''}`}
        onClick={toggle}
        aria-label={label}
        title={label}
      >
        {icon}
        <span className={styles.colorBar} style={{ background: barColor }} />
      </button>
      {open &&
        pos &&
        createPortal(
          <div
            ref={menuRef}
            className={styles.palette}
            role="menu"
            style={{ left: pos.left, top: pos.top }}
          >
            <button
              type="button"
              className={styles.paletteClear}
              onClick={() => {
                onClear()
                close()
              }}
            >
              기본색
            </button>
            <div className={styles.paletteGrid}>
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`${styles.swatch} ${value.toLowerCase() === c.toLowerCase() ? styles.swatchActive : ''}`}
                  style={{ background: c }}
                  onClick={() => {
                    onSelect(c)
                    close()
                  }}
                  aria-label={`색상 ${c}`}
                />
              ))}
            </div>
            <button
              type="button"
              className={styles.paletteCustom}
              onClick={() => {
                close()
                setPickerOpen(true)
              }}
            >
              <LiaPaletteSolid />
              직접 선택
            </button>
          </div>,
          document.body,
        )}
      {pickerOpen && (
        <CategoryColorPicker
          title={label}
          initialColor={value || undefined}
          renderPreview={renderPickerPreview}
          onApply={(hex) => onSelect(hex)}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  )
}

/* ── 서식 툴바 ── */
function Toolbar() {
  const [editor] = useLexicalComposerContext()
  const fileRef = useRef<HTMLInputElement>(null)
  const [fmt, setFmt] = useState({ bold: false, italic: false, underline: false })
  const [block, setBlock] = useState<string>('paragraph')
  const [align, setAlign] = useState<ElementFormatType>('')
  const [textColor, setTextColor] = useState('')
  const [bgColor, setBgColor] = useState('')

  const applyStyle = useCallback(
    (key: string, value: string | null) => {
      editor.update(() => {
        const sel = $getSelection()
        if ($isRangeSelection(sel)) $patchStyleText(sel, { [key]: value })
      })
    },
    [editor],
  )

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const sel = $getSelection()
        // 이미지가 선택된 경우: 그 이미지의 정렬을 툴바에 반영
        if ($isNodeSelection(sel)) {
          const img = sel.getNodes().find((n) => $isImageNode(n))
          if ($isImageNode(img)) setAlign(img.getFormatType())
          return
        }
        if (!$isRangeSelection(sel)) return
        setFmt({
          bold: sel.hasFormat('bold'),
          italic: sel.hasFormat('italic'),
          underline: sel.hasFormat('underline'),
        })
        setTextColor($getSelectionStyleValueForProperty(sel, 'color', ''))
        setBgColor($getSelectionStyleValueForProperty(sel, 'background-color', ''))
        const anchor = sel.anchor.getNode()
        const el = anchor.getKey() === 'root' ? anchor : anchor.getTopLevelElementOrThrow()
        if ($isHeadingNode(el)) setBlock(el.getTag())
        else if ($isListNode(el)) setBlock(el.getListType())
        else setBlock('paragraph')
        // 정렬 상태: 리스트 항목은 항목 자체, 그 외는 블록 요소의 정렬
        const alignSource = $isElementNode(anchor) ? anchor : anchor.getParentOrThrow()
        setAlign($isElementNode(alignSource) ? alignSource.getFormatType() : '')
      })
    })
  }, [editor])

  const toggleHeading = () =>
    editor.update(() => {
      const sel = $getSelection()
      if ($isRangeSelection(sel)) {
        $setBlocksType(sel, () => (block === 'h2' ? $createParagraphNode() : $createHeadingNode('h2')))
      }
    })

  const toggleList = (type: 'bullet' | 'number') => {
    if (block === type) editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
    else
      editor.dispatchCommand(
        type === 'bullet' ? INSERT_UNORDERED_LIST_COMMAND : INSERT_ORDERED_LIST_COMMAND,
        undefined,
      )
  }

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    Array.from(files).forEach((f) => {
      const url = URL.createObjectURL(f)
      editor.update(() => {
        const node = $createImageNode(url)
        const selection = $getSelection()
        if ($isRangeSelection(selection)) $insertNodes([node])
        else $getRoot().append(node)
      })
    })
    e.target.value = ''
  }

  return (
    <div className={styles.toolbar}>
      <button
        type="button"
        className={`${styles.toolBtn} ${fmt.bold ? styles.toolActive : ''}`}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        aria-label="굵게"
        title="굵게"
      >
        <LiaBoldSolid />
      </button>
      <button
        type="button"
        className={`${styles.toolBtn} ${fmt.italic ? styles.toolActive : ''}`}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        aria-label="기울임"
        title="기울임"
      >
        <LiaItalicSolid />
      </button>
      <button
        type="button"
        className={`${styles.toolBtn} ${fmt.underline ? styles.toolActive : ''}`}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
        aria-label="밑줄"
        title="밑줄"
      >
        <LiaUnderlineSolid />
      </button>

      <span className={styles.toolDivider} />

      <button
        type="button"
        className={`${styles.toolBtn} ${block === 'h2' ? styles.toolActive : ''}`}
        onClick={toggleHeading}
        aria-label="제목"
        title="제목"
      >
        <LiaHeadingSolid />
      </button>
      <button
        type="button"
        className={`${styles.toolBtn} ${block === 'bullet' ? styles.toolActive : ''}`}
        onClick={() => toggleList('bullet')}
        aria-label="글머리 목록"
        title="글머리 목록"
      >
        <LiaListUlSolid />
      </button>
      <button
        type="button"
        className={`${styles.toolBtn} ${block === 'number' ? styles.toolActive : ''}`}
        onClick={() => toggleList('number')}
        aria-label="번호 목록"
        title="번호 목록"
      >
        <LiaListOlSolid />
      </button>

      <span className={styles.toolDivider} />

      <button
        type="button"
        className={`${styles.toolBtn} ${align === '' || align === 'left' || align === 'start' ? styles.toolActive : ''}`}
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}
        aria-label="왼쪽 정렬"
        title="왼쪽 정렬"
      >
        <LiaAlignLeftSolid />
      </button>
      <button
        type="button"
        className={`${styles.toolBtn} ${align === 'center' ? styles.toolActive : ''}`}
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}
        aria-label="가운데 정렬"
        title="가운데 정렬"
      >
        <LiaAlignCenterSolid />
      </button>
      <button
        type="button"
        className={`${styles.toolBtn} ${align === 'right' || align === 'end' ? styles.toolActive : ''}`}
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')}
        aria-label="오른쪽 정렬"
        title="오른쪽 정렬"
      >
        <LiaAlignRightSolid />
      </button>

      <span className={styles.toolDivider} />

      <ColorMenuButton
        icon={<LiaFontSolid />}
        label="글자색"
        colors={TEXT_COLORS}
        value={textColor}
        barColor={textColor || 'var(--color-text)'}
        renderPickerPreview={(hex) => (
          <span className={styles.colorPreviewText} style={{ color: hex }}>
            가나다 ABC
          </span>
        )}
        onSelect={(c) => applyStyle('color', c)}
        onClear={() => applyStyle('color', null)}
      />
      <ColorMenuButton
        icon={<LiaHighlighterSolid />}
        label="글자 배경색"
        colors={HIGHLIGHT_COLORS}
        value={bgColor}
        barColor={bgColor || 'transparent'}
        renderPickerPreview={(hex) => (
          <span className={styles.colorPreviewHighlight} style={{ background: hex }}>
            가나다 ABC
          </span>
        )}
        onSelect={(c) => applyStyle('background-color', c)}
        onClear={() => applyStyle('background-color', null)}
      />

      <span className={styles.toolDivider} />

      <button
        type="button"
        className={styles.toolImg}
        onClick={() => fileRef.current?.click()}
        aria-label="사진 넣기"
        title="사진 넣기"
      >
        <LiaImageSolid />
        사진
      </button>
      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onPick} />
    </div>
  )
}

/* HTML 문자열을 에디터 초기 상태로 주입 */
function prepopulate(editor: LexicalEditor, html: string) {
  const root = $getRoot()
  if (root.getFirstChild() !== null) return
  const dom = new DOMParser().parseFromString(html, 'text/html')
  const nodes = $generateNodesFromDOM(editor, dom)
  for (const node of nodes) {
    if ($isElementNode(node) || $isDecoratorNode(node)) {
      root.append(node)
    } else {
      root.append($createParagraphNode().append(node))
    }
  }
  if (root.getChildrenSize() === 0) {
    root.append($createParagraphNode())
  }
}

export default function RichTextEditor({
  initialHtml = '',
  onChange,
  placeholder = '내용을 작성하세요.',
  minHeight,
}: {
  initialHtml?: string
  onChange: (html: string) => void
  placeholder?: string
  // 편집 영역 최소 높이(px). 댓글처럼 짧은 입력엔 작게. 기본은 CSS의 240px.
  minHeight?: number
}) {
  return (
    <LexicalComposer
      initialConfig={{
        namespace: 'rich-text-editor',
        nodes: [ImageNode, HeadingNode, QuoteNode, ListNode, ListItemNode],
        onError(error: Error) {
          throw error
        },
        editorState:
          initialHtml && initialHtml.trim()
            ? (editor) => prepopulate(editor, initialHtml)
            : undefined,
        theme: {},
      }}
    >
      <div className={styles.frame} style={minHeight != null ? { minHeight } : undefined}>
        <Toolbar />
        <div className={styles.shell}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className={styles.editor}
                aria-placeholder={placeholder}
                placeholder={<div className={styles.placeholder}>{placeholder}</div>}
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
      </div>
      <HistoryPlugin />
      <ListPlugin />
      <ImagePlugin />
      <OnChangeHtmlPlugin onChange={onChange} />
    </LexicalComposer>
  )
}
