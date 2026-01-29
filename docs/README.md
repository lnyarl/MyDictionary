# Stashy 프로젝트 문서화

이 디렉토리에는 Stashy 사전 애플리케이션에 대한 포괄적인 문서가 포함되어 있습니다.

## 문서 구조

### `/architecture/`
- **`overview.md`** - 상위 수준 시스템 아키텍처 및 설계 결정
- **`backend.md`** - 백엔드 아키텍처 (NestJS + Knex.js + PostgreSQL)
- **`frontend.md`** - 프론트엔드 아키텍처 (React 19 + Vite + Radix UI)
- **`admin-system.md`** - 관리 시스템 아키텍처
- **`shared-workspace.md`** - 공유 워크스페이스 패턴 및 컨벤션

### `/api/`
- **`conventions.md`** - API 설계 패턴 및 컨벤션
- **`authentication.md`** - 인증 및 권한 부여 흐름
- **`endpoints.md`** - API 엔드포인트 문서

### `/database/`
- **`schema.md`** - 데이터베이스 스키마 및 설계
- **`migrations.md`** - 마이그레이션 전략 및 패턴
- **`repositories.md`** - 리포지토리 패턴 및 사용법

### `/deployment/`
- **`development.md`** - 개발 환경 설정
- **`production.md`** - 프로덕션 배포 가이드
- **`docker.md`** - Docker 구성 및 사용법

### `/guides/`
- **`development-workflow.md`** - 개발 워크플로우 및 모범 사례
- **`code-style.md`** - 코드 스타일 및 컨벤션
- **`testing.md`** - 테스트 전략 및 패턴

## 빠른 링크

- [시작하기](../README.md#getting-started)
- [아키텍처 개요](architecture/overview.md)
- [개발 워크플로우](guides/development-workflow.md)
- [API 컨벤션](api/conventions.md)

## 문서화 철학

이 문서는 다음 원칙을 따릅니다:

1.  **무엇보다 왜**: 아키텍처 결정이 무엇인지 뿐만 아니라 왜 그렇게 결정되었는지 설명하는 데 중점
2.  **실용적인 예시**: 코드베이스에서 사용된 실제 코드 예시 및 패턴 포함
3.  **살아있는 문서**: 코드 변경 사항과 문서 동기화 유지
4.  **개발자 중심**: 프로젝트에 참여하거나 참여할 개발자를 위해 작성

---

*최종 업데이트: 2026-01-29*