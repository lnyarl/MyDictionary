# 개발 워크플로우 및 도구

## 개요

이 문서는 Stashy 프로젝트에 기여하기 위한 개발 워크플로우, 주요 도구 및 모범 사례를 설명합니다. 목표는 모든 워크스페이스(백엔드, 프론트엔드, 관리자, 공유)에서 일관되고 효율적이며 고품질의 개발 경험을 보장하는 것입니다.

## 1. 프로젝트 설정

### 필수 조건
-   **Node.js (20 이상)**: JavaScript 런타임 환경.
-   **Yarn**: 모노레포를 위한 패키지 관리자 (워크스페이스에 사용).
-   **Docker & Docker Compose**: 컨테이너화된 데이터베이스(PostgreSQL), Redis 및 기타 서비스를 위해.

### 초기 설정
1.  **저장소 복제**:
    ```bash
    git clone <repository-url>
    cd Stashy
    ```
2.  **의존성 설치**:
    ```bash
    yarn install
    ```
    -   이것은 모든 워크스페이스의 의존성을 설치합니다.
3.  **환경 변수**: `backend/` 및 `frontend/` (해당하는 경우 `backend-admin/`, `frontend-admin/`)에 각 `*.env.example` 파일을 기반으로 `.env` 파일을 생성합니다.
4.  **데이터베이스 설정**:
    ```bash
    yarn docker:dev   # PostgreSQL, Redis, Minio 시작
    yarn db:reset     # 데이터베이스 재설정, 마이그레이션 실행, 타입 생성
    ```

## 2. 로컬 개발 워크플로우

### 애플리케이션 실행

-   **모든 애플리케이션 (메인 & 관리자)**:
    ```bash
    yarn dev
    ```
    -   이 명령은 `concurrently`를 사용하여 `shared` (감시 모드), `backend` (개발 모드), `backend-admin` (개발 모드), `frontend` (개발 모드), `frontend-admin` (개발 모드)를 동시에 실행합니다.
    -   프론트엔드: `http://localhost:5173`
    -   백엔드 API: `http://localhost:3000`
-   **메인 애플리케이션만**:
    ```bash
    yarn dev:main
    ```
-   **관리자 애플리케이션만**:
    ```bash
    yarn dev:admin
    ```

### 파일 감시 및 핫 리로딩
-   모든 `dev` 스크립트(`yarn dev:shared`, `yarn dev:backend`, `yarn dev:frontend` 등)는 핫 리로딩을 위한 감시 모드로 구성되어 코드 변경 시 즉각적인 피드백을 보장합니다.

## 3. 코드 품질 및 표준

### 린팅 및 포맷팅 (Biome)

