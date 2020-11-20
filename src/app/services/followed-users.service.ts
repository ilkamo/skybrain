import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { EMPTY, from, Observable, zip } from 'rxjs';
import { map, catchError, first } from 'rxjs/operators';
import { mapPublicSkyToMemory, Memory } from '../reducers/memory/memory.model';
import { ApiService } from './api.service';
import { FollowedUser } from '../models/user-followed-users';

@Injectable({
  providedIn: 'root'
})
export class FollowedUsersService implements Resolve<FollowedUser[]> {
  constructor(private apiService: ApiService, private router: Router) {}

  resolve(
    route: ActivatedRouteSnapshot,
    _: RouterStateSnapshot
  ): Observable<FollowedUser[]> {
    return from(this.apiService.getFollowedUsers({ publicKey: route.params.publicKey })).pipe(
      catchError(error => {
        // TODO: dispaly error
        return EMPTY;
      })
    );
  }
}
