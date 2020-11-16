import { createReducer, on, Store } from '@ngrx/store';
import { LoadingState } from 'src/app/models/loading-state';
import { UserData, UserKeys } from 'src/app/models/user-data';
import { FollowedUser } from 'src/app/models/user-followed-users';
import * as UserActions from './user.actions';

export const userFeatureKey = 'user';

export interface State extends LoadingState  {
  authenticated: boolean;
  user?: UserData;
  keys?: Partial<UserKeys>;
  followedUsers: FollowedUser[];
}

export const initialState: State = {
  authenticated: false,
  loading: false,
  user: undefined,
  keys: undefined,
  followedUsers: [],
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
  on(UserActions.updateUserDataFailure, (state, action) => ({ ...state, loading: false, error: action.error })),

  on(UserActions.getFollowedUsers, (state) => ({ ...state, loading: true, error: undefined })),
  on(UserActions.getFollowedUsersSuccess, (state, action) => ({ ...state, followedUsers: action.users, loading: false, error: undefined })),
  on(UserActions.getFollowedUsersFailure, (state, action) => ({ ...state, loading: false, error: action.error })),

  on(UserActions.followUser, (state) => ({ ...state, loading: true, error: undefined })),
  on(UserActions.followUserSuccess, (state, action) => {
    const index = state.followedUsers.findIndex(u => u.publicKey === action.user.publicKey);
    if (index !== -1) {
      return state as State;
    }
    const followedUsers = [ ...state.followedUsers ];
    followedUsers.splice(index, 1);
    followedUsers.push(action.user);
    followedUsers.sort((a, b) => {
      return b.startedAt.getTime() - a.startedAt.getTime();
    });
    return { ...state, followedUsers, loading: false, error: undefined };
  }),
  on(UserActions.followUserFailure, (state, action) => ({ ...state, loading: false, error: action.error })),

  on(UserActions.unfollowUser, (state) => ({ ...state, loading: true, error: undefined })),
  on(UserActions.unfollowUserSuccess, (state, action) => {
    const index = state.followedUsers.findIndex(u => u.publicKey === action.publicKey);
    if (index === -1) {
      return state as State;
    }
    const followedUsers = [ ...state.followedUsers ];
    followedUsers.splice(index, 1);
    followedUsers.sort((a, b) => {
      return b.startedAt.getTime() - a.startedAt.getTime();
    });
    return { ...state, followedUsers, loading: false, error: undefined };
  }),
  on(UserActions.unfollowUserFailure, (state, action) => ({ ...state, loading: false, error: action.error }))
);

