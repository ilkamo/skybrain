// tslint:disable no-any
export enum ApiErrorType {
  UNKNOWN,
  GENERAL,
  SKY_ERROR,
}

export class ServiceError extends Error {
  constructor(message: string, private _errorType: ApiErrorType, private _orginalError: any = null) {
      super(message);
  }

  public get type(): ApiErrorType {
    return this._errorType;
  }

  public get orginalError(): any {
    return this._orginalError;
  }
}

export function throwApiError(error: any, type = ApiErrorType.UNKNOWN): never {
  if (typeof error === 'string') {
    throw new ServiceError(error, type, error);
  }

  if (error && typeof error === 'object' && 'message' in error) {
    throw new ServiceError(error.message, type, error);
  }

  throw new ServiceError('unknown error', ApiErrorType.UNKNOWN, error);
}
