// 기본 애플리케이션 에러
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(code: string, message: string, statusCode: number, details?: unknown) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.name = this.constructor.name;
  }
}

// 400 — 입력 검증 실패
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

// 401 — 인증 실패
export class AuthenticationError extends AppError {
  constructor(message = '인증에 실패했습니다.') {
    super('AUTHENTICATION_ERROR', message, 401);
  }
}

// 403 — 권한 부족
export class AuthorizationError extends AppError {
  constructor(message = '접근 권한이 없습니다.') {
    super('AUTHORIZATION_ERROR', message, 403);
  }
}

// 404 — 리소스 없음
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND_ERROR', `${resource}을(를) 찾을 수 없습니다.`, 404);
  }
}

// 409 — 중복 데이터
export class DuplicateError extends AppError {
  constructor(resource: string) {
    super('DUPLICATE_ERROR', `이미 존재하는 ${resource}입니다.`, 409);
  }
}

// 429 — 시도 횟수 초과
export class TooManyAttemptsError extends AppError {
  constructor(message = '로그인 시도 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.') {
    super('TOO_MANY_ATTEMPTS', message, 429);
  }
}

// 422 — 잘못된 상태
export class InvalidStateError extends AppError {
  constructor(message: string) {
    super('INVALID_STATE_ERROR', message, 422);
  }
}
