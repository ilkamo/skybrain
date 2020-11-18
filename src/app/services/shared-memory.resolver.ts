import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { EMPTY, from, Observable } from 'rxjs';
import { map, catchError, withLatestFrom } from 'rxjs/operators';
import { State } from '../reducers';
import { mapSkyToMemory, Memory } from '../reducers/memory/memory.model';
import { isAuthenticated } from '../reducers/user/user.selectors';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class SharedMemoryService implements Resolve<{ auth: boolean, memory: Memory }> {
  constructor(private apiService: ApiService, private router: Router, private store: Store<State>) { }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<{ auth: boolean, memory: Memory }> {

    return from(this.apiService.resolveMemoryFromBase64(route.params.code))
      .pipe(
        map(mapSkyToMemory),
        withLatestFrom(this.store.select(isAuthenticated)),
        map(([memory, auth]) => ({ memory, auth })),
        catchError(error => {
          this.router.navigate(['/404'], { queryParams: { error: error.message } });
          return EMPTY;
        })
      )
    ;
  }
}
