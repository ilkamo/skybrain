import { ConnectedUser } from 'src/app/models/user-connected-users';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { State as RootState } from '../../reducers';
import { selectVisitedConnections } from 'src/app/reducers/connection/connection.selectors';
import { map } from 'rxjs/operators';
import Connection from 'src/app/reducers/connection/connection.model';
import { BeginGetConnectionAction } from 'src/app/reducers/connection/connection.action';

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
  visitedConnectionsSubscription = new Subscription();
  visitedConnections$ = this.store.pipe(select(selectVisitedConnections));

  visitedConnections: Connection[] = [];

  constructor(private store: Store<RootState>, private router: Router) {
    this.routeData$ = router.events.pipe(filter(event => event instanceof NavigationStart));
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
    this.visitedConnectionsSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.routerSubscription = this.routeData$.subscribe((event: NavigationStart) => {
      this.accordionOpened = false;
    });

    this.visitedConnectionsSubscription = this.visitedConnections$
      .pipe(
        map(visitedConnections => {
          this.visitedConnections = visitedConnections;
        })
      )
      .subscribe();

    this.store.dispatch(BeginGetConnectionAction());
  }

  visited(publicKey: string): boolean {
    return this.visitedConnections.find(c => c.publicKey === publicKey) !== undefined;
  }
}
