import {Component} from '@angular/core';
import {
  collection,
  doc,
  Firestore,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from '@angular/fire/firestore';
import {ActivatedRoute, Router} from '@angular/router';
import {Room} from 'src/app/models/Room';
import {Auth, onAuthStateChanged} from '@angular/fire/auth';
import {adjectives, animals, uniqueNamesGenerator,} from 'unique-names-generator';
import * as confetti from 'canvas-confetti';
import {MatSnackBar} from "@angular/material/snack-bar";
import {throttle} from "helpful-decorators";
import {HighlightService} from "@app/services/highlight.service";
import {map, take} from "rxjs";
import {User} from "@app/models/User";

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css'],
})
export class RoomComponent {
  room: Room = {} as Room;
  users: any[] = [];
  firestore: Firestore;
  currentUser: any;
  average: string | number = 0;
  fibonacciAverage: string | number = 0;
  agreement = 0;
  cardOptions: any[] = [];
  issue: string = '';
  enteredRoomPasscode: boolean = false;
  username: string = '';
  windowHref = window.location.href;

  highlights$ = this.highlightService.getHighlights().pipe(
    map((response: {highlights: any[]}) => response.highlights[Math.round(Math.random() * 2)])
  )

  pokemon = [
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/1.gif",
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/4.gif",
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/7.gif",
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/25.gif",
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/133.gif",
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/147.gif",
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/83.gif",
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/54.gif",
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/37.gif",
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/16.gif",
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/132.gif",
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/151.gif",
  ]

  constructor(
    firestore: Firestore,
    private route: ActivatedRoute,
    private router: Router,
    public auth: Auth,
    private snackbar: MatSnackBar,
    private highlightService: HighlightService
  ) {
    route.params.subscribe((params: any) => {
      onAuthStateChanged(this.auth, (user) => {
        if (user) {
          this.currentUser = user;
          this.registerUserToRoom(params.roomId);
        }
      });
      onSnapshot(doc(firestore, 'rooms', params.roomId), (doc) => {
        this.room = {
          id: doc.id,
          ...doc.data(),
        } as Room;
        if(this.issue != null && this.issue != "" && this.room.issue != this.issue) {
          const ref = this.snackbar.open("A new issue is being voted on!", "Open Issue", {
            duration: 10_000,
          });
          ref.onAction().pipe(take(1)).subscribe(() => window.open(this.room.issue, '_blank'));
        }
        this.issue = this.room.issue;
        this.cardOptions = this.room.card_options.split(',');
        if (this.agreement > 98 && this.room.show_cards) {
          confetti.create(document.getElementById('canvas') as HTMLCanvasElement, {
            resize: true,
          })({
            particleCount: 300,
            spread: 125,
            startVelocity: 70,
            origin: {y: 1.2}
          });
        }
      });
      const userQuery = query(
        collection(firestore, 'users'),
        where('roomId', '==', params.roomId)
      );
      onSnapshot(userQuery, (querySnapshot) => {
        this.users = this.prioritizeObject(querySnapshot.docs.map((doc) => {
          if(doc.id == this.currentUser.uid && !this.username) {
            this.username = doc.data()['name'];
          }
          return {
            id: doc.id,
            ...doc.data()
          };
        }), 'id', this.currentUser.uid)
        let allVotes = true;
        const average = Number(
          (
            this.users.reduce((acc, user) => {
              if(this.room.owner_uid != user.id && !user.vote) {
                allVotes = false;
              }
              if (user.vote && user.vote != '🤷') {
                return acc + Number(user.vote);
              }
              return acc;
            }, 0) / this.users.filter((user) => user.vote && user.vote != '🤷').length
          ).toFixed(2)
        );
        if(allVotes && this.users.length > 1 && this.room.owner_uid == this.currentUser.uid) {
            const ref = this.snackbar.open("The votes are in!", "Show Votes", {
              duration: 10_000,
            });
            ref.onAction().pipe(take(1)).subscribe(() => this.toggleShowCards(this.room));
        }
        this.average = isNaN(average) ? '???' : average;
        this.fibonacciAverage = isNaN(average) ? '???' : this.roundUpFibonacci(average);
        this.agreement = this.calculateAgreementPercentage();
      });
    });

    this.firestore = firestore;
  }

  async enterRoomPasscode() {
    if (this.room.room_passcode &&
      !this.enteredRoomPasscode &&
      this.room.owner_uid != this.currentUser.uid &&
      prompt("Enter room passcode") != this.room.room_passcode) {
      this.snackbar.open('Incorrect Room Code', '', {
        duration: 2000,
      });
      await this.router.navigate(['/']);
      return false;
    }
    this.enteredRoomPasscode = true;
    return true;
  }

