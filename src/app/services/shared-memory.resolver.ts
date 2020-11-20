import { FollowedUser } from 'src/app/models/user-followed-users';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { EMPTY, from, Observable, zip } from 'rxjs';
import { map, catchError, first } from 'rxjs/operators';
import { mapSkyToMemory, Memory } from '../reducers/memory/memory.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class SharedMemoryService implements Resolve<{sharedMemory: Memory, followedUsers: FollowedUser[]}> {
  constructor(private apiService: ApiService, private router: Router) { }

  resolve(
    route: ActivatedRouteSnapshot,
    _: RouterStateSnapshot
  ): Observable<{sharedMemory: Memory, followedUsers: FollowedUser[]}> {
    if (!route.params.code) {
      this.router.navigate(['/404'], { queryParams: { error: 'Invalid shared link' } });
      return EMPTY;
    }

    const publicKey = this.apiService.resolvePublicKeyFromBase64(route.params.code);

    const sharedMemory$ = from(this.apiService.resolveMemoryFromBase64(route.params.code))
      .pipe(
        map(mapSkyToMemory),
        first(),
        catchError(error => {
          this.router.navigate(['/404'], { queryParams: { error: error.message } });
          return EMPTY;
        })
      );

    const followedUsers$ = from(this.apiService.getFollowedUsers({ publicKey })).pipe(
      catchError(error => {
        // TODO: dispaly error
        return EMPTY;
      })
    );

    return zip(sharedMemory$, followedUsers$).pipe(
      map(([sharedMemory, followedUsers]) => ({ sharedMemory, followedUsers })),
      first()
    );
  }
}
