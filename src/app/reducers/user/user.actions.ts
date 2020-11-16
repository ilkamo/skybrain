import { createAction, props } from '@ngrx/store';
import { UserData, UserKeys } from 'src/app/models/user-data';
import { FollowedUser } from 'src/app/models/user-followed-users';

export const authenticateUser = createAction(
  '[Authenticate] Load Authenticates',
  props<{ passphrase: string }>()
);

export const authenticateUserSuccess = createAction(
  '[Authenticate] Load Authenticates Success',
  props<{ user: UserData, keys: UserKeys }>()
);

export const authenticateUserFailure = createAction(
  '[Authenticate] Load Authenticates Failure',
  props<{ error: string }>()
);

export const registerUser = createAction(
  '[Authenticate] Load Registration',
  props<{ passphrase: string }>()
);

export const registerUserSuccess = createAction(
  '[Authenticate] Load Registration Success'
);

export const registerUserFailure = createAction(
  '[Authenticate] Load Registration Failure',
  props<{ error: string }>()
);

export const updateUserData = createAction(
  '[Profile] Update User Data',
  props<{ user: UserData }>()
);

export const updateUserDataSuccess = createAction(
  '[Profile] Update User Data Success',
  props<{ user: UserData }>()
);

export const updateUserDataFailure = createAction(
  '[Profile] Update User Data Failure',
  props<{ error: string }>()
);

export const getFollowedUsers = createAction(
  '[Profile] Get Followed Users'
);
export const getFollowedUsersSuccess = createAction(
  '[Profile] Get Followed Users Success',
  props<{ users: FollowedUser[] }>()
);
export const getFollowedUsersFailure = createAction(
  '[Profile] Get Followed Users Failure',
  props<{ error: string }>()
);

export const followUser = createAction(
  '[Profile] Follow User',
  props<{ publicKey: string }>()
);
export const followUserSuccess = createAction(
  '[Profile] Follow User Success',
  props<{ user: FollowedUser }>()
);
export const followUserFailure = createAction(
  '[Profile] Follow User Failure',
  props<{ error: string }>()
);

export const unfollowUser = createAction(
  '[Profile] Unfollow User',
  props<{ publicKey: string }>()
);
export const unfollowUserSuccess = createAction(
  '[Profile] Unfollow User Success',
  props<{ publicKey: string }>()
);
export const unfollowUserFailure = createAction(
  '[Profile] Unfollow User Failure',
  props<{ error: string }>()
);
