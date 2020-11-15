import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, catchError, withLatestFrom, filter, tap, first, map } from 'rxjs/operators';
import { EMPTY, NEVER, of } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { State as RootState } from '../';
import { Store } from '@ngrx/store';
import * as UserSelectors from '../user/user.selectors';
import * as MemorySelectors from '../memory/memory.selectors';
import * as MemoryActions from './memory.actions';
import { mapMemoryToSky, mapSkyToMemory, Memory } from './memory.model';
import { Update } from '@ngrx/entity';
import { UserMemory } from 'src/app/models/user-memory';

@Injectable()
export class MemoryEffects {

  getMemories$ = createEffect(() => this.actions$.pipe(
    ofType(MemoryActions.getMemories),
    withLatestFrom(
      this.store.select(UserSelectors.selectUserKeys)
    ),
    switchMap(async ([_, keys]) => {
      if (!keys) {
        throw new Error('No user keys');
      }
      const userMemories = await this.api.loadMemories(keys);
      const memories = userMemories.map((m): Memory => ({
        ...m,
        loading: false,
        saved: true
      }));
      return MemoryActions.loadMemories({ memories });
    }),
    catchError(error => of(MemoryActions.getMemoriesFailure({ error: error.message })))
  ));

  newMemory$ = createEffect(() => this.actions$.pipe(
    ofType(MemoryActions.newMemory),
    withLatestFrom(
      this.store.select(UserSelectors.selectUserKeys)
    ),
    switchMap(async ([action, keys]) => {
      if (!keys) {
        throw new Error('No user keys');
      }
      const memory = await this.api.newMemory( { memory: action.memory, file: action.file } );
      return MemoryActions.newMemorySuccess({ memory });
    }),
    catchError(error => of(MemoryActions.newMemoryFailure({ error: error.message })))
  ));

  saveMemories$ = createEffect(() => this.actions$.pipe(
    ofType(
      MemoryActions.newMemorySuccess,
      MemoryActions.forgetMemory
    ),
    withLatestFrom(
      this.store.select(UserSelectors.selectUserKeys),
      this.store.select(MemorySelectors.selectMemories),
    ),
    switchMap(async ([action, keys, storeMemories]) => {
      const memories = storeMemories.map(mapMemoryToSky).filter(m => m !== null) as UserMemory[];
      try{
        await this.api.storeMemories( { memories, ...keys } );
        return MemoryActions.loadMemories({ memories: memories.map(mapSkyToMemory) });
      } catch (error) {
        switch (action.type) {
          case MemoryActions.forgetMemory.type:
            return MemoryActions.updateMemory({ memory: {
              id: action.id,
              changes: {
                loading: false,
                deleted: undefined,
                error: error.message
              }
            } });
          case MemoryActions.newMemorySuccess.type:
            return MemoryActions.updateMemory({ memory: {
              id: action.memory.id,
              changes: {
                loading: false,
                error: error.message,
              }
            } });
        }
      }
    })
  ));

  constructor(
    private actions$: Actions,
    private api: ApiService,
    private store: Store<RootState>
  ) {}
}
