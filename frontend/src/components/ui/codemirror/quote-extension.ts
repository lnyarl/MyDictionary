import { EditorState, RangeSetBuilder, StateField } from "@codemirror/state";
import { Decoration, type DecorationSet, EditorView, WidgetType } from "@codemirror/view";
import { parseQuoteBlocks, type QuoteBlockMetadata } from "@/lib/utils/quote-block";

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
		button.textContent = "인용 원문 연결";

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

	ignoreEvent(event: Event) {
		const target = event.target;
		if (!(target instanceof HTMLElement)) {
			return false;
		}
		return event.type === "click" && !!target.closest(".quote-block-widget__button");
	}
}

function isQuoteLine(text: string): boolean {
	return /^\s*>/.test(text);
}

function addQuoteLineDecorations(
	builder: RangeSetBuilder<Decoration>,
	state: EditorState,
	markerFrom: number,
) {
	const markerLine = state.doc.lineAt(markerFrom);
	let lineNumber = markerLine.number - 1;
	const quoteLines: number[] = [];

	while (lineNumber >= 1) {
		const line = state.doc.line(lineNumber);
		if (!isQuoteLine(line.text)) {
			break;
		}
		quoteLines.push(line.from);
		lineNumber -= 1;
	}

	for (const lineFrom of quoteLines.reverse()) {
		builder.add(lineFrom, lineFrom, Decoration.line({ class: "quote-block-line" }));
	}
}

function buildQuoteDecorations(state: EditorState): DecorationSet {
	const blocks = parseQuoteBlocks(state.doc.toString());
	if (blocks.length === 0) {
		return Decoration.none;
	}

	const builder = new RangeSetBuilder<Decoration>();
	for (const block of blocks) {
		addQuoteLineDecorations(builder, state, block.from);
		builder.add(
			block.from,
			block.to,
			Decoration.replace({
				widget: new QuoteSourceButtonWidget(block.metadata),
				block: true,
			}),
		);
	}

	return builder.finish();
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
	provide: (field) => [EditorView.decorations.from(field)],
});

export const quoteBlockPlugin = [quoteDecorationField];
