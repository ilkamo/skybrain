import { UserData } from './../../models/user-data';
import { ConnectedUser } from 'src/app/models/user-connected-users';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Memory } from 'src/app/reducers/memory/memory.model';
import { map, withLatestFrom } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { State as RootState } from '../../reducers';
import { BeginCreateVisitedConnectionAction, BeginGetConnectionInfoAction } from '../../reducers/connection/connection.action';

@Component({
  templateUrl: './connection.component.html',
  styleUrls: ['./connection.component.scss']
})
export class ConnectionComponent implements OnInit, OnDestroy {
  memories: Memory[] | null = null;
  connectedUsers: ConnectedUser[] | null = null;
  brainData: UserData | null = null;
  accordionOpened = false;
  publicKey: string | undefined;
  subscription = new Subscription();
  // tslint:disable-next-line: no-any
  routeData$: Observable<any>;


  constructor(private store: Store<RootState>, route: ActivatedRoute) {
    this.routeData$ = route.data.pipe(
      map(data => data.publicBrain),
      withLatestFrom(route.params),
      map(([publicBrain, params]) => ({ publicBrain, params }))
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.subscription.add(
      this.routeData$.subscribe(data => {
        this.connectedUsers = data.publicBrain.connectedUsers;
        this.memories = data.publicBrain.memories;
        this.publicKey = data.params.publicKey;
        this.brainData = data.publicBrain.brainData;
        this.store.dispatch(BeginCreateVisitedConnectionAction({ connection: { publicKey: this.publicKey } }));
      })
    );
  }

  trackMemory(index: number, memory: Memory): string {
    return memory.id;
  }
}
