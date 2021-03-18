import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Memory } from 'src/app/reducers/memory/memory.model';
import { map, withLatestFrom } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { State as RootState } from '../../reducers';
import { isAuthenticated } from '../../reducers/user/user.selectors';

@Component({
  selector: 'app-stream',
  templateUrl: './stream.component.html',
  styleUrls: ['./stream.component.scss']
})
export class StreamComponent implements OnInit, OnDestroy {

  memories: Memory[] | null = null;
  accordionOpened = false;
  subscription = new Subscription();
  // tslint:disable-next-line: no-any
  routeData$: Observable<any>;

  displayedMemories: Memory[] = [];
  displayedIndex = 0;
  toDisplayOnInit = 3;

  isAuthenticated$ = this.store.pipe(select(isAuthenticated));

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
        this.memories = data.publicBrain.memories;
        this.displayedIndex = 0;
        this.displayedMemories = [];

        if (this.memories) {
          // If possibile, display `toDisplayOnInit` memories on the timeline.
          for (let i = 0; i < this.toDisplayOnInit; i++) {
            this.onScroll();
          }
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
