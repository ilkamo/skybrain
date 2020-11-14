import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { USER_DATA_KEY } from './models/user-data';
import { USER_MEMORIES_KEY_PREFIX } from './models/user-memory';
import { USER_FOLLOWED_USERS_KEY } from './models/user-followed-users';
import { USER_SHARED_MEMORIES_KEY } from './models/user-shared-memories';
import { USER_PUBLIC_MEMORIES_KEY } from './models/user-public-memories';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { WallComponent } from './pages/wall/wall.component';
import { ErrorComponent } from './pages/error/error.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SiaUrlPipe } from './pipes/sia-url.pipe';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { UploadComponent } from './components/upload/upload.component';
import { MemoryComponent } from './components/memory/memory.component';

import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { reducers, metaReducers } from './reducers';
import { UserEffects } from './reducers/user/user.effects';
import { ProfileComponent } from './pages/profile/profile.component';
import { ConnectFormDirective } from './directives/connect-form.directive';
import { MemoryEffects } from './reducers/memory/memory.effects';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    WallComponent,
    ErrorComponent,
    SiaUrlPipe,
    UploadComponent,
    MemoryComponent,
    NavbarComponent,
    ProfileComponent,
    ConnectFormDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    EffectsModule.forRoot([UserEffects, MemoryEffects]),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production }),
    StoreModule.forRoot(reducers, { metaReducers }),
    !environment.production ? StoreDevtoolsModule.instrument() : []
  ],
  providers: [
    { provide: USER_DATA_KEY, useValue: 'SKYBRAIN__USER_DATA' },
    /*
      TODO: USER_MEMORIES_KEY should be based on UserFilesKey
      generated from the login passphrase in order to make it accessible only to the logged users.
      Something like: SKYBRAIN__USER_FILES_{UserFilesKey}
    */
    { provide: USER_MEMORIES_KEY_PREFIX, useValue: 'SKYBRAIN__USER_MEMORIES' },
    { provide: USER_PUBLIC_MEMORIES_KEY, useValue: 'SKYBRAIN__USER_PUBLIC_MEMORIES' },
    { provide: USER_SHARED_MEMORIES_KEY, useValue: 'SKYBRAIN__USER_SHARED_MEMORIES' },
    { provide: USER_FOLLOWED_USERS_KEY, useValue: 'SKYBRAIN__USER_FOLLOWS' },
    { provide: LocationStrategy, useClass: HashLocationStrategy},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
