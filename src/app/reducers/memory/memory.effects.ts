import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, catchError, withLatestFrom, map, filter } from 'rxjs/operators';
import { from, of } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { State as RootState } from '../';
import { select, Store } from '@ngrx/store';
import * as UserSelectors from '../user/user.selectors';
import * as MemorySelectors from '../memory/memory.selectors';
import * as MemoryActions from './memory.actions';
import { mapSkyToMemory, Memory } from './memory.model';
import { UserKeys } from 'src/app/models/user-data';

@Injectable()
export class MemoryEffects {

  getMemories$ = createEffect(() => this.actions$.pipe(
    ofType(MemoryActions.getMemories),
    withLatestFrom(
      this.store.select(UserSelectors.selectUserKeys),
    ),
    switchMap(([_, keys]) => {
      return from(this.api.getMemories(keys as UserKeys)).pipe(
        map(userMemories => userMemories.map(mapSkyToMemory)),
        map(memories => MemoryActions.getMemoriesSuccess({ memories })),
        catchError(error => of(MemoryActions.getMemoriesFailure({ error: error.message })))
      );
    }),
  ));

  newMemory$ = createEffect(() => this.actions$.pipe(
    ofType(MemoryActions.newMemory),
    withLatestFrom(
      this.store.select(UserSelectors.selectUserKeys),
      this.store.select(MemorySelectors.selectCache)
    ),
    switchMap(([action, keys, memories]) => {
      return from(this.api.addMemory( { memory: action.memory, file: action.file, memories, ...keys } )).pipe(
        map(memory => MemoryActions.newMemorySuccess({ memory: mapSkyToMemory(memory) })),
        catchError(error => of(MemoryActions.newMemoryFailure({ error: error.message })))
      );
    })
  ));

  forgetMemory$ = createEffect(() => this.actions$.pipe(
    ofType(MemoryActions.forgetMemory),
    withLatestFrom(
      this.store.select(UserSelectors.selectUserKeys),
      this.store.select(MemorySelectors.selectCache)
    ),
    switchMap(([action, keys, memories]) => {
      return from(this.api.deleteMemory( { id: action.id, memories, ...keys } )).pipe(
        map(_ => MemoryActions.forgetMemorySuccess({ id: action.id })),
        catchError(error => of(MemoryActions.forgetMemoryFailure({ error: error.message })))
      );
    })
  ));

  makeBublic$ = createEffect(() => this.actions$.pipe(
    ofType(MemoryActions.makePublicMemory),
    withLatestFrom(
      this.store.select(UserSelectors.selectUserKeys),
      this.store.select(MemorySelectors.selectCache)
    ),
    switchMap(([action, keys, memories]) => {
      return from(
        action.toggle ? this.api.publicMemory( { id: action.id, memories, ...keys } ) :
        this.api.unpublicMemory( { id: action.id, memories, ...keys } )
      ).pipe(
        map(_ =>  MemoryActions.makePublicMemorySuccess({ id: action.id, isPublic: action.toggle || undefined })),
        catchError(error => of(MemoryActions.makePublicMemoryFailure({ error: error.message })))
      );
    })
  ));

  getMemoryShareLink$ = createEffect(() => this.actions$.pipe(
    ofType(MemoryActions.getShareMemoryLink),
    withLatestFrom(
      this.store.select(UserSelectors.selectUserKeys),
      this.store.select(MemorySelectors.selectCache)
    ),
    switchMap(([action, keys, memories]) => {
      return from(
        action.toggle ? this.api.shareMemory( { id: action.id, memories, ...keys } ) :
          this.api.unshareMemory( { id: action.id, memories, ...keys } )
      ).pipe(
        map(l => l || undefined),
        map(link => MemoryActions.getShareMemoryLinkSuccess({ id: action.id, link, isShared: action.toggle || undefined })),
        catchError(error => of(MemoryActions.getShareMemoryLinkFailure({ error: error.message })))
      );
    })
  ));

  connectedMemories$ = createEffect(() => this.store.pipe(
    select(MemorySelectors.selectConnectedUsersToPopulate),
    filter(connectedUsers => !!connectedUsers .length),
    switchMap(connectedUsers  => {
      return from(this.api.getPublicMemoriesOfConnectedUsers({ connectedUsers })).pipe(
        map(userPublicMemories => {
          const users = Object.keys(userPublicMemories);
          return users.reduce((acc, connectedId) => {
            const userMemories: Memory[] = userPublicMemories[connectedId].map(data => ({ ...mapSkyToMemory(data.memory), connectedId }));
            return [ ...acc, ...userMemories];
          }, [] as Memory[]);
        }),
        map(memories => MemoryActions.connectedUsersMemoriesSuccess({ memories, connectedUsers })),
        catchError(error => of(MemoryActions.connectedUsersMemoriesFailure({ connectedUsers, error: error.message })))
      );
    }),
  ));

  constructor(
    private actions$: Actions,
    private api: ApiService,
    private store: Store<RootState>
  ) {}
}
