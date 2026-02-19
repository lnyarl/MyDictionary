import { ReportReason, ReportStatus } from "@stashy/shared";
import { AssignableAdminRole } from "@stashy/shared/dist/admin/dto/admin-user/create-admin-user.dto";

export interface SeedUserInput {
  email: string;
  nickname: string;
  profilePicture?: string;
}

export interface SeedBadgeInput {
  code: string;
  name: string;
  description: string;
  category: string;
  event_type: string;
  threshold: number;
  is_active: boolean;
}

export interface FeedTemplateInput {
  tags: string[];
  isPublic: boolean;
  opening: string;
  body: string;
  closing: string;
}

export interface ControllerSeedData {
  admin: {
    bootstrapAdmin: {
      username: string;
      password: string;
      role: AssignableAdminRole;
    };
    users: SeedUserInput[];
    badges: SeedBadgeInput[];
  };
  backend: {
    feedPerUser: number;
    termPool: string[];
    feedTemplates: FeedTemplateInput[];
    userUpdate: {
      opening: string;
      body: string;
      closing: string;
      tags: string[];
      isPublic: boolean;
    };
    reports: {
      reason: ReportReason;
      description: string;
      status: ReportStatus;
    }[];
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
      { email: "noah.kim@example.com", nickname: "noah_kim" },
      { email: "mina.lee@example.com", nickname: "mina_lee" },
      { email: "jiwon.park@example.com", nickname: "jiwon_park" },
      { email: "eunseo.choi@example.com", nickname: "eunseo_choi" },
      { email: "dohyun.han@example.com", nickname: "dohyun_han" },
    ],
    badges: [
      {
        code: "WORD_CARTOGRAPHER",
        name: "Word Cartographer",
        description: "용어 지도를 넓혀가는 사용자에게 부여됩니다.",
        category: "activity",
        event_type: "word_create",
        threshold: 20,
        is_active: true,
      },
      {
        code: "STEADY_WRITER",
        name: "Steady Writer",
        description: "꾸준히 정의를 작성한 사용자를 위한 배지입니다.",
        category: "activity",
        event_type: "definition_create",
        threshold: 30,
        is_active: true,
      },
      {
        code: "CURATION_KEEPER",
        name: "Curation Keeper",
        description: "신고 및 정리 활동에 기여한 사용자를 의미합니다.",
        category: "community",
        event_type: "report_create",
        threshold: 5,
        is_active: true,
      },
      {
        code: "SOCIAL_BRIDGE",
        name: "Social Bridge",
        description: "팔로우 네트워크를 활발하게 형성한 사용자에게 부여됩니다.",
        category: "community",
        event_type: "follow_create",
        threshold: 15,
        is_active: true,
      },
      {
        code: "CONSISTENT_LOGIN",
        name: "Consistent Login",
        description: "로그인 연속 기록을 달성한 사용자의 배지입니다.",
        category: "streak",
        event_type: "user_login_streak",
        threshold: 7,
        is_active: true,
      },
    ],
  },
  backend: {
    feedPerUser: 100,
    termPool: [
      "serendipity",
      "ephemeral",
      "ubiquitous",
      "resilience",
      "ambiguous",
      "catalyst",
      "equilibrium",
      "nostalgia",
      "meticulous",
      "paradox",
      "spectrum",
      "archive",
      "syntax",
      "semantic",
      "iterate",
      "compass",
      "topology",
      "harmony",
      "luminous",
      "solstice",
      "keystone",
      "momentum",
      "vernacular",
      "algebra",
      "algorithm",
      "ecosystem",
      "atlas",
      "inference",
      "cohesion",
      "threshold",
      "lantern",
      "odyssey",
      "harbor",
      "granular",
      "constellation",
      "narrative",
      "quantum",
      "fractal",
      "legacy",
      "continuum",
    ],
    feedTemplates: [
      {
        tags: ["language", "usage"],
        isPublic: true,
        opening:
          "일상 대화에서 이 단어를 사용할 때는 문맥을 먼저 확인하는 편이 좋습니다.",
        body: "특히 비슷한 표현과 비교하면 의미 차이가 분명해집니다. 예를 들어 공식 문서에서는 명확성을 위해 더 중립적인 표현을 고르고, 구어체에서는 감정의 뉘앙스를 살려 선택할 수 있습니다.",
        closing:
          "이런 방식으로 정리하면 학습자가 실제 상황에서 자연스럽게 적용할 수 있습니다.",
      },
      {
        tags: ["etymology", "history"],
        isPublic: true,
        opening:
          "어원 관점에서 보면 이 단어는 서로 다른 문화권을 거치며 의미가 확장되었습니다.",
        body: "초기에는 제한된 기술 용어였지만 시대가 변하면서 비유적 용법까지 포함하게 되었습니다. 문학 작품과 신문 기사에서 동시에 등장하기 시작한 시점이 전환점으로 자주 언급됩니다.",
        closing:
          "결과적으로 현대 사용례에서는 원래 의미와 확장 의미를 함께 이해해야 오해를 줄일 수 있습니다.",
      },
      {
        tags: ["study", "example"],
        isPublic: true,
        opening:
          "학습 노트 기준으로는 짧은 예문 세 개를 먼저 암기하는 전략이 효율적이었습니다.",
        body: "첫째는 기본 의미를 보여주는 단문, 둘째는 반대 맥락에서의 응용, 셋째는 전문 분야에서 쓰이는 형태를 고릅니다. 이 과정을 거치면 단어를 고립된 정보가 아니라 연결된 지식으로 기억할 수 있습니다.",
        closing:
          "복습할 때는 예문의 주어와 시제를 바꿔 재구성해보면 장기 기억에 도움이 됩니다.",
      },
      {
        tags: ["writing", "style"],
        isPublic: true,
        opening:
          "문장 스타일을 다듬을 때 이 단어는 지나치게 남용되기 쉬운 편입니다.",
        body: "강조가 필요한 문단에서는 효과적이지만 매 문장에 반복되면 리듬이 단조로워집니다. 그래서 초안 단계에서 자유롭게 쓴 뒤, 편집 단계에서 빈도를 조절하는 방식을 권장합니다.",
        closing:
          "적절한 위치에 배치하면 정보 전달력과 문장의 인상이 동시에 좋아집니다.",
      },
      {
        tags: ["culture", "interpretation"],
        isPublic: true,
        opening:
          "문화적 배경이 다른 화자 사이에서는 같은 단어라도 해석의 초점이 달라질 수 있습니다.",
        body: "어떤 집단은 이 표현을 긍정적 진취성으로 읽고, 다른 집단은 신중함이 부족한 태도로 받아들이기도 합니다. 따라서 번역이나 로컬라이징 단계에서는 단순 치환보다 맥락 분석이 선행되어야 합니다.",
        closing:
          "독자가 어떤 경험을 기반으로 읽을지 예상하고 보조 설명을 제공하면 이해도가 크게 높아집니다.",
      },
      {
        tags: ["usage", "nuance"],
        isPublic: true,
        opening:
          "비슷한 의미의 유의어 사이에서 갈등할 때는 대상과의 심리적 거리를 먼저 고려하십시오.",
        body: "공적인 관계에서는 한자어나 외래어 기반의 명확한 단어가 신뢰를 주며, 사적인 관계에서는 고유어 중심의 부드러운 표현이 정서적 공감대를 넓힙니다.",
        closing: "단어의 온도를 맞추는 것이 대화의 기술입니다.",
      },
      {
        tags: ["vocabulary", "precision"],
        isPublic: true,
        opening:
          "전문적인 글쓰기에서는 추상적인 형용사보다 구체적인 수치나 명사를 사용하는 것이 힘이 있습니다.",
        body: "'매우 많다'는 표현 대신 구체적인 빈도나 양을 지칭하는 단어를 선택하면 독자의 머릿속에 더 선명한 이미지가 그려집니다.",
        closing: "모호함을 제거하는 것이 곧 설득력의 시작입니다.",
      },
      {
        tags: ["grammar", "structure"],
        isPublic: true,
        opening:
          "문장의 주어와 서술어가 호응하지 않으면 정보의 전달력이 급격히 떨어집니다.",
        body: "문장이 길어질수록 주어를 잊기 쉬우므로, 마침표를 자주 찍어 문장을 짧게 끊어 쓰는 습관을 들이는 것이 좋습니다.",
        closing: "간결한 문장이 가장 강력한 메시지를 전달합니다.",
      },
      {
        tags: ["business", "communication"],
        isPublic: true,
        opening:
          "비즈니스 메일에서 거절의 의사를 밝힐 때는 부정어보다 대안 제시형 단어를 선택하십시오.",
        body: "'불가능하다'라는 단정적인 표현 대신 '현재로서는 어려우나 다음 분기에는 검토 가능하다'와 같은 완곡한 표현이 관계를 유지해 줍니다.",
        closing: "단어 하나가 비즈니스의 성패를 가를 수 있습니다.",
      },
      {
        tags: ["translation", "localization"],
        isPublic: true,
        opening:
          "직역이 불가능한 관용구는 그 언어권의 문화를 반영한 대체 표현을 찾아야 합니다.",
        body: "단순히 글자 그대로 옮기면 의미 왜곡이 발생하므로, 해당 표현이 목표 언어에서 어떤 상황에 쓰이는지 맥락을 먼저 분석해야 합니다.",
        closing: "번역은 언어를 바꾸는 것이 아니라 문화를 연결하는 작업입니다.",
      },
      {
        tags: ["etymology", "evolution"],
        isPublic: true,
        opening:
          "이 단어의 기원을 추적하면 과거 인류의 생활 양식을 엿볼 수 있습니다.",
        body: "과거에는 물리적인 도구를 지칭하던 단어가 현대에 들어와 추상적인 사고의 틀을 의미하게 된 과정은 언어의 생명력을 증명합니다.",
        closing: "과거를 알면 현재 사용하는 단어의 깊이가 달라집니다.",
      },
      {
        tags: ["writing", "rhythm"],
        isPublic: true,
        opening:
          "글의 리듬을 살리려면 문장의 길이를 의도적으로 조절해야 합니다.",
        body: "단문과 복문을 적절히 섞어 배치하면 독자가 글을 읽을 때 호흡 조절이 쉬워지며 지루함을 덜 느끼게 됩니다.",
        closing: "좋은 글은 눈으로 읽히는 음악과 같습니다.",
      },
      {
        tags: ["slang", "trend"],
        isPublic: true,
        opening:
          "신조어는 특정 세대의 가치관과 시대의 변화를 가장 빠르게 반영하는 지표입니다.",
        body: "공식 석상에서는 사용을 자제해야 하지만, 마케팅이나 트렌드 분석 시에는 이러한 단어들이 가진 폭발적인 전파력을 이해할 필요가 있습니다.",
        closing:
          "언어의 변화를 관찰하는 것은 사회의 흐름을 읽는 것과 같습니다.",
      },
      {
        tags: ["academic", "logic"],
        isPublic: true,
        opening:
          "학술적 텍스트에서는 주관적인 감정 표현보다 객관적인 논거를 뒷받침하는 단어를 골라야 합니다.",
        body: "'느껴진다'나 '생각된다' 보다는 '분석된다', '도출된다'와 같은 검증 가능한 서술어를 사용하는 것이 논문의 신뢰도를 높입니다.",
        closing: "용어의 정의가 명확할수록 논리는 단단해집니다.",
      },
      {
        tags: ["pronunciation", "intonation"],
        isPublic: true,
        opening:
          "외국어 학습 시 단어의 스펠링만큼이나 중요한 것이 음절의 강세입니다.",
        body: "똑같은 철자라도 강세의 위치에 따라 품사가 명사에서 동사로 바뀌는 경우가 많으므로 소리 내어 읽는 연습이 필수적입니다.",
        closing: "정확한 발음은 자신감 있는 소통의 기반이 됩니다.",
      },
    ],
    userUpdate: {
      opening: "초기 등록된 정의를 실제 사용 사례에 맞게 보완했습니다.",
      body: "문맥별 예시를 추가하고 모호했던 문장을 정리해 가독성을 개선했습니다. 또한 오해를 줄이기 위해 유사 개념과의 경계를 분명히 설명했습니다.",
      closing:
        "최신 작성 가이드 기준으로 재구성해 학습 및 검색 경험이 더 자연스럽게 이어지도록 했습니다.",
      tags: ["edited", "refined", "context"],
      isPublic: true,
    },
    reports: [
      {
        reason: ReportReason.SPAM,
        description: "반복적인 홍보 문구가 포함되어 있어 검토가 필요합니다.",
        status: ReportStatus.RESOLVED,
      },
      {
        reason: ReportReason.HARASSMENT,
        description: "특정 사용자를 겨냥한 표현이 포함되어 있어 신고합니다.",
        status: ReportStatus.REVIEWING,
      },
      {
        reason: ReportReason.MISINFORMATION,
        description: "검증되지 않은 사실이 단정적으로 서술되어 있습니다.",
        status: ReportStatus.PENDING,
      },
      {
        reason: ReportReason.INAPPROPRIATE,
        description:
          "사전 서비스 성격과 맞지 않는 표현이 다수 포함되어 있습니다.",
        status: ReportStatus.DISMISSED,
      },
      {
        reason: ReportReason.OTHER,
        description: "정의 내용과 태그의 연관성이 낮아 품질 검토를 요청합니다.",
        status: ReportStatus.RESOLVED,
      },
    ],
  },
};
