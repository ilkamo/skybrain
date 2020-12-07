import { Component, HostBinding, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { faCheck, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Action, Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { State } from 'src/app/reducers';
import { navigate } from 'src/app/reducers/router/router.actions';
import { connectUser, unconnectUser } from 'src/app/reducers/user/user.actions';
import { selectConnectedUsers, selectUserPublicKey } from 'src/app/reducers/user/user.selectors';

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
  private btnAction?: Action;
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
    if (this.btnAction === undefined) {
      return;
    }
    this.store.dispatch(this.btnAction);
  }

  constructor(private store: Store<State>) {
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.subscription.add(
      combineLatest([
        this.publicKey$,
        this.store.select(selectUserPublicKey),
        this.store.select(selectConnectedUsers)
      ]).subscribe(([k, m, f]) => {
        const connected = !!k && f.findIndex(v => v.publicKey === k) !== -1;
        const isMyBrain = !!k && m === k;

        this.icon = connected || isMyBrain ? faCheck : undefined;

        let classes = 'btn btn-sm' + this.cssClasses;
        classes += isMyBrain ? ' btn-outline-success disabled' : (connected ? ' btn-outline-danger' : ' btn-outline-primary');
        this.class = classes;

        this.btnLabel = isMyBrain ? this.myLabel : (connected ? this.unconnectLabel : this.connectLabel);

        this.btnAction = !m ? navigate({
          commands: ['/login'],
          authAction: k ? connectUser({ publicKey: k }) : undefined }
        ) : ( !k || isMyBrain ? undefined : ( connected ?
          unconnectUser({ publicKey: k }) :
          connectUser({ publicKey: k })
        ));
      })
    );
  }

}
