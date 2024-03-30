import {Component, OnInit} from '@angular/core';
import {Auth, GoogleAuthProvider, onAuthStateChanged, signInAnonymously, signInWithPopup} from '@angular/fire/auth';
import {RemoteConfigService} from "@app/services/remote-config.service";
import {FeedbackService} from "@app/services/feedback.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'Pointing Poker';
  theme: Record<string, string> | null = null;
  logoUrl: string = 'assets/Playing-Cards.svg';
  bannerButton: {
    link: string;
    text: string;
  } | null = null;

  currentUser: any;
  userHasLoaded: boolean = false;

  constructor(
    public auth: Auth,
    private feedbackService: FeedbackService,
    private remoteConfigService: RemoteConfigService
  ) {
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.userHasLoaded = true;
    });

  }

  async ngOnInit() {
    await this.setupRemoteConfig();
  }

  async setupRemoteConfig() {
    try {
      const values = await this.remoteConfigService.getValues();
      this.title = values.title;
      this.theme = values.theme;
      this.logoUrl = values.logoUrl;
      this.bannerButton = values.bannerButton;
    } catch (e) {
      console.error(`Unknown error occurred when fetching remote config`)
    }
  }

  async loginAnonymously() {
    await signInAnonymously(this.auth);
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.auth, provider);
  }

  async logout() {
    await this.auth.signOut();
  }

  async leaveFeedback() {
    const message = prompt('Please leave anonymous feedback here:');
    if (message) {
      await this.feedbackService.add({
        to: 'dev.levibarker@gmail.com',
        message: {
          subject: 'Pointing Poker Feedback',
          text: message,
        }
      })
    }
  }

  openLink(link: string) {
    window.open(link, '_blank');
  }
}
