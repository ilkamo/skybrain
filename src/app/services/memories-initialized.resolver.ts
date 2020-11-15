import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { first, map, withLatestFrom, filter } from 'rxjs/operators';
import { State } from '../reducers';
import { getMemories } from '../reducers/memory/memory.actions';
import { selectIsInitialized, selectIsLoading } from '../reducers/memory/memory.selectors';

@Injectable({
  providedIn: 'root'
})
export class MemoriesInitializedService implements Resolve<boolean> {
  constructor(private store: Store<State>) { }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.store.pipe(
      select(selectIsInitialized),
      withLatestFrom(this.store.select(selectIsLoading)),
      map(([initialized, isLoading]) => {
        if (initialized) {
          return true;
        }
        if (!isLoading) {
          this.store.dispatch(getMemories());
        }
        return initialized;
      }),
      filter(i => i),
      first()
    );
  }
}
