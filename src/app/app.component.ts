import {Component, OnInit} from '@angular/core';
import {Auth, GoogleAuthProvider, onAuthStateChanged, signInAnonymously, signInWithPopup} from '@angular/fire/auth';
import {RemoteConfigService} from "@app/services/remote-config.service";
import {FeedbackService} from "@app/services/feedback.service";
import {CheckoutService} from "@app/services/checkout.service";
import {PromptService} from './services/prompt.service';
import {tap} from 'rxjs';
import LogRocket from "logrocket";

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
  donatedLoading = true;
  donated = false;

  constructor(
    public auth: Auth,
    private feedbackService: FeedbackService,
    private remoteConfigService: RemoteConfigService,
    private checkoutService: CheckoutService,
    private promptService: PromptService
  ) {
    LogRocket.init('mjbuli/levis-pointing-poker', {
      console: {
        isEnabled: true
      }
    });

    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.userHasLoaded = true;
      LogRocket.identify(user?.uid ?? 'unauthenticated', {
        name: user?.displayName ?? "Anonymous"
      })
      if(user?.uid && user?.isAnonymous == false) {
        this.checkoutService.getCheckoutSession(user.uid)
          .then((result: any) => {
          this.donated = result?.['data']?.['object']
            this.donatedLoading = false
        })
      }
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


  prompt: string = '';
  response: any = '';
  thinking = false;
  submitPrompt() {
    this.thinking = true;
    this.promptService
      .prompt(this.prompt)
      .pipe(
        tap(() => this.thinking = false)
      )
      .subscribe(response => this.response = response);
  }
}
