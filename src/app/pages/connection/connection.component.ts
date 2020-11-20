import { FollowedUser } from 'src/app/models/user-followed-users';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Memory } from 'src/app/reducers/memory/memory.model';
import { map, withLatestFrom } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
@Component({
  templateUrl: './connection.component.html',
  styleUrls: ['./connection.component.scss']
})
export class ConnectionComponent implements OnInit, OnDestroy {
  memories: Memory[] | null = null;
  followedUsers: FollowedUser[] | null = null;
  accordionOpened = false;
  publicKey: string | undefined;
  subscription = new Subscription();
  // tslint:disable-next-line: no-any
  routeData$: Observable<any>;


  constructor(route: ActivatedRoute) {
    this.routeData$ = route.data.pipe(
      map(data => data.publicBrain),
      withLatestFrom(route.params),
      map(([publicBrain, params]) => ({publicBrain, params}))
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.subscription.add(
      this.routeData$.subscribe(data => {
        this.followedUsers = data.publicBrain.followedUsers;
        this.memories = data.publicBrain.memories;
        this.publicKey = data.params.publicKey;
      })
    );
  }

  trackMemory(index: number, memory: Memory): string {
    return memory.id;
  }
}
