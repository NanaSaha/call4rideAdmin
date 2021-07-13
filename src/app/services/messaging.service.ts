import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { BehaviorSubject } from 'rxjs'
import { BackEnd } from './back-end';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {

  private backEndCollection: AngularFirestoreCollection<BackEnd>;
  currentMessage = new BehaviorSubject(null);
  constructor(private angularFireMessaging: AngularFireMessaging, private db:AngularFirestore) { 
    this.angularFireMessaging.messages.subscribe(
      (_messaging: AngularFireMessaging) => {
      _messaging.onMessage = _messaging.onMessage.bind(_messaging);
      _messaging.onTokenRefresh = _messaging.onTokenRefresh.bind(_messaging);
    });

    this.backEndCollection = this.db.collection<BackEnd>('BackEnd');
   
  }

  requestPermission()
  {
    this.angularFireMessaging.requestToken.subscribe(
    (token) => {
      this.updateBackEndDoc("backendapp",token);
      console.log(token);
    },
    (err) => {
      console.error('Unable to get permission to notify.', err);
    }
    );
  }
  receiveMessage()
  {
    this.angularFireMessaging.messages.subscribe(
    (payload) => {
    console.log("new message received. ", payload);
    this.currentMessage.next(payload);
    })
  }

  updateBackEndDoc(_name: string, _value: string) {
    let doc = this.db.collection('BackEnd', ref => ref.where('name', '==', _name));
    doc.snapshotChanges().subscribe((res: any) => {
      let id = res[0].payload.doc.id;
      this.db.collection('BackEnd').doc(id).update({apptoken: _value,entryDate:new Date()});
    });
  }
}
