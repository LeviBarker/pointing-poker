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
import {getValue, RemoteConfig} from "@angular/fire/remote-config";

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
  possibleCardOptions: string[] = [];
  creatingRoom: boolean = false;

  constructor(firestore: Firestore, private router: Router, private remoteConfig: RemoteConfig) {
    this.firestore = firestore;
    this.roomCollection = collection(this.firestore, 'rooms');
    this.possibleCardOptions = getValue(this.remoteConfig, 'card_options').asString()?.replaceAll('"', '').split(':') || [];
  }

  async createRoom() {
    this.creatingRoom = true;
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
