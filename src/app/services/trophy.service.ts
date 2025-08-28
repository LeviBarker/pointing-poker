import {Injectable} from '@angular/core';
import {addDoc, collection, CollectionReference, doc, Firestore, getDoc, getDocs} from "@angular/fire/firestore";
import {Room} from "@app/models/Room";
import { Trophy } from '@app/models/Trophy';

@Injectable({
  providedIn: 'root'
})
export class TrophyService {

  trophyCollection: CollectionReference;

  constructor(private firestore: Firestore) {
    this.trophyCollection = collection(firestore, 'trophy-case');
  }

  async addTrophy(url: string) {
    const room: Partial<Trophy> = {
      url,
      date: new Date()
    };
    return await addDoc(this.trophyCollection, room);
  }
  
  async getAllTrophies() {
    const docs = await getDocs(this.trophyCollection);
    return docs.docs.map(doc => doc.data());
  }
}
