import { Plugin } from "@tiptap/pm/state";
import { Extension } from "@tiptap/react";

export const PasteMarkdown = Extension.create({
  name: "pasteMarkdown",

  addProseMirrorPlugins() {
    const { editor } = this;
    return [
      new Plugin({
        props: {
          handlePaste(_view, event, _slice) {
            const text = event.clipboardData?.getData("text/plain");

            if (!text) {
              return false;
            }

            // Check if text looks like Markdown
            if (editor.markdown && looksLikeMarkdown(text)) {
              //   const { state, dispatch } = view;
              // Parse the Markdown text to Tiptap JSON using the Markdown manager
              const json = editor.markdown.parse(text);

              // Insert the parsed JSON content at cursor position
              editor.commands.insertContent(json);
              return true;
            }

            return false;
          },
        },
      }),
    ];
  },
});

function looksLikeMarkdown(text: string): boolean {
  // Simple heuristic: check for Markdown syntax
  return (
    /^#{1,6}\s/.test(text) || // Headings
    /\*\*[^*]+\*\*/.test(text) || // Bold
    /\[.+\]\(.+\)/.test(text) || // Links
    /^[-*+]\s/.test(text)
  ); // Lists
}
