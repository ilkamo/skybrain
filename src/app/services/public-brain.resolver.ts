import { UserData } from './../models/user-data';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { EMPTY, from, Observable, zip } from 'rxjs';
import { map, catchError, first } from 'rxjs/operators';
import { mapPublicSkyToMemory, Memory } from '../reducers/memory/memory.model';
import { ApiService } from './api.service';
import { ConnectedUser } from '../models/user-connected-users';

@Injectable({
  providedIn: 'root'
})
export class PublicBrainResolver implements Resolve<{
  memories: Memory[],
  connectedUsers: ConnectedUser[],
  brainData: UserData
}> {
  constructor(private apiService: ApiService, private router: Router) { }

  resolve(
    route: ActivatedRouteSnapshot,
    _: RouterStateSnapshot
  ): Observable<{ memories: Memory[], connectedUsers: ConnectedUser[], brainData: UserData }> {
    return zip(
      from(this.apiService.getPublicMemories({ publicKey: route.params.publicKey })),
      from(this.apiService.getConnectedUsers({ publicKey: route.params.publicKey })),
      from(this.apiService.getBrainData({ publicKey: route.params.publicKey }))
    )
      .pipe(
        first(),
        map(([publicMemories, connectedUsers, brainData]) => {
          const memories = publicMemories.map(mapPublicSkyToMemory);
          return { memories, connectedUsers, brainData };
        }),
        catchError(error => {
          this.router.navigate(['/404'], { queryParams: { error: error.message } });
          return EMPTY;
        })
      );
  }
}
