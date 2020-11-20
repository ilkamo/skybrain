import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { EMPTY, from, Observable, of, zip } from 'rxjs';
import { map, catchError, first } from 'rxjs/operators';
import { mapPublicSkyToMemory, Memory } from '../reducers/memory/memory.model';
import { ApiService } from './api.service';
import { FollowedUser } from '../models/user-followed-users';

@Injectable({
  providedIn: 'root'
})
export class UserMemoriesResolver implements Resolve<{memories: Memory[], followedUsers: FollowedUser[]}> {
  constructor(private apiService: ApiService, private router: Router) {}

  resolve(
    route: ActivatedRouteSnapshot,
    _: RouterStateSnapshot
  ): Observable<{memories: Memory[], followedUsers: FollowedUser[]}> {
    return zip(
      from(this.apiService.getPublicMemories({ publicKey: route.params.publicKey })),
      from(this.apiService.getFollowedUsers({ publicKey: route.params.publicKey }))
    )
    .pipe(
      map(([publicMemories, followedUsers]) => {
        const memories = publicMemories.map(mapPublicSkyToMemory);
        return { memories, followedUsers };
      }),
      catchError(error => {
        this.router.navigate(['/404'], { queryParams: { error: error.message } });
        return EMPTY;
      })
    );
  }
}
