'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChangeEvent, JSX } from 'react'
import {
  LiaImageSolid,
  LiaBoldSolid,
  LiaItalicSolid,
  LiaUnderlineSolid,
  LiaHeadingSolid,
  LiaListUlSolid,
  LiaListOlSolid,
} from 'react-icons/lia'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
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
import { $setBlocksType } from '@lexical/selection'
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $insertNodes,
  $isDecoratorNode,
  $isElementNode,
  $isRangeSelection,
  DecoratorNode,
  FORMAT_TEXT_COMMAND,
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type EditorState,
  type LexicalEditor,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from 'lexical'
import styles from './RichTextEditor.module.css'

/* ── 이미지 노드 (게시글 인라인/블록 이미지) ── */
type SerializedImageNode = Spread<{ src: string }, SerializedLexicalNode>

class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string

  static getType(): string {
    return 'image'
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__key)
  }

  constructor(src: string, key?: NodeKey) {
    super(key)
    this.__src = src
  }

  isInline(): boolean {
    return false
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div')
    div.style.display = 'block'
    return div
  }

  updateDOM(): false {
    return false
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: () => ({
        conversion: (element: HTMLElement): DOMConversionOutput => ({
          node: new ImageNode(element.getAttribute('src') ?? ''),
        }),
        priority: 0,
      }),
    }
  }

  exportDOM(): DOMExportOutput {
    const img = document.createElement('img')
    img.setAttribute('src', this.__src)
    return { element: img }
  }

  static importJSON(json: SerializedImageNode): ImageNode {
    return new ImageNode(json.src)
  }

  exportJSON(): SerializedImageNode {
    return { ...super.exportJSON(), src: this.__src }
  }

  decorate(): JSX.Element {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={this.__src} alt="" />
  }
}

function $createImageNode(src: string): ImageNode {
  return new ImageNode(src)
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

/* ── 서식 툴바 ── */
function Toolbar() {
  const [editor] = useLexicalComposerContext()
  const fileRef = useRef<HTMLInputElement>(null)
  const [fmt, setFmt] = useState({ bold: false, italic: false, underline: false })
  const [block, setBlock] = useState<string>('paragraph')

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const sel = $getSelection()
        if (!$isRangeSelection(sel)) return
        setFmt({
          bold: sel.hasFormat('bold'),
          italic: sel.hasFormat('italic'),
          underline: sel.hasFormat('underline'),
        })
        const anchor = sel.anchor.getNode()
        const el = anchor.getKey() === 'root' ? anchor : anchor.getTopLevelElementOrThrow()
        if ($isHeadingNode(el)) setBlock(el.getTag())
        else if ($isListNode(el)) setBlock(el.getListType())
        else setBlock('paragraph')
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
      >
        <LiaBoldSolid />
      </button>
      <button
        type="button"
        className={`${styles.toolBtn} ${fmt.italic ? styles.toolActive : ''}`}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        aria-label="기울임"
      >
        <LiaItalicSolid />
      </button>
      <button
        type="button"
        className={`${styles.toolBtn} ${fmt.underline ? styles.toolActive : ''}`}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
        aria-label="밑줄"
      >
        <LiaUnderlineSolid />
      </button>

      <span className={styles.toolDivider} />

      <button
        type="button"
        className={`${styles.toolBtn} ${block === 'h2' ? styles.toolActive : ''}`}
        onClick={toggleHeading}
        aria-label="제목"
      >
        <LiaHeadingSolid />
      </button>
      <button
        type="button"
        className={`${styles.toolBtn} ${block === 'bullet' ? styles.toolActive : ''}`}
        onClick={() => toggleList('bullet')}
        aria-label="글머리 목록"
      >
        <LiaListUlSolid />
      </button>
      <button
        type="button"
        className={`${styles.toolBtn} ${block === 'number' ? styles.toolActive : ''}`}
        onClick={() => toggleList('number')}
        aria-label="번호 목록"
      >
        <LiaListOlSolid />
      </button>

      <span className={styles.toolDivider} />

      <button type="button" className={styles.toolImg} onClick={() => fileRef.current?.click()}>
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
}: {
  initialHtml?: string
  onChange: (html: string) => void
  placeholder?: string
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
      <div className={styles.frame}>
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
      <OnChangeHtmlPlugin onChange={onChange} />
    </LexicalComposer>
  )
}
