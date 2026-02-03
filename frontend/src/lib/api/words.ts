import { api } from "./api";
import type { Definition } from "./definitions";

export type Word = {
  id: string;
  term: string;
  userId: string;
  definitions?: Definition[];
  createdAt: string;
  updatedAt: string;
};

export type UpdateWordInput = {
  term: string;
};

export const wordsApi = {
  async getAll(): Promise<Word[]> {
    return api.get<Word[]>("/words");
  },

  async getOne(id: string): Promise<Word> {
    return api.get<Word>(`/words/${id}`);
  },

  async search(term: string): Promise<{ data: Word[] }> {
    return api.get<{ data: Word[] }>(`/words/search?term=${term}&limit=5`);
  },

  async autocomplete(term: string): Promise<{ myWords: Word[]; othersWords: Word[] }> {
    return api.get<{ myWords: Word[]; othersWords: Word[] }>(`/words/autocomplete?term=${term}`);
  },
};
