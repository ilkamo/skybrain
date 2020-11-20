import {
  ActionReducerMap,
  MetaReducer,
  Store
} from '@ngrx/store';
import { environment } from '../../environments/environment';
import * as fromMemory from './memory/memory.reducer';
import * as fromUser from './user/user.reducer';
import * as fromRouter from './router';
import { MinimalRouterStateSnapshot, routerReducer, RouterReducerState } from '@ngrx/router-store';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { isAuthenticated } from './user/user.selectors';


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
