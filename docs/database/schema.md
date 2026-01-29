# 데이터베이스 설계 및 마이그레이션 전략

## 개요

Stashy 애플리케이션은 Knex.js SQL 쿼리 빌더를 통해 관리되는 PostgreSQL 관계형 데이터베이스를 주 데이터 저장소로 활용합니다. 데이터베이스 스키마는 핵심 사전 기능, 사용자 관리, 소셜 상호 작용, 알림 및 관리 작업을 지원하도록 설계되었습니다. 스키마 변경 사항을 관리하기 위한 강력한 SQL 기반 마이그레이션 전략이 마련되어 있으며, 향상된 개발 안전성을 위한 자동 TypeScript 타입 생성 기능으로 보완됩니다.

## 기술 스택

-   **데이터베이스**: PostgreSQL
-   **쿼리 빌더**: Knex.js
-   **캐싱/세션**: Redis (비영구 데이터, 속도 제한 및 세션용)
-   **마이그레이션 도구**: SQL 마이그레이션을 위해 `docker exec`를 활용하는 사용자 정의 Node.js 스크립트.

## 데이터베이스 스키마 설계

데이터베이스 스키마는 `backend/migrations/000_init.sql`부터 시작하는 SQL 마이그레이션 파일에 정의됩니다. 주요 테이블과 관계는 다음과 같습니다:

### 핵심 엔티티:

1.  **`users`**
    -   **목적**: 인증 식별자를 포함한 사용자 프로필을 저장합니다.
    -   **필드**: `id` (UUID, PK), `google_id` (VARCHAR, 고유, nullable - Google OAuth 사용자용), `email` (VARCHAR, 고유, NOT NULL), `nickname` (VARCHAR, 고유, NOT NULL), `profile_picture` (VARCHAR), `bio` (TEXT), `suspended_at` (TIMESTAMP).
    -   **타임스탬프**: `created_at`, `updated_at`, `deleted_at` (소프트 삭제).
    -   **인덱스**: `google_id`, `email`, `nickname`에 대한 고유 인덱스. `deleted_at`, `email` (삭제되지 않은 경우), `google_id` (삭제되지 않은 경우)에 대한 Btree 인덱스.
    -   **`deleted_at`를 사용하는 이유**: 기록 데이터를 보존하고 잠재적인 복구를 허용하여 영구적인 데이터 손실을 방지하기 위해 소프트 삭제를 구현합니다.

2.  **`words`**
    -   **목적**: 사용자가 정의하는 용어/단어를 저장합니다.
    -   **필드**: `id` (UUID, PK), `term` (VARCHAR, NOT NULL), `user_id` (UUID, `users`에 대한 FK).
    -   **타임스탬프**: `created_at`, `updated_at`, `deleted_at` (소프트 삭제).
    -   **인덱스**: `user_id`, `term`, `created_at` (DESC), `deleted_at`에 대한 Btree 인덱스. 효율적인 퍼지 검색을 위해 `pg_trgm`을 사용하는 `term`에 대한 GIN 인덱스.
    -   **`pg_trgm`를 사용하는 이유**: 단어 용어에 대한 빠르고 유연한 전체 텍스트 검색 기능을 활성화하여 사용자 검색 경험을 향상시킵니다.

3.  **`definitions`**
    -   **목적**: `words`에 대한 사용자가 기여한 정의를 저장합니다.
    -   **필드**: `id` (UUID, PK), `content` (TEXT, NOT NULL, 최대 5000자), `word_id` (UUID, `words`에 대한 FK), `user_id` (UUID, `users`에 대한 FK), `tags` (TEXT 배열, 기본 `{}`), `media_urls` (JSONB, 기본 `[]`), `is_public` (BOOLEAN, NOT NULL, 기본 `false`).
    -   **타임스탬프**: `created_at`, `updated_at`, `deleted_at` (소프트 삭제).
    -   **인덱스**: `word_id`, `user_id`, `created_at` (DESC), `deleted_at`, `is_public`에 대한 Btree 인덱스. `user_id, created_at DESC`에 대한 복합 인덱스.
    -   **`media_urls`에 `JSONB`를 사용하는 이유**: 다양한 미디어 메타데이터를 반정형 형식으로 저장할 수 있는 유연성을 제공하여 사소한 변경을 위한 마이그레이션 없이 스키마 진화를 허용합니다.
    -   **`is_public`를 사용하는 이유**: 사용자가 개인 정의를 생성하고 조정 워크플로우에서 가시성을 제어할 수 있도록 합니다.

### 소셜 및 활동 데이터:

4.  **`likes`**
    -   **목적**: `definitions`에 대한 사용자 좋아요를 기록합니다.
    -   **필드**: `id` (UUID, PK), `user_id` (UUID, `users`에 대한 FK), `definition_id` (UUID, `definitions`에 대한 FK).
    -   **타임스탬프**: `created_at`, `updated_at`, `deleted_at` (소프트 삭제).
    -   **인덱스**: `user_id`, `definition_id`에 대한 고유 인덱스. `user_id`, `definition_id`, `deleted_at`에 대한 Btree 인덱스.

