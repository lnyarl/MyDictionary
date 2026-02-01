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
            if (editor.markdown) {
              const json = editor.markdown.parse(text);
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
