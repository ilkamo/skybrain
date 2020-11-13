export enum ErrorType {
    LoginError,
    RegisterError,
    FetchMemoriesError,
    AddMemoryError,
    StoreMemoryError,
    DeleteMemoryError,
    FetchPublicMemoriesError,
    AddPublicMemoryError,
    DeletePublicMemoryError,
    FetchFollowedUsersError,
    FollowUserError,
    UnfollowUserError,
    FetchPublicMemoriesOfFollowedUserByPublicKeyError,
    FetchSharedMemoriesError,
    ShareMemoryError,
    ResolveSharedMemoryError,
    EncryptionError,
    InitUserSkyDBError,
}

export class ServiceError extends Error {
    private _errorType: ErrorType;
    constructor(message: string, errorType: ErrorType) {
        super(message);
        this._errorType = errorType;
    }

    public Type(): ErrorType {
        return this._errorType;
    }
}