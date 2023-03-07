import { Component } from '@angular/core';
import {
  CollectionReference,
  DocumentData,
  Firestore,
  addDoc,
  collection,
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Room } from 'src/app/models/Room';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  roomTitle: string = '';
  firestore: Firestore;
  roomCollection: CollectionReference<DocumentData>;
  cardOptions: string = '1,2,3,4,5,6,7,8,9,10';

  constructor(firestore: Firestore, private router: Router) {
    this.firestore = firestore;
    this.roomCollection = collection(this.firestore, 'rooms');
  }

  onKey(event: any) {
    this.roomTitle = event.target.value;
  }

  async createRoom() {
    const room: Partial<Room> = {
      name: this.roomTitle,
      show_cards: false,
      card_options: this.cardOptions,
      created_at: new Date().getTime(),
    };
    const roomDoc = await addDoc(this.roomCollection, room);
    this.router.navigate([`/room/${roomDoc.id}`]);
  }
}
