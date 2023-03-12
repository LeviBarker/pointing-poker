import { Component } from '@angular/core';
import {Auth, GoogleAuthProvider, onAuthStateChanged, signInAnonymously, signInWithPopup} from '@angular/fire/auth';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';
import {fetchAndActivate, getValue, RemoteConfig} from "@angular/fire/remote-config";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Pointing Poker';
  firetore: Firestore = {} as Firestore;

  theme: Record<string, string> | null = null;
  logoUrl: string = 'assets/Playing-Cards.svg';

  currentUser: any;
  userHasLoaded: boolean = false;


  constructor(
    public auth: Auth,
    private firestore: Firestore,
    private remoteConfig: RemoteConfig
  ) {
    this.firestore = firestore;
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.userHasLoaded = true;
    });
    this.remoteConfig.settings.minimumFetchIntervalMillis = 300000;
    this.remoteConfig.settings.fetchTimeoutMillis = 2000;
    this.remoteConfig.defaultConfig = {
      app_name: 'Pointing Poker',
      theme: JSON.stringify({
        'background-color': '#ffffff',
        'color': '#314a52',
      }),
      logo_url: 'assets/Playing-Cards.svg',
      card_options: [
        '1,2,3,4,5,6,7,8,9,10',
        '0.5,1,2,3,5,8,13,20',
        'XXS,XS,S,M,L,XL,XXL',
      ].join(':'),
    };
    fetchAndActivate(this.remoteConfig).then(() => {
      this.title = getValue(this.remoteConfig, 'app_name').asString();
      this.theme = JSON.parse(getValue(this.remoteConfig, 'theme').asString());
      this.logoUrl = getValue(this.remoteConfig, 'logo_url').asString();
    });
  }

  loginAnonymously() {
    signInAnonymously(this.auth);
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
  }

  logout() {
    this.auth.signOut();
  }

  async leaveFeedback() {
    const message = prompt('Please leave anonymous feedback here:');
    if (message) {
      await addDoc(collection(this.firestore, 'feedback'), {
        to: 'dev.levibarker@gmail.com',
        message: {
          subject: 'Pointing Poker Feedback',
          text: message,
        }
      });
    }
  }
}
