import { Failure } from './failure';

export enum Error {
    LoginError,
    InvalidUserCredentials,
    NoUserData,
    NoUserNickname,
    NoFollowedUsers,
    NoUserPublicMemories,
    NoUserSharedMemories,
}

export const invalidUserCredentialsError = (): Failure<
    Error.InvalidUserCredentials
> => ({
    type: Error.InvalidUserCredentials,
    reason: 'Nickname and passphrase cannot be empty',
});

export const invalidUserDataError = (): Failure<
    Error.NoUserData
> => ({
    type: Error.NoUserData,
    reason: 'User data cannot be null',
});

export const invalidUserNicknameError = (): Failure<
    Error.NoUserNickname
> => ({
    type: Error.NoUserNickname,
    reason: 'User nickname cannot be null',
});

export const loginError = (error: string): Failure<
    Error.LoginError
> => ({
    type: Error.LoginError,
    reason: error,
});