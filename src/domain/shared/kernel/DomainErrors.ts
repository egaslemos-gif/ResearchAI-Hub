export abstract class DomainError extends Error {
  public readonly code: string;

  constructor(message: string, code: string = 'DOMAIN_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
  }
}

export class BusinessRuleViolation extends DomainError {
  constructor(message: string) {
    super(message, 'BUSINESS_RULE_VIOLATION');
  }
}

export class InfrastructureError extends DomainError {
  constructor(message: string) {
    super(message, 'INFRASTRUCTURE_ERROR');
  }
}
