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
// import * as SlidingMarker from "marker-animate-unobtrusive";
import * as SlidingMarker from "../../../node_modules/marker-animate-unobtrusive";
import { AuthService } from "../auth/auth.service";

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

  autocomplete: { input: string };
  autocompleteItems: any[];
  GoogleAutocomplete: any;
  placeid: any;
  userId: string;
  rider_details;
  endAddress: any;
  startAddress: any;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    public fb: FormBuilder,
    private authService: AuthService,
    public zone: NgZone,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.loadMap();
    //AUTOCOMPLETE THINGS
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.autocomplete = { input: "" };
    this.autocompleteItems = [];

    this.directionForm = this.fb.group({
      destination: ["", Validators.required],
    });
  }

  ngOnInit() {
    this.loadMap();
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
          }
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  ionViewWillEnter() {
    this.loadMap();
    // this.mapData();
  }

  loadMap() {
    Geolocation.getCurrentPosition().then(
      (resp) => {
        let lat = resp.coords.latitude;
        let lng = resp.coords.longitude;

        this.current_location = new google.maps.LatLng(lat, lng);

        let mapOptions = {
          center: this.current_location,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          disableDefaultUI: true,
          // zoomControl: true,
        };

        this.map = new google.maps.Map(
          this.mapElement.nativeElement,
          mapOptions
        );

        //PUT MARKER ON MAP
        this.carMarker = new SlidingMarker({
          map: this.map,
          position: this.current_location,
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

    this.locations.subscribe((location) => {
      // console.log("new Locations updating ", location[0].lat);
      this.updateMap(location);
    });
  }

  updateMap(locations) {
    console.log("----INSIDE UPDATE MAP----", locations);
    if (locations.length > 0) {
      for (let loc of locations) {
        let latlng = new google.maps.LatLng(loc.lat, loc.lng);
        console.log("MARKERS ARRAY LENTHG", this.markersArray.length);

        if (this.markersArray.length >= 1) {
          console.log("----ARRAY > 1----");
          this.firstmarkersArray.map((marker) => marker.setMap(null));
          this.carMarker.setPosition(latlng);
          this.carMarker.setDuration(2000);
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
            duration: 2000,
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

        // let end = new google.maps.LatLng(
        //   position.coords.latitude,
        //   position.coords.longitude
        // );

        // this.calculateAndDisplayRoute(this.endAddress);
      }
    });
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

  // startNavigating() {
  //   let directionsService = new google.maps.DirectionsService();
  //   let directionsDisplay = new google.maps.DirectionsRenderer();

  //   directionsDisplay.setMap(this.map);
  //   directionsDisplay.setPanel(this.directionsPanel.nativeElement);

  //   directionsService.route(
  //     {
  //       origin: "adelaide",
  //       destination: "adelaide oval",
  //       travelMode: google.maps.TravelMode["DRIVING"],
  //     },
  //     (res, status) => {
  //       if (status == google.maps.DirectionsStatus.OK) {
  //         directionsDisplay.setDirections(res);
  //       } else {
  //         console.warn(status);
  //       }
  //     }
  //   );
  // }

  calculateAndDisplayRoute(destination) {
    console.log("START::", this.current_location);
    console.log("END:::", destination);
    this.isNotClicked = false;

    this.directionsService.route(
      {
        origin: this.current_location,
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
    this.autocompleteItems = [];
    this.autocomplete.input = "";
  }

  toggle() {
    this.isNotClicked = false;
  }

  //AUTOCOMPLETE
  //AUTOCOMPLETE, SIMPLY LOAD THE PLACE USING GOOGLE PREDICTIONS AND RETURNING THE ARRAY.
  UpdateSearchResults() {
    var options = {
      types: ["(cities)"],
      componentRestrictions: { country: "gh" },
    };

    console.log("INUT FROM AUTONOCOM", this.autocomplete.input);
    if (this.autocomplete.input == "") {
      this.autocompleteItems = [];
      return;
    }
    this.GoogleAutocomplete.getPlacePredictions(
      { input: this.autocomplete.input, options },
      (predictions, status) => {
        this.autocompleteItems = [];
        this.zone.run(() => {
          predictions.forEach((prediction) => {
            this.autocompleteItems.push(prediction);
          });
        });
      }
    );
  }

  //wE CALL THIS FROM EACH ITEM.
  SelectSearchResult(item) {
    ///WE CAN CONFIGURE MORE COMPLEX FUNCTIONS SUCH AS UPLOAD DATA TO FIRESTORE OR LINK IT TO SOMETHING
    // alert(JSON.stringify(item));
    this.placeid = item.place_id;
    let destination = item.description;
    console.log("Destinaton Location", destination);
    this.autocompleteItems = [];
    this.autocomplete.input = "";
  }

  //lET'S BE CLEAN! THIS WILL JUST CLEAN THE LIST WHEN WE CLOSE THE SEARCH BAR.
  ClearAutocomplete() {
    this.autocompleteItems = [];
    this.autocomplete.input = "";
  }
}
