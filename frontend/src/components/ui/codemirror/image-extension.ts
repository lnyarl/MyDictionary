import {
  Decoration,
  type DecorationSet,
  EditorView,
  MatchDecorator,
  ViewPlugin,
  type ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { api } from "@/lib/api";

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("files", file);

  try {
    const response = await api.post<{ urls: string[] }>("/definitions/upload-temp", formData);
    return response.urls[0];
  } catch (error) {
    console.error("Image upload failed:", error);
    throw error;
  }
}

class LoadingWidget extends WidgetType {
  toDOM() {
    const div = document.createElement("div");
    div.className =
      "inline-flex items-center justify-center bg-muted text-muted-foreground rounded px-2 py-1 text-xs gap-2";
    div.innerHTML = `
      <svg class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Uploading...
    `;
    return div;
  }
}

class ImageWidget extends WidgetType {
  constructor(
    readonly url: string,
    readonly alt: string,
    readonly width?: string,
  ) {
    super();
  }

  eq(other: ImageWidget) {
    return other.url === this.url && other.alt === this.alt && other.width === this.width;
  }

  toDOM(view: EditorView) {
    const container = document.createElement("div");
    container.className = "cm-image-widget inline-block relative group";

    const img = document.createElement("img");
    img.src = this.url;
    img.alt = this.alt;
    img.className = "max-w-full rounded-md border border-border";
    if (this.width) img.style.width = `${this.width}px`;
    else img.style.maxWidth = "100%";

    container.appendChild(img);

    if (view.state.readOnly) return container;

    const resizeHandle = document.createElement("div");
    resizeHandle.className =
      "absolute bottom-0 right-0 w-4 h-4 bg-primary cursor-se-resize rounded-tl hidden group-hover:block z-10";
    resizeHandle.onmousedown = (e) => this.startResize(e, view, img);
    container.appendChild(resizeHandle);

    return container;
  }

  startResize(event: MouseEvent, view: EditorView, img: HTMLImageElement) {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = img.offsetWidth;

    const onMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(50, startWidth + (e.clientX - startX));
      img.style.width = `${newWidth}px`;
    };

    const onMouseUp = (e: MouseEvent) => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);

      const finalWidth = Math.max(50, startWidth + (e.clientX - startX));
      this.updateWidth(view, finalWidth);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  updateWidth(view: EditorView, width: number) {
    const pos = view.posAtDOM(
      view.dom.querySelector(`img[src="${this.url}"]`)?.parentElement as HTMLElement,
    );
    if (pos === null) return;

    const newText = `<img src="${this.url}" alt="${this.alt}" width="${Math.round(width)}" />`;

    const line = view.state.doc.lineAt(pos);
    const lineText = line.text;
    const lineStart = line.from;

    const mdRegex = /!\[(.*?)\]\((.*?)\)/g;
    let match = mdRegex.exec(lineText);
    while (match !== null) {
      if (match[2] === this.url) {
        const from = lineStart + match.index;
        const to = from + match[0].length;
        view.dispatch({
          changes: { from, to, insert: newText },
        });
        return;
      }
      match = mdRegex.exec(lineText);
    }

    const htmlRegex = /<img src="(.*?)"(?: alt="(.*?)")?(?: width="(\d+)")? \/>/g;
    let htmlMatch = htmlRegex.exec(lineText);
    while (htmlMatch !== null) {
      if (htmlMatch[1] === this.url) {
        const from = lineStart + htmlMatch.index;
        const to = from + htmlMatch[0].length;
        view.dispatch({
          changes: { from, to, insert: newText },
        });
        return;
      }
      htmlMatch = htmlRegex.exec(lineText);
    }
  }
}

const loadingMatcher = new MatchDecorator({
  regexp: /!\[Uploading\.\.\.\]\((.*?)\)/g,
  decoration: () =>
    Decoration.replace({
      widget: new LoadingWidget(),
    }),
});

