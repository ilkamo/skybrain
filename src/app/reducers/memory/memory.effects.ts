import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, catchError, withLatestFrom, filter, tap, first } from 'rxjs/operators';
import { EMPTY, NEVER, of } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { State as RootState } from '../';
import { Store } from '@ngrx/store';
import * as UserSelectors from '../user/user.selectors';
import * as MemorySelectors from '../memory/memory.selectors';
import * as MemoryActions from './memory.actions';
import { mapMemoryToSky, mapSkyToMemory, Memory } from './memory.model';
import { Update } from '@ngrx/entity';

@Injectable()
export class MemoryEffects {

  getMemories$ = createEffect(() => this.actions$.pipe(
    ofType(MemoryActions.getMemories),
    first(),
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
      MemoryActions.newMemorySuccess
    ),
    withLatestFrom(
      this.store.select(UserSelectors.selectUserKeys),
      this.store.select(MemorySelectors.selectMemories),
    ),
    switchMap(async ([_, keys, storeMemories]) => {
      const memories = storeMemories.map(mapMemoryToSky);
      try{
        await this.api.storeMemories( { memories, ...keys } );
        return MemoryActions.upsertMemories({ memories: memories.map(mapSkyToMemory) });
      } catch (error) {
        const errored = storeMemories
          .filter(m => m.loading)
          .map(m => ({ id: m.id, changes: { error: error.message, loading: false } } as Update<Memory>));
        return MemoryActions.updateMemories({ memories: errored });
      }
    })
  ));

  constructor(
    private actions$: Actions,
    private api: ApiService,
    private store: Store<RootState>
  ) {}
}
