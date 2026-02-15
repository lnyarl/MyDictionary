import { EditorState, StateField } from "@codemirror/state";
import { Decoration, type DecorationSet, EditorView, WidgetType } from "@codemirror/view";
import { parseQuoteBlocks, type QuoteBlockMetadata } from "@/lib/utils/quote-block";

export const QUOTE_TOGGLE_EVENT = "stashy:quote-toggle-source";

export type QuoteToggleEventDetail = {
	hostDefinitionId?: string;
	sourceDefinitionId: string;
	sourceUrl: string;
};

class QuoteWidget extends WidgetType {
	constructor(readonly metadata: QuoteBlockMetadata) {
		super();
	}

	eq(other: QuoteWidget) {
		return (
			other.metadata.definitionId === this.metadata.definitionId &&
			other.metadata.sourceUrl === this.metadata.sourceUrl
		);
	}

	toDOM() {
		const container = document.createElement("div");
		container.className = "quote-block-widget";

		const actionRow = document.createElement("div");
		actionRow.className = "quote-block-widget__actions";

		const connectButton = document.createElement("a");
		connectButton.href = this.metadata.sourceUrl;
		connectButton.className = "quote-block-widget__button";
		connectButton.textContent = "인용 원문 연결";

		connectButton.addEventListener("click", (event) => {
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

		actionRow.append(connectButton);
		container.append(actionRow);
		return container;
	}

	ignoreEvent(event: Event) {
		const target = event.target;
		if (!(target instanceof HTMLElement)) {
			return false;
		}

		if (event.type === "click" && target.closest(".quote-block-widget__button")) {
			return true;
		}

		return false;
	}
}

function buildQuoteDecorations(state: EditorState): DecorationSet {
	const blocks = parseQuoteBlocks(state.doc.toString());
	if (blocks.length === 0) {
		return Decoration.none;
	}

	const decorations = blocks.map((block) => {
		return Decoration.replace({
			widget: new QuoteWidget(block.metadata),
			block: true,
		}).range(block.from, block.to);
	});

	return Decoration.set(decorations, true);
}

const quoteDecorationField = StateField.define<DecorationSet>({
	create(state) {
		return buildQuoteDecorations(state);
	},
	update(decorations, transaction) {
		if (!transaction.docChanged) {
			return decorations;
		}
		return buildQuoteDecorations(transaction.state);
	},
	provide: (field) => [
		EditorView.decorations.from(field),
	],
});

export const quoteBlockPlugin = [quoteDecorationField];
