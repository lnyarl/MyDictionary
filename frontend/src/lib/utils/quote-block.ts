export type QuoteBlockMetadata = {
	definitionId: string;
	term: string;
	sourceUrl: string;
	startOffset: number;
	endOffset: number;
};

export type ParsedQuoteBlock = {
	fullMatch: string;
	metadata: QuoteBlockMetadata;
	from: number;
	to: number;
};

export const QUOTE_SOURCE_MARKER_REGEX = /\[_\[quote-source:(\{[^\n]+\})\]_\]/;

function toMarkdownBlockquote(text: string): string {
	return text
		.trim()
		.split("\n")
		.map((line) => `> ${line}`)
		.join("\n");
}

export function createQuoteBlock(metadata: QuoteBlockMetadata, quoteText: string): string {
	const quotedText = toMarkdownBlockquote(quoteText);
	return `${quotedText}\n[_[quote-source:${JSON.stringify(metadata)}]_]`;
}

export function parseQuoteBlocks(content: string): ParsedQuoteBlock[] {
	const blocks: ParsedQuoteBlock[] = [];
	for (const match of content.matchAll(QUOTE_SOURCE_MARKER_REGEX)) {
		const [fullMatch, metadataJson] = match;
		const from = match.index ?? 0;
		const to = from + fullMatch.length;

		try {
			const parsed = JSON.parse(metadataJson) as QuoteBlockMetadata;
			if (!parsed.definitionId || !parsed.sourceUrl || !parsed.term) {
				continue;
			}
			blocks.push({
				fullMatch,
				metadata: parsed,
				from,
				to,
			});
		} catch {
		}
	}

	return blocks;
}
