import {Injectable} from '@angular/core';
import {addDoc, collection, CollectionReference, doc, Firestore, getDoc} from "@angular/fire/firestore";
import {Room} from "@app/models/Room";

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  roomCollection: CollectionReference;

  constructor(private firestore: Firestore) {
    this.roomCollection = collection(firestore, 'rooms');
  }

  async createRoom(name: string, cardOptions: any, ownerUid: string | undefined, roomPasscode: string | null) {
    const room: Partial<Room> = {
      name,
      show_cards: false,
      card_options: cardOptions,
      created_at: new Date().getTime(),
      owner_uid: ownerUid,
      room_passcode: roomPasscode,
      easterEggId: Math.floor(Math.random() * (400 - 1 + 1)) + 1
    };
    return await addDoc(this.roomCollection, room);
  }

  getRoomWithUsers(id: string) {
    const docRef = doc(this.roomCollection, id);
    getDoc(docRef)
  }
}
