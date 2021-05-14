import { PORTAL } from './tokens/portal.token';
import { STREAM_MEMORIES_KEY } from './models/stream-memory';
import { StreamComponent } from './pages/stream/stream.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { CopyKeyComponent } from './components/copy-key/copy-key.component';
import { MarkdownPipe } from './pipes/markdown.pipe';
import { ConnectionEffects } from './reducers/connection/connection.effects';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { USER_DATA_KEY } from './models/user-data';
import { USER_MEMORIES_KEY_PREFIX } from './models/user-memory';
import { SKYBRAIN_ACCOUNT_PUBLIC_KEY, USER_CONNECTED_USERS_KEY } from './models/user-connected-users';
import { USER_SHARED_MEMORIES_KEY } from './models/user-shared-memories';
import { USER_PUBLIC_MEMORIES_KEY } from './models/user-public-memories';
import { SKYBRAIN_SKYDB_CACHED_USERS_KEY } from './models/users-cache';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { MemoriesComponent } from './pages/memories/memories.component';
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
import { SharedComponent } from './pages/shared/shared.component';
import { FooterComponent } from './components/footer/footer.component';
import { AbsolutePathPipe } from './pipes/absolute-path.pipe';
import { MemoryMediaTypePipe } from './pipes/memory-media-type.pipe';
import { ConnectionComponent } from './pages/connection/connection.component';
import { RouterState, StoreRouterConnectingModule } from '@ngrx/router-store';
import { BrainConnectionsComponent } from './components/brain-connections/brain-connections.component';
import { ConnectMeComponent } from './components/connect-me/connect-me.component';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
import { RouterEffects } from './reducers/router/router.effects';
import { SkyidConnectComponent } from './components/skyid-connect/skyid-connect.component';
import { APP_NAME } from './tokens/app-name.token';
import { MarkdownEditorModule } from './modules/markdown-editor/markdown-editor.module';
import { PublicMemoryComponent } from './pages/public-memory/public-memory.component';
import { Ng2ImgMaxModule } from 'ng2-img-max';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    MemoriesComponent,
    ErrorComponent,
    SiaUrlPipe,
    UploadComponent,
    MemoryComponent,
    NavbarComponent,
    ProfileComponent,
    ConnectFormDirective,
    SharedComponent,
    FooterComponent,
    AbsolutePathPipe,
    MemoryMediaTypePipe,
    ConnectMeComponent,
    ConnectionComponent,
    BrainConnectionsComponent,
    BreadcrumbsComponent,
    SkyidConnectComponent,
    MarkdownPipe,
    PublicMemoryComponent,
    CopyKeyComponent,
    StreamComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    EffectsModule.forRoot([RouterEffects, UserEffects, MemoryEffects, ConnectionEffects]),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production }),
    StoreModule.forRoot(reducers, { metaReducers }),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    StoreRouterConnectingModule.forRoot({ routerState: RouterState.Minimal }),
    MarkdownEditorModule,
    InfiniteScrollModule,
    Ng2ImgMaxModule
  ],
  providers: [
    { provide: USER_DATA_KEY, useValue: 'SKYBRAIN__USER_DATA' },
    { provide: USER_MEMORIES_KEY_PREFIX, useValue: 'SKYBRAIN__USER_MEMORIES' },
    { provide: USER_PUBLIC_MEMORIES_KEY, useValue: 'SKYBRAIN__USER_PUBLIC_MEMORIES' },
    { provide: USER_SHARED_MEMORIES_KEY, useValue: 'SKYBRAIN__USER_SHARED_MEMORIES' },
    { provide: USER_CONNECTED_USERS_KEY, useValue: 'SKYBRAIN__USER_FOLLOWS' },
    { provide: SKYBRAIN_ACCOUNT_PUBLIC_KEY, useValue: 'aa804900a3386bb436640d90438ef3d566e07061e388e1a511d565038a026c0f' },
    { provide: APP_NAME, useValue: 'SkyBrain' },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: SKYBRAIN_SKYDB_CACHED_USERS_KEY, useValue: 'SKYBRAIN__CACHED_USERS' },
    { provide: STREAM_MEMORIES_KEY, useValue: 'SKYBRAIN__STREAM_MEMORIES' },
    { provide: PORTAL, useValue: 'https://siasky.net' },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
