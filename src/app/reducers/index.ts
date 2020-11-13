import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer
} from '@ngrx/store';
import { environment } from '../../environments/environment';
import * as fromMemory from './memory/memory.reducer';
import * as fromUser from './user/user.reducer';


export interface State {

  [fromMemory.memoriesFeatureKey]: fromMemory.State;
  [fromUser.userFeatureKey]: fromUser.State;
}

export const reducers: ActionReducerMap<State> = {

  [fromMemory.memoriesFeatureKey]: fromMemory.reducer,
  [fromUser.userFeatureKey]: fromUser.reducer,
};


export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
