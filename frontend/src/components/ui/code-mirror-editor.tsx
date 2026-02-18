import { cn } from "@/lib/utils";
import {
  acceptCompletion,
  autocompletion,
  completionKeymap,
  completionStatus,
} from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { Compartment, EditorState, type SelectionRange } from "@codemirror/state";
import {
  drawSelection,
  dropCursor,
  EditorView,
  keymap,
  placeholder as placeholderExt,
} from "@codemirror/view";
import { type RefObject, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { imageExtension } from "./codemirror/image-extension";
import { quoteBlockPlugin } from "./codemirror/quote-extension";
import "./codemirror/styles.css";
import {
  wikiLinkClickHandler,
  wikiLinkCompletion,
  wikiLinkPlugin,
} from "./codemirror/wikilink-extension";

type CodeMirrorEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onMouseUp?: (e: React.MouseEvent, view: EditorView) => void;
  onSelectionChange?: (range: SelectionRange, view: EditorView) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  ref?: RefObject<EditorView | null>;
};

export function CodeMirrorEditor({
  value,
  onChange,
  onKeyDown,
  onMouseUp,
  onSelectionChange,
  placeholder = "",
  className,
  disabled,
  autoFocus,
  ref,
}: CodeMirrorEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView>(null);
  const navigate = useNavigate();

  const editableCompartment = useMemo(() => new Compartment(), []);
  const placeholderCompartment = useMemo(() => new Compartment(), []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!editorRef.current) return;
    const selectionListener = EditorView.updateListener.of((update) => {
      // 선택 영역이 변경되었는지 확인
      if (onSelectionChange) {
        if (update.selectionSet) {
          const selection = update.state.selection;
          const mainRange = selection.main; // 가장 최근/주요 선택 영역
          onSelectionChange(mainRange, update.view);
        }
      }
    });
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
        quoteBlockPlugin,
        wikiLinkPlugin,
        // quoteExtension,
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
        imageExtension,
        keymap.of([
          ...defaultKeymap,
          ...completionKeymap,
          ...historyKeymap,
          {
            key: "Tab",
            preventDefault: false,
            run: (e) => {
              if (!completionStatus(e.state)) false;
              return acceptCompletion(e);
            },
          },
        ]),
        selectionListener,
        EditorView.domEventHandlers({
          keydown: (e) => {
            if (onKeyDown) {
              onKeyDown(e as unknown as React.KeyboardEvent);
            }
          },
          mouseup: (e, view) => {
            if (onMouseUp) {
              onMouseUp(e as unknown as React.MouseEvent, view);
            }
          },
        }),
        EditorView.theme({
          ".cm-cursor": {
            borderLeftWidth: "1px",
            height: "1.2em",
          },
        }),
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    viewRef.current = view;
    if (ref) {
      ref.current = view;
    }

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
        "min-h-80 flex w-full border border-input bg-transparent disabled:cursor-not-allowed text-sm overflow-y-auto",
        className,
      )}
    />
  );
}
