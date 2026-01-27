import { cn } from "@/lib/utils";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from '@tiptap/markdown';
import { type Content, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { WikiLinkExtension } from "./tiptap-wikilink-extention";
import Selector from "./tiptap-wikilink-extention/selector";
import { PasteMarkdown } from "./tiptap-markdown-paste-extention/paste-markdown";
import "./rich-text-editor.css";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

const ALL_OPTIONS = [
  { id: "a", text: "Hello World, this is the first option" },
  { id: "b", text: "Second option, lol" },
  { id: "c", text: "This is the third option" },
  { id: "d", text: "The last and fourth option" },
];


export function RichTextEditor({
  value,
  onChange,
  placeholder = "",
  className,
  disabled,
  autoFocus,
}: RichTextEditorProps) {
  const elRoot = useRef<Root>(undefined);
  useEffect(() => {
    elRoot.current = undefined;
  }, []);
  const editor = useEditor({
    extensions: [
      Markdown,
      PasteMarkdown,
      StarterKit,
      Image,
      Placeholder.configure({
        placeholder,
      }),
      WikiLinkExtension.configure({
        renderSuggestionFunction: (element, text, editor, range) => {
          if (!elRoot.current) {
            elRoot.current = createRoot(element);
          }
          const selector = (<Selector
            text={text}
            options={ALL_OPTIONS}
            onSelection={({ id, text }: { id: string; text: string }) => {
              const content: Content = [
                {
                  type: "wikiLink",
                  attrs: { name: text, id: id },
                },
              ];
              return editor.chain().focus().insertContentAt(range, content).insertContent(" ").run();
            }}
          />);
          return { selector, root: elRoot.current };
        },
        onWikiLinkClick: (id, name, event) => {
          console.log({ id, name, event });
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: cn(
          "min-h-[320px] w-full border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm prose prose-sm max-w-none dark:prose-invert focus:outline-none [&_.is-editor-empty:first-child::before]:text-muted-foreground [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.is-editor-empty:first-child::before]:float-left [&_.is-editor-empty:first-child::before]:h-0 [&_.is-editor-empty:first-child::before]:pointer-events-none overflow-y-auto ",
          "[&_p]:my-1",
          className,
        ),
      },
      clipboardTextSerializer: (slice) => {
        const result = editor.storage.markdown.manager.serialize({ ...slice.toJSON(), type: 'doc' }) as string;
        return result;
      },
    },
    onUpdate: ({ editor }) => {
      const markdown = (editor).getMarkdown();
      onChange(markdown);
    },
    content: value,
    contentType: "markdown",
    editable: !disabled,
    autofocus: autoFocus,
  });

  useEffect(() => {
    if (editor && value !== (editor).getMarkdown()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return <EditorContent editor={editor} />
}
