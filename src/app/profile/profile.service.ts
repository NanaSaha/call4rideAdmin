import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, take, switchMap, tap, last, concatMap } from "rxjs/operators";

import { UserRecord } from "../auth/userrecord.model";
import { ProfileImage } from "../shared/model/profile-image.model";
import { AngularFireStorage } from "@angular/fire/storage";
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: "root",
})
export class ProfileService {
  constructor(private http: HttpClient,private storage: AngularFireStorage,private db:AngularFirestore) {}

  uploadImage(image: File,userId:string) {

    const filePath = `profiles/${userId}/${
      new Date().toLocaleTimeString() + "-" + image.name
    }`;
    const uploadtask =  this.storage.upload(filePath, image);
   return uploadtask
    .snapshotChanges()
    .pipe(
      last(),
      concatMap(() => this.storage.ref(filePath).getDownloadURL())
    );

    // const uploadData = new FormData();
    // uploadData.append("image", image);

    // return this.http.post<ProfileImage>(
    //   "https://us-central1-callforride.cloudfunctions.net/storeImage",
    //   uploadData
    // );
  }
  // updateProfile(
  //   id: string,
  //   firstName: string,
  //   lastName: string,
  //   description: string,
  //   imageUrl: string,
  //   phone: string,
  //   localId: string,
  //   email: string,
  //   entryDate: Date
  // ) {
  //   let updateUser = new UserRecord(
  //     id,
  //     firstName,
  //     lastName,
  //     description,
  //     imageUrl,
  //     phone,
  //     email,
  //     entryDate,
  //     new Date(),
  //     localId,
  //     null
  //   );
  //   return this.http
  //     .put<UserRecord>(`https://callforride.firebaseio.com/users/${id}.json`, {
  //       ...updateUser,
  //       id: null,
  //     })
  //     .pipe(
  //       map((userData) => {
  //         let recordkey = "";
  //         let result = Object.keys(userData).map((key) => {
  //           recordkey = key;
  //           return userData[key];
  //         });
  //         console.log(result);
  //         return new UserRecord(
  //           recordkey,
  //           result[0].firstName,
  //           result[0].lastName,
  //           result[0].description,
  //           result[0].imageUrl,
  //           result[0].phone,
  //           result[0].email,
  //           new Date(result[0].entryDate),
  //           new Date(),
  //           result[0].userId,
  //           result[0].location
  //         );
  //       })
  //     );
  // }

  updateProfile(
    id: string,
    firstName: string,
    lastName: string,
    description: string,
    imageUrl: string,
    phone: string,
    localId: string,
    email: string,
    entryDate: Date,
    roles:any
  ) {

    if(description === undefined || description === null)
    {
      description = "";
    }

    console.log(description);
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
    // return this.http
    //   .put<UserRecord>(`https://callforride.firebaseio.com/users/${id}.json`, {
    //     ...updateUser,
    //     id: null,
    //   })
    //   .pipe(
    //     map((userData) => {
    //       let recordkey = "";
    //       let result = Object.keys(userData).map((key) => {
    //         recordkey = key;
    //         return userData[key];
    //       });
    //       console.log(result);
    //       return new UserRecord(
    //         recordkey,
    //         result[0].firstName,
    //         result[0].lastName,
    //         result[0].description,
    //         result[0].imageUrl,
    //         result[0].phone,
    //         result[0].email,
    //         new Date(result[0].entryDate),
    //         new Date(),
    //         result[0].userId,
    //         result[0].location
    //       );
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
    roles:any
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
}
