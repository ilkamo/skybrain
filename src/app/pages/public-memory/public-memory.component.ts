import { UserPublicMemory } from './../../models/user-public-memories';
import { UserData } from './../../models/user-data';
import { ConnectedUser } from 'src/app/models/user-connected-users';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Memory } from 'src/app/reducers/memory/memory.model';
import { map, withLatestFrom } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { State as RootState } from '../../reducers';
import { beginCreateVisitedConnectionAction } from '../../reducers/connection/connection.action';

@Component({
  templateUrl: './public-memory.component.html',
  styleUrls: ['./public-memory.component.scss']
})
export class PublicMemoryComponent implements OnInit, OnDestroy {

  publicMemory: UserPublicMemory | null = null;
  connectedUsers: ConnectedUser[] | null = null;
  brainData: UserData | null = null;
  accordionOpened = false;
  publicKey: string | undefined;
  subscription = new Subscription();
  // tslint:disable-next-line: no-any
  routeData$: Observable<any>;

  constructor(private store: Store<RootState>, route: ActivatedRoute) {
    this.routeData$ = route.data.pipe(
      map(data => data.publicData),
      withLatestFrom(route.params),
      map(([publicData, params]) => ({ publicData, params }))
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.subscription.add(
      this.routeData$.subscribe(data => {
        this.connectedUsers = data.publicData.connectedUsers;
        this.publicMemory = data.publicData.publicMemory;
        this.publicKey = data.params.publicKey;
        this.brainData = data.publicData.brainData;
        if (this.publicKey) {
          this.store.dispatch(beginCreateVisitedConnectionAction({ connection: { publicKey: this.publicKey } }));
        }
      })
    );
  }
}
