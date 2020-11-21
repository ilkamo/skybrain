import { ConnectedUser } from 'src/app/models/user-connected-users';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';

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
  subscription = new Subscription();

  constructor(private router: Router) {
    this.routeData$ = router.events.pipe(filter(event => event instanceof NavigationStart));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.subscription = this.routeData$.subscribe((event: NavigationStart) => {
      this.accordionOpened = false;
    });
  }
}
