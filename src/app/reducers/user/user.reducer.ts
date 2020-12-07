import { Action, createReducer, on } from '@ngrx/store';
import { LoadingState } from 'src/app/models/loading-state';
import { UserData, UserKeys } from 'src/app/models/user-data';
import { ConnectedUser } from 'src/app/models/user-connected-users';
import * as UserActions from './user.actions';
import * as RouterActions from '../router/router.actions';

export const userFeatureKey = 'user';

export interface State extends LoadingState  {
  authenticated: boolean;
  user?: UserData;
  keys?: Partial<UserKeys>;
  connectedUsers: ConnectedUser[];
  authAction?: Action;
}

export const initialState: State = {
  authenticated: false,
  loading: false,
  user: undefined,
  keys: undefined,
  connectedUsers: [],
  authAction: undefined
};

export const reducer = createReducer(
  initialState,

  on(UserActions.authenticateUser, state => ({ ...state, loading: true })),
  on(UserActions.authenticateUserFailure, (state, action) => ({ ...state, loading: false, error: action.error || 'Error' })),
  on(UserActions.authenticateUserSuccess, (state, action) => ({
    ...state,
    loading: true,
    error: undefined,
    user: action.user,
    authenticated: true,
    keys: action.keys
  })),

  on(UserActions.registerUser, state => ({ ...state, loading: true})),
  on(UserActions.registerUserFailure, (state, action) => ({ ...state, loading: false, error: action.error })),
  on(UserActions.registerUserSuccess, state => ({ ...state, loading: false, error: undefined })),

  on(UserActions.updateUserData, (state) => ({ ...state, loading: true, error: undefined })),
  on(UserActions.updateUserDataSuccess, (state, action) => ({ ...state, user: action.user, loading: false, error: undefined })),
  on(UserActions.updateUserDataFailure, (state, action) => ({ ...state, loading: false, error: action.error })),

  on(UserActions.getConnectedUsers, (state) => ({ ...state, loading: true, error: undefined })),
  on(UserActions.getConnectedUsersSuccess, (state, action) => ({
     ...state, connectedUsers: action.users, loading: false, error: undefined
  })),
  on(UserActions.getConnectedUsersFailure, (state, action) => ({ ...state, loading: false, error: action.error })),

  on(UserActions.connectUser, (state) => ({ ...state, loading: true, error: undefined })),
  on(UserActions.connectUserSuccess, (state, action) => {
    const index = state.connectedUsers.findIndex(u => u.publicKey === action.user.publicKey);
    if (index !== -1) {
      return { ...state, loading: false } as State;
    }
    const connectedUsers = [ ...state.connectedUsers, action.user ];
    connectedUsers.sort((a, b) => {
      return b.startedAt.getTime() - a.startedAt.getTime();
    });
    return { ...state, connectedUsers, loading: false, error: undefined };
  }),
  on(UserActions.connectUserFailure, (state, action) => ({ ...state, loading: false, error: action.error })),

  on(UserActions.unconnectUser, (state) => ({ ...state, loading: true, error: undefined })),
  on(UserActions.unconnectUserSuccess, (state, action) => {
    const index = state.connectedUsers.findIndex(u => u.publicKey === action.publicKey);
    if (index === -1) {
      return { ...state, loading: false } as State;
    }
    const connectedUsers = [ ...state.connectedUsers ];
    connectedUsers.splice(index, 1);
    return { ...state, connectedUsers, loading: false, error: undefined };
  }),
  on(UserActions.unconnectUserFailure, (state, action) => ({ ...state, loading: false, error: action.error })),

  on(RouterActions.navigate, (state, action) => {
    if (!action.authAction) {
      return state;
    }
    return { ...state, authAction: action.authAction };
  }),

  on(RouterActions.navigateByUrl, (state, action) => {
    if (!action.authAction) {
      return state;
    }
    return { ...state, authAction: action.authAction };
  }),

  on(UserActions.runUserAuthActionSuccess, state => {
    return { ...state, authAction: undefined };
  })
 );

