import { Component } from '@angular/core';
import { Auth, signInAnonymously } from '@angular/fire/auth';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'pointing-poker';
  firetore: Firestore = {} as Firestore;

  constructor(
    private auth: Auth,
    private snackbar: MatSnackBar,
    private firestore: Firestore
  ) {
    this.login();
    this.firestore = firestore;
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
    const message = prompt('Please anonymous leave feedback here:');
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
