# API 설계 및 컨벤션

## 개요

Stashy 애플리케이션의 API는 NestJS를 사용하여 구축되었으며 RESTful 원칙을 따릅니다. 명확하고 일관되며 예측 가능한 리소스 중심 URL, 표준 HTTP 메서드 및 강력한 데이터 처리를 위한 DTO 기반 유효성 검사를 강조합니다. API는 주요 프론트엔드, 관리자 프론트엔드 및 잠재적으로 다른 클라이언트에서 사용되도록 설계되었습니다.

## 1. 일반적인 API 원칙

-   **RESTful 설계**: 리소스 식별, 조작 및 스테이트리스(Stateless)성에 대한 REST 원칙 준수.
-   **리소스 중심 URL**: API는 리소스(예: `/users`, `/words`, `/definitions`)를 중심으로 설계됩니다.
-   **표준 HTTP 메서드**: 해당 CRUD 작업에 표준 HTTP 메서드(GET, POST, PUT, PATCH, DELETE)를 사용합니다.
-   **스테이트리스(Stateless)성**: 클라이언트에서 서버로의 각 요청은 요청을 이해하는 데 필요한 모든 정보를 포함해야 합니다. 서버 측 세션은 최소화됩니다. HTTP 전용 쿠키의 JWT가 인증 상태를 처리합니다.
-   **요청/응답을 위한 JSON**: 모든 요청 본문과 응답 페이로드는 JSON 형식입니다.
-   **버전 없는 API**: 현재 API는 명시적인 버전 관리(예: `/v1/`)를 사용하지 않습니다. 이는 개발을 간소화하지만, 향후 중대한 변경 사항이 도입되면 추가될 수 있습니다.

## 2. API 구조 및 명명 컨벤션

### URL 명명
-   **복수 명사**: 리소스 컬렉션에 복수 명사를 사용합니다(예: `/users`, `/words`).
-   **케밥 케이스**: 여러 단어로 구성된 리소스 이름에 케밥 케이스를 사용합니다(예: `/definition-histories`).
-   **중첩 리소스**: 관계에 중첩 URL을 사용합니다(예: `/words/:wordId/definitions`).

### 엔드포인트 예시 (메인 백엔드)
-   `GET /users` - 사용자 목록 가져오기
-   `GET /users/:id` - ID로 특정 사용자 가져오기
-   `POST /users` - 새 사용자 생성
-   `PATCH /users/:id` - 사용자 업데이트
-   `DELETE /users/:id` - 사용자 삭제
-   `GET /words` - 단어 목록 가져오기
-   `POST /words/:wordId/definitions` - 특정 단어에 대한 정의 생성
-   `POST /auth/google` - Google OAuth를 통한 사용자 로그인

### 엔드포인트 예시 (관리자 백엔드)
-   `POST /auth/login` - 관리자 로그인
-   `PATCH /admin-users/:id/change-password` - 관리자 암호 변경
-   `GET /admin/users` - 사용자 목록 가져오기 (관리자 뷰)

## 3. 데이터 전송 객체 (DTO)

DTO는 API 계약을 정의하고 엄격한 타입 안전성 및 유효성 검사를 보장하는 데 핵심적입니다. 주로 `shared/src/dto` 및 `shared/src/admin/dto` 워크스페이스에 위치합니다.

### DTO 사용 원칙

-   **입력 유효성 검사**: 모든 들어오는 요청 본문은 `class-validator` 데코레이터를 사용하여 DTO에 대해 유효성 검사됩니다.
-   **타입 변환**: `class-transformer`는 들어오는 요청의 일반 객체를 DTO 인스턴스로 변환하는 데 사용되어 타입 안전한 작업을 가능하게 합니다.
-   **명확한 계약**: 각 DTO는 API 요청 및 때로는 응답에 대한 예상되는 데이터 모양과 제약 조건을 명확하게 정의합니다.
-   **공유 정의**: `shared` 워크스페이스의 DTO는 프론트엔드와 백엔드 간의 일관성을 보장합니다.

### DTO 예시 (`shared/src/dto/word/create-word.dto.ts`)

```typescript
import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateWordDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  term: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
```

**DTO를 사용하는 이유**: DTO는 데이터 무결성을 강제하고, 예상되는 입력에 대한 명확한 문서를 제공하며, 비즈니스 로직에 도달하기 전에 잘못된 요청을 자동으로 거부하여 오류 처리를 간소화합니다.

