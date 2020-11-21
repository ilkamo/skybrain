import { Component, HostBinding, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faCheck, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Action, Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { State } from 'src/app/reducers';
import { followUser, unfollowUser } from 'src/app/reducers/user/user.actions';
import { selectFollowedUsers, selectUserPublicKey } from 'src/app/reducers/user/user.selectors';

@Component({
  selector: 'app-connect-me',
  templateUrl: './connect-me.component.html',
  styleUrls: ['./connect-me.component.scss'],
})
export class ConnectMeComponent implements OnInit, OnDestroy {
  btnLabel = '';
  icon?: IconDefinition;
  private subscription = new Subscription();
  private publicKey$ = new BehaviorSubject<string | undefined>(undefined);
  // tslint:disable-next-line: no-any
  private btnAction?: Action | null;
  @HostBinding('class') class = 'hidden';
  @Input() cssClasses = '';
  @Input() connectLabel = 'Connect';
  @Input() unconnectLabel = 'Unconnect';
  @Input() myLabel = 'It\'s my brain';
  @Input()
  set publicKey(key: string | undefined) {
    if (key !== this.publicKey$.value){
      this.publicKey$.next(key);
  }
  }
  get publicKey(): string | undefined {
    return this.publicKey$.value;
  }
  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    event.preventDefault();
    if (this.btnAction === null) {
      this.router.navigateByUrl('/login');
      return;
    }
    if (this.btnAction === undefined) {
      return;
    }
    this.store.dispatch(this.btnAction);
  }

  constructor(private store: Store<State>, private router: Router) {
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.subscription.add(
      combineLatest([
        this.publicKey$,
        this.store.select(selectUserPublicKey),
        this.store.select(selectFollowedUsers)
      ]).subscribe(([k, m, f]) => {
        const followed = !!k && f.findIndex(v => v.publicKey === k) !== -1;
        const isMyBrain = !!k && m === k;

        this.icon = followed || isMyBrain ? faCheck : undefined;

        let classes = 'btn ' + this.cssClasses;
        classes += isMyBrain ? ' btn-outline-success disabled' : (followed ? ' btn-outline-danger' : ' btn-outline-primary');
        this.class = classes;

        this.btnLabel = isMyBrain ? this.myLabel : (followed ? this.unconnectLabel : this.connectLabel);

        this.btnAction = !m ? null : ( !k || isMyBrain ? undefined : ( followed ?
          unfollowUser({ publicKey: k }) :
          followUser({ publicKey: k })
        ));
      })
    );
  }

}
