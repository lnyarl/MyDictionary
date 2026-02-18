import { type EditorState, RangeSetBuilder, StateField } from "@codemirror/state";
import { Decoration, type DecorationSet, EditorView, WidgetType } from "@codemirror/view";
import { QUOTE_SOURCE_MARKER_REGEX, type QuoteBlockMetadata } from "@/lib/utils/quote-block";
import i18n from "@/lib/i18n";

export const QUOTE_TOGGLE_EVENT = "stashy:quote-toggle-source";

export type QuoteToggleEventDetail = {
  hostDefinitionId?: string;
  sourceDefinitionId: string;
  sourceUrl: string;
};

class QuoteSourceButtonWidget extends WidgetType {
  constructor(readonly metadata: QuoteBlockMetadata) {
    super();
  }

  eq(other: QuoteSourceButtonWidget) {
    return (
      other.metadata.definitionId === this.metadata.definitionId &&
      other.metadata.sourceUrl === this.metadata.sourceUrl
    );
  }

  toDOM() {
    const container = document.createElement("div");
    container.className = "quote-block-widget";

    const button = document.createElement("a");
    button.href = this.metadata.sourceUrl;
    button.className = "quote-block-widget__button";
    button.textContent = i18n.t("feed.quotation.source");

    button.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
        return;
      }
      event.preventDefault();
      const hostDefinitionId =
        container.closest("[data-definition-id]")?.getAttribute("data-definition-id") ?? undefined;
      document.dispatchEvent(
        new CustomEvent<QuoteToggleEventDetail>(QUOTE_TOGGLE_EVENT, {
          detail: {
            hostDefinitionId,
            sourceDefinitionId: this.metadata.definitionId,
            sourceUrl: this.metadata.sourceUrl,
          },
        }),
      );
    });

    container.append(button);
    return container;
  }

  ignoreEvent(_event: Event): boolean {
    return false;
  }
}

class JustAccessory extends WidgetType {
  toDOM() {
    const container = document.createElement("span");
    container.className = "quote-indent";
    return container;
  }

  ignoreEvent(_event: Event): boolean {
    return false;
  }
}

function addQuoteLineDecorations(state: EditorState) {
  const builder = new RangeSetBuilder<Decoration>();
  const maxLine = state.doc.lines;
  for (let i = 0; i < maxLine; i++) {
    const line = state.doc.line(i + 1);
    const quotaMatch = line.text.match(/^(> )+/);
    const sourceMatch = line.text.match(QUOTE_SOURCE_MARKER_REGEX);
    if (quotaMatch) {
      const level = quotaMatch[0].length / 2;
      builder.add(
        line.from,
        line.from,
        Decoration.line({
          attributes: {
            class: "cm-quote-line",
            style: `
                    background-color: rgba(0, 123, 255, ${Math.min(level * 0.05, 0.15)});
                    `,
          },
        }),
      );
      for (let i = 0; i < level; i++) {
        builder.add(
          line.from + i * 2,
          line.from + (i * 2) + 2 ,
          Decoration.replace({
            attributes: {
              style: `
                    padding-left: ${i * 12}px;
                    border-left: 4px solid #007bff;
                    `,
            },

            widget: new JustAccessory(),
          }),
        );
      }
    }
    if (sourceMatch) {
      try {
        builder.add(
          line.from + (sourceMatch.index ?? 0),
          line.from + (sourceMatch.index ?? 0) + sourceMatch[0].length,
          Decoration.replace({
            widget: new QuoteSourceButtonWidget(JSON.parse(sourceMatch[1])),
          }),
        );
      } catch {}
    }
  }
  return builder.finish();
}

const quoteDecorationField = StateField.define<DecorationSet>({
  create(state) {
    return addQuoteLineDecorations(state);
  },
  update(decorations, transaction) {
    if (!transaction.docChanged) {
      return decorations;
    }
    return addQuoteLineDecorations(transaction.state);
  },
  provide: (field) => [EditorView.decorations.from(field)],
});

const quoteTheme = EditorView.baseTheme({
  ".cm-quote-line": {
    display: "flex",
    margin: "0",
    transition: "border-left 0.2s, background-color 0.2s",
    lineHeight: "1.7rem",
  },
  ".cm-line": {
    paddingLeft: "0px",
  },
  ".cm-widgetBuffer": {
    display: "none",
  },
  ".quote-indent": {
    borderLeft: "3px solid #729fcf",
    paddingRight: "12px",
  },
  ".cm-hidden-marker": {
    display: "inline-block",
    width: "0",
    height: "0",
    fontSize: "0",
    opacity: "0",
    overflow: "hidden",
    pointerEvents: "none",
    verticalAlign: "top",
  },
});

export const quoteBlockPlugin = [quoteDecorationField, quoteTheme];
