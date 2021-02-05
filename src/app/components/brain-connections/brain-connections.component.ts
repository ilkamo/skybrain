import { CacheService } from './../../services/cache.service';
import { ConnectedUser } from 'src/app/models/user-connected-users';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { State as RootState } from '../../reducers';
import { selectConnections } from 'src/app/reducers/connection/connection.selectors';
import { map } from 'rxjs/operators';
import { Connection } from 'src/app/reducers/connection/connection.model';
import { UsersData } from 'src/app/models/user-data';

@Component({
  selector: 'app-brain-connections',
  templateUrl: './brain-connections.component.html',
  styleUrls: ['./brain-connections.component.scss']
})
export class BrainConnectionsComponent implements OnInit, OnDestroy {
  @Input() connectedUsers?: ConnectedUser[];
  accordionOpened = false;
  // tslint:disable-next-line: no-any
  routeData$: Observable<any>;
  routerSubscription = new Subscription();

  visitedConnections: Connection[] = [];
  connectionsInfo: UsersData = {};

  connectionsSubscription = new Subscription();
  connections$ = this.store.pipe(select(selectConnections));

  constructor(private store: Store<RootState>, private router: Router, private cacheService: CacheService) {
    this.routeData$ = router.events.pipe(filter(event => event instanceof NavigationStart));
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
    this.connectionsSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.routerSubscription = this.routeData$.subscribe((event: NavigationStart) => {
      this.accordionOpened = false;
    });

    this.connectionsSubscription = this.connections$
      .pipe(
        map(connections => {
          this.visitedConnections = connections.visitedConnections;
          this.connectionsInfo = connections.connectionsInfo;
        })
      )
      .subscribe();
  }

  visited(publicKey: string): boolean {
    return this.visitedConnections.find(c => c.publicKey === publicKey) !== undefined;
  }

  resolveConnectionName(publicKey: string): string {
    return this.cacheService.resolveNameFromPublicKey(publicKey);
  }
}
