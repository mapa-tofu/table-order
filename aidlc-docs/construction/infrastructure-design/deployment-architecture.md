# 배포 아키텍처 (Deployment Architecture)

---

## 1. 전체 아키텍처 다이어그램

```
                         ┌──────────────────────────────────────────┐
                         │              AWS Cloud                    │
                         │           (ap-northeast-2)                │
                         │                                          │
    ┌──────────┐         │  ┌──────────────────────────────────┐    │
    │ 클라이언트 │ HTTPS   │  │        VPC (10.0.0.0/16)         │    │
    │ (브라우저) │────────►│  │                                  │    │
    └──────────┘         │  │  ┌────────────────────────────┐  │    │
                         │  │  │   퍼블릭 서브넷 (AZ-a, c)   │  │    │
                         │  │  │                            │  │    │
                         │  │  │  ┌──────────────────────┐  │  │    │
                         │  │  │  │   ALB (HTTPS:443)    │  │  │    │
                         │  │  │  │   ACM SSL 인증서      │  │  │    │
                         │  │  │  │   Sticky Session     │  │  │    │
                         │  │  │  └──────────┬───────────┘  │  │    │
                         │  │  │             │              │  │    │
                         │  │  │     ┌───────┴───────┐      │  │    │
                         │  │  │     │               │      │  │    │
                         │  │  │  ┌──▼────┐   ┌─────▼──┐   │  │    │
                         │  │  │  │EC2 #1 │   │ EC2 #2 │   │  │    │
                         │  │  │  │t3.small│   │t3.small│   │  │    │
                         │  │  │  │       │   │        │   │  │    │
                         │  │  │  │ PM2   │   │  PM2   │   │  │    │
                         │  │  │  │Express│   │Express │   │  │    │
                         │  │  │  │ App   │   │  App   │   │  │    │
                         │  │  │  └──┬────┘   └────┬───┘   │  │    │
                         │  │  │     │             │       │  │    │
                         │  │  └─────┼─────────────┼───────┘  │    │
                         │  │        │             │          │    │
                         │  │  ┌─────┼─────────────┼───────┐  │    │
                         │  │  │  프라이빗 서브넷 (AZ-a, c) │  │    │
                         │  │  │     │             │       │  │    │
                         │  │  │  ┌──▼─────────────▼──┐    │  │    │
                         │  │  │  │   RDS PostgreSQL  │    │  │    │
                         │  │  │  │   db.t3.micro     │    │  │    │
                         │  │  │  │   단일 인스턴스     │    │  │    │
                         │  │  │  └───────────────────┘    │  │    │
                         │  │  └───────────────────────────┘  │    │
                         │  └──────────────────────────────────┘    │
                         │                                          │
                         │  ┌──────────────────────────────────┐    │
                         │  │  S3 Bucket (이미지)               │    │
                         │  │  퍼블릭 읽기 허용                  │    │
                         │  │  menus/{storeId}/{uuid}.{ext}    │    │
                         │  └──────────────────────────────────┘    │
                         │                                          │
                         │  ┌──────────────────────────────────┐    │
                         │  │  CloudWatch (기본 메트릭)          │    │
                         │  │  EC2 + RDS + ALB 기본 모니터링     │    │
                         │  └──────────────────────────────────┘    │
                         └──────────────────────────────────────────┘
```

---

## 2. 요청 흐름 (Request Flow)

### 2.1 정적 파일 요청 (프론트엔드)
```
브라우저 → ALB (HTTPS) → EC2 Express → express.static('client/dist') → HTML/JS/CSS 응답
```

### 2.2 Customer API 요청
```
브라우저 → ALB (HTTPS) → EC2 Express → /api/customer/* 라우터 → 비즈니스 로직 → RDS → JSON 응답
```

### 2.3 Admin API 요청
```
브라우저 → ALB (HTTPS) → EC2 Express → /api/admin/* 라우터 → 비즈니스 로직 → RDS → JSON 응답
```

### 2.4 이미지 업로드 흐름
```
관리자 브라우저 → ALB → EC2 Express (multer) → 임시 파일 저장
                                              → 즉시 응답 (임시 상태)
                                              → 백그라운드: S3 업로드
                                              → MenuItem.imageUrl 업데이트
                                              → 임시 파일 삭제
```

### 2.5 이미지 조회 흐름
```
브라우저 → S3 퍼블릭 URL (직접 접근) → 이미지 응답
```

### 2.6 SSE 연결 흐름
```
브라우저 → ALB (HTTPS, Sticky Session) → EC2 Express → SSE 연결 유지
                                                      → 이벤트 발생 시 push
                                                      → 연결 끊김 시 자동 재연결
                                                      → Last-Event-ID로 놓친 이벤트 재전송
```

