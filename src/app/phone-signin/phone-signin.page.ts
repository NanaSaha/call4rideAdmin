import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';

import { WindowService } from '../services/window.service';

// import * as firebase from 'firebase';
import * as firebaseui from 'firebaseui'
import * as firebase from 'firebase';
import { UserService } from '../auth/user.service';
import { Platform } from '@ionic/angular';
import { DeviceService } from '../services/device.service';
import { Device, Plugins } from '@capacitor/core';

export class PhoneNumber {
  country: string;
  area: string;
  prefix: string;
  line: string;

  // format phone numbers as E.164
  get e164() {
    const num = this.country + this.area + this.prefix + this.line
    return `+${num}`
  }

}

@Component({
  selector: 'app-phone-signin',
  templateUrl: './phone-signin.page.html',
  styleUrls: ['./phone-signin.page.scss'],
})
export class PhoneSigninPage implements OnInit, OnDestroy {

  windowRef: any;

  phoneNumber = new PhoneNumber()

  verificationCode: string;

  user: any;
  ui: firebaseui.auth.AuthUI;
  uiConfig: firebaseui.auth.Config;
  constructor(
    private win: WindowService,
    private afAuth:AngularFireAuth,
    private router:Router,
    private ngZone:NgZone,
    private _userService:UserService,
    private platform: Platform,
    private _DeviceService:DeviceService
    ) { }

  ngOnDestroy(): void {
    this.ui.delete();
  }

  ngOnInit() {

    // this.platform.resume.subscribe(async () => {
    //   this.router.navigateByUrl('/home');
    // });

    this.uiConfig ={
      signInOptions:[
        // firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        // firebase.auth.EmailAuthProvider.PROVIDER_ID,
        firebase.auth.PhoneAuthProvider.PROVIDER_ID
      ],
      callbacks:{
        signInSuccessWithAuthResult:this.onLoginSuccessful.bind(this),
        signInFailure:this.onSignInFailure.bind(this)
      }
    };
    this.ui = new firebaseui.auth.AuthUI(firebase.auth());
    this.ui.start('#firebaseui-auth-container',this.uiConfig);

  //   this.windowRef = this.win.windowRef
  //   this.windowRef.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container')

  //   this.windowRef.recaptchaVerifier.render()
  }

  onSignInFailure() {
    throw new Error('Method not implemented.');
  }
  onLoginSuccessful(result) {
   console.log("Phone Result ", result.user.phoneNumber);
   this.ngZone.run( ()=>
   {
    //  let phoneNumber = "00";
    // if(result.user.phoneNumber.charAt(0) === '+')
    // {
    //   phoneNumber +=  result.user.phoneNumber.slice(1);
    //   console.log(phoneNumber);
    // }

    Device.getInfo().then((device)=>{
      if(device !== null){
        this._DeviceService.getDeviceInfoByDeviceId(device.uuid).subscribe((deviceInfo)=>{
          if(deviceInfo.length === 0){
            this._DeviceService.registerDevice(device.uuid,result.user.phoneNumber).then(result=>{
              console.log(result);
              // alert("Your platform is: " + device.uuid)
              Plugins.Storage.set({ key: "device_id", value: device.uuid});
            },error=>console.log);
           
          }
        },err=>console.log)
      }

     },err=>console.log)


     this._userService.getUserByPhoneNumber(result.user.phoneNumber).subscribe((user)=>{
       if(user.length > 0)
       {
         this.router.navigateByUrl('/home')
       }
       else{
         this.router.navigateByUrl('/setup')
       }
     })    
   })
  }


  // sendLoginCode() {

  //   const appVerifier = this.windowRef.recaptchaVerifier;

  //   const num = this.phoneNumber.e164;

  //   firebase.auth().signInWithPhoneNumber(num, appVerifier)
  //           .then(result => {

  //               this.windowRef.confirmationResult = result;

  //           })
  //           .catch( error => console.log(error) );

  // }

  // verifyLoginCode() {
  //   this.windowRef.confirmationResult
  //                 .confirm(this.verificationCode)
  //                 .then( result => {

  //                   this.user = result.user;

  //   })
  //   .catch( error => console.log(error, "Incorrect code entered?"));
  // }

}
