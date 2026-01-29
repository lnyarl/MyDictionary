# 공유 워크스페이스 아키텍처 및 패턴

## 개요

`shared` 워크스페이스는 Stashy 모노레포의 중요한 구성 요소이며, 프로젝트 내의 여러 애플리케이션(예: `backend`, `backend-admin`, `frontend`, `frontend-admin`)에서 활용되는 공통 코드를 저장하도록 설계되었습니다. 이 워크스페이스는 전체 풀스택 애플리케이션에서 일관성을 보장하고 중복을 줄이며 개발을 간소화합니다.

## 아키텍처 근거

**공유 워크스페이스를 사용하는 이유?**

1.  **타입 안전성 및 일관성**: 단일 공유 위치에 DTO(데이터 전송 객체), 인터페이스 및 열거형을 정의함으로써 프론트엔드 및 백엔드 애플리케이션 모두 동일한 데이터 구조 이해로 작동하도록 보장합니다. 이는 TypeScript 우선 프로젝트에서 종단 간 타입 안전성을 유지하는 데 가장 중요합니다.
2.  **중복 감소 (DRY 원칙)**: 공통 상수, 유틸리티 함수 및 유효성 검사 로직을 한 번 작성하고 필요한 곳에서 가져올 수 있으므로 중복 코드를 방지하고 잠재적인 불일치를 줄일 수 있습니다.
3.  **간소화된 API 계약**: `shared` 워크스페이스는 프론트엔드와 백엔드 간의 API 계약을 효과적으로 정의합니다. `shared`의 DTO 변경은 사용하는 서비스에서 필요한 업데이트를 즉시 강조하여 강력한 개발 주기를 촉진합니다.
4.  **향상된 유지보수성**: 핵심 데이터 구조 또는 유틸리티를 수정해야 하는 경우 한 곳에서 업데이트할 수 있으며, 모든 종속 프로젝트는 자동으로 업데이트를 받습니다(재빌드 후).
5.  **더 빠른 개발**: 개발자는 공통 빌딩 블록에 빠르게 액세스하고 재사용하여 새로운 기능 개발을 가속화할 수 있습니다.

## 콘텐츠 및 구조

`shared` 워크스페이스는 일반적으로 다음을 포함합니다:

```
shared/
├── src/
│   ├── common/              # 일반 유틸리티, 열거형, 상수
│   ├── dtos/                # API 요청/응답을 위한 데이터 전송 객체
│   ├── interfaces/          # 공유 TypeScript 인터페이스
│   ├── types/               # 사용자 정의 타입 및 타입 가드
│   └── index.ts             # 내보내기 배럴 파일
├── dist/                    # 컴파일된 JavaScript 및 타입 정의 파일
├── package.json             # 워크스페이스별 의존성 및 스크립트
└── tsconfig.json            # TypeScript 구성
```

### 공유 코드의 주요 범주:

1.  **DTO (데이터 전송 객체)**:
    -   이들은 프론트엔드와 백엔드 간에 전송되는 데이터의 구조를 정의하는 일반 TypeScript 클래스입니다(종종 `class-validator` 및 `class-transformer` 데코레이터와 함께 사용).
    -   **예시**: `CreateWordDto`, `UserResponseDto`, `LoginRequestDto`.
    -   **이유**: API 입력 유효성 검사 및 일관된 데이터 계약 보장에 중요합니다.

2.  **인터페이스 및 타입**:
    -   데이터 모델, API 응답 또는 기타 복잡한 데이터 구조를 나타내는 TypeScript 인터페이스 및 타입입니다.
    -   **예시**: `IUser`, `IWord`, `ApiResponse<T>`.
    -   **이유**: 애플리케이션 전체에서 강력한 타입 검사를 제공하여 많은 일반적인 런타임 오류를 방지합니다.

3.  **상수**:
    -   매직 문자열, 구성 값 또는 제한과 같은 애플리케이션 전체 상수입니다.
    -   **예시**: `MAX_WORD_LENGTH`, `API_PREFIX`, `DEFAULT_PAGINATION_LIMIT`.
    -   **이유**: 중요한 값을 중앙 집중화하여 관리 및 업데이트하기 쉽게 만듭니다.

4.  **열거형**:
    -   명명된 상수 값 세트입니다.
    -   **예시**: `UserRoleEnum`, `NotificationTypeEnum`.
    -   **이유**: 가독성을 높이고 임의의 문자열을 사용하는 오류를 방지합니다.

5.  **유틸리티 함수**:
    -   특정 애플리케이션 도메인에 국한되지 않는 일반적인 작업(예: 날짜 형식 지정, 문자열 조작, 데이터 변환)을 수행하는 순수 함수입니다.
    -   **예시**: `formatDate`, `slugify`.
    -   **이유**: 코드 중복을 줄이고 일반적인 작업에서 일관성을 촉진합니다.

## 공유 워크스페이스의 의존성

`shared` 워크스페이스의 `package.json`은 일반적으로 `typescript`, `class-validator`, `class-transformer` 및 `biome`과 같은 린터/포맷터와 같은 개발 의존성을 포함합니다. 또한 `uuidv7`와 같은 특정 공유 유틸리티에 대한 의존성도 포함합니다.

**이러한 의존성을 사용하는 이유**: 이는 `shared` 모듈 자체가 컴파일하고 DTO를 유효성 검사하며 지정된 유틸리티 기능을 수행하는 데 필요하며, `backend` 또는 `frontend`에서 무거운 애플리케이션 특정 의존성을 가져오지 않습니다.

## 빌드 프로세스

`shared` 워크스페이스는 독립적으로 컴파일됩니다. `shared`에서 변경 사항이 발생하면 다른 워크스페이스(예: `backend` 또는 `frontend`)는 업데이트된 타입 및 코드를 가져오기 위해 재빌드되거나 다시 감시되어야 합니다. 이는 일반적으로 루트 `package.json` 및 `shared` 워크스페이스 자체에 정의된 `yarn watch` 또는 `yarn build` 스크립트에 의해 관리됩니다.

```json
// 루트 package.json
"scripts": {
  "dev:shared": "cd shared && yarn watch",
  "build:shared": "cd shared && yarn build",
}
```

## 다른 워크스페이스와의 통합

다른 워크스페이스(예: `backend`, `frontend`)는 `@stashy/shared` 패키지 별칭(루트 `package.json` 또는 `tsconfig.json` 경로에 정의됨)을 사용하여 `shared` 워크스페이스를 참조합니다.

```typescript
// backend/src/users/users.controller.ts
import { CreateUserDto } from '@stashy/shared/dtos/users';

// frontend/src/components/forms/RegisterForm.tsx
import { CreateUserDto } from '@stashy/shared/dtos/users';
```

이 명시적인 가져오기 경로는 애플리케이션의 양쪽 끝이 정확히 동일한 데이터 정의를 사용하도록 보장합니다.

---

`shared` 워크스페이스는 Stashy 애플리케이션을 위한 응집력 있고 타입 안전하며 효율적인 모노레포 아키텍처를 유지하는 데 필수적인 요소입니다.