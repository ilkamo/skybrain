import { Component, HostBinding, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { State } from 'src/app/reducers';
import { followUser, unfollowUser } from 'src/app/reducers/user/user.actions';
import { selectFollowedUsers, selectUserPublicKey } from 'src/app/reducers/user/user.selectors';

@Component({
  selector: 'app-follow-me',
  templateUrl: './follow-me.component.html',
  styleUrls: ['./follow-me.component.scss'],
})
export class FollowMeComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();
  private publicKey$ = new BehaviorSubject<string | undefined>(undefined);
  private _publicKey: string | undefined = undefined;
  private _myKey: string | undefined = undefined;
  private _followed = false;
  get followed(): boolean {
    return this._followed;
  }
  get isMyBrain(): boolean {
    return !!this.publicKey && this._myKey === this._publicKey;
  }
  @HostBinding('class')
  get class(): string {
    let classes = 'btn ' + this.cssClasses;
    if (this.isMyBrain) {
      classes += ' btn-outline-success';
    } else {
      classes += this.followed ? ' btn-outline-danger' : ' btn-outline-primary';
    }
    if (this.isMyBrain) {
      classes += ' disabled';
    }
    return classes;
  }
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
    return this._publicKey;
  }
  get btnLabel(): string | undefined {
    if (this.isMyBrain) {
      return this.myLabel;
    }
    return this.followed ? this.unconnectLabel : this.connectLabel;
  }
  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    event.preventDefault();
    if (!this._myKey) {
      this.router.navigateByUrl('/login');
      return;
    }
    if (!this.publicKey) {
      return;
    }
    if (this.followed) {
      this.store.dispatch(unfollowUser({ publicKey: this.publicKey }));
      return;
    }
    this.store.dispatch(followUser({ publicKey: this.publicKey }));
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
        this._publicKey = k;
        this._myKey = m;
        this._followed = !!k && f.findIndex(v => v.publicKey === k) !== -1;
      })
    );
  }

}
