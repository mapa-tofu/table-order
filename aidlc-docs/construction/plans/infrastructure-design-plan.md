# Infrastructure Design 계획 — 전체 유닛 통합

> 기능 설계 + NFR Requirements를 기반으로 논리적 컴포넌트를 AWS 인프라에 매핑합니다.

---

## 진행 체크리스트

- [x] Step 1: 설계 산출물 분석
- [x] Step 2: 인프라 질문 생성
- [x] Step 3: 사용자 답변 수집
- [x] Step 4: Infrastructure Design 산출물 생성
- [x] Step 5: 사용자 승인 (2026-04-15)

---

## 인프라 매핑 대상 (논리적 컴포넌트 → AWS 서비스)

| 논리적 컴포넌트 | 설명 |
|---|---|
| React 클라이언트 앱 | 정적 파일 호스팅 |
| Express Customer API | 고객용 REST API + SSE |
| Express Admin API | 관리자용 REST API + SSE |
| PostgreSQL 데이터베이스 | 관계형 데이터 저장 |
| S3 이미지 저장소 | 메뉴 이미지 파일 |
| SSE 연결 관리 | 실시간 이벤트 스트리밍 |
| 로드 밸런서 | 다중 인스턴스 트래픽 분배 |
| 로깅/모니터링 | 운영 가시성 |

---

## 인프라 설계 질문

### 배포 환경 (Deployment)

**Q1. 컨테이너화 여부**
백엔드 서버 배포 방식은?

- A) Docker 컨테이너 (ECS Fargate — 서버리스 컨테이너)
- B) Docker 컨테이너 (ECS EC2 — 직접 인스턴스 관리)
- C) EC2 직접 배포 (PM2 프로세스 매니저)
- D) Elastic Beanstalk (관리형 배포)

[Answer]:C

**Q2. 환경 분리**
배포 환경 구성은?

- A) 개발(dev) + 프로덕션(prod) 2개 환경
- B) 개발(dev) + 스테이징(staging) + 프로덕션(prod) 3개 환경
- C) 프로덕션(prod) 1개만 (MVP)

[Answer]:C

---

### 컴퓨팅 (Compute)

**Q3. Customer API와 Admin API 배포 분리**
두 API 서버의 배포 방식은?

- A) 단일 Express 서버에서 라우팅 분리 (하나의 서비스)
- B) 별도 서비스로 분리 배포 (독립 스케일링)

[Answer]:A

**Q4. 프론트엔드 호스팅**
React 빌드 결과물 호스팅 방식은?

- A) S3 + CloudFront (CDN 배포)
- B) Express 서버에서 정적 파일 서빙
- C) 별도 Nginx 서버

[Answer]:B

---

### 스토리지 (Storage)

**Q5. RDS 인스턴스 구성**
PostgreSQL RDS 구성은?

- A) 단일 인스턴스 (db.t3.micro/small — MVP 비용 절감)
- B) Multi-AZ 배포 (자동 장애 조치 — 높은 가용성)
- C) 단일 인스턴스 + 자동 백업 (중간 수준)

[Answer]:A

**Q6. S3 이미지 접근 방식**
메뉴 이미지 S3 접근 방식은?

- A) CloudFront를 통한 CDN 배포 (빠른 로딩)
- B) S3 퍼블릭 URL 직접 접근
- C) 서버를 통한 프록시 (Signed URL)

[Answer]:B

---

### 네트워킹 (Networking)

**Q7. 로드 밸런서 유형**
NFR에서 다중 인스턴스 + 로드 밸런서가 결정되었습니다. 유형은?

- A) Application Load Balancer (ALB) — HTTP/HTTPS, SSE 지원
- B) Network Load Balancer (NLB) — TCP 레벨

[Answer]:A

**Q8. 도메인 및 SSL**
도메인 설정은?

- A) Route 53 + ACM 인증서 (커스텀 도메인 + HTTPS)
- B) ALB 기본 DNS + ACM 인증서 (HTTPS만)
- C) MVP에서는 HTTP만 (추후 HTTPS 적용)

[Answer]:B

---

### 모니터링 (Monitoring)

**Q9. 모니터링 도구**
AWS 모니터링 구성은?

- A) CloudWatch (로그 + 메트릭 + 알람) — AWS 네이티브
- B) CloudWatch 로그 + 외부 도구 (Datadog, Grafana 등)
- C) 기본 CloudWatch 메트릭만 (최소 구성)

[Answer]:C

---

### CI/CD

**Q10. CI/CD 파이프라인**
배포 자동화 방식은?

- A) GitHub Actions (CI) + AWS CodeDeploy (CD)
- B) AWS CodePipeline + CodeBuild + CodeDeploy (전체 AWS)
- C) GitHub Actions만 (CI + CD 통합)
- D) MVP에서는 수동 배포 (추후 자동화)

[Answer]:D
