# 2026-02 코드 리뷰 메모

## 핵심 이슈

1. 프론트엔드 `FollowListDialog`에서 `type` 값에 따라 `useFollowers`/`useFollowing` 훅을 조건부로 호출하고 있어 React Hook 규칙을 위반합니다.
2. `frontend/src/lib/api/definitions.ts`에서 `Definition` 타입을 내부 import로만 사용하고 export 하지 않아, 다른 모듈에서 `Definition`을 import 할 때 타입 체크가 실패합니다.
3. 프론트엔드 훅 일부가 존재하지 않는 `frontend/src/types/*` 경로를 참조하고 있습니다.
4. `any` 사용 및 catch 블록의 `any` 에러 처리 패턴이 남아 있어 타입 안정성이 저하됩니다.
5. 백엔드 서비스/부트스트랩 코드에 디버그 `console.log`가 남아 있어 운영 환경 로그 품질이 저하될 수 있습니다.

## 개선 우선순위 제안

- P0: React Hook 규칙 위반/타입체크 실패를 우선 수정
- P1: 잘못된 타입 경로와 `Definition` 타입 export 정리
- P2: `any` 제거 및 로깅 전략(Nest Logger) 통일