5.  **`follows`**
    -   **목적**: `users` 간의 팔로워-팔로잉 관계를 기록합니다.
    -   **필드**: `id` (UUID, PK), `follower_id` (UUID, `users`에 대한 FK), `following_id` (UUID, `users`에 대한 FK).
    -   **타임스탬프**: `created_at`, `updated_at`, `deleted_at` (소프트 삭제).
    -   **인덱스**: `follower_id`, `following_id`에 대한 고유 인덱스. `follower_id`, `following_id`, `deleted_at`에 대한 Btree 인덱스.

6.  **`notifications`**
    -   **목적**: 사용자를 위해 생성된 알림을 저장합니다.
    -   **필드**: `id` (UUID, PK), `user_id` (UUID, `users`에 대한 FK), `type` (VARCHAR), `title` (VARCHAR), `message` (TEXT), `actor_id` (UUID, `users`에 대한 FK, nullable), `target_url` (VARCHAR), `is_read` (BOOLEAN, 기본 `false`).
    -   **타임스탬프**: `created_at`, `updated_at`, `deleted_at` (소프트 삭제).
    -   **인덱스**: `user_id`, `user_id, is_read`, `created_at` (DESC), `deleted_at`에 대한 Btree 인덱스.

7.  **`events` & `event_aggregates`**
    -   **목적**: `events`는 분석을 위한 원시 사용자 활동을 저장하고, `event_aggregates`는 요약된 이벤트 데이터를 저장합니다.
    -   **왜 분리하는가**: 원시 이벤트는 감사 및 상세 분석을 위해 유지되며, 집계는 대시보드 및 보고서를 위한 빠른 쿼리를 제공하여 일반적인 분석 요구 사항에 대한 성능 및 스토리지를 최적화합니다.

### 관리자 및 조정:

8.  **`admin_users`**
    -   **목적**: 관리자를 위한 자격 증명을 저장합니다.
    -   **필드**: `id` (UUID, PK), `username` (VARCHAR, 고유, NOT NULL), `password` (VARCHAR, NOT NULL, 해시됨), `role` (`admin_role` ENUM: `super_admin`, `developer`, `operator`), `must_change_password` (BOOLEAN, 기본 `true`), `last_login` (TIMESTAMP).
    -   **타임스탬프**: `created_at`, `updated_at`, `deleted_at` (소프트 삭제).
    -   **왜 사용자 정의 역할인가**: 다양한 유형의 관리자를 위한 세분화된 액세스 제어를 제공합니다.

9.  **`reports`**
    -   **목적**: 다른 사용자 또는 정의에 대해 사용자가 제출한 보고서를 저장합니다.
    -   **필드**: `id` (UUID, PK), `reporter_id` (UUID, `users`에 대한 FK), `reported_user_id` (UUID, `users`에 대한 FK), `definition_id` (UUID, `definitions`에 대한 FK, nullable), `reason` (VARCHAR), `status` (VARCHAR, 기본 `PENDING`), `description` (TEXT), `resolved_at` (TIMESTAMP).
    -   **타임스탬프**: `created_at`, `updated_at`.

### 기타 테이블:

10. **`definition_histories`**
    -   **목적**: 정의의 기록 버전을 저장합니다.
    -   **필드**: `id` (UUID, PK), `definition_id` (UUID, `definitions`에 대한 FK), `content` (TEXT), `tags` (TEXT 배열), `media_urls` (JSONB).
    -   **타임스탬프**: `created_at`.
    -   **왜 기록인가**: 사용자가 정의의 이전 버전을 보고 잠재적으로 변경 사항을 되돌릴 수 있도록 하여 콘텐츠 감사 가능성을 지원합니다.

11. **`badges`, `user_badges`, `user_badge_progress`**
    -   **목적**: 사용자 행동을 기반으로 업적/배지 시스템을 구현합니다.
    -   **왜 업적 시스템인가**: 사용자 참여를 장려하고 애플리케이션에 게임화 측면을 제공합니다.

### 데이터베이스 뷰:

-   **`vw_definitions_with_likes`**: 정의와 총 좋아요 수를 함께 쿼리하는 것을 간소화합니다.
-   **`vw_words_with_stats`**: 정의 및 기여자 수와 같은 단어에 대한 집계 통계를 제공합니다.
-   **`vw_latest_definitions`**: 각 사용자별로 단어에 대한 최신 정의를 검색하고, 관련 사용자 및 좋아요 정보를 포함합니다. 이는 단어 페이지에 사용자 기여를 표시하는 데 유용합니다.

## 데이터베이스 마이그레이션 전략

이 프로젝트는 사용자 정의 Node.js 스크립트에 의해 관리되고 PostgreSQL 컨테이너에 대해 `docker exec`를 통해 실행되는 **SQL 기반 마이그레이션 전략**을 사용합니다.

