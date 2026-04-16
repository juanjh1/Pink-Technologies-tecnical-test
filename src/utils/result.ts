export class Result<TValue, TError> {
  success: boolean;
  value: TValue | null;
  error: TError | null;

  constructor(ok: boolean, value: TValue | null, error: TError | null) {
    this.success = ok;
    this.value = value;
    this.error = error;
  }

  static ok<TValue>(value: TValue) {
    return new Result<TValue, never>(true, value, null);
  }

  static err<TError>(error: TError) {
    return new Result<never, TError>(false, null, error);
  }

  get isOk() {
    return this.success;
  }

  get isErr() {
    return !this.success;
  }
}
