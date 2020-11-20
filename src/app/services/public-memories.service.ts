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
export class PublicMemoriesService implements Resolve<Memory[]> {
  constructor(private apiService: ApiService, private router: Router) {}

  resolve(
    route: ActivatedRouteSnapshot,
    _: RouterStateSnapshot
  ): Observable<Memory[]> {
    return from(this.apiService.getPublicMemories({ publicKey: route.params.publicKey })).pipe(
      map(userPublicMemories => userPublicMemories.map(mapPublicSkyToMemory)),
      catchError(error => {
        this.router.navigate(['/404'], { queryParams: { error: error.message } });
        return EMPTY;
      })
    );
  }
}
