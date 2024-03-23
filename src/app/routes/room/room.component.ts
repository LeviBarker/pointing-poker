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
  agreement = 0;
  cardOptions: any[] = [];
  issue: string = '';
  enteredRoomPasscode: boolean = false;

  constructor(
    firestore: Firestore,
    private route: ActivatedRoute,
    private router: Router,
    public auth: Auth,
    private snackbar: MatSnackBar
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
        this.enterRoomPasscode();
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
        this.users = querySnapshot.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        });
        const average = Number(
          (
            this.users.reduce((acc, user) => {
              if (user.vote && user.vote != '🤷') {
                return acc + Number(user.vote);
              }
              return acc;
            }, 0) / this.users.filter((user) => user.vote && user.vote != '🤷').length
          ).toFixed(2)
        );
        this.average = isNaN(average) ? '???' : average;
        this.agreement = this.calculateAgreementPercentage();
      });
    });

    this.firestore = firestore;
  }

  async enterRoomPasscode() {
    if (!this.enteredRoomPasscode &&
      this.room.owner_uid != this.currentUser.uid &&
      prompt("Enter room passcode") != this.room.room_passcode) {
      await this.router.navigate(['/']);
      return;
    }
    this.enteredRoomPasscode = true;
  }

  async registerUserToRoom(roomId: string) {
    const userId = this.auth.currentUser?.uid;
    if (!userId) {
      return;
    }
    const docRef = doc(this.firestore, 'users', userId);
    const docSnap = await getDoc(docRef);

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
        photoURL: this.auth.currentUser?.photoURL || 'https://robohash.org/' + name,
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
    await updateDoc(docRef, user, {merge: true});
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
}


