import { createFeatureSelector, createSelector } from '@ngrx/store';
import { isValidatorValid, validateUserData } from 'src/app/models/user-data';
import { State as RootState } from '..';
import { State as UserState, userFeatureKey } from './user.reducer';

export const selectFeature = createFeatureSelector<RootState, UserState>(userFeatureKey);

export const selectIsLoading = createSelector(
  selectFeature,
  (state: UserState) => state.loading
);

export const selectError = createSelector(
  selectFeature,
  (state: UserState) => state.error
);

export const selectUserData = createSelector(
  selectFeature,
  (state: UserState) => state.user
);

export const selectUserKeys = createSelector(
  selectFeature,
  (state: UserState) => state.keys
);

export const isAuthenticated = createSelector(
  selectFeature,
  (state: UserState) => state.authenticated
);

export const selectConnectedUsers = createSelector(
  selectFeature,
  (state: UserState) => state.connectedUsers
);

export const selectConnectedUsersCache = createSelector(
  selectConnectedUsers,
  (users) => users.map(user => ({ ...user }))
);

export const hasValidUserData = createSelector(
  selectUserData,
  (data) => isValidatorValid(validateUserData(data))
);

export const selectUserPublicKey = createSelector(
  selectUserKeys,
  (keys) => keys && keys.publicKey || undefined
);
