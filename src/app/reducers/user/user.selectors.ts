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

export const hasValidUserData = createSelector(
  selectFeature,
  selectUserData,
  (_, data) => isValidatorValid(validateUserData(data))
);
