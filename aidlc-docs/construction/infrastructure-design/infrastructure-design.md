# 인프라 설계 (Infrastructure Design) — 전체 유닛 통합

---

## 1. 인프라 개요

### 배포 환경
- **클라우드**: AWS (ap-northeast-2, 서울 리전)
- **환경**: 프로덕션(prod) 1개 환경 (MVP)
- **컨테이너화**: 미적용 — EC2 직접 배포 + PM2 프로세스 매니저

### 아키텍처 요약
```
                    ┌─────────────┐
                    │   클라이언트  │
                    │ (브라우저)    │
                    └──────┬──────┘
                           │ HTTPS
                    ┌──────▼──────┐
                    │     ALB     │
                    │ (ACM 인증서) │
                    └──────┬──────┘
                           │ HTTP (내부)
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼──────┐ ┌──▼───┐ ┌──────▼──────┐
       │   EC2 #1    │ │  ... │ │   EC2 #2    │
       │ Express App │ │      │ │ Express App │
       │ (PM2)       │ │      │ │ (PM2)       │
       └──────┬──────┘ └──────┘ └──────┬──────┘
              │                         │
              └────────────┬────────────┘
                           │
              ┌────────────┼────────────┐
              │                         │
       ┌──────▼──────┐          ┌──────▼──────┐
       │  RDS        │          │  S3 Bucket  │
       │  PostgreSQL │          │  (이미지)    │
       │  (t3.micro) │          │  퍼블릭 접근 │
       └─────────────┘          └─────────────┘
```

---

## 2. 컴퓨팅 인프라 (Compute)

### EC2 인스턴스
| 항목 | 설정 |
|---|---|
| 인스턴스 타입 | t3.small (2 vCPU, 2GB RAM) |
| 인스턴스 수 | 최소 2개 (ALB 헬스체크 + 고가용성) |
| OS | Amazon Linux 2023 |
| Node.js | v20.x LTS (nvm 관리) |
| 프로세스 매니저 | PM2 (클러스터 모드, CPU 코어 수만큼 워커) |
| 보안 그룹 | 인바운드: ALB에서 80 포트만 허용 |

### 단일 Express 서버 구성
- Customer API + Admin API를 하나의 Express 앱에서 라우팅 분리
- 프론트엔드 빌드 결과물도 동일 서버에서 정적 파일 서빙
- 라우팅 구조:
  ```
  / (정적 파일)          → React 빌드 결과물 (express.static)
  /api/customer/*        → Customer API 라우터
  /api/admin/*           → Admin API 라우터
  /api-docs              → Swagger UI
  /health                → 헬스체크 엔드포인트
  ```

### PM2 설정
```json
{
  "apps": [{
    "name": "table-order-api",
    "script": "dist/index.js",
    "instances": "max",
    "exec_mode": "cluster",
    "env": {
      "NODE_ENV": "production"
    },
    "max_memory_restart": "500M",
    "log_date_format": "YYYY-MM-DD HH:mm:ss Z"
  }]
}
```

### SSE + PM2 클러스터 고려사항
- SSE 연결은 특정 워커 프로세스에 바인딩됨
- ALB Sticky Session (쿠키 기반) 활성화로 SSE 연결 유지
- SSE 이벤트 버퍼는 프로세스 메모리 → 클러스터 간 공유 불가
- **해결 방안**: PM2 클러스터 대신 단일 프로세스 모드 사용, 또는 Redis Pub/Sub 도입 (추후)
- **MVP 결정**: 단일 프로세스 모드 (`instances: 1` per EC2) + ALB 2개 인스턴스로 가용성 확보

---

## 3. 스토리지 인프라 (Storage)

### RDS PostgreSQL
| 항목 | 설정 |
|---|---|
| 엔진 | PostgreSQL 15.x |
| 인스턴스 클래스 | db.t3.micro (MVP 비용 절감) |
| 스토리지 | 20GB gp3 (자동 확장 활성화, 최대 100GB) |
| Multi-AZ | 비활성화 (단일 인스턴스) |
| 자동 백업 | 7일 보존 (기본값) |
| 보안 그룹 | EC2 보안 그룹에서 5432 포트만 허용 |
| 파라미터 그룹 | 기본값 + `timezone: Asia/Seoul` |
| 암호화 | 활성화 (AWS 관리형 키) |

