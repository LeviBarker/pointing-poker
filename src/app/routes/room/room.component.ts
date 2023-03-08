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
import {ActivatedRoute} from '@angular/router';
import {Room} from 'src/app/models/Room';
import {Auth, onAuthStateChanged} from '@angular/fire/auth';
import {adjectives, animals, uniqueNamesGenerator,} from 'unique-names-generator';
import * as confetti from 'canvas-confetti';

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
  average = 0;
  agreement = 0;
  cardOptions: any[] = [];

  constructor(
    firestore: Firestore,
    private route: ActivatedRoute,
    public auth: Auth
  ) {
    route.params.subscribe((params: any) => {
      console.log('route params changed');
      onAuthStateChanged(this.auth, (user) => {
        console.log('auth state changed');
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
        this.cardOptions = this.room.card_options.split(',');
        if (this.agreement == 100 && this.room.show_cards) {
          confetti.create(document.getElementById('canvas') as HTMLCanvasElement, {
            resize: true,
          })({particleCount: 200, spread: 200, });
        }
        console.log('room data changed');
      });
      const userQuery = query(
        collection(firestore, 'users'),
        where('roomId', '==', params.roomId)
      );
      onSnapshot(userQuery, (querySnapshot) => {
        console.log('user data changed');
        this.users = querySnapshot.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        });
        this.average = Number(
          (
            this.users.reduce((acc, user) => {
              if (user.vote) {
                return acc + Number(user.vote);
              }
              return acc;
            }, 0) / this.users.filter((user) => user.vote).length
          ).toFixed(2)
        );
        this.agreement = this.calculateAgreementPercentage();
      });
    });

    this.firestore = firestore;
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
      await setDoc(docRef, {
        roomId,
        name: uniqueNamesGenerator({
          dictionaries: [adjectives, animals],
          separator: ' ',
          style: 'capital',
        }),
        vote: null,
      });
    }
  }

  async updateRoom(room: any) {
    const docRef = await doc(this.firestore, 'rooms', room.id);
    await updateDoc(docRef, room);
  }

  async toggleShowCards(room: any) {
    const docRef = await doc(this.firestore, 'rooms', room.id);
    await updateDoc(docRef, {show_cards: !room.show_cards});
  }

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

  async updateUser(user: any) {
    const docRef = await doc(this.firestore, 'users', user.id);
    await updateDoc(docRef, user, {merge: true});
  }

  async vote(roomId: string, vote: number) {
    const docRef = await doc(this.firestore, 'users', this.currentUser.uid);
    await updateDoc(docRef, {vote});
  }

  calculateAgreementPercentage() {
    const votes = this.users.map((user) => user.vote).filter((v) => v);
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
}
