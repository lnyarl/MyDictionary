import { EditorState, StateField } from "@codemirror/state";
import { Decoration, type DecorationSet, EditorView, WidgetType } from "@codemirror/view";
import { definitionsApi } from "@/lib/api/definitions";
import { parseQuoteBlocks, type QuoteBlockMetadata } from "@/lib/utils/quote-block";

class QuoteWidget extends WidgetType {
	constructor(
		readonly metadata: QuoteBlockMetadata,
		readonly quoteText: string,
	) {
		super();
	}

	eq(other: QuoteWidget) {
		return (
			other.metadata.definitionId === this.metadata.definitionId &&
			other.quoteText === this.quoteText &&
			other.metadata.sourceUrl === this.metadata.sourceUrl
		);
	}

	toDOM() {
		const container = document.createElement("div");
		container.className = "quote-block-widget";

		const quoteContent = document.createElement("blockquote");
		quoteContent.className = "quote-block-widget__content";
		quoteContent.textContent = this.quoteText;

		const info = document.createElement("p");
		info.className = "quote-block-widget__info";
		info.textContent = `인용: ${this.metadata.term} (${this.metadata.startOffset}-${this.metadata.endOffset})`;

		const actionRow = document.createElement("div");
		actionRow.className = "quote-block-widget__actions";

		const goToSourceButton = document.createElement("button");
		goToSourceButton.type = "button";
		goToSourceButton.className = "quote-block-widget__button";
		goToSourceButton.textContent = "원문 보기";
		goToSourceButton.addEventListener("click", () => {
			window.location.href = this.metadata.sourceUrl;
		});

		const openThreadButton = document.createElement("button");
		openThreadButton.type = "button";
		openThreadButton.className = "quote-block-widget__button";
		openThreadButton.textContent = "인용 원문 연결";

		const linkedContent = document.createElement("div");
		linkedContent.className = "quote-block-widget__linked hidden";

		openThreadButton.addEventListener("click", async () => {
			if (!linkedContent.classList.contains("hidden")) {
				linkedContent.classList.add("hidden");
				openThreadButton.textContent = "인용 원문 연결";
				return;
			}

			if (!linkedContent.dataset.loaded) {
				linkedContent.textContent = "원문 불러오는 중...";
				try {
					const sourceDefinition = await definitionsApi.getById(this.metadata.definitionId);
					linkedContent.innerHTML = "";

					const linkedTerm = document.createElement("a");
					linkedTerm.href = this.metadata.sourceUrl;
					linkedTerm.className = "quote-block-widget__linked-title";
					linkedTerm.textContent = `${sourceDefinition.term} 원문으로 이동`;

					const linkedText = document.createElement("p");
					linkedText.className = "quote-block-widget__linked-content";
					linkedText.textContent = sourceDefinition.content;

					linkedContent.append(linkedTerm, linkedText);
					linkedContent.dataset.loaded = "true";
				} catch {
					linkedContent.textContent = "원문을 불러오지 못했습니다.";
				}
			}

			linkedContent.classList.remove("hidden");
			openThreadButton.textContent = "원문 접기";
		});

		actionRow.append(goToSourceButton, openThreadButton);
		container.append(quoteContent, info, actionRow, linkedContent);
		return container;
	}

	ignoreEvent() {
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
			widget: new QuoteWidget(block.metadata, block.quoteText),
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
		EditorView.atomicRanges.from(field),
	],
});

export const quoteBlockPlugin = [quoteDecorationField];
