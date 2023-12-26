import {Injectable} from '@angular/core';
import {addDoc, collection, CollectionReference, Firestore} from "@angular/fire/firestore";


interface Feedback {
  to: string;
  message: {
    subject: string,
    text: string
  }
}

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  feedbackCollection: CollectionReference;

  constructor(private firestore: Firestore) {
    this.feedbackCollection = collection(this.firestore, 'feedback');
  }

  async add(feedback: Feedback) {
    return await addDoc(this.feedbackCollection, feedback);
  }
}
