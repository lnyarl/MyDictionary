export type Term = {
  id: string;
  text: string;
  number: number;
  createdAt: Date;
  updatedAt: Date;
};

export const TermSelect = {
  id: "terms.id",
  text: "terms.text",
  number: "terms.number",
  createdAt: "terms.created_at",
} as const;
