import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Plugins } from "@capacitor/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { Observable } from "rxjs";
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from "@angular/fire/firestore";
import { map } from "rxjs/operators";
const { Geolocation } = Plugins;
// import * as SlidingMarker from "marker-animate-unobtrusive";
import * as SlidingMarker from "../../../node_modules/marker-animate-unobtrusive";

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
  map: any;
  markers = [];
  markersArray = [];
  start = "chicago, il";
  end = "chicago, il";
  isTracking = false;
  watch: any;
  carMarker;

  //SIMULATONS
  myLat: 5.7186191;
  myLng: -0.024065399999999997;
  public myRouteIndex: number;
  public myRoute: any;

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore) {}

  ngOnInit() {
    this.mapData();
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

    this.locations.subscribe((locations) => {
      console.log("new Locations updating ", locations);
      this.updateMap(locations);
    });
  }

  updateMap(locations) {
    console.log("----INSIDE UPDATE MAP----");

    for (let loc of locations) {
      let latlng = new google.maps.LatLng(loc.lat, loc.lng);
      console.log("MARKERS ARRAY LENTHG", this.markersArray.length);

      if (this.markersArray.length >= 1) {
        console.log("----ARRAY > 1----");
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

  startTracking() {
    this.isTracking = true;

    // let start = new google.maps.LatLng(51.9036442, 7.6673267);
    this.watch = Geolocation.watchPosition({}, (position, err) => {
      if (position) {
        this.addNewLocation(
          position.coords.latitude,
          position.coords.longitude,
          position.timestamp
        );

        // var locations = {
        //   lat: position.coords.latitude,
        //   lng: position.coords.longitude,
        // };
        // this.updateMap(Array.of(locations));
        // console.log("CALLING TRACKKINNg ----------------");
        // this.mapData();
        // let end = new google.maps.LatLng(
        //   position.coords.latitude,
        //   position.coords.longitude
        // );
        // this.calculateAndDisplayRoute(start, end);
        // console.log(
        //   "RUNNIN CALCULATE AND DISPLAY",
        //   this.calculateAndDisplayRoute(start, end)
        // );
      }
    });
  }

  stopTracking() {
    Geolocation.clearWatch({ id: this.watch }).then(() => {
      this.isTracking = false;
    });
  }

  addNewLocation(lat, lng, timestamp) {
    this.locationsCollection.add({
      lat,
      lng,
      timestamp,
    });

    // let position = new google.maps.LatLng(lat, lng);
    // this.carMarker.setPosition(position);

    //let position = new google.maps.LatLng(lat, lng);
    //this.map.setCenter(position);
    // this.map.setZoom(15);
  }

  deleteLoc(pos) {
    this.locationsCollection.doc(pos.id).delete();
  }

  onButtonClick() {
    let position = this.carMarker.getPosition();
    console.log("POSITION FROM MARKER", position);
    this.carMarker.setPosition(position);
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

  calculateAndDisplayRoute(start, end) {
    console.log("START AND END", start, end);
    this.directionsService.route(
      {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode["DRIVING"],
      },
      (response, status) => {
        if (status === "OK") {
          this.directionsDisplay.setDirections(response);
          console.log(
            "DIRECTIONS-----",
            this.directionsDisplay.setDirections(response)
          );
        } else {
          window.alert("Directions request failed due to " + status);
        }
      }
    );
  }

  ////SIMULATIONS
  // private cars1 = {
  //   cars: [
  //     {
  //       id: 1,
  //       coord: {
  //         lat: -26.097551,
  //         lng: 28.050939,
  //       },
  //     },
  //     {
  //       id: 2,
  //       coord: {
  //         lat: -26.102831,
  //         lng: 28.059951,
  //       },
  //     },
  //   ],
  // };

  // getSegmentedDirections(directions) {
  //   let route = directions.routes[0];
  //   let legs = route.legs;
  //   let path = [];
  //   let increments = [];
  //   let duration = 0;

  //   let numOfLegs = legs.length;

  //   // work backwards though each leg in directions route
  //   while (numOfLegs--) {
  //     let leg = legs[numOfLegs];
  //     let steps = leg.steps;
  //     let numOfSteps = steps.length;

  //     while (numOfSteps--) {
  //       let step = steps[numOfSteps];
  //       let points = step.path;
  //       let numOfPoints = points.length;

  //       duration += step.duration.value;

  //       while (numOfPoints--) {
  //         let point = points[numOfPoints];

  //         path.push(point);

  //         increments.unshift({
  //           position: point, // car position
  //           time: duration, // time left before arrival
  //           path: path.slice(0), // clone array to prevent referencing final path array
  //         });
  //       }
  //     }
  //   }

  //   return increments;
  // }

  // findPickupCar(pickupLocation) {
  //   this.myRouteIndex = 0;

  //   let car = this.cars1.cars[0]; // pick one of the cars to simulate pickupLocation
  //   let start = new google.maps.LatLng(car.coord.lat, car.coord.lng);
  //   let end = pickupLocation;

  //   return this.simulateRoute(start, end);
  // }

  // simulateRoute(start, end) {
  //   return Observable.create((observable) => {
  //     this.calculateRoute(start, end).subscribe((directions) => {
  //       // get route path
  //       this.myRoute = this.getSegmentedDirections(directions);
  //       // return pickup car
  //       this.getPickupCar().subscribe((car) => {
  //         observable.next(car); // first increment in car path
  //       });
  //     });
  //   });
  // }
}
