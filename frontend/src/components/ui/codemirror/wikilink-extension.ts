import type { CompletionContext, CompletionResult } from "@codemirror/autocomplete";
import {
  Decoration,
  type DecorationSet,
  EditorView,
  MatchDecorator,
  ViewPlugin,
  type ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { wordsApi } from "@/lib/words";

// --- 1. Autocomplete (Completion) ---
export const wikiLinkCompletion = async (
  context: CompletionContext,
): Promise<CompletionResult | null> => {
  // Match '[[' at the end of the word before cursor
  const word = context.matchBefore(/\[\[([^\]]*)/);
  if (!word) return null;

  if (word.from === word.to && !context.explicit) return null;

  const searchText = word.text.slice(2);

  try {
    const results = await wordsApi.autocomplete(searchText);
    const options = results.myWords.map((w) => ({
      label: w.term,
      displayLabel: w.term,
      apply: `[[${w.term}]]`,
    }));

    return {
      from: word.from,
      options: options,
      filter: false,
    };
  } catch (e) {
    console.error("Failed to fetch autocomplete suggestions", e);
    return null;
  }
};

// --- 2. Decoration (Rendering [[Link]] as a chip) ---

class WikiLinkWidget extends WidgetType {
  constructor(readonly name: string) {
    super();
  }

  eq(other: WikiLinkWidget) {
    return other.name === this.name;
  }

  toDOM() {
    const span = document.createElement("span");
    span.className = "wikilink";
    span.textContent = this.name;
    span.dataset.name = this.name;
    return span;
  }

  ignoreEvent() {
    return false;
  }
}

const wikiLinkMatcher = new MatchDecorator({
  regexp: /\[\[([^\]]+)\]\]/g,
  decoration: (match) => {
    return Decoration.replace({
      widget: new WikiLinkWidget(match[1]),
    });
  },
});

export const wikiLinkPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = wikiLinkMatcher.createDeco(view);
    }
    update(update: ViewUpdate) {
      this.decorations = wikiLinkMatcher.updateDeco(update, this.decorations);
    }
  },
  {
    decorations: (instance) => instance.decorations,
    provide: (plugin) =>
      EditorView.atomicRanges.of((view) => {
        return view.plugin(plugin)?.decorations || Decoration.none;
      }),
  },
);

// --- 3. Event Handler (Click) ---
export const wikiLinkClickHandler = (onClick: (name: string) => void) => {
  return EditorView.domEventHandlers({
    click(event, _view) {
      const target = event.target as HTMLElement;
      if (target.matches(".wikilink")) {
        const name = target.dataset.name;
        if (name) {
          event.preventDefault();
          onClick(name);
        }
      }
    },
  });
};
