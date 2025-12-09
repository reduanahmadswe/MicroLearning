'use client';

import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CodeBlock from '@tiptap/extension-code-block';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  ImageIcon,
  Code,
  FileCode,
  Undo,
  Redo,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false, // Disable default code block
      }),
      Underline,
      Placeholder.configure({
        placeholder: placeholder || 'Write something amazing...',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'code-block-wrapper',
        },
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const handleAddLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkModal(false);
    }
  };

  const handleAddImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setShowImageModal(false);
    }
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="bg-muted/30 border-b border-border p-2 sm:p-3 flex flex-wrap gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`hover:bg-accent hover:text-accent-foreground ${editor.isActive('heading', { level: 1 }) ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"

          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`hover:bg-accent hover:text-accent-foreground ${editor.isActive('heading', { level: 2 }) ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`hover:bg-accent hover:text-accent-foreground ${editor.isActive('heading', { level: 3 }) ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`hover:bg-accent hover:text-accent-foreground ${editor.isActive('bold') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`hover:bg-accent hover:text-accent-foreground ${editor.isActive('italic') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`hover:bg-accent hover:text-accent-foreground ${editor.isActive('underline') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`hover:bg-accent hover:text-accent-foreground ${editor.isActive('bulletList') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}


          className={`hover:bg-accent hover:text-accent-foreground ${editor.isActive('orderedList') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`hover:bg-accent hover:text-accent-foreground ${editor.isActive('code') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
          title="Inline Code"
        >
          <Code className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}


          className={`hover:bg-accent hover:text-accent-foreground ${editor.isActive('codeBlock') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
          title="Code Block"
        >
          <FileCode className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowLinkModal(true)}
          className="hover:bg-accent hover:text-accent-foreground text-muted-foreground"
          title="Add Link"
        >
          <LinkIcon className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowImageModal(true)}
          className="hover:bg-accent hover:text-accent-foreground text-muted-foreground"
          title="Add Image"
        >
          <ImageIcon className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="hover:bg-accent hover:text-accent-foreground text-muted-foreground disabled:opacity-30"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="hover:bg-accent hover:text-accent-foreground text-muted-foreground disabled:opacity-30"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className="bg-background text-foreground" />

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-popover rounded-lg p-6 w-full max-w-md shadow-xl border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Add Link</h3>
              <button
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkUrl('');
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Enter URL
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddLink();
                    }
                  }}
                  autoFocus
                  className="bg-background border-input text-foreground"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowLinkModal(false);
                    setLinkUrl('');
                  }}
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleAddLink}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Add Link
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-popover rounded-lg p-6 w-full max-w-md shadow-xl border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Add Image</h3>
              <button
                onClick={() => {
                  setShowImageModal(false);
                  setImageUrl('');
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Enter Image URL
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddImage();
                    }
                  }}
                  autoFocus
                  className="bg-background border-input text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Paste a direct link to an image
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowImageModal(false);
                    setImageUrl('');
                  }}
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleAddImage}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Add Image
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
