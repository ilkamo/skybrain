import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, catchError, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { State as RootState } from '../';
import { Store } from '@ngrx/store';
import * as UserSelectors from '../user/user.selectors';
import * as MemorySelectors from '../memory/memory.selectors';
import * as MemoryActions from './memory.actions';
import { mapSkyToMemory } from './memory.model';
import { UserKeys } from 'src/app/models/user-data';

@Injectable()
export class MemoryEffects {

  getMemories$ = createEffect(() => this.actions$.pipe(
    ofType(MemoryActions.getMemories),
    withLatestFrom(
      this.store.select(UserSelectors.selectUserKeys),
    ),
    switchMap(async ([_, keys]) => {
      const userMemories = await this.api.getMemories(keys as UserKeys);
      const memories = userMemories.map(mapSkyToMemory);
      return MemoryActions.getMemoriesSuccess({ memories });
    }),
    catchError(error => of(MemoryActions.getMemoriesFailure({ error: error.message })))
  ));

  newMemory$ = createEffect(() => this.actions$.pipe(
    ofType(MemoryActions.newMemory),
    withLatestFrom(
      this.store.select(UserSelectors.selectUserKeys),
      this.store.select(MemorySelectors.selectCache)
    ),
    switchMap(async ([action, keys, memories]) => {
      const memory = await this.api.addMemory( { memory: action.memory, file: action.file, memories, ...keys } );
      return MemoryActions.newMemorySuccess({ memory: mapSkyToMemory(memory) });
    }),
    catchError(error => of(MemoryActions.newMemoryFailure({ error: error.message })))
  ));

  forgetMemory$ = createEffect(() => this.actions$.pipe(
    ofType(MemoryActions.forgetMemory),
    withLatestFrom(
      this.store.select(UserSelectors.selectUserKeys),
      this.store.select(MemorySelectors.selectCache)
    ),
    switchMap(async ([action, keys, memories]) => {
      await this.api.deleteMemory( { id: action.id, memories, ...keys } );
      return MemoryActions.forgetMemorySuccess({ id: action.id });
    }),
    catchError(error => of(MemoryActions.forgetMemoryFailure({ error: error.message })))
  ));

  makeBublic$ = createEffect(() => this.actions$.pipe(
    ofType(MemoryActions.makePublicMemory),
    withLatestFrom(
      this.store.select(UserSelectors.selectUserKeys),
      this.store.select(MemorySelectors.selectCache)
    ),
    switchMap(async ([action, keys, memories]) => {
      if (action.toggle) {
        await this.api.publicMemory( { id: action.id, memories, ...keys } );
      } else {
        await this.api.unpublicMemory( { id: action.id, memories, ...keys } );
      }
      return MemoryActions.makePublicMemorySuccess({ id: action.id, isPublic: action.toggle || undefined });
    }),
    catchError(error => of(MemoryActions.makePublicMemoryFailure({ error: error.message })))
  ));

  getMemoryShareLink$ = createEffect(() => this.actions$.pipe(
    ofType(MemoryActions.getShareMemoryLink),
    withLatestFrom(
      this.store.select(UserSelectors.selectUserKeys),
      this.store.select(MemorySelectors.selectCache)
    ),
    switchMap(async ([action, keys, memories]) => {
      let link;
      if (action.toggle) {
        link = await this.api.shareMemory( { id: action.id, memories, ...keys } );
      } else {
        await this.api.unshareMemory( { id: action.id, memories, ...keys } );
      }
      return MemoryActions.getShareMemoryLinkSuccess({ id: action.id, link, isShared: action.toggle || undefined });
    }),
    catchError(error => of(MemoryActions.getShareMemoryLinkFailure({ error: error.message })))
  ));

  constructor(
    private actions$: Actions,
    private api: ApiService,
    private store: Store<RootState>
  ) {}
}