-   **주요 도구**: [Biome](https://biomejs.dev/)은 모든 워크스페이스에서 린팅 및 포맷팅 모두에 사용됩니다.
-   **구성**: Biome은 루트에 구성되며, 필요한 경우 워크스페이스별 재정의(예: 프론트엔드 들여쓰기)가 적용됩니다.
-   **명령**:
    -   `yarn lint` (각 워크스페이스에서 전역적으로): 린트 및 포맷팅 검사를 실행합니다.
    -   `yarn format` (각 워크스페이스에서): Biome 규칙에 따라 코드를 포맷팅합니다.
    -   `yarn lint:check` (각 워크스페이스에서): 수정하지 않고 린팅 오류를 확인합니다.
    -   `yarn lint:fix` (각 워크스페이스에서): 린팅 및 포맷팅 오류를 수정합니다.
-   **들여쓰기**:
    -   **백엔드/루트**: 2칸 공백.
    -   **프론트엔드**: 탭 (UI 컴포넌트에 중요).
-   **따옴표**: 모든 문자열에 큰따옴표를 사용합니다.
-   **가져오기**: Biome은 가져오기를 자동으로 구성하고 정렬합니다.
    -   **규칙**: 컴파일 성능을 향상시키고 순환 의존성을 방지하기 위해 항상 타입 전용 가져오기에 `import type`을 사용합니다.

### 타입 안전성 (TypeScript)

-   **엄격한 필수 사항**: 전체 코드베이스에서 TypeScript가 적용됩니다.
-   **`any` 사용 회피**: `any` 사용은 엄격히 권장되지 않습니다.
-   **타입 검사**: `yarn type-check` (프론트엔드 워크스페이스에서)는 `tsc -b`를 실행하여 포괄적인 타입 검사를 수행합니다.
-   **공유 타입**: 프론트엔드와 백엔드 모두에서 사용되는 정의(`DTO`, `Entities`, `Interfaces`)는 `shared/`에 있습니다.
-   **인터페이스 vs 타입**: 객체 형태에는 `interface`를, 유니온/별칭에는 `type`을 선호합니다.

### 사전 커밋 훅 (Husky & lint-staged)

-   **목적**: 커밋 전에 코드 품질 검사를 자동화합니다.
-   **`husky`**: Git 훅을 관리합니다.
-   **`lint-staged`**: 스테이지된 Git 파일에 대해서만 린터/포맷터를 실행합니다.
-   **워크플로우**: `git commit`이 실행되면 `lint-staged`는 변경된 파일에 대해 `biome lint --write` 및 관련 테스트를 실행하여 일반적인 문제가 저장소에 들어가는 것을 방지합니다.

## 4. 테스트 전략

### 단위 테스트 (Jest)

-   **백엔드**: `cd backend && yarn test`
-   **관리자 백엔드**: `cd backend-admin && yarn test`
-   **감시 모드**: 개발 중 지속적인 테스트를 위한 `yarn test:watch`.
-   **커버리지**: `yarn test:cov`는 테스트 커버리지 보고서를 생성합니다.

### End-to-End (E2E) 테스트

-   **백엔드 E2E**: `cd backend && yarn test:e2e`
-   **관리자 백엔드 E2E**: `cd backend-admin && yarn test:e2e`
-   **Playwright (프론트엔드 E2E)**: `yarn test:playwright` (전역 명령, `playwright/` 디렉토리에서 테스트 실행).

### 테스트 환경 (Docker화)
-   통합 및 E2E 테스트를 위한 격리된 데이터베이스 및 Redis 인스턴스를 시작하는 데 전용 `docker-compose.test.yml`이 사용되어 일관된 테스트 환경을 보장합니다.

## 5. 빌드 및 배포

### 워크스페이스 빌드
-   `yarn build:shared`
-   `yarn build:backend`
-   `yarn build:backend-admin`
-   `yarn build:frontend`
-   `yarn build:frontend-admin`
-   **모두 빌드**: `yarn build` (모든 개별 빌드 명령을 순차적으로 실행).

### Docker 배포
-   **개발 Docker**: `yarn docker:dev` (인프라 서비스 시작: postgres, redis, minio).
-   **완전 Docker화된 개발**: `yarn docker` (모든 서비스 시작 및 이미지 빌드).
-   **프로덕션 Docker**: `yarn docker:prod` (프로덕션 준비 설정에 `docker-compose.yml` 사용).
-   **Docker 중지**: `yarn docker:down` (컨테이너 중지), `yarn docker:down-v` (볼륨 중지 및 제거).

## 6. 데이터베이스 관리

-   **마이그레이션**: `yarn db:migration` (보류 중인 SQL 마이그레이션 적용).
-   **재설정**: `yarn db:reset` (데이터베이스 지우기, 모든 마이그레이션 적용, TypeScript 타입 생성 – 주로 개발용).
-   **타입 생성**: `yarn db:generate-types` (현재 스키마를 기반으로 `shared/src/types/db.generated.ts` 업데이트).
    -   **왜 타입을 생성하는가**: TypeScript 코드가 데이터베이스 스키마와 일치하도록 보장하여 런타임 오류를 방지하고 데이터 액세스 계층의 타입 안전성을 향상시킵니다.

## 7. 버전 제어 (Git)

-   **브랜칭 전략**: `main` (또는 `develop`)에서 기능 브랜치.
-   **커밋 메시지**: 컨벤셔널 커밋을 따르는 명확하고 간결한 커밋 메시지(예: `feat: add new feature`, `fix: resolve bug`).
-   **풀 리퀘스트**: 코드 검토 및 기능을 `main`으로 병합하는 데 사용됩니다.

## 8. 개발자를 위한 일반적인 에이전트 레시피

### 새 API 엔드포인트 추가
1.  `shared/` 또는 `backend/src/*/dto/`에 DTO 정의/업데이트.
2.  해당 `Service`에 로직 구현.
3.  `Controller`에 경로 핸들러 추가.
4.  백엔드에서 `yarn lint` 및 `yarn build` 실행.

### 새 프론트엔드 컴포넌트 생성
1.  PascalCase를 사용하여 `frontend/src/components/`에 새 `.tsx` 파일 생성.
2.  접근성 있는 UI를 위해 Radix UI 프리미티브 활용.
3.  들여쓰기는 **탭**을 사용하도록 보장.
4.  프론트엔드에서 `yarn type-check` 실행.

---

이 가이드는 살아있는 문서 역할을 합니다. 개발자는 개선 사항에 기여하고 도구 또는 워크플로우 변경 사항으로 최신 상태를 유지하도록 권장됩니다.