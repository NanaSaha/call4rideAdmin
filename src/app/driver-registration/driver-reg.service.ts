import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireStorage } from "@angular/fire/storage";
import { Observable } from "rxjs";
import { last, concatMap, first, map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class DriverRegService {
  constructor(
    private storage: AngularFireStorage,
    private db: AngularFirestore
  ) {}

  registerDriver(driver: any) {
    return new Promise<any>((resolve, reject) => {
      this.db
        .collection("drivers")
        .add({ ...driver })
        .then(
          (res) => {
            console.log(res);
            resolve(res);
          },
          (err) => {
            console.log(err);
            reject(err);
          }
        );
    });
  }

  uploadImage(image: File, userId: string) {
    const filePath = `drivers/${userId}/${
      new Date().toLocaleTimeString() + "-" + image.name
    }`;
    const uploadtask = this.storage.upload(filePath, image);
    return uploadtask.snapshotChanges().pipe(
      last(),
      concatMap(() => this.storage.ref(filePath).getDownloadURL())
    );
  }

  getDrivers(): Observable<any[]> {
    return this.db
      .collection("drivers", (ref) => ref.orderBy("entryDate", "desc"))
      .snapshotChanges()
      .pipe(
        map((snaps) =>
          snaps.map((snap) => {
            let id = snap.payload.doc.id;
            let data: any = snap.payload.doc.data() as {};
            data.id = id;
            return {
              ...data,
            };
          })
        ),
        first()
      );
  }

  updateDriverStatus(statusItem, status) {
    console.log(
      "ITEM LIST::" + statusItem,
      "STATUS" + status,
      "DRIVER ID" + statusItem.id
    );
    return new Promise<any>((resolve, reject) => {
      this.db
        .collection("drivers")
        .doc(statusItem.id)
        .update({ status: status })
        .then(
          (res) => {
            console.log("RESPONSE FROM STATUS UDATE::" + JSON.stringify(res));
            resolve(res);
          },
          (err) => reject(err)
        );
    });
  }

  deleteDriver(id) {
    console.log("DRIVER ID " + id);
    return new Promise<any>((resolve, reject) => {
      this.db
        .collection("drivers")
        .doc(id)
        .delete()
        .then(
          (res) => {
            console.log("RESPONSE FROM STATUS UDATE::" + JSON.stringify(res));
            resolve(res);
          },
          (err) => reject(err)
        );
    });
  }

  getDriverById(userId: any): Observable<any> {
    return this.db
      .collection("drivers", (ref) => ref.where("uid", "==", userId))
      .snapshotChanges()
      .pipe(
        map((snaps) =>
          snaps.map((snap) => {
            let data: any = snap.payload.doc.data() as {};
            const id = snap.payload.doc.id;
            data.id = id;
            return {
              id: id,
              ...data,
            };
          })
        ),
        first()
      );
  }

  assignJobToDriver(id: any, job: any) {
    return new Promise<any>((resolve, reject) => {
      this.db
        .collection("drivers")
        .doc(id)
        .collection("jobs")
        .add({ ...job })
        .then(
          (res) => resolve(res),
          (err) => reject(err)
        );
    });
  }

  assignDriverToUser(rider_id: any, driver_id: any) {
    return new Promise<any>((resolve, reject) => {
      this.db
        .collection("users")
        .doc(rider_id)
        .collection("driver_jobs")
        .add({ driver_id: driver_id })
        .then(
          (res) => resolve(res),
          (err) => reject(err)
        );
    });
  }

  //retrive all drivers assigned to a rider
  getDriversAssginedToRider(rider_id: any): Observable<any> {
    return this.db
      .collection("users")
      .doc(rider_id)
      .collection("driver_jobs")
      .snapshotChanges()
      .pipe(
        map((snaps) =>
          snaps.map((snap) => {
            let data: any = snap.payload.doc.data() as {};
            const id = snap.payload.doc.id;
            data.id = id;
            return {
              id: id,
              ...data,
            };
          })
        ),
        first()
      );
  }

  getDriverJobDocId(userDocId: any): Observable<any> {
    var startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    var endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    // if(fetchDate !== null && fetchDate !== undefined)
    // {
    //   startOfToday = new Date(fetchDate);
    //   startOfToday.setHours(0,0,0,0);
    //   endOfToday = new Date(fetchDate);
    //   endOfToday.setHours(23,59,59,999);
    // }

    return this.db
      .collection("drivers")
      .doc(userDocId)
      .collection("jobs", (ref) =>
        ref
          .where("assignedDate", ">=", startOfToday)
          .where("assignedDate", "<=", endOfToday)
          .orderBy("assignedDate")
      )
      .snapshotChanges()
      .pipe(
        map((snaps) =>
          snaps.map((snap) => {
            let data: any = snap.payload.doc.data() as {};
            const id = snap.payload.doc.id;
            data.id = id;
            return {
              id: id,
              ...data,
            };
          })
        ),
        first()
      );
  }
}
