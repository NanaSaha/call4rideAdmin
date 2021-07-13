import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { NgForm } from "@angular/forms";
import { LoadingController, AlertController } from "@ionic/angular";
import { Observable } from "rxjs";
import { Plugins } from "@capacitor/core";

import { AuthService, AuthResponseData } from "../auth/auth.service";
import { DeviceService } from "../services/device.service";

const { Device } = Plugins;

@Component({
  selector: "app-auth",
  templateUrl: "./auth.page.html",
  styleUrls: ["./auth.page.scss"],
})
export class AuthPage implements OnInit {
  isLoading = false;
  isLogin = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private _DeviceService:DeviceService,
  ) {}

  ngOnInit() {}

  async authenticate(email: string, password: string) {
    const info = await Device.getInfo();
    this.isLoading = true;
    this.loadingCtrl
      .create({ keyboardClose: true, message: "Logging in..." })
      .then((loadingEl) => {
        loadingEl.present();
        let authObs: Observable<AuthResponseData>;
        authObs = this.authService.login(email, password);

        authObs.subscribe(
          (resData) => {
            console.log(resData);
            this.isLoading = false;
            loadingEl.dismiss();
            //this.router.navigateByUrl("/home");
           //alert("Your platform is: " + info.uuid)
            this.deviceCheck(info.uuid);
          },
          (errRes) => {
            loadingEl.dismiss();
            const code = errRes.error.error.message;
            let message = "Could not sign you up, please try again.";
            if (code === "EMAIL_EXISTS") {
              message = "This email address exists already!";
            } else if (code === "EMAIL_NOT_FOUND") {
              message = "E-Mail address could not be found.";
            } else if (code === "INVALID_PASSWORD") {
              message = "This password is not correct.";
            }
            this.showAlert(message);
          }
        );
      });
  }

  private deviceCheck(uuid: any) {

    Plugins.Storage.get({ key: "device_id"}).then((uuid)=>{
      if (uuid !== null && uuid !== undefined) {
        this._DeviceService.iSDeviceRegistered(uuid.value).subscribe((device) => {
          // alert(device);
          if (device !== null && device !== undefined && device.length > 0) {
            this.router.navigateByUrl("/home");
          }
          else {
            this.router.navigateByUrl("/phone-signin");
          }
        });
      }
      else {
        this.router.navigateByUrl("/phone-signin");
      }
    },err=>{
      console.log(err);
    })
 
  }
  // private deviceCheck(uuid: any) {
  //   if (uuid !== null && uuid !== undefined) {
  //     this._DeviceService.iSDeviceRegistered(uuid).subscribe((device) => {
  //       alert(device);
  //       if (device !== null && device !== undefined && device.length > 0) {
  //         this.router.navigateByUrl("/home");
  //       }
  //       else {
  //         this.router.navigateByUrl("/phone-signin");
  //       }
  //     });
  //   }
  //   else {
  //     this.router.navigateByUrl("/phone-signin");
  //   }
  // }

  onSwitchAuthMode() {
    this.router.navigateByUrl("/setup");
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;

    this.authenticate(email, password);
  }

  private showAlert(message: string) {
    this.alertCtrl
      .create({
        header: "Authentication failed",
        message: message,
        buttons: ["Okay"],
      })
      .then((alertEl) => alertEl.present());
  }
}
