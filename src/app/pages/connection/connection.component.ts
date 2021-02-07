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

  displayedMemories: Memory[] = [];
  displayedIndex = 0;
  toDisplayOnInit = 3;

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
        this.displayedIndex = 0;
        this.displayedMemories = [];

        if (this.memories) {
          // If possibile, display `toDisplayOnInit` memories on the timeline.
          for (let i = 0; i < this.toDisplayOnInit; i++) {
            this.onScroll();
          }
        }

        this.publicKey = data.params.publicKey;
        this.brainData = data.publicBrain.brainData;
        if (this.publicKey) {
          this.store.dispatch(beginCreateVisitedConnectionAction({ connection: { publicKey: this.publicKey } }));
        }
      })
    );
  }

  trackMemory(index: number, memory: Memory): string {
    return memory.id;
  }

  onScroll() {
    if (this.memories && this.memories.length > this.displayedIndex) {
      this.displayedIndex++;
      this.displayedMemories = this.memories.slice(0, this.displayedIndex);
    }
  }

  canShowMore(): boolean {
    if (!this.memories) return false;
    return this.memories.length > this.displayedIndex;
  }
}
