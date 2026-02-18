export interface SeedUserInput {
  email: string;
  nickname: string;
  profilePicture?: string;
}

export interface SeedFeedInput {
  term: string;
  definition: {
    content: string;
    tags: string[];
    isPublic: boolean;
  };
}

export interface ControllerSeedData {
  admin: {
    bootstrapAdmin: {
      username: string;
      password: string;
      role: "developer" | "operator";
    };
    users: SeedUserInput[];
    badge: {
      code: string;
      name: string;
      description: string;
      category: string;
      event_type: string;
      threshold: number;
      is_active: boolean;
    };
  };
  backend: {
    feeds: SeedFeedInput[];
    definitionUpdate: {
      content: string;
      tags: string[];
      isPublic: boolean;
    };
    report: {
      reason:
        | "SPAM"
        | "HARASSMENT"
        | "HATE_SPEECH"
        | "MISINFORMATION"
        | "INAPPROPRIATE"
        | "OTHER";
      description: string;
    };
  };
}

export const controllerSeedData: ControllerSeedData = {
  admin: {
    bootstrapAdmin: {
      username: "seed_admin",
      password: "SeedPassw0rd!",
      role: "developer",
    },
    users: [
      {
        email: "seed-user1@example.com",
        nickname: "seed_user_1",
      },
      {
        email: "seed-user2@example.com",
        nickname: "seed_user_2",
      },
      {
        email: "seed-user3@example.com",
        nickname: "seed_user_3",
      },
    ],
    badge: {
      code: "SEED_WORD_MASTER",
      name: "Seed Word Master",
      description: "Created during controller-based seeding",
      category: "activity",
      event_type: "word_create",
      threshold: 1,
      is_active: true,
    },
  },
  backend: {
    feeds: [
      {
        term: "controller-seed-term-1",
        definition: {
          content: "첫 번째 컨트롤러 기반 시드 정의입니다.",
          tags: ["seed", "controller"],
          isPublic: true,
        },
      },
      {
        term: "controller-seed-term-2",
        definition: {
          content: "두 번째 컨트롤러 기반 시드 정의입니다.",
          tags: ["seed", "e2e"],
          isPublic: true,
        },
      },
    ],
    definitionUpdate: {
      content: "컨트롤러 시드에서 업데이트된 정의 본문입니다.",
      tags: ["seed", "updated"],
      isPublic: true,
    },
    report: {
      reason: "SPAM",
      description: "controller seed validation report",
    },
  },
};