### S3 이미지 버킷
| 항목 | 설정 |
|---|---|
| 버킷명 | `table-order-images-{account-id}` |
| 리전 | ap-northeast-2 |
| 접근 방식 | 퍼블릭 읽기 허용 (버킷 정책) |
| 버전 관리 | 비활성화 (MVP) |
| 수명 주기 | 미설정 (MVP) |
| CORS | 프론트엔드 오리진 허용 |
| 폴더 구조 | `menus/{storeId}/{uuid}.{ext}` |

### S3 버킷 정책 (퍼블릭 읽기)
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::table-order-images-*/*"
  }]
}
```

---

## 4. 네트워킹 인프라 (Networking)

### VPC 구성
| 항목 | 설정 |
|---|---|
| VPC CIDR | 10.0.0.0/16 |
| 퍼블릭 서브넷 | 2개 (AZ-a, AZ-c) — EC2, ALB |
| 프라이빗 서브넷 | 2개 (AZ-a, AZ-c) — RDS |
| NAT Gateway | 미사용 (EC2가 퍼블릭 서브넷) |
| Internet Gateway | 활성화 |

### Application Load Balancer (ALB)
| 항목 | 설정 |
|---|---|
| 유형 | Application Load Balancer |
| 스킴 | Internet-facing |
| 리스너 | HTTPS:443 → 타겟 그룹 (HTTP:80) |
| SSL 인증서 | ACM 발급 (ALB 기본 DNS) |
| 타겟 그룹 | EC2 인스턴스 (포트 3000) |
| 헬스체크 | GET /health (간격 30초, 임계값 3회) |
| Sticky Session | 활성화 (SSE 연결 유지용, 쿠키 기반, 16시간) |
| 유휴 타임아웃 | 3600초 (SSE 장시간 연결 지원) |

### 보안 그룹 구성
| 보안 그룹 | 인바운드 규칙 |
|---|---|
| ALB SG | 0.0.0.0/0 → 443 (HTTPS) |
| EC2 SG | ALB SG → 3000 (HTTP), SSH 관리 IP → 22 |
| RDS SG | EC2 SG → 5432 (PostgreSQL) |

---

## 5. 모니터링 인프라 (Monitoring)

### CloudWatch (기본 구성)
| 항목 | 설정 |
|---|---|
| EC2 메트릭 | CPU, 네트워크, 디스크 (기본 5분 간격) |
| RDS 메트릭 | CPU, 연결 수, 스토리지 (기본) |
| ALB 메트릭 | 요청 수, 응답 시간, 5xx 에러 (기본) |
| 로그 | 미전송 (PM2 로컬 로그 파일 관리) |
| 알람 | 미설정 (MVP — 추후 추가) |

### 애플리케이션 로깅
- winston → PM2 로그 파일 (`~/.pm2/logs/`)
- PM2 로그 로테이션: `pm2-logrotate` 모듈 (일별, 최대 7일 보존)
- 필요 시 SSH 접속하여 로그 확인

---

## 6. 배포 전략 (Deployment)

### 수동 배포 프로세스
```
1. 로컬에서 빌드:
   - npm run build (프론트엔드 + 백엔드 TypeScript 컴파일)

2. EC2에 배포:
   - scp 또는 rsync로 빌드 결과물 전송
   - SSH 접속 → npm install --production
   - pm2 reload table-order-api (무중단 재시작)

3. 데이터베이스 마이그레이션:
   - SSH 접속 → npx sequelize-cli db:migrate
```

### 배포 순서 (다중 인스턴스)
1. EC2 #1을 ALB 타겟에서 제거 (deregister)
2. EC2 #1 배포 + 검증
3. EC2 #1을 ALB 타겟에 재등록
4. EC2 #2 동일 과정 반복

---

## 7. 비용 추정 (월간, 서울 리전 기준)

| 서비스 | 사양 | 예상 비용 (USD/월) |
|---|---|---|
| EC2 (x2) | t3.small, On-Demand | ~$30 |
| RDS | db.t3.micro, 20GB | ~$15 |
| ALB | 기본 요금 + LCU | ~$20 |
| S3 | 이미지 저장 (수 GB) | ~$1 |
| 데이터 전송 | 아웃바운드 | ~$5 |
| **합계** | | **~$71/월** |

> 참고: Reserved Instance 또는 Savings Plan 적용 시 30~40% 절감 가능
