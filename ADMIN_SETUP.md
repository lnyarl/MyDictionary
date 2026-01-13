# Admin Service Setup Guide

Admin 서비스가 성공적으로 생성되었습니다. 아래 단계를 따라 설정하고 실행하세요.

## 📋 완료된 작업

✅ **Shared 폴더**: User entity, Pagination DTO, TypeScript types
✅ **Backend-Admin**: NestJS 서버 (Port 3001)
  - AdminUser entity with password authentication
  - bcrypt password hashing
  - JWT authentication with guards
  - User management endpoints
  - Database migration file

✅ **Frontend-Admin**: React + Vite 앱 (Port 5174)
  - Login page
  - Change password page
  - Users list page with pagination
  - Admin auth context
  - Protected routes

✅ **Docker 설정**: docker-compose.yml 업데이트 완료
✅ **Root package.json**: Workspaces 및 scripts 추가 완료

---

## 🚀 실행 방법

### 1단계: 의존성 설치

현재 `yarn install` 실행 중 파일 잠금 문제가 발생했습니다. 다음을 수행하세요:

```bash
# 실행 중인 프로세스 종료 (VS Code, 터미널 등)
# 그 후:

yarn install
```

만약 여전히 실패하면:

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules
rm yarn.lock
yarn install
```

### 2단계: Bcrypt Hash 생성

Admin 초기 비밀번호를 위한 bcrypt hash를 생성해야 합니다:

```bash
cd backend-admin
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin', 10).then(console.log);"
```

생성된 hash를 복사하여 `backend-admin/migrations/001_create_admin_users.sql` 파일의 INSERT 문에 있는 placeholder hash를 교체하세요:

```sql
INSERT INTO admin_users (username, password, must_change_password)
VALUES ('admin', '여기에_생성된_hash_붙여넣기', TRUE)
ON CONFLICT (username) DO NOTHING;
```

### 3단계: 데이터베이스 마이그레이션 실행

```bash
# PostgreSQL 시작
docker-compose up -d postgres

# 마이그레이션 실행
docker exec -i mydictionary-db psql -U postgres -d mydictionary < backend-admin/migrations/001_create_admin_users.sql
```

또는 직접 psql 사용:

```bash
psql -h localhost -U postgres -d mydictionary -f backend-admin/migrations/001_create_admin_users.sql
```

### 4단계: 개발 모드로 실행

**Option A: 모든 서비스 동시 실행** (권장)

```bash
# 별도 터미널에서 shared watcher 실행
cd shared && yarn watch

# 다른 터미널에서
yarn dev:backend-admin

# 또 다른 터미널에서
yarn dev:frontend-admin
```

**Option B: 기존 서비스와 함께 실행**

```bash
# Terminal 1: Shared
cd shared && yarn watch

# Terminal 2: Main Backend
yarn dev:backend

# Terminal 3: Admin Backend
yarn dev:backend-admin

# Terminal 4: Main Frontend
yarn dev:frontend

# Terminal 5: Admin Frontend
yarn dev:frontend-admin
```

---

## 🌐 접속 정보

### 개발 모드
- **Main App**: http://localhost:5173
- **Admin Panel**: http://localhost:5174
- **Main API**: http://localhost:3000
- **Admin API**: http://localhost:3001

### 프로덕션 모드 (Docker)
- **Main App**: http://localhost
- **Admin Panel**: http://localhost:81
- **Main API**: http://localhost:3000
- **Admin API**: http://localhost:3001

---

## 🔐 Admin 로그인

### 초기 계정
- **Username**: `admin`
- **Password**: `admin`

### 첫 로그인 시
1. admin/admin으로 로그인
2. 자동으로 비밀번호 변경 페이지로 리다이렉트
3. 새 비밀번호 설정 (최소 8자, 대문자, 소문자, 숫자 포함)
4. 비밀번호 변경 후 사용자 목록 페이지로 이동

---

## 🐳 Docker로 실행

### 빌드 및 실행

```bash
# 모든 서비스 빌드
yarn build:all

