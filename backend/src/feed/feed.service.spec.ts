import { Test, type TestingModule } from "@nestjs/testing";
import { PaginationDto } from "@shared";
import { FollowsService } from "../follows/follows.service";
import { FeedRepository } from "./feed.repository";
import { FeedService } from "./feed.service";

describe("FeedService", () => {
  let service: FeedService;
  let feedRepository: FeedRepository;
  let followsService: FollowsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedService,
        {
          provide: FeedRepository,
          useValue: {
            findFeeds: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: FollowsService,
          useValue: {
            getFollowingIds: jest.fn().mockResolvedValue(["u-2"]),
          },
        },
      ],
    }).compile();

    service = module.get<FeedService>(FeedService);
    feedRepository = module.get<FeedRepository>(FeedRepository);
    followsService = module.get<FollowsService>(FollowsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getFeed", () => {
    it("should return paginated feeds", async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10, offset: 0 };
      const result = await service.getFeed("u-1", paginationDto);

      expect(result.data).toEqual([]);
      expect(followsService.getFollowingIds).toHaveBeenCalledWith("u-1");
      expect(feedRepository.findFeeds).toHaveBeenCalledWith(["u-2", "u-1"], 0, 10);
    });
  });
});
