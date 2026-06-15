"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"

function ToolButton({
  onClick,
  active,
  label,
  title,
}: {
  onClick: () => void
  active?: boolean
  label: string
  title?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
          : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
      }`}
    >
      {label}
    </button>
  )
}

interface RichEditorProps {
  content: string
  onChange: (html: string) => void
}

export default function RichEditor({ content, onChange }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({
        placeholder: "Write your TIL entry...",
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          "tiptap prose prose-sm max-w-none dark:prose-invert focus:outline-none min-h-[220px] px-5 py-4",
      },
    },
    immediatelyRender: false,
  })

  if (!editor) return null

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-800">
        <div className="flex items-center gap-1.5">
          <ToolButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            label="B"
            title="Bold"
          />
          <ToolButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            label="I"
            title="Italic"
          />
          <ToolButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")}
            label="S"
            title="Strikethrough"
          />
        </div>

        <span className="mx-1 h-5 w-px bg-gray-300 dark:bg-gray-600" />

        <div className="flex items-center gap-1.5">
          <ToolButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive("heading", { level: 1 })}
            label="H1"
            title="Heading 1"
          />
          <ToolButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
            label="H2"
            title="Heading 2"
          />
          <ToolButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive("heading", { level: 3 })}
            label="H3"
            title="Heading 3"
          />
        </div>

        <span className="mx-1 h-5 w-px bg-gray-300 dark:bg-gray-600" />

        <div className="flex items-center gap-1.5">
          <ToolButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            label="•"
            title="Bulleted list"
          />
          <ToolButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            label="1."
            title="Numbered list"
          />
        </div>

        <span className="mx-1 h-5 w-px bg-gray-300 dark:bg-gray-600" />

        <div className="flex items-center gap-1.5">
          <ToolButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive("code")}
            label="< >"
            title="Inline code"
          />
          <ToolButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive("codeBlock")}
            label="Code"
            title="Code block"
          />
          <ToolButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            label="❝"
            title="Blockquote"
          />
        </div>

        <span className="mx-1 h-5 w-px bg-gray-300 dark:bg-gray-600" />

        <div className="flex items-center gap-1.5">
          <ToolButton
            onClick={() => editor.chain().focus().undo().run()}
            label="Undo"
            title="Undo"
          />
          <ToolButton
            onClick={() => editor.chain().focus().redo().run()}
            label="Redo"
            title="Redo"
          />
        </div>
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}

