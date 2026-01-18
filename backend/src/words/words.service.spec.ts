import { Test, type TestingModule } from "@nestjs/testing";
import { WordsRepository } from "./words.repository";
import { WordsService } from "./words.service";

describe("WordsService", () => {
  let service: WordsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WordsService,
        {
          provide: WordsRepository,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<WordsService>(WordsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
