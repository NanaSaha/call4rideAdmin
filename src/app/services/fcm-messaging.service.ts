import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class FcmMessagingService {
  token='key=AAAA7SRV_tKJ1NzRT8d2VJ5NGkayEx1HT9SxrdTT5G5a4kx5c6GoDvmWmzhCTWDRCqrdACrctF5Gjy5Df2qf6ZCNJHt7oHfH7BC'
  constructor(private http: HttpClient) {

   }

  sendNotification(data) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `${environment.firebaseFCMServerKey}`
    });
    console.log('Res from Frontend=>', data)
    return this.http.post('https://fcm.googleapis.com/fcm/send', data, { headers: headers })
    // return this.http.post('https://fcm.googleapis.com/fcm/send', data, { headers: headers }).subscribe(res => {
    //   console.log('Res from APi', res)
    // })
  }

//   const fcm = {
//     "notification": {
//       "title": '',
//       "body": '',
//       "sound": "default",
//       "click_action": "FCM_PLUGIN_ACTIVITY",
//       "icon": "./../../assets/images/logos/arabic-purpal-logo.png"
//     },
//     "data": {
//       "hello": "This is a Firebase Cloud Messagin  hbhj g Device Gr new v Message!",
//     },
//     "to": 'FCM Token Here'
//   };
//   this.service.createNotification(fcm)
// }
}
