import { CacheService } from './../../services/cache.service';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { IBreadcrumbLink } from 'src/app/app-routing.module';
import { State } from 'src/app/reducers';
import { selectRouteData, selectRouteParams } from 'src/app/reducers/router';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent implements OnInit {
  breadcrumbs$ = combineLatest([
    this.store.select(selectRouteData),
    this.store.select(selectRouteParams)
  ]).pipe(
    filter(([data, _]) => data && !!data.breadcrumbs),
    map(([data, params]) => {
      return data.breadcrumbs.map((b: IBreadcrumbLink) => {
        const title = b.title ? b.title : (b.param && params ? params[b.param] : undefined);
        const link = b.link ? [b.link] : undefined;
        if (link && params && b.param) {
          link.push(params[b.param]);
        }
        return { title, link };
      });
    })
  );

  constructor(
    private store: Store<State>,
    private cacheService: CacheService
  ) { }

  ngOnInit(): void {
  }

  resolveConnectionName(publicKey: string): string {
    return this.cacheService.resolveNameFromPublicKey(publicKey);
  }
}
