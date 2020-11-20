import {
  ActionReducerMap,
  MetaReducer
} from '@ngrx/store';
import { environment } from '../../environments/environment';
import * as fromMemory from './memory/memory.reducer';
import * as fromUser from './user/user.reducer';
import * as fromRouter from './router';
import { MinimalRouterStateSnapshot, routerReducer, RouterReducerState } from '@ngrx/router-store';


export interface State {

  [fromMemory.memoriesFeatureKey]: fromMemory.State;
  [fromUser.userFeatureKey]: fromUser.State;
  // tslint:disable-next-line: no-any
  [fromRouter.routerFeatureKey]: RouterReducerState<MinimalRouterStateSnapshot>;
}

export const reducers: ActionReducerMap<State> = {

  [fromMemory.memoriesFeatureKey]: fromMemory.reducer,
  [fromUser.userFeatureKey]: fromUser.reducer,
  [fromRouter.routerFeatureKey]: routerReducer
};


export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
