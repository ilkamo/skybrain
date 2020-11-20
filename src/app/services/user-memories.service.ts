import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { EMPTY, from, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { mapPublicSkyToMemory, Memory } from '../reducers/memory/memory.model';
import { ApiService } from './api.service';
import * as UserActions from './../reducers/user/user.actions';
import { FollowedUser } from '../models/user-followed-users';

@Injectable({
  providedIn: 'root'
})
export class UserMemoriesService implements Resolve<{memories: Memory[], followedUsers: FollowedUser[]}> {
  constructor(private apiService: ApiService, private router: Router) {}

  resolve(
    route: ActivatedRouteSnapshot,
    _: RouterStateSnapshot
  ): Observable<{memories: Memory[], followedUsers: FollowedUser[]}> {
    const memories = from(this.apiService.getPublicMemories({ publicKey: route.params.publicKey })).pipe(
      map(userPublicMemories => userPublicMemories.map(mapPublicSkyToMemory)),
      catchError(error => {
        this.router.navigate(['/404'], { queryParams: { error: error.message } });
        return EMPTY;
      })
    );

    const followedUsers = from(this.apiService.getFollowedUsers({ publicKey: route.params.publicKey })).pipe(
      catchError(error => {
        // TODO: dispaly error
        return EMPTY;
      })
    );

    return { memories, followedUsers };

  }
}
