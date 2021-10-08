import { Component, NgZone, OnInit, Renderer2 } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import {
  Platform,
  LoadingController,
  ActionSheetController,
} from "@ionic/angular";
import { UserService } from "../auth/user.service";
import { DriverRegService } from "../driver-registration/driver-reg.service";

@Component({
  selector: "app-user",
  templateUrl: "./user.page.html",
  styleUrls: ["./user.page.scss"],
})
export class UserPage implements OnInit {
  loading: Promise<HTMLIonLoadingElement>;
  userdatas: any[];
  automaticClose: boolean = true;
  roleModel: string;
  selectedIndex: any;
  drivers: any;
  driver_list: any;

  constructor(
    private userService: UserService,
    private renderer: Renderer2,
    private platform: Platform,
    public zone: NgZone,
    public loadingCtrl: LoadingController,
    private activatedRoute: ActivatedRoute,
    public actionSheetController: ActionSheetController,
    private driverSvr: DriverRegService
  ) {
    this.loading = this.loadingCtrl.create();
    this.roleModel = "user";
  }

  ngOnInit() {
    this.userService.usersCollectionFetch().subscribe(
      (ride) => {
        console.log(ride);
        this.userdatas = ride.map(
          (item) => (item = { ...item, open: false, role: "user" })
        );
        console.log("USER DATA::", this.userdatas);
        this.userdatas.forEach((element) => {
          console.log(element.roles);
          if (element.roles !== undefined) {
            element.role = this.getRole(element.roles);
          }
        });

        if (this.userdatas.length > 0) {
          this.zone.run(() => {
            this.userdatas[0].open = true;
          });
        }
        console.log(this.userdatas);
      },
      (err) => {
        console.log(err);
      }
    );

    this.getAllDrivers();
  }

  getAllDrivers() {
    this.driverSvr.getDrivers().subscribe(
      (res) => {
        console.log("RESPONSE FROM DRIVERS" + JSON.stringify(res));
        this.driver_list = res;
        this.drivers = res.map((item) => (item = { ...item, open: false }));
        console.log("SHOWIN ALL DRIVERS!! " + JSON.stringify(this.drivers));

        if (this.drivers.length > 0) {
          this.zone.run(() => {
            this.drivers[0].open = true;
          });
        }
        // console.log("DRIVER ID" + this.drivers[0].uid);
        // console.log("DRIVER NAME" + this.drivers[0].driverName);
        // console.log("LICENSE NUM" + this.drivers[0].licencesPlate);
        // console.log("CAR TYPE" + this.drivers[0].carType);
        // console.log("CAR YEAR" + this.drivers[0].carYear);
        // console.log("CAR PHOTO" + this.drivers[0].carPhotopath);
        // console.log("DRIVER IMAGE" + this.drivers[0].profileImgUrl);
        // console.log("CAR COLOR" + this.drivers[0].carColor);
        // console.log("OPEN" + this.drivers[0].open);
      },
      (err) => {
        console.log(err);
      }
    );
  }
  getRole(roles: any) {
    if (roles.admin) {
      return "admin";
    }
    return "user";
  }

  toggleSelection(index) {
    this.selectedIndex = index;
    this.userdatas[index].open = !this.userdatas[index].open;
    if (this.automaticClose && this.userdatas[index].open) {
      this.userdatas
        .filter((item, itemIndex) => itemIndex != index)
        .map((item) => (item.open = false));
    }
  }

  toggleSelectionDrivers(index) {
    this.selectedIndex = index;
    this.drivers[index].open = !this.drivers[index].open;
    if (this.drivers[index].open) {
      this.drivers
        .filter((item, itemIndex) => itemIndex != index)
        .map((item) => (item.open = false));
    }
  }

  onSelectChange(event, item) {
    console.log(event.detail.value);
    //console.log(this.roleModel);
    console.log(item);
    let role: string;
    if (event.detail.value === "admin") {
      role = "admin";
      item.roles.admin = true;
    } else {
      item.roles.admin = false;
      role = "user";
    }
    this.loadingCtrl
      .create({
        message: "Updating...",
      })
      .then((loadingEl) => {
        loadingEl.present();
        this.userService.updateUserRole(item).then(
          (res) => {
            console.log(res);
            console.log("USER DATA INDEX", this.userdatas[this.selectedIndex]);
            this.userdatas[this.selectedIndex].role = role;
            loadingEl.dismiss();
          },
          (err) => {
            console.log(err);
            loadingEl.dismiss();
          }
        );
      });
  }

  onSelectChangeDriver(event, item) {
    console.log(event.detail.value);
    console.log(item);
    let status: string;
    if (event.detail.value === "verify") {
      status = "verified";
      console.log("STATUS SELECT::" + status);
      // item.roles.admin = true;
    } else {
      // item.roles.admin = false;
      status = "unverified";
      console.log("STATUS SELECT::" + status);
    }
    this.loadingCtrl
      .create({
        message: "Updating Status...",
      })
      .then((loadingEl) => {
        loadingEl.present();
        this.driverSvr.updateDriverStatus(item, status).then(
          (res) => {
            console.log(JSON.stringify(res));
            console.log("drivers DATA INDEX", this.drivers[this.selectedIndex]);
            this.drivers[this.selectedIndex].status = status;
            loadingEl.dismiss();
          },
          (err) => {
            console.log(err);
            loadingEl.dismiss();
          }
        );
      });
  }

  delete(id) {
    this.driverSvr.deleteDriver(id).then(
      (res) => {
        console.log(JSON.stringify(res));
      },
      (err) => {
        console.log(err);
      }
    );
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: "Albums",
      cssClass: "my-custom-class",
      buttons: [
        {
          text: "Delete",
          role: "destructive",
          icon: "trash",
          handler: () => {
            console.log("Delete clicked");
          },
        },
        {
          text: "Share",
          icon: "share",
          handler: () => {
            console.log("Share clicked");
          },
        },
        {
          text: "Play (open modal)",
          icon: "caret-forward-circle",
          handler: () => {
            console.log("Play clicked");
          },
        },
        {
          text: "Favorite",
          icon: "heart",
          handler: () => {
            console.log("Favorite clicked");
          },
        },
        {
          text: "Cancel",
          icon: "close",
          role: "cancel",
          handler: () => {
            console.log("Cancel clicked");
          },
        },
      ],
    });
    await actionSheet.present();
  }
}
