import { Injectable, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Plugins  } from "@capacitor/core";
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';
import { first, switchMap, take } from 'rxjs/operators';


  const { Device } = Plugins;


@Injectable({
  providedIn: 'root'
})
export class DeviceService implements OnInit {
 
  deviceInfo: any;

   
  constructor(private db:AngularFirestore) {

   }
   ngOnInit() {
     
  }

  get getDeviceInfo() {
    return of(Device.getInfo()).pipe(
      map((device) => {
        if (device) {
          return device
        } else {
          return null;
        }
      })
    );
  }
    iSDeviceRegistered(uuid:any): Observable<any>
     {
         return this.db
    .collection('devices', ref => ref.where('uuid', '==', uuid))
    .snapshotChanges()
    .pipe(
      map((snaps) =>snaps.map((snap) => {
          let data:any = (snap.payload.doc.data() as {});
          const id = snap.payload.doc.id;
          data.id = id;
          return {
            id: id,
            ...data
          };
        })
     
      ),
      first()
    );
      
     }

  registerDevice(uuid: string, phoneNumber: any) {
    return new Promise<any>((resolve, reject) =>{
      this.db
      .collection('devices').add({uuid: uuid,phone:phoneNumber,entryDate:new Date()})
          .then(res => resolve(res), err => reject(err));  
     });
  }
  getDeviceInfoByDeviceId(deviceId: any): Observable<any> {
     return this.db
    .collection('devices', ref => ref.where('uuid', '==', deviceId))
    .snapshotChanges()
    .pipe(
      map((snaps) =>snaps.map((snap) => {
          let data:any = (snap.payload.doc.data() as {});
          const id = snap.payload.doc.id;
          data.id = id;
          return {
            id: id,
            ...data
          };
        })
     
      ),
      first()
    );
  }

}
