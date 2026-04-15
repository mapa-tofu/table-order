# 통합 테스트 지침

## 사전 요구사항
- PostgreSQL 15.x 실행 중
- `table_order` 데이터베이스 생성 완료
- `.env` 파일 설정 완료

## 환경 설정

### 1. 데이터베이스 준비
```bash
createdb table_order
cd table-order
npm run db:seed
```

### 2. 서버 시작
```bash
npm run dev
```

## 통합 테스트 시나리오

### 시나리오 1: 테이블 로그인 → 메뉴 조회 → 주문 생성
```bash
# 1. 테이블 로그인
curl -X POST http://localhost:3000/api/customer/auth/login \
  -H "Content-Type: application/json" \
  -d '{"storeId":"<STORE_ID>","tableNumber":1,"password":"1234"}'

# 2. 메뉴 조회 (토큰 사용)
curl http://localhost:3000/api/customer/menus \
  -H "Authorization: Bearer <TOKEN>"

# 3. 주문 생성
curl -X POST http://localhost:3000/api/customer/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"items":[{"menuItemId":"<MENU_ID>","quantity":2}]}'
```

### 시나리오 2: 관리자 로그인 → 주문 모니터링 → 상태 변경
```bash
# 1. 관리자 로그인
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"storeId":"<STORE_ID>","username":"admin","password":"admin1234"}'

# 2. 활성 주문 조회
curl http://localhost:3000/api/admin/orders \
  -H "Authorization: Bearer <ADMIN_TOKEN>"

# 3. 주문 상태 변경
curl -X PATCH http://localhost:3000/api/admin/orders/<ORDER_ID>/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{"status":"preparing"}'
```

### 시나리오 3: SSE 실시간 이벤트
```bash
# 터미널 1: SSE 연결
curl -N http://localhost:3000/api/admin/sse \
  -H "Authorization: Bearer <ADMIN_TOKEN>"

# 터미널 2: 주문 생성 (이벤트 발생)
curl -X POST http://localhost:3000/api/customer/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TABLE_TOKEN>" \
  -d '{"items":[{"menuItemId":"<MENU_ID>","quantity":1}]}'
# → 터미널 1에서 order:created 이벤트 수신 확인
```

### 시나리오 4: 헬스체크
```bash
curl http://localhost:3000/health
# 기대: {"status":"ok","database":"connected",...}
```

### 시나리오 5: Swagger UI
```
브라우저에서 http://localhost:3000/api-docs 접속
→ API 문서 확인
```
