export class AIValidationError extends Error {
  constructor(
    message: string,
    public readonly rawResponse: string,
    public readonly zodError?: unknown
  ) {
    super(message);
    this.name = "AIValidationError";
  }
}
