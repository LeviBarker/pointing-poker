import {Injectable} from '@angular/core';
import {addDoc, collection, CollectionReference, doc, Firestore, getDoc} from "@angular/fire/firestore";
import {Room} from "@app/models/Room";

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  checkoutCollection: CollectionReference;

  constructor(private firestore: Firestore) {
    this.checkoutCollection = collection(firestore, 'stripe_checkout_sessions');
  }

  async getCheckoutSession(id: string) {
    const docRef = doc(this.checkoutCollection, id);
    return (await getDoc(docRef)).data()
  }
}
