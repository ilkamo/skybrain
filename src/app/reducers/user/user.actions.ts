import { Action, createAction, props } from '@ngrx/store';
import { UserData, UserKeys } from 'src/app/models/user-data';
import { ConnectedUser } from 'src/app/models/user-connected-users';

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

export const getConnectedUsers = createAction(
  '[Profile] Get Connected Users'
);
export const getConnectedUsersSuccess = createAction(
  '[Profile] Get Connected Users Success',
  props<{ users: ConnectedUser[] }>()
);
export const getConnectedUsersFailure = createAction(
  '[Profile] Get Connected Users Failure',
  props<{ error: string }>()
);

export const connectUser = createAction(
  '[Profile] Connect User',
  props<{ publicKey: string }>()
);
export const connectUserSuccess = createAction(
  '[Profile] Connect User Success',
  props<{ user: ConnectedUser }>()
);
export const connectUserFailure = createAction(
  '[Profile] Connect User Failure',
  props<{ error: string }>()
);

export const unconnectUser = createAction(
  '[Profile] Unconnect User',
  props<{ publicKey: string }>()
);
export const unconnectUserSuccess = createAction(
  '[Profile] Unconnect User Success',
  props<{ publicKey: string }>()
);
export const unconnectUserFailure = createAction(
  '[Profile] Unconnect User Failure',
  props<{ error: string }>()
);
export const runUserAuthAction = createAction(
  '[Profile] Run User Auth Action'
);
export const runUserAuthActionSuccess = createAction(
    '[Profile] Run User Auth Action Success',
    props<{ authAction?: Action }>()
);
