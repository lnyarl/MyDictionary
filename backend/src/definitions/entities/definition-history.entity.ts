export type DefinitionHistory = {
  id: string;
  definitionId: string;
  content: string;
  tags: string[];
  mediaUrls: any[];
  createdAt: Date;
};

export const DefinitionHistorySelect = {
  id: "id",
  definitionId: "definition_id",
  content: "content",
  tags: "tags",
  mediaUrls: "media_urls",
  createdAt: "created_at",
} as const;
