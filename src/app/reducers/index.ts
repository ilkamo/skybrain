import {
  ActionReducerMap,
  MetaReducer,
} from '@ngrx/store';
import { environment } from '../../environments/environment';
import * as fromMemory from './memory/memory.reducer';
import * as fromUser from './user/user.reducer';
import * as fromConnection from './connection/connection.reducer';
import * as fromRouter from './router';
import { MinimalRouterStateSnapshot, routerReducer, RouterReducerState } from '@ngrx/router-store';


export interface State {
  [fromConnection.connectionsFeatureKey]: fromConnection.State;
  [fromMemory.memoriesFeatureKey]: fromMemory.State;
  [fromUser.userFeatureKey]: fromUser.State;
  [fromRouter.routerFeatureKey]: RouterReducerState<MinimalRouterStateSnapshot>;
}

export const reducers: ActionReducerMap<State> = {
  [fromConnection.connectionsFeatureKey]: fromConnection.reducer,
  [fromMemory.memoriesFeatureKey]: fromMemory.reducer,
  [fromUser.userFeatureKey]: fromUser.reducer,
  [fromRouter.routerFeatureKey]: routerReducer
};

export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
