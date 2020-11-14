import { Action, createReducer, on } from '@ngrx/store';
import { LoadingState } from 'src/app/models/loading-state';
import { UserData, UserKeys } from 'src/app/models/user-data';
import * as UserActions from './user.actions';

export const userFeatureKey = 'user';

export interface State extends LoadingState  {
  authenticated: boolean;
  user?: UserData;
  keys?: Partial<UserKeys>;
}

export const initialState: State = {
  authenticated: false,
  loading: false,
  user: undefined,
  keys: undefined
};

export const reducer = createReducer(
  initialState,

  on(UserActions.authenticateUser, _ => ({ ...initialState, loading: true })),
  on(UserActions.authenticateUserFailure, (_, action) => ({ ...initialState, loading: false, error: action.error || 'Error' })),
  on(UserActions.authenticateUserSuccess, (_, action) => ({
    ...initialState,
    loading: false,
    error: undefined,
    user: action.user,
    authenticated: true,
    keys: action.keys
  })),

  on(UserActions.registerUser, _ => ({ ...initialState, loading: true})),
  on(UserActions.registerUserFailure, (_, action) => ({ ...initialState, loading: false, error: action.error })),
  on(UserActions.registerUserSuccess, _ => ({ ...initialState, loading: false, error: undefined })),

  on(UserActions.updateUserData, (state) => ({ ...state, loading: true, error: undefined })),
  on(UserActions.updateUserDataSuccess, (state, action) => ({ ...state, user: action.user, loading: false, error: undefined })),
  on(UserActions.updateUserDataFailure, (state, action) => ({ ...state, loading: false, error: action.error }))
);