  async registerUserToRoom(roomId: string) {
    const userId = this.auth.currentUser?.uid;
    if (!userId) {
      return;
    }
    const docRef = doc(this.firestore, 'users', userId);
    const docSnap = await getDoc(docRef);

    const enteredCorrectPasscode = await this.enterRoomPasscode();
    if(!enteredCorrectPasscode) {
      return;
    }
    if (docSnap.exists()) {
      await setDoc(
        docRef,
        {
          roomId,
          vote: null,
        },
        {merge: true}
      );
    } else {
      const name = this.auth.currentUser?.displayName || uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
        separator: ' ',
        style: 'capital',
      });
      await setDoc(docRef, {
        roomId,
        name,
        photoURL: this.auth.currentUser?.photoURL || `https://github.com/identicons/${this.generateRandomString(3)}.png`,
        vote: null,
      });
    }
  }

  @throttle(400)
  async updateIssue(issue: any) {
    if(issue != this.room.issue){
      const docRef = await doc(this.firestore, 'rooms', this.room.id);
      await updateDoc(docRef, {issue, show_cards: false});
      await this.clearVotes(this.room);
    }
  }

  @throttle(400)
  async updateRoom(room: any) {
    const docRef = await doc(this.firestore, 'rooms', room.id);
    await updateDoc(docRef, room);
  }

  @throttle(400)
  async toggleShowCards(room: any) {
    const docRef = await doc(this.firestore, 'rooms', room.id);
    await updateDoc(docRef, {show_cards: !room.show_cards});
  }

  @throttle(400)
  async clearVotes(room: any) {
    const roomRef = await doc(this.firestore, 'rooms', room.id);
    const batch = writeBatch(this.firestore);

    this.users.forEach((user) => {
      const docRef = doc(this.firestore, 'users', user.id);
      batch.update(docRef, {vote: null});
    });

    updateDoc(roomRef, {show_cards: false});
    batch.commit();
  }

  @throttle(400)
  async updateUser(user: any) {
    const docRef = await doc(this.firestore, 'users', user.id);
    await updateDoc(docRef, {
      ...user,
      name: this.username
    }, {merge: true});
  }

  @throttle(400)
  async vote(roomId: string, vote: any) {
    const docRef = await doc(this.firestore, 'users', this.currentUser.uid);
    await updateDoc(docRef, {vote});
  }

  calculateAgreementPercentage() {
    const votes = this.users.map((user) => user.vote).filter((v) => v && v != '🤷');
    if (!votes.length) {
      return 0;
    }
    const uniqueVotes = new Set(votes);
    const mode = Array.from(uniqueVotes).reduce(
      (a, b) =>
        votes.filter((v) => v === a).length >
        votes.filter((v) => v === b).length
          ? a
          : b,
      null
    );
    const modeCount = votes.filter((v) => v === mode).length;
    return Math.round((modeCount / votes.length) * 100);
  }

  copyToClipboard() {
    navigator.clipboard.writeText(window.location.href);
    this.snackbar.open('📋 Room copied to clipboard!', '', {
      duration: 2000,
    });
  }

  getLastPartOfUrlPath(url: String) {
    var urlParts = url.split("/");
    return urlParts[urlParts.length - 1];
  }

  isUrl(input: string) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return pattern.test(input);
  }

  identify(index: number, item: any) {
    return item.id;
  }

  open(issue: string){
    window.open(issue, "_blank");
  }


  async makeOwner(id: string) {
    const docRef = doc(this.firestore, 'rooms', this.room.id);
    await updateDoc(docRef, {owner_uid: id});
  }

  async kick(id: string) {
    const docRef = doc(this.firestore, 'users', id);
    await updateDoc(docRef, {roomId: null});
  }

  prioritizeObject(arr: any, prop: string, value: any) {
    return arr.sort((a: { [x: string]: any; }, b: { [x: string]: any; }) => (a[prop] === value ? -1 : b[prop] === value ? 1 : 0));
  }

  generateRandomString(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  trackFn(index: number, user: User) {
    return user.id;
  }

  roundUpFibonacci(average: number) {
    if (average < 0) {
      return 0;
    }
    if (average === 0 || average === 1) {
      return average;
    }
  
    let a = 0;
    let b = 1;
    let nextFib = 1;
  
    while (nextFib < average) {
      a = b;
      b = nextFib;
      nextFib = a + b;
    }
    return nextFib;
  }
}


