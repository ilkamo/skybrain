import { RouterReducerState, getSelectors, MinimalRouterStateSnapshot } from '@ngrx/router-store';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State as RootState } from '..';

export const routerFeatureKey = 'router';

// tslint:disable-next-line: no-any
export const selectRouterFeature = createFeatureSelector<RootState, RouterReducerState<MinimalRouterStateSnapshot>>(routerFeatureKey);

export const {
  selectCurrentRoute,
  selectFragment,
  selectQueryParams,
  selectQueryParam,
  selectRouteParams,
  selectRouteParam,
  selectRouteData,
  selectUrl,
} = getSelectors(selectRouterFeature);

export const selectVavbarIsVisible = createSelector(
  selectUrl,
  url => !['/login', '/register'].includes(url)
);
