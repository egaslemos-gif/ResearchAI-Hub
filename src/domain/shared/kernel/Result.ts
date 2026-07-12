export class Result<T, E> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  public readonly error: E | string;
  private readonly _value: T;

  private constructor(isSuccess: boolean, error?: E | string, value?: T) {
    if (isSuccess && error) {
      throw new Error('InvalidOperation: A result cannot be successful and contain an error');
    }
    if (!isSuccess && !error) {
      throw new Error('InvalidOperation: A failing result needs to contain an error message');
    }

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error as E | string;
    this._value = value as T;
    
    Object.freeze(this);
  }

  public getValue(): T {
    if (!this.isSuccess) {
      throw new Error("Can't get the value of an error result. Use 'error' instead.");
    }
    return this._value;
  }

  public static ok<U>(value?: U): Result<U, never> {
    return new Result<U, never>(true, undefined, value);
  }

  public static fail<U, E>(error: E | string): Result<U, E> {
    return new Result<U, E>(false, error);
  }
}
