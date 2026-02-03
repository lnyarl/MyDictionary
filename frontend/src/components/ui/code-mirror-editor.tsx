import {
  acceptCompletion,
  autocompletion,
  completionKeymap,
  completionStatus,
} from "@codemirror/autocomplete";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentLess,
  indentMore,
} from "@codemirror/commands";
import { Compartment, EditorState } from "@codemirror/state";
import {
  drawSelection,
  dropCursor,
  EditorView,
  keymap,
  placeholder as placeholderExt,
} from "@codemirror/view";
import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  wikiLinkClickHandler,
  wikiLinkCompletion,
  wikiLinkPlugin,
} from "./codemirror/wikilink-extension";
import "./codemirror/styles.css";
import { imageExtension } from "./codemirror/image-extension";
import { saveExtension } from "./codemirror/save-extension";

type CodeMirrorEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
};

export function CodeMirrorEditor({
  value,
  onChange,
  onKeyDown,
  placeholder = "",
  className,
  disabled,
  autoFocus,
}: CodeMirrorEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView>(null);
  const navigate = useNavigate();

  const editableCompartment = useMemo(() => new Compartment(), []);
  const placeholderCompartment = useMemo(() => new Compartment(), []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!editorRef.current) return;

    const startState = EditorState.create({
      doc: value,
      extensions: [
        EditorView.contentAttributes.of({ class: "cm-lineWrapping" }),
        drawSelection(),
        dropCursor(),
        autocompletion({
          override: [wikiLinkCompletion],
          defaultKeymap: true,
          maxRenderedOptions: 10,
        }),
        history({
          // 한글자씩 undo 되도록 하기 위해서 false를 리턴한다
          joinToEvent: () => {
            return false;
          },
        }),
        // closeBrackets(),
        wikiLinkPlugin,
        wikiLinkClickHandler((name) => {
          navigate(`/word/${name}`);
        }),
        editableCompartment.of(EditorView.editable.of(!disabled)),
        placeholderCompartment.of(placeholderExt(placeholder)),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        }),
        saveExtension,
        imageExtension,
        keymap.of([
          ...defaultKeymap,
          ...completionKeymap,
          ...historyKeymap,
          {
            key: "Tab",
            preventDefault: true,
            shift: indentLess,
            run: (e) => {
              if (!completionStatus(e.state)) return indentMore(e);
              return acceptCompletion(e);
            },
          },
        ]),
        EditorView.domEventHandlers({
          keydown: (e) => {
            if (onKeyDown) {
              onKeyDown(e as unknown as React.KeyboardEvent);
            }
          },
        }),
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    viewRef.current = view;

    if (autoFocus) {
      view.focus();
    }

    return () => {
      view.destroy();
    };
  }, []);

  return (
    <div
      ref={editorRef}
      className={cn(
        "min-h-80 flex w-full border border-input bg-transparent px-3 py-2 text-base disabled:cursor-not-allowed md:text-sm overflow-y-auto",
        className,
      )}
    />
  );
}
