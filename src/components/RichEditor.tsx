"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"

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
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: "Write your TIL entry here...",
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none dark:prose-invert min-h-[200px] focus:outline-none px-4 py-3",
      },
    },
    immediatelyRender: false,
  })

  if (!editor) return null

  const ToolButton = ({
    onClick,
    active,
    label,
  }: {
    onClick: () => void
    active?: boolean
    label: string
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`rounded px-2 py-1 text-xs font-medium ${
        active
          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
          : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="overflow-hidden rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900">
      <div className="flex flex-wrap gap-0.5 border-b border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
        <ToolButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          label="B"
        />
        <ToolButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          label="I"
        />
        <ToolButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          label="S"
        />
        <span className="mx-1 w-px bg-gray-300 dark:bg-gray-600" />
        <ToolButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          label="H1"
        />
        <ToolButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          label="H2"
        />
        <ToolButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          label="H3"
        />
        <span className="mx-1 w-px bg-gray-300 dark:bg-gray-600" />
        <ToolButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          label="• List"
        />
        <ToolButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          label="1. List"
        />
        <span className="mx-1 w-px bg-gray-300 dark:bg-gray-600" />
        <ToolButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          label="<>"
        />
        <ToolButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          label="Code"
        />
        <ToolButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          label="Quote"
        />
        <span className="mx-1 w-px bg-gray-300 dark:bg-gray-600" />
        <ToolButton
          onClick={() => editor.chain().focus().undo().run()}
          label="Undo"
        />
        <ToolButton
          onClick={() => editor.chain().focus().redo().run()}
          label="Redo"
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
