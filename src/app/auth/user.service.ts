import { Injectable } from "@angular/core";
import { PlaceLocation } from "../shared/model/location.model";
import { HttpClient } from "@angular/common/http";
import { map, take, switchMap, tap, first } from "rxjs/operators";
import { UserRecord } from "./userrecord.model";
import { AuthService } from "./auth.service";
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

interface UserData {
  firstName: string;
  lastName: string;
  description: string;
  imageUrl: string;
  phone: string;
  email: string;
  entryDate: Date;
  userId: string;
  location: PlaceLocation;
}

@Injectable({
  providedIn: "root",
})
export class UserService {
 
 
  constructor(private authService: AuthService, private http: HttpClient, private db:AngularFirestore) {}


  getUserByUserId(): Observable<any> {
    let userId = this.getUserId();
     
    return this.db
    .collection('users', ref => ref.where('userId', '==', userId))
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
  };

  getUserByPhoneNumber(phoneNumber: any): Observable<any>  {
    return this.db
    .collection('users', ref => ref.where('phone', '==', phoneNumber))
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

  getUserId() 
  {
    let userId:string;
    this.authService.userId.subscribe(userid =>{
      if(userid !== null && userid !== undefined )
      {
        userId = userid;
      }
    })

    return userId;
    // return this.authService.userId.pipe(
    //   take(1),
    //   switchMap((userId) => {
    //     if (!userId) {
    //       throw new Error("User not found!");
    //     }
    //      return userId;
    //   })
    // );
  }
  getUser() {
    return this.authService.userId.pipe(
      take(1),
      switchMap((userId) => {
        if (!userId) {
          throw new Error("User not found!");
        }

        return this.http
          .get(`https://callforride.firebaseio.com/users.json?userId=${userId}`)
          .pipe(
            map((userData) => {
              let recordkey = "";
              let result = Object.keys(userData).map((key) => {
                recordkey = key;
                return userData[key];
              });
              console.log(result);
              return new UserRecord(
                recordkey,
                result[0].firstName,
                result[0].lastName,
                result[0].description,
                result[0].imageUrl,
                result[0].phone,
                result[0].email,
                new Date(result[0].entryDate),
                new Date(),
                result[0].userId,
                result[0].location,
                result[0].roles
              );
            })
          );
      })
    );
  }

  // addUser(
  //   firstName: string,
  //   lastName: string,
  //   description: string,
  //   imageUrl: string,
  //   phone: string,
  //   email: string,
  //   entryDate: Date,
  //   localId: string,
  //   location: PlaceLocation
  // ) {
  //   let newUser: UserRecord;
  //   if (!localId) {
  //     throw new Error("No user found!");
  //   }
  //   newUser = new UserRecord(
  //     Math.random().toString(),
  //     firstName,
  //     lastName,
  //     description,
  //     imageUrl,
  //     phone,
  //     email,
  //     entryDate,
  //     new Date(),
  //     localId,
  //     location
  //   );
  //   return this.http
  //     .post<UserRecord>("https://callforride.firebaseio.com/users.json", {
  //       ...newUser,
  //       id: null,
  //     })
  //     .pipe(
  //       tap((userData) => {
  //         console.log(userData);
  //       })
  //     );
  // }

  addUser(
    firstName: string,
    lastName: string,
    description: string,
    imageUrl: string,
    phone: string,
    email: string,
    entryDate: Date,
    localId: string,
    location: PlaceLocation,
    roles:any
  ) {
    let newUser: UserRecord;
    if (!localId) {
      throw new Error("No user found!");
    }
    newUser = new UserRecord(
      Math.random().toString(),
      firstName,
      lastName,
      description,
      imageUrl,
      phone,
      email,
      entryDate,
      new Date(),
      localId,
      location,
      roles
    );

    return new Promise<any>((resolve, reject) =>{
      this.db
      .collection('users').add({...newUser,id: null,})
          .then(res => resolve(res), err => reject(err));  
  });
    // return this.http
    //   .post<UserRecord>("https://callforride.firebaseio.com/users.json", {
    //     ...newUser,
    //     id: null,
    //   })
    //   .pipe(
    //     tap((userData) => {
    //       console.log(userData);
    //     })
    //   );
  }

 
  updateUser(
    id: string,
    firstName: string,
    lastName: string,
    description: string,
    imageUrl: string,
    phone: string,
    localId: string,
    email: string,
    entryDate: Date,
    roles: any
  ) {
    let updateUser = new UserRecord(
      id,
      firstName,
      lastName,
      description,
      imageUrl,
      phone,
      email,
      entryDate,
      new Date(),
      localId,
      null,
      roles
    );
    return new Promise<any>((resolve, reject) =>{
      this.db
      .collection('users').doc(id).set({...updateUser,id: null,})
          .then(res => resolve(res), err => reject(err));  
  });
    // return this.http.put<UserRecord>(
    //   `https://callforride.firebaseio.com/users/${id}.json`,
    //   { ...updateUser, id: null }
    // );
  }

  updateUserRole(userItem)
  {
    return new Promise<any>((resolve, reject) =>{
      this.db
      .collection('users').doc(userItem.id).set({...userItem,id: null,})
          .then(res => resolve(res), err => reject(err));  
  });
  }

  usersCollectionFetch(): Observable<any[]> {
    return this.db
      .collection("users", ref => 
      ref.orderBy('entryDate','desc'))
      .snapshotChanges()
      .pipe(
        map((snaps) =>
          snaps.map((snap) => {
            let data:any = (snap.payload.doc.data() as {});
            const id = snap.payload.doc.id;
            data.id = id;
                      return {
              id: id,
              ... data
            };
          })
        ),
        first()
      );
  }
}
