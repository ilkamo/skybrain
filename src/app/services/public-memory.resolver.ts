import { UserPublicMemory } from './../models/user-public-memories';
import { ConnectedUser } from 'src/app/models/user-connected-users';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { EMPTY, from, Observable, zip } from 'rxjs';
import { map, catchError, first } from 'rxjs/operators';
import { mapSkyToMemory, Memory } from '../reducers/memory/memory.model';
import { ApiService } from './api.service';
import { UserData } from '../models/user-data';

@Injectable({
  providedIn: 'root'
})
export class PublicMemoryService implements Resolve<{
  publicMemory: UserPublicMemory, connectedUsers: ConnectedUser[], brainData: UserData
}> {
  constructor(private apiService: ApiService, private router: Router) { }

  resolve(
    route: ActivatedRouteSnapshot,
    _: RouterStateSnapshot
  ): Observable<{ publicMemory: UserPublicMemory, connectedUsers: ConnectedUser[], brainData: UserData }> {
    if (!route.params.publicKey || !route.params.memoryId) {
      this.router.navigate(['/404'], { queryParams: { error: 'Invalid public memory link' } });
      return EMPTY;
    }

    const publicKey: string = route.params.publicKey;
    const id = route.params.memoryId;

    return zip(
      from(this.apiService.getPublicMemory({ id, publicKey })),
      from(this.apiService.getConnectedUsers({ publicKey })),
      from(this.apiService.getBrainData({ publicKey }))
    )
      .pipe(
        first(),
        map(([publicMemory, connectedUsers, brainData]) => {
          return { publicMemory, connectedUsers, brainData };
        }),
        catchError(error => {
          this.router.navigate(['/404'], { queryParams: { error: error.message } });
          return EMPTY;
        })
      );
  }
}
