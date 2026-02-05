import { Term as SharedTerm, TermResponseDto } from "@stashy/shared";
export type Term = SharedTerm & { definitions?: any[] };
export { TermSelect } from "@stashy/shared";
