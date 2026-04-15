# Unit of Work 의존성 매트릭스

## 의존성 관계

```
Unit 1: Frontend ──────────────────────────────────────┐
    │                                                   │
    │ (OpenAPI 스펙 참조)                               │ (shared/types 참조)
    │                                                   │
    v                                                   v
Unit 2-A: Shared & Customer API ◄──── shared/types/ ───┘
    │
    │ (공유 서비스/모델 의존)
    v
Unit 2-B: Admin API
```

## 의존성 매트릭스

| 유닛 (행 → 열 의존) | Unit 1: Frontend | Unit 2-A: Shared & Customer | Unit 2-B: Admin | shared/types |
|---|---|---|---|---|
| **Unit 1: Frontend** | - | OpenAPI 스펙 | OpenAPI 스펙 | ✅ 직접 참조 |
| **Unit 2-A: Shared & Customer** | - | - | - | ✅ 정의 주체 |
| **Unit 2-B: Admin** | - | ✅ 공유 서비스/모델 | - | ✅ 직접 참조 |

## 개발 순서 및 병렬화 전략

### Phase 0: 공통 기반 (선행 작업)
- **담당**: 백엔드 (본인)
- **작업**: OpenAPI 스펙 초안 작성, shared/types 정의
- **산출물**: `docs/openapi/customer-api.yaml`, `docs/openapi/admin-api.yaml`, `shared/types/`
- **소요**: 이 단계 완료 후 프론트엔드 병렬 개발 시작 가능

### Phase 1: 병렬 개발
| 백엔드 (본인) | 프론트엔드 (담당자) |
|---|---|
| Unit 2-A: Shared Layer 구현 | Unit 1: 고객 모듈 UI 구현 |
| Unit 2-A: Customer API 구현 | Unit 1: 관리자 모듈 UI 구현 |
| Customer API 테스트 | 프론트엔드 단위 테스트 |

### Phase 2: 순차 개발 (백엔드) + 통합 (프론트엔드)
| 백엔드 (본인) | 프론트엔드 (담당자) |
|---|---|
| Unit 2-B: Admin API 구현 | Customer API 연동 테스트 |
| Admin API 테스트 | Admin API 연동 테스트 |

### Phase 3: 통합 테스트
- 전체 시스템 통합 테스트
- E2E 테스트

## 조정 포인트 (Coordination Points)

| 시점 | 내용 | 참여자 |
|---|---|---|
| Phase 0 완료 | OpenAPI 스펙 리뷰 및 합의 | 백엔드 + 프론트엔드 |
| Phase 1 중간 | API 변경사항 동기화 | 백엔드 + 프론트엔드 |
| Phase 2 시작 | Customer API 연동 확인 | 백엔드 + 프론트엔드 |
| Phase 3 시작 | 전체 통합 테스트 | 백엔드 + 프론트엔드 |
