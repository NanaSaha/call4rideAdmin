import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Ride } from './ride';

@Injectable({
  providedIn: 'root'
})
export class QuoteService {
  private ridesCollection: AngularFirestoreCollection<Ride>;
  constructor(private db:AngularFirestore) { 
    this.ridesCollection = this.db.collection<Ride>('rides');
  }

  addItem(item: Ride) {
    return new Promise<any> ((resolve, reject) => {
      this.db.collection('rides').add({...item}).then(res => {
        console.log(res);
        resolve(res);
      }, err => {
        console.log(err);
        reject(err)
      });
    });
    
  }

}