### 핵심 원칙:

1.  **버전 제어**: 각 스키마 변경 사항은 순차적인 번호(예: `000_init.sql`, `001_add_feature.sql`)가 접두사로 붙은 별도의 `.sql` 파일에 정의됩니다. 이 파일은 버전 제어에 커밋됩니다.
2.  **멱등성**: 마이그레이션 스크립트는 가능한 경우 멱등하도록 설계됩니다(예: `CREATE EXTENSION IF NOT EXISTS`, `DROP TABLE IF EXISTS`). 이는 의도하지 않은 부작용 없이 여러 번 실행될 수 있도록 보장합니다.
3.  **`migration_history` 테이블**: 전용 테이블(`migration_history`)은 데이터베이스에 성공적으로 적용된 마이그레이션 파일을 추적하여 이미 실행된 마이그레이션의 재실행을 방지합니다.
4.  **스크립트 기반 실행**: Node.js 스크립트(`scripts/db-migration.js`, `scripts/db-reset.js`)는 Docker화된 PostgreSQL 인스턴스와 상호 작용하여 마이그레이션 프로세스를 오케스트레이션합니다.

### 주요 마이그레이션 스크립트:

-   **`scripts/db-migration.js`**: 보류 중인 모든 SQL 마이그레이션 파일을 실행합니다. 이 스크립트는 데이터베이스 스키마에 대한 증분 업데이트를 위한 것입니다.
-   **`scripts/db-reset.js`**: 주로 개발 또는 테스트 환경에서 사용되는 더 강력한 스크립트입니다. 다음 단계를 수행합니다:
    1.  `public` 스키마를 삭제하고 다시 생성합니다(모든 데이터 및 스키마를 효과적으로 지웁니다).
    2.  데이터베이스 사용자에게 필요한 권한을 부여합니다.
    3.  모든 SQL 마이그레이션을 처음부터 실행하여 깨끗하고 최신 스키마를 보장합니다.
    4.  TypeScript 타입을 다시 생성하기 위해 `scripts/generate-db-types.js`를 트리거합니다.
    -   **`db-reset`를 사용하는 이유**: 개발 데이터베이스를 알려진 상태로 빠르게 재설정하는 안정적인 방법을 제공하며, 로컬 개발 및 테스트 설정에 중요합니다.

### 데이터베이스 타입 생성 (`scripts/generate-db-types.js`)

이 스크립트는 개발 워크플로우의 중요한 부분입니다:

1.  **목적**: PostgreSQL `information_schema`를 자동으로 쿼리하여 테이블 및 열 타입을 추론합니다.
2.  **출력**: 모든 데이터베이스 테이블에 대한 타입 정의(`shared/src/types/db.generated.ts` 파일 - 예: `UsersTable`, `WordsTable`)를 포함하는 TypeScript 파일을 생성합니다.
3.  **왜 자동 생성인가**: 수동 타입 정의를 제거하여 데이터베이스와 상호 작용하는 TypeScript 코드가 항상 실제 스키마와 동기화되도록 보장하고, 타입 관련 버그를 줄이며 개발자 경험을 향상시킵니다.
4.  **통합**: 일반적으로 `db:reset` 또는 `db:migration` 프로세스의 일부로 실행되어 새로운 스키마 변경 사항이 애플리케이션에서 사용 가능한 TypeScript 타입에 즉시 반영되도록 보장합니다.

## Knex.js 구성

-   **Provider**: `knexProvider` (`backend/src/common/database/knex.provider.ts`)는 Knex.js 인스턴스를 초기화하는 역할을 합니다.
-   **환경 변수**: 데이터베이스 연결 매개변수(`DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`)는 환경 변수에서 로드되어 다양한 환경(개발, 테스트, 프로덕션)에 걸쳐 유연한 구성을 허용합니다.
-   **연결 풀링**: Knex.js는 연결 풀(`min: 2`, `max: 10`)로 구성되어 데이터베이스 연결을 효율적으로 관리하고 리소스 사용 및 성능을 최적화합니다.
-   **디버깅**: `DB_LOGGING` 환경 변수는 Knex.js 디버그 출력이 활성화되는지 여부를 제어하여 쿼리 최적화 및 문제 해결을 돕습니다.

## 리포지토리 패턴

백엔드 아키텍처에서 설명한 바와 같이, `BaseRepository` 패턴은 소프트 삭제 및 트랜잭션 관리와 같은 공통 기능을 제공하여 데이터베이스 상호 작용을 추상화하는 데 사용됩니다. 이 패턴은 Knex.js와 결합되어 비즈니스 로직과 데이터 액세스 계층 간의 명확한 관심사 분리를 보장합니다.

---

이 강력한 데이터베이스 설계 및 마이그레이션 전략은 타입 생성과 결합되어 Stashy 애플리케이션 내에서 데이터를 관리하기 위한 견고하고 유지보수 가능하며 개발자 친화적인 접근 방식을 제공합니다.