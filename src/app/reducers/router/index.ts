import { RouterReducerState, getSelectors, MinimalRouterStateSnapshot } from '@ngrx/router-store';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State as RootState } from '..';

export const routerFeatureKey = 'router';
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

export const selectNavbarIsVisibleForRoute = createSelector(
  selectUrl,
  url => {
    // return ['/login', '/register'].filter((r) => url && url.indexOf(r) !== -1).length === 0;
    return true;
  }
);
