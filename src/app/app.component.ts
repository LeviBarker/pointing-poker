import { Component } from '@angular/core';
import {Auth, GoogleAuthProvider, onAuthStateChanged, signInAnonymously, signInWithPopup} from '@angular/fire/auth';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
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

  currentUser: any;
  userHasLoaded: boolean = false;

  constructor(
    public auth: Auth,
    private snackbar: MatSnackBar,
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
      })
    };
    fetchAndActivate(this.remoteConfig).then(() => {
      this.title = getValue(this.remoteConfig, 'app_name').asString();
      this.theme = JSON.parse(getValue(this.remoteConfig, 'theme').asString());
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

  copyToClipboard() {
    navigator.clipboard.writeText(window.location.href);
    this.snackbar.open('📋 Room copied to clipboard!', '', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      duration: 2000,
    });
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
