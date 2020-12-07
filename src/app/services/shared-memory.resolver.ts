import { ConnectedUser } from 'src/app/models/user-connected-users';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { EMPTY, from, Observable, zip } from 'rxjs';
import { map, catchError, first } from 'rxjs/operators';
import { mapSkyToMemory, Memory } from '../reducers/memory/memory.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class SharedMemoryService implements Resolve<{sharedMemory: Memory, connectedUsers: ConnectedUser[]}> {
  constructor(private apiService: ApiService, private router: Router) { }

  resolve(
    route: ActivatedRouteSnapshot,
    _: RouterStateSnapshot
  ): Observable<{sharedMemory: Memory, connectedUsers: ConnectedUser[]}> {
    if (!route.params.code) {
      this.router.navigate(['/404'], { queryParams: { error: 'Invalid shared link' } });
      return EMPTY;
    }

    let publicKey;

    try {
      publicKey = this.apiService.resolvePublicKeyFromBase64(route.params.code);
    } catch (error) {
      this.router.navigate(['/404'], { queryParams: { error: 'Invalid shared link' } });
      return EMPTY;
    }

    const sharedMemory$ = from(this.apiService.resolveMemoryFromBase64(route.params.code))
      .pipe(
        map(mapSkyToMemory),
        first()
      );

    const connectedUsers$ = from(this.apiService.getConnectedUsers({ publicKey }));

    return zip(sharedMemory$, connectedUsers$).pipe(
      map(([sharedMemory, connectedUsers]) => ({ sharedMemory, connectedUsers })),
      first(),
      catchError(error => {
        this.router.navigate(['/404'], { queryParams: { error: error.message } });
        return EMPTY;
      }),
    );
  }
}
