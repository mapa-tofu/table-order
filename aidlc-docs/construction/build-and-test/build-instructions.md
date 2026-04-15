# 빌드 지침 (Build Instructions)

## 사전 요구사항
- **Node.js**: v20.x LTS 이상 (v24.x 호환 확인됨)
- **npm**: 10.x 이상
- **PostgreSQL**: 15.x (서버 실행 시 필요)
- **OS**: macOS / Linux

## 빌드 단계

### 1. 의존성 설치
```bash
cd table-order
npm install
```

### 2. 환경 변수 설정
```bash
cp .env.example .env
# .env 파일에서 DB 접속 정보, JWT_SECRET 등 수정
```

### 3. TypeScript 빌드
```bash
npm run build:server
# 또는 직접: cd server && npx tsc
```

### 4. 빌드 검증
- **성공 출력**: 에러 없이 종료 (Exit Code: 0)
- **빌드 산출물**: `server/dist/` 디렉토리에 JS 파일 생성
- **주의**: `declaration: false` 설정으로 `.d.ts` 파일은 생성되지 않음

## 트러블슈팅

### npm install 권한 에러
```bash
sudo chown -R $(whoami) ~/.npm
npm cache clean --force
npm install
```

### TypeScript 빌드 에러
- `@shared/types` 경로 에러 → `tsconfig.json`의 `rootDir`이 `..`으로 설정되어 있는지 확인
- `declaration` 관련 에러 → `declaration: false` 설정 확인
