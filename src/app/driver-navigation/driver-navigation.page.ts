import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  NgZone,
} from "@angular/core";
import { ActivatedRoute, NavigationExtras, Router } from "@angular/router";
import { Plugins } from "@capacitor/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { Observable } from "rxjs";
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from "@angular/fire/firestore";
import { map } from "rxjs/operators";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
const { Geolocation } = Plugins;
import {
  NativeGeocoder,
  NativeGeocoderResult,
  NativeGeocoderOptions,
} from "@ionic-native/native-geocoder/ngx";
// import * as SlidingMarker from "marker-animate-unobtrusive";
import * as SlidingMarker from "../../../node_modules/marker-animate-unobtrusive";
import { AuthService } from "../auth/auth.service";
import { Platform } from "@ionic/angular";

@Component({
  selector: "app-driver-navigation",
  templateUrl: "./driver-navigation.page.html",
  styleUrls: ["./driver-navigation.page.scss"],
})
export class DriverNavigationPage implements OnInit {
  locations: Observable<any>;
  locationsCollection: AngularFirestoreCollection<any>;

  @ViewChild("map") mapElement: ElementRef;
  @ViewChild("directionsPanel") directionsPanel: ElementRef;
  directionsService = new google.maps.DirectionsService();
  directionsDisplay = new google.maps.DirectionsRenderer();
  // directionsDisplay = new google.maps.DirectionsRenderer({
  //   preserveViewport: true, //Added to preserve viewport
  // polylineOptions: {
  //   strokeColor: "red";
  // };
  // });
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
  current_location: any;
  directionForm: FormGroup;
  geocoder: any;

