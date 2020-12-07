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
export class SharedMemoryService implements Resolve<{sharedMemory: Memory, connectedUsers: ConnectedUser[],
  brainData: UserData, publicKey: string}> {
  constructor(private apiService: ApiService, private router: Router) { }

  resolve(
    route: ActivatedRouteSnapshot,
    _: RouterStateSnapshot
  ): Observable<{sharedMemory: Memory, connectedUsers: ConnectedUser[], brainData: UserData, publicKey: string}> {
    if (!route.params.code) {
      this.router.navigate(['/404'], { queryParams: { error: 'Invalid shared link' } });
      return EMPTY;
    }

    let publicKey: string;

    try {
      publicKey = this.apiService.resolvePublicKeyFromBase64(route.params.code);
    } catch (error) {
      this.router.navigate(['/404'], { queryParams: { error: 'Invalid shared link' } });
      return EMPTY;
    }

    return zip(
      from(this.apiService.resolveMemoryFromBase64(route.params.code)),
      from(this.apiService.getConnectedUsers({ publicKey })),
      from(this.apiService.getBrainData({ publicKey }))
    )
      .pipe(
        first(),
        map(([sharedMemory, connectedUsers, brainData]) => {
          return { sharedMemory, connectedUsers, brainData, publicKey };
        }),
        catchError(error => {
          this.router.navigate(['/404'], { queryParams: { error: error.message } });
          return EMPTY;
        })
      );
  }
}
