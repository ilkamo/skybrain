import { createAction, props } from '@ngrx/store';
import { UserData, UserKeys } from 'src/app/models/user-data';

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
