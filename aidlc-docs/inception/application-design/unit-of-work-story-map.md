# Unit of Work — Story Map

## 스토리-유닛 매핑

| 스토리 | Unit 1: Frontend | Unit 2-A: Shared & Customer | Unit 2-B: Admin | 비고 |
|---|---|---|---|---|
| US-C01: 테이블 자동 로그인 | ✅ TableAuth UI | ✅ TableAuthRouter, AuthService | - | 크로스 유닛 |
| US-C02: 메뉴 조회 및 탐색 | ✅ MenuBrowser UI | ✅ MenuRouter, MenuService | - | 크로스 유닛 |
| US-C03: 장바구니 관리 | ✅ Cart UI (로컬) | - | - | 프론트엔드 전용 |
| US-C04: 주문 생성 | ✅ OrderCreate UI | ✅ OrderRouter, OrderService | - | 크로스 유닛 |
| US-C05: 주문 내역 조회 | ✅ OrderHistory UI + SSE | ✅ OrderRouter, SSERouter | - | 크로스 유닛 |
| US-A01: 매장 인증 | ✅ AdminAuth UI | - | ✅ AdminAuthRouter, AuthService | 크로스 유닛 |
| US-A02: 실시간 주문 모니터링 | ✅ OrderDashboard UI + SSE | - | ✅ OrderManageRouter, SSERouter | 크로스 유닛 |
| US-A03: 테이블 관리 | ✅ TableManager UI | - | ✅ TableManageRouter, TableService | 크로스 유닛 |
| US-A04: 메뉴 관리 | ✅ MenuManager UI | - | ✅ MenuManageRouter, FileUpload | 크로스 유닛 |

## 유닛별 스토리 요약

### Unit 1: Frontend
- **전체 스토리**: 9개 (모든 스토리의 UI 부분)
- **프론트엔드 전용**: US-C03 (장바구니 — 로컬 저장소만 사용)
- **크로스 유닛**: 8개 (백엔드 API 연동 필요)

### Unit 2-A: Shared & Customer API
- **담당 스토리**: 4개 (US-C01, US-C02, US-C04, US-C05)
- **공유 레이어**: 모든 ORM 모델, AuthService, OrderService, TableService, MenuService, SSEManager, FileService

### Unit 2-B: Admin API
- **담당 스토리**: 4개 (US-A01, US-A02, US-A03, US-A04)
- **의존**: Unit 2-A의 공유 서비스/모델

## 크로스 유닛 스토리 상세

대부분의 스토리가 프론트엔드(UI) + 백엔드(API)에 걸쳐 있습니다.
OpenAPI 스펙이 두 유닛 간의 계약 역할을 하며, 이를 기반으로 병렬 개발이 가능합니다.

| 계약 문서 | 관련 스토리 |
|---|---|
| `docs/openapi/customer-api.yaml` | US-C01, US-C02, US-C04, US-C05 |
| `docs/openapi/admin-api.yaml` | US-A01, US-A02, US-A03, US-A04 |