# Docker Compose로 실행
docker-compose up -d

# 또는 개별 서비스만
docker-compose up -d backend-admin frontend-admin
```

### 로그 확인

```bash
# 모든 로그
docker-compose logs -f

# Admin 백엔드 로그만
docker-compose logs -f backend-admin

# Admin 프론트엔드 로그만
docker-compose logs -f frontend-admin
```

---

## 🧪 API 테스트

### Login

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' \
  -c cookies.txt
```

### Get Current Admin

```bash
curl http://localhost:3001/auth/me -b cookies.txt
```

### Change Password

```bash
curl -X POST http://localhost:3001/auth/change-password \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"admin","newPassword":"Admin123!"}' \
  -b cookies.txt
```

### Get Users List

```bash
curl http://localhost:3001/users?page=1&limit=20 -b cookies.txt
```

---

## 📁 프로젝트 구조

```
MyDictionary/
├── shared/                      # 공유 코드
│   ├── src/
│   │   ├── entities/           # User entity
│   │   ├── dto/                # Pagination DTO
│   │   └── types/              # TypeScript types
│   └── package.json
│
├── backend-admin/               # Admin NestJS backend
│   ├── src/
│   │   ├── auth/               # 인증 (bcrypt + JWT)
│   │   ├── admin-users/        # AdminUser 관리
│   │   ├── users/              # User 목록 조회
│   │   └── common/             # 공통 decorators
│   ├── migrations/             # SQL migrations
│   └── package.json
│
├── frontend-admin/              # Admin React frontend
│   ├── src/
│   │   ├── pages/              # Login, ChangePassword, UsersList
│   │   ├── components/         # UI components, layouts
│   │   ├── contexts/           # Auth context
│   │   ├── hooks/              # Custom hooks
│   │   ├── lib/                # API clients
│   │   └── types/              # TypeScript types
│   └── package.json
│
├── backend/                     # Main backend (기존)
├── frontend/                    # Main frontend (기존)
└── docker-compose.yml           # 업데이트됨
```

---

## 🔧 문제 해결

### yarn install 실패 시

```bash
# 1. 모든 프로세스 종료
# 2. node_modules 삭제
rm -rf node_modules */node_modules
rm yarn.lock

# 3. 재설치
yarn install
```

### bcrypt 빌드 오류 시

```bash
# Windows
yarn add bcrypt --ignore-scripts
yarn rebuild bcrypt --build-from-source

# Linux/Mac
yarn add bcrypt
```

### 데이터베이스 연결 오류 시

```bash
# PostgreSQL이 실행 중인지 확인
docker-compose ps

# PostgreSQL 시작
docker-compose up -d postgres

# 연결 테스트
psql -h localhost -U postgres -d mydictionary
```

---

## 🎯 다음 단계

1. ✅ 의존성 설치 완료
2. ✅ Bcrypt hash 생성 및 마이그레이션 업데이트
3. ✅ 데이터베이스 마이그레이션 실행
4. ✅ Admin backend 실행 (http://localhost:3001)
5. ✅ Admin frontend 실행 (http://localhost:5174)
6. ✅ admin/admin으로 로그인
7. ✅ 비밀번호 변경
8. ✅ 사용자 목록 확인

---

## 📝 참고사항

- **보안**: 프로덕션 환경에서는 `.env` 파일의 `JWT_SECRET`을 강력한 값으로 변경하세요
- **CORS**: 프로덕션 환경에서는 CORS origin을 제한하세요
- **HTTPS**: 프로덕션 환경에서는 HTTPS를 사용하세요
- **비밀번호 정책**: 현재 최소 8자, 대문자/소문자/숫자 포함이 필요합니다

---

## 🎉 완료!

모든 설정이 완료되었습니다. 문제가 발생하면 위의 문제 해결 섹션을 참고하세요.
