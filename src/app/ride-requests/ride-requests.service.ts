import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map, first } from 'rxjs/operators';
import { Ride } from '../quote/ride';
// import * as admin from 'firebase-admin';

@Injectable({
  providedIn: 'root'
})
export class RideRequestsService {
  
  

  private ridesRequestsCollection: AngularFirestoreCollection<Ride>;
  constructor(private db:AngularFirestore) { 
    this.ridesRequestsCollection = this.db.collection<Ride>('rides');
  }

  ridesRequestsCollectionFetch(fetchDate:any = null): Observable<any[]> {
    var startOfToday = new Date(); 
    startOfToday.setHours(0,0,0,0);
    var endOfToday = new Date(); 
    endOfToday.setHours(23,59,59,999);
    if(fetchDate !== null && fetchDate !== undefined)
    {
      startOfToday = new Date(fetchDate);
      startOfToday.setHours(0,0,0,0);
      endOfToday = new Date(fetchDate);
      endOfToday.setHours(23,59,59,999);
    }

    return this.db
      .collection("rides", ref => ref.where("tripDate", ">=", startOfToday).where('tripDate', '<=', endOfToday)
      .orderBy('tripDate').orderBy('time'))
      .snapshotChanges()
      .pipe(
        map((snaps) =>
          snaps.map((snap) => {
            let id = snap.payload.doc.id;
            let data:any = (snap.payload.doc.data() as {});
            data.id = id;
           return {
              ...data
              };
          })
        ),
        first()
      );
  }

  

  updateRidesRequest(rideItem) {
    let id = rideItem.id;
    // rideItem.id = "";
    return new Promise<any>((resolve, reject) =>{
      this.db
      .collection('rides').doc(id).set({...rideItem})
          .then(res => resolve(res), err => reject(err));  
  });
  
  }

  getMyRide(userid: string): Observable<any[]> {
    return this.db
    .collection("rides", ref => ref.where("userId", "==", userid).orderBy('entryDate','desc'))
    .snapshotChanges()
    .pipe(
      map((snaps) =>
        snaps.map((snap) => {
          let id = snap.payload.doc.id;
          let data:any = (snap.payload.doc.data() as {});
          data.id = id;
         return {
            ...data
            };
        })
      ),
      first()
    );
  }

  getRideByDocId(docId: string) {
    return this.db
    .collection('rides').doc(docId)
    .snapshotChanges().pipe(
      map((doc:any)=>{
        let data:any = (doc.payload.data() as {});
        console.log(data)
        const id = 0;//doc.payload.doc.id;
        data.id = id;
        return { id, ...data };

      })
    )
  
  }



  deleteRide(id: any) {
    return new Promise<any>((resolve, reject) =>{
      this.db
      .collection('rides').doc(id).delete()
          .then(res => resolve(res), err => reject(err));  
    });
  }

}


