import { EditorView } from "@codemirror/view";
import { setItem } from "@/lib/localStorage";

export const STORAGE_KEY = "word-save";
export const saveExtension = EditorView.updateListener.of((update) => {
  if (update.docChanged) {
    const content = update.state.doc.toString();
    setItem(STORAGE_KEY, content);
  }
});
