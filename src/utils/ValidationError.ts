export class ValidationError extends Error {
  public readonly statusCode: number;
  public readonly errors: Record<string, unknown>;

  constructor(message: string, errors: Record<string, unknown>) {
    super(message);
    this.statusCode = 400;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}
