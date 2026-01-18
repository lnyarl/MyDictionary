# Stashy

Full-Stack Stash Application built with modern technologies.

## Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling
- **React Router** - Routing

### Backend
- **NestJS** - Node.js framework
- **TypeScript** - Type safety
- **Knex.js** - SQL Query Builder
- **PostgreSQL** - Database
- **Jest** - Testing framework

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Container orchestration

## Project Structure

```
Stashy/
├── backend/              # NestJS backend application
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── app.controller.ts
│   │   └── app.service.ts
│   ├── test/
│   ├── Dockerfile
│   └── package.json
├── frontend/             # React frontend application
│   ├── src/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml    # Production compose file
└── docker-compose.dev.yml # Development compose file
```

## 구현 상태

## Getting Started

### Prerequisites
- Node.js 20+
- yarn
- Docker and Docker Compose (for containerized deployment)

### Local Development

#### 1. Install Dependencies
```bash
yarn install
```

#### 2. Environment Variables
**Backend (.env):**
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

**Frontend (.env):**
```bash
cd frontend
cp .env.example .env
# Edit .env with your configuration
```

#### 3. Setup Database
Start PostgreSQL using Docker:
```bash
yarn docker:dev
```

#### 4. Run Applications

**Run All**
```bash
yarn dev
```
The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### Docker Deployment

#### Production
```bash
yarn docker:prod
```

## Testing

### Backend Tests

**Unit Tests:**
```bash
cd backend
yarn test
```

**E2E Tests:**
```bash
cd backend
yarn test:e2e
```

**Test Coverage:**
```bash
cd backend
yarn test:cov
```

## API Documentation

The API is available at `http://localhost:3000`

### Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check

## Development

### Code Quality

**Backend Linting:**
```bash
cd backend
yarn lint
```

**Frontend Linting:**
```bash
cd frontend
yarn lint
```

### Building

**Backend:**
```bash
cd backend
yarn build
```

**Frontend:**
```bash
cd frontend
yarn build
```

## Troubleshooting

### ECONNREFUSED Error

If you see `ECONNREFUSED` error when accessing the frontend:

1. **백엔드가 실행 중인지 확인:**
   ```bash
   # 백엔드 프로세스 확인 (Windows)
   netstat -ano | findstr :3000

   # 백엔드 프로세스 확인 (Linux/Mac)
   lsof -i :3000
   ```

2. **실행 순서 확인:**
   - 먼저 데이터베이스를 시작하세요 (Docker):
     ```bash
     docker-compose -f docker-compose.dev.yml up -d
     ```
   - 그 다음 백엔드를 시작하세요:
     ```bash
     cd backend
     yarn start:dev
     ```
   - 마지막으로 프론트엔드를 시작하세요:
     ```bash
     cd frontend
     yarn dev
     ```

3. **브라우저 새로고침:**
   - 백엔드가 시작된 후 브라우저를 새로고침하세요 (Ctrl+F5 또는 Cmd+Shift+R)

4. **환경 변수 확인:**
   - `.env.example` 파일을 `.env`로 복사했는지 확인하세요
   - 백엔드와 프론트엔드 모두 `.env` 파일이 필요합니다

### Port Already in Use

포트가 이미 사용 중인 경우:

```bash
# Windows
netstat -ano | findstr :<PORT>
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:<PORT> | xargs kill -9
```

### Database Connection Issues

데이터베이스 연결 문제:

1. PostgreSQL이 실행 중인지 확인:
   ```bash
   docker ps | grep postgres
   ```

2. 데이터베이스 재시작:
   ```bash
   docker-compose -f docker-compose.dev.yml down
   docker-compose -f docker-compose.dev.yml up -d
   ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
