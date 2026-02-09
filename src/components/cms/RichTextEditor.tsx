import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Heading1,
  Heading2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder = 'Escribe el contenido aquí...' }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none min-h-[250px] focus:outline-none p-6 text-foreground bg-transparent',
      },
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  if (!editor) {
    return null
  }

  return (
    <div className="w-full border border-border rounded-xl bg-card shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-ring/20 transition-all">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/10 backdrop-blur-sm sticky top-0 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "h-9 w-9 p-0",
            editor.isActive('bold') ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-accent'
          )}
          type="button"
          title="Negrita"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "h-9 w-9 p-0",
            editor.isActive('italic') ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-accent'
          )}
          type="button"
          title="Cursiva"
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn(
            "h-9 w-9 p-0",
            editor.isActive('heading', { level: 1 }) ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-accent'
          )}
          type="button"
          title="Título 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(
            "h-9 w-9 p-0",
            editor.isActive('heading', { level: 2 }) ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-accent'
          )}
          type="button"
          title="Título 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "h-9 w-9 p-0",
            editor.isActive('bulletList') ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-accent'
          )}
          type="button"
          title="Lista con viñetas"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            "h-9 w-9 p-0",
            editor.isActive('orderedList') ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-accent'
          )}
          type="button"
          title="Lista numerada"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(
            "h-9 w-9 p-0",
            editor.isActive('blockquote') ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-accent'
          )}
          type="button"
          title="Cita"
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="flex-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          type="button"
          title="Deshacer"
          className="h-9 w-9 p-0 hover:bg-accent"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          type="button"
          title="Rehacer"
          className="h-9 w-9 p-0 hover:bg-accent"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      <div className="bg-background/50 cursor-text">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