const loadingPlugin = ViewPlugin.fromClass(
  class {
    placeholders: DecorationSet;
    constructor(view: EditorView) {
      this.placeholders = loadingMatcher.createDeco(view);
    }
    update(update: ViewUpdate) {
      this.placeholders = loadingMatcher.updateDeco(update, this.placeholders);
    }
  },
  {
    decorations: (instance) => instance.placeholders,
    provide: (plugin) =>
      EditorView.atomicRanges.of((view) => {
        return view.plugin(plugin)?.placeholders || Decoration.none;
      }),
  },
);

const imageMatcher = new MatchDecorator({
  regexp: /!\[(.*?)\]\((.*?)\)/g,
  decoration: (match) => {
    if (match[1] === "Uploading...") return null;

    return Decoration.replace({
      widget: new ImageWidget(match[2], match[1]),
    });
  },
});

const htmlImageMatcher = new MatchDecorator({
  regexp: /<img src="(.*?)"(?: alt="(.*?)")?(?: width="(\d+)")? \/>/g,
  decoration: (match) => {
    return Decoration.replace({
      widget: new ImageWidget(match[1], match[2] || "", match[3]),
    });
  },
});

const mdImagePlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = imageMatcher.createDeco(view);
    }
    update(update: ViewUpdate) {
      if (update.docChanged) {
        this.decorations = imageMatcher.updateDeco(update, this.decorations);
      }
    }
  },
  {
    decorations: (v) => v.decorations,
    provide: (plugin) =>
      EditorView.atomicRanges.of((view) => {
        return view.plugin(plugin)?.decorations || Decoration.none;
      }),
  },
);

const htmlImagePlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = htmlImageMatcher.createDeco(view);
    }
    update(update: ViewUpdate) {
      if (update.docChanged) {
        this.decorations = htmlImageMatcher.updateDeco(update, this.decorations);
      }
    }
  },
  {
    decorations: (v) => v.decorations,
    provide: (plugin) =>
      EditorView.atomicRanges.of((view) => {
        return view.plugin(plugin)?.decorations || Decoration.none;
      }),
  },
);

const imageEventHandler = EditorView.domEventHandlers({
  paste(event, view) {
    const files = event.clipboardData?.files;
    if (files && files.length > 0) {
      const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (imageFiles.length > 0) {
        event.preventDefault();
        handleFiles(imageFiles, view);
      }
    }
  },
  drop(event, view) {
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (imageFiles.length > 0) {
        event.preventDefault();
        const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
        if (pos !== null) {
          handleFiles(imageFiles, view, pos);
        }
      }
    }
  },
});

async function handleFiles(files: File[], view: EditorView, pos?: number) {
  const insertPos = pos ?? view.state.selection.main.head;

  const changes = files.map(() => {
    const id = Math.random().toString(36).substring(7);
    return {
      from: insertPos,
      to: insertPos,
      insert: `![Uploading...](${id}) `,
    };
  });

  view.dispatch({ changes });

  files.forEach(async (file, index) => {
    const id = changes[index].insert.match(/\((.*?)\)/)?.[1];
    if (!id) return;

    try {
      const url = await uploadImage(file);
      const docString = view.state.doc.toString();
      const placeholder = `![Uploading...](${id})`;
      const idx = docString.indexOf(placeholder);

      if (idx !== -1) {
        view.dispatch({
          changes: {
            from: idx,
            to: idx + placeholder.length,
            insert: `![${file.name}](${url})`,
          },
        });
      }
    } catch (e) {
      const docString = view.state.doc.toString();
      const placeholder = `![Uploading...](${id})`;
      const idx = docString.indexOf(placeholder);
      if (idx !== -1) {
        view.dispatch({
          changes: { from: idx, to: idx + placeholder.length, insert: "" },
        });
      }
    }
  });
}

export const imageExtension = [loadingPlugin, mdImagePlugin, htmlImagePlugin, imageEventHandler];
