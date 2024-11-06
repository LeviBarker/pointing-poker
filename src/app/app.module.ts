import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';
import {HomeComponent} from './routes/home/home.component';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatMenuModule} from "@angular/material/menu";
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatSelectModule} from "@angular/material/select";
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatToolbarModule} from '@angular/material/toolbar';
import {RoomComponent} from './routes/room/room.component';
import {environment} from '../environments/environment';
import {getRemoteConfig, provideRemoteConfig} from "@angular/fire/remote-config";
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {getAuth, provideAuth} from '@angular/fire/auth';
import {getFirestore, provideFirestore} from '@angular/fire/firestore';
import {MatBadgeModule} from "@angular/material/badge";
import {MatChipsModule} from "@angular/material/chips";
import {MatTooltipModule} from "@angular/material/tooltip";
import {SponsorComponent} from './routes/room/sponsor/sponsor.component';
import {ShareComponent} from './routes/room/share/share.component';
import {VoteComponent} from './routes/room/vote/vote.component';
import {HttpClientModule} from "@angular/common/http";
import {MarkdownModule} from "ngx-markdown";
import {MatSidenavModule} from "@angular/material/sidenav";

@NgModule({
  declarations: [AppComponent, RoomComponent, HomeComponent, SponsorComponent, ShareComponent, VoteComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideRemoteConfig(() => getRemoteConfig()),
    BrowserAnimationsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatToolbarModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatMenuModule,
    MatSelectModule,
    FormsModule,
    MatBadgeModule,
    MatChipsModule,
    MatTooltipModule,
    HttpClientModule,
    MarkdownModule.forRoot(),
    MatSidenavModule
  ],
  providers: [
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
