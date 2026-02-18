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
