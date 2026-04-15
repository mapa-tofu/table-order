# 비즈니스 규칙 — Unit 2-B: Backend Admin API

> Unit 2-A의 공유 비즈니스 규칙(AUTH, ORD, MENU, STATE, INT)이 모두 적용됩니다.
> 이 문서는 Admin API 전용 추가 규칙만 정의합니다.

---

## 1. Admin API 접근 제어 규칙

| 규칙 ID | 규칙 | 설명 |
|---|---|---|
| ADMIN-01 | 모든 Admin API는 AdminAuthMiddleware 필수 | JWT 검증 없이 접근 불가 |
| ADMIN-02 | JWT의 role이 'admin'이어야 함 | 테이블 JWT로 Admin API 접근 불가 |
| ADMIN-03 | JWT의 storeId로 데이터 격리 | 다른 매장 데이터 접근 불가 |

## 2. 메뉴 관리 추가 규칙

| 규칙 ID | 규칙 | 설명 |
|---|---|---|
| ADMIN-MENU-01 | 메뉴 삭제 시 기존 이미지 S3에서 삭제 | 고아 파일 방지 |
| ADMIN-MENU-02 | 메뉴 수정 시 이미지 교체되면 기존 이미지 삭제 | 고아 파일 방지 |
| ADMIN-MENU-03 | 이미지 업로드 파일 크기 제한: 5MB | 서버 부하 방지 |
| ADMIN-MENU-04 | 이미지 허용 형식: JPEG, PNG, WebP | 지원 형식 제한 |

## 3. 주문 관리 추가 규칙

| 규칙 ID | 규칙 | 설명 |
|---|---|---|
| ADMIN-ORD-01 | 주문 삭제 시 확인 필수 (프론트엔드 팝업) | 실수 방지 — API는 즉시 삭제 |
| ADMIN-ORD-02 | 주문 삭제 후 테이블 총 주문액 재계산 | SSE로 실시간 반영 |

## 4. 테이블 관리 추가 규칙

| 규칙 ID | 규칙 | 설명 |
|---|---|---|
| ADMIN-TBL-01 | 이용 완료 시 확인 필수 (프론트엔드 팝업) | 실수 방지 — API는 즉시 처리 |
| ADMIN-TBL-02 | 이용 완료 후 새 고객은 이전 내역 없이 시작 | 세션 리셋 보장 |

---

## 5. Testable Properties (PBT-01)

> Unit 2-A에서 식별된 PBT 속성이 공유 서비스를 통해 Admin API에도 적용됩니다.
> Admin API 전용 추가 PBT 속성:

| 컴포넌트 | 속성 카테고리 | 설명 |
|---|---|---|
| 메뉴 이미지 교체 로직 | Invariant | 메뉴 수정 시 이미지 교체 → 기존 이미지 삭제 + 새 이미지 저장 (이미지 수 불변) |
| Admin JWT 검증 | Invariant | role='admin' 클레임이 없는 토큰은 항상 거부 |

### PBT 미적용 컴포넌트
| 컴포넌트 | 사유 |
|---|---|
| Admin Express 라우터 | HTTP 핸들러 — 통합 테스트로 커버 |
| 확인 팝업 로직 | 프론트엔드 전용 (Unit 1) |
