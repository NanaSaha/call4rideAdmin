import { NavigationExtras, Router } from "@angular/router";
import { AuthService } from "./auth/auth.service";
import {
  Component,
  OnInit,
  OnDestroy,
  Host,
  HostListener,
} from "@angular/core";

import { Platform } from "@ionic/angular";
import {
  Plugins,
  Capacitor,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed,
} from "@capacitor/core";

import { Subscription } from "rxjs";
import { UserService } from "./auth/user.service";
import { UserRecord } from "./auth/userrecord.model";
import { AngularFireMessaging } from "@angular/fire/messaging";
import { MessagingService } from "./services/messaging.service";
import { ScreensizeService } from "./services/screensize.service";
import { StoreService } from "./services/store.service";
import { AndroidPermissions } from "@ionic-native/android-permissions/ngx";
import { Uid } from "@ionic-native/uid/ngx";
import { UniqueDeviceID } from "@ionic-native/unique-device-id/ngx";
import { DeviceService } from "./services/device.service";
import { DriverRegService } from "./driver-registration/driver-reg.service";

const { PushNotifications, Device } = Plugins;

// import { Plugins } from '@capacitor/core';

// const {  } = Plugins;

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
})
export class AppComponent implements OnInit, OnDestroy {
  private authSub: Subscription;
  private previousAuthState = false;
  user: UserRecord;
  fullName: string;
  selectedImage: string;
  defailtImage: string = "assets/image/profile.png";
  message;
  isDesktop;
  adminMenuAllowed: boolean;
  isDriver: boolean = false;
  UniqueDeviceID: string;
  userId: string;

  constructor(
    private platform: Platform,
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
    private screensizeService: ScreensizeService,
    private _StoreService: StoreService,
    private _DeviceService: DeviceService,
    private driverSvr: DriverRegService
  ) {
    this.initializeApp();

    this.screensizeService.isDesktopView().subscribe((isDesktop) => {
      console.log("Is destop changed:", isDesktop);
      this.isDesktop = isDesktop;
    });
  }

  async initializeApp() {
    this.platform.ready().then(() => {
      if (Capacitor.isPluginAvailable("SplashScreen")) {
        Plugins.SplashScreen.hide();
      }

      this.screensizeService.onResize(this.platform.width());
      // if (this.platform.is('cordova')) {
      //  this.getPermission();
      //  this.getUniqueDeviceID();
      // }
    });

    this.platform.resume.subscribe(async () => {
      this.authService.refreshToken2().subscribe(
        (result) => {
          this.authenticateUser();
        },
        (err) => {
          console.log(err);
        }
      );
    });

    // console.log('Device UUID is: ' + this.device.uuid);
  }

  async ngOnInit() {
    this.selectedImage = this.defailtImage;

    // Initialize the CapacitorDataStorageSQLite plugin
    await this._StoreService.init();

    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    PushNotifications.requestPermission().then((result) => {
      if (result.granted) {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      } else {
        // Show some error
      }
    });

    // On success, we should be able to receive notifications
    PushNotifications.addListener(
      "registration",
      (token: PushNotificationToken) => {
        this.storeAppToken(token.value);

        // alert('Push registration success, token: ' + token.value);
      }
    );

    // Some issue with our setup and push will not work
    PushNotifications.addListener("registrationError", (error: any) => {
      alert("Error on registration: " + JSON.stringify(error));
    });

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener(
      "pushNotificationReceived",
      (notification: PushNotification) => {
        // const message = JSON.parse(token.value);
        if (notification !== null && notification !== undefined) {
          let navigationExtras: NavigationExtras = {
            queryParams: {
              message: JSON.stringify(notification),
            },
          };
          this.router.navigate(["driver"], navigationExtras);
        }
        // alert('Push received: ' + JSON.stringify(notification));
      }
    );

    // Method called when tapping on a notification
    PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (notification: PushNotificationActionPerformed) => {
        alert("Push action performed: " + JSON.stringify(notification));
      }
    );

    this.authenticateUser();
  }

  private authenticateUser() {
    this.authSub = this.authService.userIsAuthenticated.subscribe((isAuth) => {
      if (isAuth) {
        this.deviceCheck();
      } else {
        this.router.navigateByUrl("/auth");
      }
    });
  }

  private deviceCheck() {
    Plugins.Storage.get({ key: "device_id" }).then(
      (uuid) => {
        if (uuid !== null && uuid !== undefined) {
          this._DeviceService
            .iSDeviceRegistered(uuid.value)
            .subscribe((device) => {
              // alert(device);
              if (
                device !== null &&
                device !== undefined &&
                device.length > 0
              ) {
                this.router.navigateByUrl("/home");
              } else {
                this.router.navigateByUrl("/phone-signin");
              }
            });
        } else {
          this.router.navigateByUrl("/phone-signin");
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  menuOpened() {
    this.userService.getUserByUserId().subscribe((userdatas) => {
      if (userdatas.length > 0) {
        let userdata = userdatas[0];
        this.user = userdata;
        this.fullName = userdata.firstName + " " + userdata.lastName;
        console.log("USERDATAS:::", userdatas);
        console.log("USERDATAS ID:::", userdata.userId);
        if (userdata.userId) {
          this.driverSvr.getDriverById(userdata.userId).subscribe((drivers) => {
            console.log("DRIVER DETAILS:::", drivers);
            if (drivers.length > 0) {
              console.log("DRIVER DETAILS UID:::", drivers[0].uid);
              console.log("USER ID:::", userdata.userId);
              if (drivers[0].uid == userdata.userId) {
                console.log("USER IS A DRIVER");

                this.isDriver = true;
                console.log("this.isDriver", this.isDriver);
              } else {
                console.log("NOT DRIVER");
              }
            } else {
              console.log("DRIVER DETAILS NOT AVAILABLE");
            }
          });
        } else {
          console.log("USERDATAS ID NOT READY YET:::", userdata.userId);
        }

        if (userdata.imageUrl) {
          this.selectedImage = userdata.imageUrl;
        } else {
          this.selectedImage = this.defailtImage;
        }
        if (userdata.roles.admin) {
          this.adminMenuAllowed = true;
        } else {
          this.adminMenuAllowed = false;
        }
        console.log(userdata);
      }
    });
  }
  menuClosed() {}
  onLogout() {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }

  async storeAppToken(appToken: string): Promise<void> {
    if (this._StoreService.isService) {
      // open the data storage
      let result: any = await this._StoreService.openStore();
      console.log("storage retCreate result", result);
      if (result) {
        await this._StoreService.clear();
        // store data in the first store
        await this._StoreService.setItem("apptoken", appToken);
        result = await this._StoreService.getItem("session");
        console.log("result ", result);
      }
    } else {
      console.log("CapacitorDataStorageSqlite Service is not initialized");
    }
  }

  async storeDeviceInfo(deviceId: any): Promise<void> {
    if (this._StoreService.isService) {
      // open the data storage
      let result: any = await this._StoreService.openStore();
      console.log("storage retCreate result", result);
      if (result) {
        await this._StoreService.clear();
        // store data in the first store
        await this._StoreService.setItem("deviceId", deviceId);
        result = await this._StoreService.getItem("session");
        console.log("result ", result);
      }
    } else {
      console.log("CapacitorDataStorageSqlite Service is not initialized");
    }
  }

  @HostListener("window:resize", ["$event"])
  private onResize(event) {
    this.screensizeService.onResize(event.target.innerWidth);
  }
}
