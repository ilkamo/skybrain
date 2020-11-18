import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { EMPTY, from, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { mapSkyToMemory, Memory } from '../reducers/memory/memory.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class SharedMemoryService implements Resolve<Memory> {
  constructor(private apiService: ApiService, private router: Router) { }

  resolve(
    route: ActivatedRouteSnapshot,
    _: RouterStateSnapshot
  ): Observable<Memory> {

    return from(this.apiService.resolveMemoryFromBase64(route.params.code))
      .pipe(
        map(mapSkyToMemory),
        catchError(error => {
          this.router.navigate(['/404'], { queryParams: { error: error.message } });
          return EMPTY;
        })
      )
    ;
  }
}
