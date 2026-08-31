'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect, useMemo, useState } from 'react';
import { createFullExtensions, createInlineExtensions } from '@/lib/tiptapExtensions';
import { htmlToMarkdown, markdownToHtml } from '@/lib/markdown';
import styles from './RichTextEditor.module.css';

type Props = {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  minHeight?: number;
  /** inline = bold/italic/link only (for short fields like subtitles). */
  toolbar?: 'full' | 'inline';
};

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.toolbarButton}${active ? ` ${styles.toolbarButtonActive}` : ''}`}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      aria-pressed={active}
      title={label}
    >
      {label}
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write content…',
  readOnly = false,
  minHeight = 200,
  toolbar = 'full',
}: Props) {
  const [, setToolbarTick] = useState(0);

  const extensions = useMemo(
    () =>
      toolbar === 'inline'
        ? createInlineExtensions(placeholder)
        : createFullExtensions(placeholder),
    [placeholder, toolbar]
  );

  const editor = useEditor(
    {
      immediatelyRender: false,
      shouldRerenderOnTransaction: true,
      extensions,
      content: markdownToHtml(value),
      editable: !readOnly,
      onUpdate: ({ editor: ed }) => {
        onChange(htmlToMarkdown(ed.getHTML()));
      },
    },
    []
  );

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!readOnly);
  }, [editor, readOnly]);

  useEffect(() => {
    if (!editor) return;
    const refreshToolbar = () => setToolbarTick((tick) => tick + 1);
    editor.on('selectionUpdate', refreshToolbar);
    editor.on('transaction', refreshToolbar);
    return () => {
      editor.off('selectionUpdate', refreshToolbar);
      editor.off('transaction', refreshToolbar);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const current = htmlToMarkdown(editor.getHTML());
    if (current !== value) {
      editor.commands.setContent(markdownToHtml(value), { emitUpdate: false });
    }
  }, [editor, value]);

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Enter link URL', previous ?? 'https://');
    if (url === null) return;
    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  }

  function insertCallout(variant: 'tip' | 'warning') {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'blockquote',
        attrs: { 'data-callout': variant },
        content: [{ type: 'paragraph' }],
      })
      .run();
  }

  if (!editor) {
    return (
      <div
        className={styles.wrap}
        style={{ ['--editor-min-height' as string]: `${minHeight}px` }}
      >
        <div className={styles.editor}>Loading editor…</div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.wrap}${readOnly ? ` ${styles.readOnly}` : ''}`}
      style={{ ['--editor-min-height' as string]: `${minHeight}px` }}
    >
      {!readOnly ? (
        <div className={styles.toolbar} role="toolbar" aria-label="Text formatting">
          <ToolbarButton
            label="B"
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <ToolbarButton
            label="I"
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          {toolbar === 'full' ? (
            <>
              <span className={styles.divider} aria-hidden />
              <ToolbarButton
                label="H2"
                active={editor.isActive('heading', { level: 2 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              />
              <ToolbarButton
                label="H3"
                active={editor.isActive('heading', { level: 3 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              />
              <span className={styles.divider} aria-hidden />
              <ToolbarButton
                label="• List"
                active={editor.isActive('bulletList')}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
              />
              <ToolbarButton
                label="1. List"
                active={editor.isActive('orderedList')}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
              />
            </>
          ) : null}
          <span className={styles.divider} aria-hidden />
          <ToolbarButton
            label="Link"
            active={editor.isActive('link')}
            onClick={setLink}
          />
          {toolbar === 'full' ? (
            <>
              <span className={styles.divider} aria-hidden />
              <ToolbarButton
                label="Tip"
                active={editor.isActive('blockquote', { 'data-callout': 'tip' })}
                onClick={() => insertCallout('tip')}
              />
              <ToolbarButton
                label="Warning"
                active={editor.isActive('blockquote', { 'data-callout': 'warning' })}
                onClick={() => insertCallout('warning')}
              />
            </>
          ) : null}
        </div>
      ) : null}
      <EditorContent editor={editor} className={styles.editor} />
    </div>
  );
}
