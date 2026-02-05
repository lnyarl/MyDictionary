import { Definition } from "../../entities/definition.entity";
import { Term } from "../../entities/term.entity";

export class TermResponseDto {
  id: string;
  term: string;
  number: number;
  createdAt: Date;
  definitions?: Definition[];

  constructor(term: Term & { definitions?: Definition[] }) {
    this.id = term.id;
    this.term = term.text;
    this.number = term.number;
    this.createdAt = term.createdAt;
    this.definitions = term.definitions;
  }
}
