import { Test, type TestingModule } from "@nestjs/testing";
import { DefinitionsService } from "../definitions/definitions.service";
import { WordsController } from "./words.controller";
import { WordsService } from "./words.service";

describe("WordsController", () => {
  let controller: WordsController;
  let _wordsService: WordsService;

  const mockUser = { id: "u-1" };
  const mockWord = { id: "w-1", term: "test" };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WordsController],
      providers: [
        {
          provide: WordsService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockWord),
            findAllByUser: jest.fn().mockResolvedValue([mockWord]),
            search: jest.fn().mockResolvedValue({ data: [mockWord], meta: {} }),
            findOne: jest.fn().mockResolvedValue(mockWord),
            update: jest.fn().mockResolvedValue(mockWord),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: DefinitionsService,
          useValue: {
            findAllByWord: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    controller = module.get<WordsController>(WordsController);
    _wordsService = module.get<WordsService>(WordsService);
  });

  it("should create a word", async () => {
    const result = await controller.create(mockUser as any, { term: "test" });
    expect(result).toEqual(mockWord);
  });

  it("should find all words for user", async () => {
    const result = await controller.findAll(mockUser as any);
    expect(result).toEqual([mockWord]);
  });

  it("should search for words", async () => {
    const result = await controller.search({ term: "test" } as any);
    expect(result.data).toEqual([mockWord]);
  });
});
