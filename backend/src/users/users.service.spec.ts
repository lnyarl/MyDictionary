import { Test, type TestingModule } from "@nestjs/testing";
import { DefinitionsRepository } from "../definitions/definitions.repository";
import { FollowsService } from "../follows/follows.service";
import { WordsRepository } from "../words/words.repository";
import { UsersRepository } from "./users.repository";
import { UsersService } from "./users.service";

describe("UsersService", () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: {} },
        { provide: WordsRepository, useValue: {} },
        { provide: DefinitionsRepository, useValue: {} },
        { provide: FollowsService, useValue: {} },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
