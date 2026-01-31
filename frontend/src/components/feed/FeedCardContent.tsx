import { Markdown } from "@tiptap/markdown";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

interface FeedCardContentProps {
  content: string;
  className?: string;
}

export function FeedCardContent({ content, className }: FeedCardContentProps) {
  const editor = useEditor({
    extensions: [StarterKit, Markdown],
    content,
    editable: false,
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return <EditorContent editor={editor} className={className} />;
}
