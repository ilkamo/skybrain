import { Inject, Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { EMPTY, from, Observable, zip } from 'rxjs';
import { map, catchError, first } from 'rxjs/operators';
import { SKYBRAIN_ACCOUNT_PUBLIC_KEY } from '../models/user-connected-users';
import { mapStreamMemoryToMemory, Memory } from '../reducers/memory/memory.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class StreamResolver implements Resolve<{
  memories: Memory[],
}> {
  constructor(
    private apiService: ApiService,
    private router: Router,
    @Inject(SKYBRAIN_ACCOUNT_PUBLIC_KEY) private skyBrainAccountPublicKey: string) { }

  resolve(
    route: ActivatedRouteSnapshot,
    _: RouterStateSnapshot
  ): Observable<{ memories: Memory[] }> {
    return zip(
      from(this.apiService.getBrainData({ publicKey: this.skyBrainAccountPublicKey })), // fix not displayed user names
      from(this.apiService.getStreamMemories()),
    )
      .pipe(
        first(),
        map(([brainData, publicMemories]) => {
          const memories = publicMemories.map(mapStreamMemoryToMemory);
          return { memories };
        }),
        catchError(error => {
          this.router.navigate(['/404'], { queryParams: { error: error.message } });
          return EMPTY;
        })
      );
  }
}