## 4. HTTP 상태 코드

표준 HTTP 상태 코드는 API 요청의 성공 또는 실패를 나타내는 데 사용됩니다.

-   **`200 OK`**: 일반적인 성공.
-   **`201 Created`**: 리소스가 성공적으로 생성됨(예: `POST` 요청).
-   **`204 No Content`**: 응답 본문이 없는 성공적인 요청(예: `DELETE`, 반환 없는 일부 `PATCH`).
-   **`400 Bad Request`**: 잘못된 요청 페이로드 또는 매개변수 (종종 DTO 유효성 검사 실패로 인해 발생).
-   **`401 Unauthorized`**: 인증이 필요하거나 실패함 (잘못되거나 누락된 JWT).
-   **`403 Forbidden`**: 인증되었지만 작업을 수행할 권한이 없음 (예: 역할 기반 접근 제어 위반, 정지된 사용자).
-   **`404 Not Found`**: 리소스가 존재하지 않음.
-   **`409 Conflict`**: 요청이 서버의 현재 상태와 충돌함 (예: 고유 제약 조건 위반).
-   **`500 Internal Server Error`**: 예상치 못한 서버 측 오류.

## 5. 오류 처리

### 글로벌 예외 필터

-   백엔드는 `HttpExceptionFilter`(`backend/src/common/filters/http-exception.filter.ts`)를 사용하여 오류 처리를 중앙 집중화합니다.
-   **글로벌 필터를 사용하는 이유**: 모든 API 엔드포인트에서 일관된 오류 응답 구조를 보장하여 클라이언트의 예측 가능성을 높이고 클라이언트 측 오류 처리를 간소화합니다.

### 오류 응답 형식

오류 발생 시 API는 일반적으로 다음을 포함하는 일관된 구조의 JSON 객체를 반환합니다:

```json
{
  "statusCode": 400,
  "message": [
    "term should not be empty",
    "term must be a string"
  ],
  "error": "Bad Request"
}
```
-   **`statusCode`**: HTTP 상태 코드.
-   **`message`**: 오류에 대한 세부 정보를 제공하는 문자열 또는 문자열 배열(예: 유효성 검사 오류).
-   **`error`**: 오류 유형에 대한 짧고 사람이 읽을 수 있는 설명.

## 6. 페이지네이션 및 필터링

-   **페이지네이션 DTO**: `PaginationDto`(`shared/src/dto/pagination.dto.ts`)와 같은 DTO는 페이지네이션 매개변수(예: `page`, `limit`)를 표준화하는 데 사용됩니다.
-   **이유**: 대규모 데이터셋을 청크로 가져와 효율적으로 검색할 수 있도록 하여 성능을 향상시키고 대역폭 사용량을 줄입니다.
-   **필터링**: 리소스 필터링에 쿼리 매개변수가 사용됩니다(예: `GET /words?term=example`).

## 7. API 호출의 인증

[인증 및 권한 부여 패턴](authentication.md) 문서에 자세히 설명된 바와 같이, 인증은 JWT를 포함하는 HTTP 전용 쿠키를 통해 처리됩니다. 브라우저가 쿠키를 자동으로 관리하므로 클라이언트는 대부분의 요청에 대해 헤더에 토큰을 명시적으로 보내지 않습니다.

## 8. 파일 업로드

-   **S3 통합**: 파일 업로드(예: 프로필 사진, 정의용 미디어)는 백엔드 의존성에 `@aws-sdk/client-s3`가 존재한다는 사실에서 알 수 있듯이 AWS S3를 통해 처리됩니다.
-   **왜 S3인가**: 확장 가능하고 가용성이 높으며 안전한 객체 저장소 솔루션을 제공하여 애플리케이션 서버에서 파일 저장소 문제를 오프로드합니다.

## 9. 국제화 (i18n)

-   API는 주로 `nestjs-i18n`을 통해 국제화를 지원합니다.
-   클라이언트는 쿼리 매개변수(`?lang=ko`) 또는 `x-custom-lang` HTTP 헤더를 사용하여 선호하는 언어를 지정할 수 있습니다.
-   **이유**: API가 다양한 언어로 메시지와 콘텐츠를 반환할 수 있도록 하여 전 세계 사용자 기반을 지원합니다.

---

이러한 API 설계 원칙 및 컨벤션은 Stashy 애플리케이션을 위한 강력하고 유지보수 가능하며 개발자 친화적인 인터페이스를 보장합니다.