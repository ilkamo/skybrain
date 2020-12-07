import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';
import { ConnectedUser } from 'src/app/models/user-connected-users';
import { UserData } from 'src/app/models/user-data';
import { beginCreateVisitedConnectionAction } from 'src/app/reducers/connection/connection.action';
import { Memory } from 'src/app/reducers/memory/memory.model';
import { State as RootState } from '../../reducers';

@Component({
  templateUrl: './shared.component.html',
  styleUrls: ['./shared.component.scss']
})
export class SharedComponent implements OnInit, OnDestroy {
  memory: Memory | null = null;
  connectedUsers: ConnectedUser[] | null = null;
  brainData: UserData | null = null;
  accordionOpened = false;
  publicKey: string | undefined;
  subscription = new Subscription();

  // tslint:disable-next-line: no-any
  routeData$: Observable<any>;

  constructor(private store: Store<RootState>, route: ActivatedRoute) {
    this.routeData$ = route.data.pipe(
      map(data => data.sharedData),
      withLatestFrom(route.params),
      map(([sharedData, params]) => ({ sharedData, params }))
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.subscription.add(
      this.routeData$.subscribe(data => {
        const sharedData = data.sharedData;
        this.memory = sharedData.sharedMemory;
        this.connectedUsers = sharedData.connectedUsers;
        this.brainData = sharedData.brainData;
        this.publicKey = sharedData.publicKey;
        if (this.publicKey) {
          this.store.dispatch(beginCreateVisitedConnectionAction({ connection: { publicKey: this.publicKey } }));
        }
      })
    );
  }
}