---

## 3. Express 앱 통합 구조

```
table-order/
├── server/
│   ├── src/
│   │   ├── index.ts              # 메인 엔트리포인트
│   │   ├── app.ts                # Express 앱 설정
│   │   │   ├── express.static()  # React 빌드 서빙
│   │   │   ├── /api/customer/*   # Customer API 라우터 마운트
│   │   │   ├── /api/admin/*      # Admin API 라우터 마운트
│   │   │   ├── /api-docs         # Swagger UI
│   │   │   └── /health           # 헬스체크
│   │   ├── shared/               # 공유 서비스/모델
│   │   ├── customer-api/         # Customer API 라우터
│   │   └── admin-api/            # Admin API 라우터
│   ├── dist/                     # TypeScript 컴파일 결과
│   └── package.json
├── client/
│   ├── src/                      # React 소스
│   ├── dist/                     # Vite 빌드 결과 (Express에서 서빙)
│   └── package.json
└── package.json                  # 모노레포 루트
```

### 빌드 스크립트
```json
{
  "scripts": {
    "build": "npm run build:client && npm run build:server",
    "build:client": "npm run --workspace=client build",
    "build:server": "npm run --workspace=server build",
    "start": "node server/dist/index.js",
    "start:pm2": "pm2 start ecosystem.config.js"
  }
}
```

---

## 4. 환경별 설정

### 프로덕션 환경 (.env.production)
```env
NODE_ENV=production
PORT=3000

# 데이터베이스
DB_HOST=<rds-endpoint>.ap-northeast-2.rds.amazonaws.com
DB_PORT=5432
DB_NAME=table_order
DB_USER=postgres
DB_PASSWORD=<secret>

# 인증
JWT_SECRET=<secret>
JWT_EXPIRES_IN=16h

# AWS
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET=table-order-images-<account-id>
AWS_ACCESS_KEY_ID=<secret>
AWS_SECRET_ACCESS_KEY=<secret>

# 서버
CORS_ORIGIN=https://<alb-dns>
LOG_LEVEL=info
```

---

## 5. 헬스체크 엔드포인트

### GET /health
```json
{
  "status": "ok",
  "timestamp": "2026-04-15T09:00:00Z",
  "uptime": 3600,
  "database": "connected",
  "memory": {
    "used": "128MB",
    "total": "2048MB"
  }
}
```

- ALB 헬스체크: 30초 간격, 연속 3회 실패 시 unhealthy
- 응답 코드: 200 (정상), 503 (DB 연결 실패)

---

## 6. SSE 다중 인스턴스 전략

### 문제점
- SSE 연결은 특정 EC2 인스턴스의 프로세스에 바인딩
- 인스턴스 A에서 발생한 이벤트가 인스턴스 B의 SSE 클라이언트에 전달되지 않음

### MVP 해결 방안
1. **ALB Sticky Session**: 동일 클라이언트는 항상 동일 인스턴스로 라우팅
2. **PM2 단일 프로세스**: 각 EC2에서 1개 Node.js 프로세스만 실행
3. **이벤트 발행자 = SSE 서버**: 주문 생성/상태 변경 API를 호출한 인스턴스가 직접 SSE 이벤트 발행
4. **제한사항**: 인스턴스 A에서 주문 상태를 변경하면, 인스턴스 B에 연결된 SSE 클라이언트는 즉시 알림을 받지 못함
5. **완화 전략**: 프론트엔드에서 주기적 폴링 (30초 간격) 병행으로 데이터 동기화

### 추후 개선 (운영 단계)
- Redis Pub/Sub 도입으로 인스턴스 간 이벤트 브로드캐스트
- 또는 Amazon ElastiCache (Redis) 활용

---

## 7. 보안 구성

### 네트워크 보안
- ALB: HTTPS만 허용 (HTTP → HTTPS 리다이렉트)
- EC2: ALB에서만 접근 가능 (보안 그룹)
- RDS: EC2에서만 접근 가능 (프라이빗 서브넷 + 보안 그룹)
- S3: 퍼블릭 읽기만 허용 (쓰기는 IAM 역할)

### IAM 구성
- EC2 인스턴스 프로파일: S3 PutObject/DeleteObject 권한
- RDS: 마스터 사용자 + 애플리케이션 전용 사용자 분리 권장

### 시크릿 관리
- MVP: EC2 인스턴스의 .env 파일 (SSH 접근 제한)
- 추후: AWS Secrets Manager 또는 SSM Parameter Store 도입
