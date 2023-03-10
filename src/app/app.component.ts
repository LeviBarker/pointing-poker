import { Component } from '@angular/core';
import { Auth, signInAnonymously } from '@angular/fire/auth';
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

  constructor(
    private auth: Auth,
    private snackbar: MatSnackBar,
    private firestore: Firestore,
    private remoteConfig: RemoteConfig
  ) {
    this.login();
    this.firestore = firestore;
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

  login() {
    signInAnonymously(this.auth);
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