  autocomplete: { input: string };
  autocompleteItems: any[];
  GoogleAutocomplete: any;
  placeid: any;
  userId: string;
  rider_details;
  endAddress: any;
  startAddress: any;
  lat;
  lng;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    public fb: FormBuilder,
    private authService: AuthService,
    public zone: NgZone,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private nativeGeocoder: NativeGeocoder,
    private platform: Platform
  ) {}
  ngOnInit() {
    // this.loadMap();
    this.mapData();
    this.authService.userId.subscribe((userId) => {
      if (!userId) {
        throw new Error("User not found!");
      }
      this.userId = userId;
      console.log("USER ID IS::: ", this.userId);
    });

    this.activatedRoute.queryParams.subscribe(
      (params) => {
        if (params && params.message) {
          this.rider_details = JSON.parse(params.message);
          console.log(params.message);
          if (this.rider_details != undefined && this.rider_details != null) {
            console.log("RIDER DETAILS:::: ", this.rider_details);
            this.endAddress = this.rider_details.endAddress;
            this.startAddress = this.rider_details.startAddress;
            console.log("START ADDRESS:::: ", this.startAddress);
            console.log("END ADDRESS:::: ", this.endAddress);

            this.forwardGeocode(this.endAddress);
          }
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  forwardGeocode(address) {
    if (this.platform.is("cordova")) {
      console.log("PLatform is cordova");
      let options: NativeGeocoderOptions = {
        useLocale: true,
        maxResults: 5,
      };
      this.nativeGeocoder
        .forwardGeocode(address, options)
        .then((result: NativeGeocoderResult[]) => {
          this.zone.run(() => {
            this.lat = result[0].latitude;
            this.lng = result[0].longitude;
          });
        })
        .catch((error: any) => console.log(error));
      console.log("LAT IS", this.lat + " and" + "LNG IS", this.lng);
    } else {
      console.log("PLatform is browser");
      let geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: address }, (results, status) => {
        if (status == google.maps.GeocoderStatus.OK) {
          this.zone.run(() => {
            this.lat = results[0].geometry.location.lat();
            this.lng = results[0].geometry.location.lng();
            console.log("results IS", results);
            console.log("LAT IS", this.lat + " and" + "LNG IS", this.lng);
          });
        } else {
          alert("Error - " + results + " & Status - " + status);
        }
      });
    }
  }

  ionViewWillEnter() {
    this.loadMap();
    this.mapData();
    this.directionsDisplay.setMap(this.map);
  }

  loadMap() {
    let latlng = new google.maps.LatLng(51.9036442, 7.6673267);

    let mapOptions = {
      center: latlng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    //PUT MARKER ON MAP
    this.carMarker = new SlidingMarker({
      map: this.map,
      position: latlng,
      icon: "/assets/image/person.png",
      duration: 1000,
      easing: "easeOutExpo",
    });

    this.firstmarkersArray.push(this.carMarker);
  }

  //   loadMap() {
  //     Geolocation.getCurrentPosition().then(
  //       (resp) => {
  //         let lat = resp.coords.latitude;
  //         let lng = resp.coords.longitude;

  //         this.current_location = new google.maps.LatLng(lat, lng);

  //         let mapOptions = {
  //           center: this.current_location,
  //           zoom: 15,
  //           mapTypeId: google.maps.MapTypeId.ROADMAP,
  //           disableDefaultUI: true,
  //           // zoomControl: true,
  //         };

  //         console.log("ABOUT TO CREAT MAP--->>");
  //         this.map = new google.maps.Map(
  //           this.mapElement.nativeElement,
  //           mapOptions
  //         );

  //         //PUT MARKER ON MAP
  //         this.carMarker = new SlidingMarker({
  //           map: this.map,
  //           position: this.current_location,
  //           icon: "/assets/image/person.png",
  //           duration: 1000,
  //           easing: "easeOutExpo",
  //         });

  //         this.firstmarkersArray.push(this.carMarker);
  //       },
  //       (err) => {
  //         console.log("Geolocation err: " + err);
  //       }
  //     );
  //   }

  mapData() {
    this.locationsCollection = this.afs.collection(`Locations`, (ref) =>
      ref.orderBy("timestamp")
    );

    //Loading Data from Firebase
    console.log("----LOADING FROM FIREBASE IN MAPDATA FUNCTION --");
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

    this.locations.subscribe((locations) => {
      console.log("new Locations updating ", locations);
      this.updateMap(locations);
    });
  }

  updateMap(locations) {
    console.log("----INSIDE UPDATE MAP----");
    if (locations.length > 0) {
      for (let loc of locations) {
        let latlng = new google.maps.LatLng(loc.lat, loc.lng);
        console.log("MARKERS ARRAY LENTHG", this.markersArray.length);

        if (this.markersArray.length >= 1) {
          console.log("----ARRAY > 1----");
          this.firstmarkersArray.map((marker) => marker.setMap(null));
          this.carMarker.setPosition(latlng);
          this.carMarker.setDuration(5000);
          this.carMarker.setEasing("linear");
          this.map.setCenter(latlng);
        } else if (this.markersArray.length < 1) {
          console.log("----CREATING NEW MARKER----");
          this.markersArray.map((marker) => marker.setMap(null));
          this.markersArray = [];
          this.carMarker = new SlidingMarker({
            map: this.map,
            position: latlng,
            icon: "/assets/image/car.png",
            duration: 5000,
            easing: "easeOutExpo",
          });
          this.markersArray.push(this.carMarker);
        } else {
          console.log("ARRAY IS NOT IN RANGE");
        }
      }
    }
  }

  startTracking() {
    this.isTracking = true;

    // let start = new google.maps.LatLng(51.9036442, 7.6673267);
    this.watch = Geolocation.watchPosition({}, (position, err) => {
      if (position) {
        this.addNewLocation(
          position.coords.latitude,
          position.coords.longitude,
          position.timestamp,
          this.userId
        );

        this.map.setZoom(15);

        this.calculateAndDisplayRoute(this.endAddress);
      }
    });
  }

  openMap() {
    this.isTracking = true;
    this.watch = Geolocation.watchPosition({}, (position, err) => {
      if (position) {
        this.addNewLocation(
          position.coords.latitude,
          position.coords.longitude,
          position.timestamp,
          this.userId
        );
      }
    });
    console.log("LAT IS", this.lat + " and" + "LNG IS", this.lng);
    let destination = this.lat + "," + this.lng;
    window.open(
      "https://www.google.com/maps/search/?api=1&query=" + destination
    );
  }

  stopTracking() {
    Geolocation.clearWatch({ id: this.watch }).then(() => {
      this.isTracking = false;
    });
  }

  addNewLocation(lat, lng, timestamp, userId) {
    this.locationsCollection.add({
      lat,
      lng,
      timestamp,
      userId,
    });

    // let position = new google.maps.LatLng(lat, lng);
    // this.carMarker.setPosition(position);

    let position = new google.maps.LatLng(lat, lng);
    this.map.setCenter(position);
    // this.map.setZoom(15);
  }

  deleteLoc(pos) {
    this.locationsCollection.doc(pos.id).delete();
  }

  calculateAndDisplayRoute(destination) {
    console.log("START::", this.current_location);
    console.log("END:::", destination);
    this.isNotClicked = false;

    this.directionsService.route(
      {
        origin: new google.maps.LatLng(51.9036442, 7.6673267),
        destination: destination,
        travelMode: google.maps.TravelMode["DRIVING"],
      },
      (response, status) => {
        if (status === "OK") {
          this.directionsDisplay.setDirections(response);

          console.log("DIRECTIONS RESPONSE-----", response);
        } else {
          window.alert("Directions request failed due to " + status);
        }
      }
    );
    this.directionsDisplay.setMap(this.map);
    // this.map.setZoom(10);
    //preserveViewport: true;
    //this.map.setCenter(this.current_location);
    // this.autocompleteItems = [];
    // this.autocomplete.input = "";
  }
}
