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
	quoteText: string;
	from: number;
	to: number;
};

const QUOTE_BLOCK_REGEX = /:::quote\s+(\{[^\n]+\})\n([\s\S]*?)\n:::/g;

export function createQuoteBlock(metadata: QuoteBlockMetadata, quoteText: string): string {
	const normalizedText = quoteText.trim();
	return `:::quote ${JSON.stringify(metadata)}\n${normalizedText}\n:::`;
}

export function parseQuoteBlocks(content: string): ParsedQuoteBlock[] {
	const blocks: ParsedQuoteBlock[] = [];
	for (const match of content.matchAll(QUOTE_BLOCK_REGEX)) {
		const [fullMatch, metadataJson, quoteText] = match;
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
				quoteText: quoteText.trim(),
				from,
				to,
			});
		} catch {
		}
	}

	return blocks;
}
