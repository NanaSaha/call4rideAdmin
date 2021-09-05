import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  NgZone,
} from "@angular/core";
import { Platform } from "@ionic/angular";
import { Plugins } from "@capacitor/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { Observable } from "rxjs";
import { interval, Subscription } from "rxjs";
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from "@angular/fire/firestore";
import { map } from "rxjs/operators";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import * as SlidingMarker from "../../../node_modules/marker-animate-unobtrusive";
import { AuthService } from "../auth/auth.service";
import { DriverRegService } from "../driver-registration/driver-reg.service";

const { Geolocation } = Plugins;

@Component({
  selector: "app-watch-driver-navigation",
  templateUrl: "./watch-driver-navigation.page.html",
  styleUrls: ["./watch-driver-navigation.page.scss"],
})
export class WatchDriverNavigationPage implements OnInit {
  locations: Observable<any>;
  drivers: Observable<any>;
  locationsCollection: AngularFirestoreCollection<any>;
  driverCollection: AngularFirestoreCollection<any>;

  @ViewChild("map") mapElement: ElementRef;
  @ViewChild("directionsPanel") directionsPanel: ElementRef;
  directionsService = new google.maps.DirectionsService();
  directionsDisplay = new google.maps.DirectionsRenderer();

  map: any;
  markers = [];
  markersArray = [];
  firstmarkersArray = [];
  start = "chicago, il";
  end = "chicago, il";
  isTracking = false;
  isNotClicked = true;
  watch: any;
  carMarker;
  user_location: any;
  directionForm: FormGroup;
  userId: string;
  showDrivers;
  driver_id;

  subscription: Subscription;
  intervalId: number;

  constructor(
    private driverSvr: DriverRegService,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    public fb: FormBuilder,
    private authService: AuthService,
    public zone: NgZone,
    private platform: Platform
  ) {
    // this.loadMap();

    // This is METHOD 1
    const source = interval(10000);
    this.subscription = source.subscribe((val) => this.mapData());

    console.log("RUNNING INTERVALS::", this.subscription);
  }

  ionViewDidLoad() {
    // this.loadMap();
    // this.platform.ready().then(() => {
    //   // your init service
    //   this.loadMap();
    // });
  }

  ngOnInit() {
    this.authService.userId.subscribe((userId) => {
      if (!userId) {
        throw new Error("User not found!");
      }
      this.userId = userId;
      console.log("USER ID IS::: ", this.userId);
      this.driverSvr
        .getDriversAssginedToRider(this.userId)
        .subscribe((showDrivers) => {
          console.log("ALL DRIVER:::", showDrivers);
          this.driver_id = showDrivers[0].driver_id;
          console.log("LAST DRIVER:::", this.driver_id);
          this.loadMap();
          this.mapData();

          this.showDrivers = showDrivers.map(
            (item) =>
              (item = {
                item,
              })
          );
        });
    });
  }

  loadMap() {
    console.log("RUNNNG LOAD MAP");
    Geolocation.getCurrentPosition().then(
      (resp) => {
        console.log("Respose from Current Position " + JSON.stringify(resp));
        let lat = resp.coords.latitude;
        let lng = resp.coords.longitude;

        this.user_location = new google.maps.LatLng(lat, lng);

        let mapOptions = {
          center: this.user_location,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          disableDefaultUI: true,
        };

        this.map = new google.maps.Map(
          this.mapElement.nativeElement,
          mapOptions
        );

        console.log("MAP MAP MAP MAP " + this.map);

        //PUT MARKER ON MAP
        this.carMarker = new SlidingMarker({
          map: this.map,
          position: this.user_location,
          icon: "/assets/image/person.png",
          duration: 1000,
          easing: "easeOutExpo",
        });

        this.firstmarkersArray.push(this.carMarker);
      },
      (err) => {
        console.log("Geolocation err: " + err);
      }
    );
  }

  mapData() {
    console.log("----RUNNING MAP DATA----");

    this.locationsCollection = this.afs.collection("Locations", (ref) =>
      ref.where("userId", "==", this.driver_id)
    );

    //Loading Data from Firebase

    this.locations = this.locationsCollection.snapshotChanges().pipe(
      map((actions) =>
        actions.map((a) => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      )
    );

    // Update MAp

    this.locations.subscribe((location) => {
      console.log("----INSIDE location MAP----", location);
      this.updateMap(location);
    });
  }

  updateMap(locations) {
    console.log("----INSIDE UPDATE MAP----", locations[0]);
    if (locations.length > 0) {
      // let test_lat = locations[locations.length - 1].lat;
      // let test_lng = locations[locations.length - 1].lng;
      let test_lat = locations[0].lat;
      let test_lng = locations[0].lng;
      console.log("LATT AND LONG:::", test_lat, test_lng);
      let driver_location = new google.maps.LatLng(test_lat, test_lng);
      console.log("MARKERS ARRAY LENGHT:::", this.markersArray.length);
      //this.calculateAndDisplayRoute(driver_location);

      if (this.markersArray.length >= 1) {
        console.log("----ARRAY is > 1----");
        console.log("----MAP----", this.map);

        this.carMarker = new SlidingMarker({
          map: this.map,
          position: driver_location,
          icon: "/assets/image/car.png",
          duration: 2000,
          easing: "easeOutExpo",
        });

        this.carMarker.setPosition(driver_location);
        this.carMarker.setDuration(2000);
        this.carMarker.setEasing("linear");
        this.map.setCenter(driver_location);
      } else if (this.markersArray.length < 1) {
        console.log("----CREATING NEW MARKER----", this.map);
        // this.markersArray.map((marker) => marker.setMap(null));

        this.carMarker = new SlidingMarker({
          map: this.map,
          position: driver_location,
          icon: "/assets/image/car.png",
          duration: 2000,
          easing: "easeOutExpo",
        });

        // this.map.setCenter(driver_location);
        console.log("PUSHING NEW MARKER--->>", this.carMarker);
        this.markersArray.push(this.carMarker);
      } else {
        console.log("ARRAY IS NOT IN RANGE");
      }
    }
  }

  startTracking() {
    this.isTracking = true;

    this.watch = Geolocation.watchPosition({}, (position, err) => {
      if (position) {
        console.log("LOCATION CHANGED");
        this.mapData();
        this.map.setZoom(15);
      }
    });
  }

  stopTracking() {
    Geolocation.clearWatch({ id: this.watch }).then(() => {
      this.isTracking = false;
    });
  }

  // calculateAndDisplayRoute(destination) {
  //   console.log("START::", this.user_location);
  //   console.log("END:::", destination);
  //   this.isNotClicked = false;

  //   this.directionsService.route(
  //     {
  //       origin: this.user_location,
  //       destination: destination,
  //       travelMode: google.maps.TravelMode["DRIVING"],
  //     },
  //     (response, status) => {
  //       if (status === "OK") {
  //         this.directionsDisplay.setDirections(response);

  //         console.log("DIRECTIONS RESPONSE-----", response);
  //       } else {
  //         window.alert("Directions request failed due to " + status);
  //       }
  //     }
  //   );
  //   this.directionsDisplay.setMap(this.map);
  //   // this.map.setZoom(10);
  //   //preserveViewport: true;
  //   //this.map.setCenter(this.current_location);
  // }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  //   this.userData = this.db.collection("users", ref => ref.where('email', '==', "xyz@gmail.com").valueChanges();

  // this.userData.subscribe(users => {

  //   this.user = users[0];

  //   console.log("this is the user:" + this.user);

  // });
}
