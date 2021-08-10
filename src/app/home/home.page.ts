/// <reference types="@types/googlemaps" />
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  ElementRef,
  Renderer2,
  NgZone,
} from "@angular/core";

import { ToastController, Platform, LoadingController } from "@ionic/angular";
import { Router, NavigationExtras } from "@angular/router";

import { AngularFireMessaging } from "@angular/fire/messaging";
import { FormGroup, Validators } from "@angular/forms";
import { Capacitor, Plugins } from "@capacitor/core";
const { Geolocation, Toast } = Plugins;
import {
  NativeGeocoder,
  NativeGeocoderResult,
  NativeGeocoderOptions,
} from "@ionic-native/native-geocoder/ngx";
// import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Diagnostic } from "@ionic-native/diagnostic/ngx";
import { LocationService } from "./location.service";
import { AuthService } from "../auth/auth.service";
import { DriverRegService } from "../driver-registration/driver-reg.service";

// import { Platform } from 'ionic-angular';

// import { NavController } from '@ionic/angular';

// import {
//   GoogleMaps,
//   GoogleMap,
//   GoogleMapsEvent,
//   GoogleMapOptions,
//   CameraPosition,
//   MarkerOptions,
//   Marker,
//   Environment,
//   GoogleMapsAnimation,
//   MyLocation,
// } from "@ionic-native/google-maps";

@Component({
  selector: "app-home",
  templateUrl: "./home.page.html",
  styleUrls: ["./home.page.scss"],
})
export class HomePage implements OnInit, AfterViewInit {
  @ViewChild("map", { static: false }) mapElementRef: ElementRef;
  myDate: string = new Date().toISOString();
  starttime: string = new Date().toISOString();
  myDateRT: string = new Date().toISOString();
  starttimeRT: string = new Date().toISOString();
  autocomplete: any;
  autocompletedp: any;
  autocompleteRT: any;
  autocompletedpRT: any;
  GoogleAutocomplete: any;
  GooglePlaces: any;
  geocoder: any;
  autocompleteItems: any;
  autocompletedpItems: any;
  autocompleteRTItems: any;
  autocompletedpRTItems: any;

  nearbyItems: any = new Array<any>();
  loading: any;
  DropOffformattedAddress: any;
  PickUpformattedAddress: any;
  map: any;
  locationItems: any;
  directionsService: any;
  directionsDisplay = new google.maps.DirectionsRenderer();
  isLinear = false;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  private _formBuilder: any;
  latitude: number;
  longitude: number;
  address: any;
  userCity: string;
  latLngResult: string;
  isReturnChecked: boolean = false;
  PickUpformattedRTAddress: any;
  DropOffformattedRTAddress: any;
  lat: any;
  lng: any;
  watchId: any;
  userId: string;

  constructor(
    private renderer: Renderer2,
    private platform: Platform,
    public zone: NgZone,
    public loadingCtrl: LoadingController,
    private router: Router,
    private afMessaging: AngularFireMessaging,
    private nativeGeocoder: NativeGeocoder,
    // private geolocation: Geolocation,
    private diagnostic: Diagnostic,
    private locationService: LocationService,
    public ngZone: NgZone,
    private authService: AuthService,
    private driverSvr: DriverRegService
  ) {
    this.geocoder = new google.maps.Geocoder();
    let elem = document.createElement("div");
    this.GooglePlaces = new google.maps.places.PlacesService(elem);
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.autocomplete = {
      input: "",
    };
    this.autocompletedp = {
      input: "",
    };
    this.autocompleteRT = {
      input: "",
    };
    this.autocompletedpRT = {
      input: "",
    };
    this.autocompleteItems = [];
    this.autocompletedpItems = [];
    this.autocompleteRTItems = [];
    this.autocompletedpRTItems = [];
    this.locationItems = [];
    this.loading = this.loadingCtrl.create();
    this.directionsService = new google.maps.DirectionsService();
    this.directionsDisplay = new google.maps.DirectionsRenderer();
    this.autocomplete.input = "";
    this.PickUpformattedAddress = "";

    this.platform.resume.subscribe(async () => {
      this.getCurrentPosition();
    });

    this.authService.userId.subscribe((userId) => {
      if (!userId) {
        throw new Error("User not found!");
      }
      this.userId = userId;
      console.log("USER ID IS::: ", this.userId);
    });

    this.driverSvr.getDriverById(this.userId).subscribe((drivers) => {
      console.log("DRIVER DETAILS:::", drivers);
      console.log("DRIVER DETAILS UID:::", drivers[0].uid);
      if (drivers[0].uid == this.userId) {
        console.log("USER IS A DRIVER");
      } else {
        console.log("NOT DRIVER");
      }
    });
  }

  async getCurrentPosition() {
    // this.platform.ready().then(() => {

    Geolocation.getCurrentPosition()
      .then((resp) => {
        console.log("Respose from Current Position " + JSON.stringify(resp));
        this.latitude = resp.coords.latitude;
        this.longitude = resp.coords.longitude;
        this.getAddress(this.latitude, this.longitude);
      })
      .catch((error) => {
        console.log("Error getting location", error);
      });
    // })
  }
  // geocoder options
  nativeGeocoderOptions: NativeGeocoderOptions = {
    useLocale: true,
    maxResults: 5,
  };

  async getMyLocation() {
    const hasPermission = await this.locationService.checkGPSPermission();
    if (hasPermission) {
      if (Capacitor.isNative) {
        const canUseGPS = await this.locationService.askToTurnOnGPS();
        this.postGPSPermission(canUseGPS);
      } else {
        this.postGPSPermission(true);
      }
    } else {
      const permission = await this.locationService.requestGPSPermission();
      if (permission === "CAN_REQUEST" || permission === "GOT_PERMISSION") {
        if (Capacitor.isNative) {
          const canUseGPS = await this.locationService.askToTurnOnGPS();
          this.postGPSPermission(canUseGPS);
        } else {
          this.postGPSPermission(true);
        }
      } else {
        await Toast.show({
          text: "User denied location permission",
        });
      }
    }
  }

  async postGPSPermission(canUseGPS: boolean) {
    if (canUseGPS) {
      this.watchPosition();
    } else {
      await Toast.show({
        text: "Please turn on GPS to get location",
      });
    }
  }

  async watchPosition() {
    try {
      this.watchId = Geolocation.watchPosition({}, (position, err) => {
        this.ngZone.run(() => {
          if (err) {
            console.log("err", err);
            return;
          }
          this.lat = position.coords.latitude;
          this.lng = position.coords.longitude;
          this.getAddress(this.lat, this.lng);
          this.clearWatch();
        });
      });
    } catch (err) {
      console.log("err", err);
    }
  }

  clearWatch() {
    if (this.watchId != null) {
      Geolocation.clearWatch({ id: this.watchId });
    }
  }

  // get address using coordinates
  getAddress(lat, long) {
    if (this.platform.is("android") || this.platform.is("ios")) {
      console.log("It is on device");
      this.getGeoLocation(lat, long);
    } else {
      this.nativeGeocoder
        .reverseGeocode(lat, long, this.nativeGeocoderOptions)
        .then((res: NativeGeocoderResult[]) => {
          this.address = this.pretifyAddress(res[0]);
          console.log(this.address);
        })
        .catch((error: any) => {
          alert("Error getting location" + JSON.stringify(error));
        });
    }
  }

  // address
  pretifyAddress(address) {
    let obj = [];
    let data = "";
    for (let key in address) {
      obj.push(address[key]);
    }
    obj.reverse();
    for (let val in obj) {
      if (obj[val].length) data += obj[val] + ", ";
    }
    return address.slice(0, -2);
  }

  async getGeoLocation(lat: number, lng: number, type?) {
    if (navigator.geolocation) {
      let geocoder = await new google.maps.Geocoder();
      let latlng = await new google.maps.LatLng(lat, lng);
      let request: any = { latLng: latlng };

      await geocoder.geocode(request, (results, status) => {
        if (status == google.maps.GeocoderStatus.OK) {
          let result = results[0];
          this.zone.run(() => {
            if (result != null) {
              this.userCity = result.formatted_address;
              this.autocomplete.input = result.formatted_address;
              this.PickUpformattedAddress = result.formatted_address;
              this.DropOffformattedRTAddress = result.formatted_address;
              this.autocompletedpRT.input = result.formatted_address;
              if (type === "reverseGeocode") {
                this.latLngResult = result.formatted_address;
              }
            }
          });
        }
      });
    }
  }

  async ngOnInit() {
    this.requestPermission();

    this.autocomplete.input = "";
    this.PickUpformattedAddress = "";
    this.getCurrentPosition();

    this.watchPosition();
    //this.getMyLocation();
  }

  ngAfterViewInit() {
    //this.createMap(-34.397,150.644);
  }

  createMap(lat: number, lng: number) {
    this.getGoogleMaps()
      .then((googleMaps) => {
        const mapEl = this.mapElementRef.nativeElement;
        const map = new googleMaps.Map(mapEl, {
          center: { lat: lat, lng: lng },
          zoom: 8,
        });

        googleMaps.event.addListenerOnce(map, "idle", () => {
          this.renderer.addClass(mapEl, "visible");
        });

        map.addListener("click", (event) => {
          // const selectedCoords = {
          //   lat: event.latLng.lat(),
          //   lng: event.latLng.lng(),
          // };
          //this.modalCtrl.dismiss(selectedCoords);
        });

        this.directionsDisplay.setMap(map);

        this.locationItems.forEach(function (loc) {
          console.log(loc);
          let marker = new google.maps.Marker({
            map: map,
            animation: google.maps.Animation.DROP,
            position: {
              lat: loc.lat,
              lng: loc.lng,
            },
          });

          google.maps.event.addListener(marker, "click", function () {
            var infowindow = new google.maps.InfoWindow({
              content: "<h4>Information!</h4>",
            });
            infowindow.open(map, marker);
          });
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  private getGoogleMaps(): Promise<any> {
    const win = window as any;
    const googleModule = win.google;
    if (googleModule && googleModule.maps) {
      return Promise.resolve(googleModule.maps);
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://maps.googleapis.com/maps/api/js?key=AIzaSyDSsiYwuqo_pa7jrdUAKLAMwZTVMzQcDpg";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        const loadedGoogleModule = win.google;
        if (loadedGoogleModule && loadedGoogleModule.maps) {
          resolve(loadedGoogleModule.maps);
        } else {
          reject("Google maps SDK not available.");
        }
      };
    });
  }

  updateSearchResults() {
    if (this.autocomplete.input == "") {
      this.autocompleteItems = [];
      return;
    }
    this.GoogleAutocomplete.getPlacePredictions(
      { input: this.autocomplete.input },
      (predictions, status) => {
        this.autocompleteItems = [];
        if (predictions) {
          this.zone.run(() => {
            predictions.forEach((prediction) => {
              this.autocompleteItems.push(prediction);
            });
          });
        }
      }
    );
  }

  selectSearchResult(item) {
    this.autocompleteItems = [];
    this.geocoder.geocode({ placeId: item.place_id }, (results, status) => {
      if (status === "OK" && results[0]) {
        console.log(results[0]);
        console.log(results[0].geometry.location);
        this.autocompleteItems = [];
        this.PickUpformattedAddress = results[0].formatted_address;
        this.DropOffformattedRTAddress = results[0].formatted_address;
        this.autocompletedpRT.input = results[0].formatted_address;
        this.locationItems.push({
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
          locType: "PickUp",
        });
        console.log(this.PickUpformattedAddress);
      }
    });
  }
  updateSearchResultsdp() {
    if (this.autocompletedp.input == "") {
      this.autocompletedpItems = [];
      return;
    }
    this.GoogleAutocomplete.getPlacePredictions(
      { input: this.autocompletedp.input },
      (predictions, status) => {
        this.autocompletedpItems = [];
        if (predictions) {
          this.zone.run(() => {
            predictions.forEach((prediction) => {
              this.autocompletedpItems.push(prediction);
            });
          });
        }
      }
    );
  }

  selectdpSearchResult(item) {
    this.geocoder.geocode({ placeId: item.place_id }, (results, status) => {
      if (status === "OK" && results[0]) {
        console.log(results[0]);
        console.log(results[0].geometry.location);
        this.DropOffformattedAddress = results[0].formatted_address;
        this.PickUpformattedRTAddress = results[0].formatted_address;
        this.autocompleteRT.input = results[0].formatted_address;
        console.log(this.DropOffformattedAddress);
        this.locationItems.push({
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
          locType: "DropOff",
        });
        // this.createMap(results[0].geometry.location.lat(),results[0].geometry.location.lng());

        this.calculateAndDisplayRoute(
          this.PickUpformattedAddress,
          this.DropOffformattedAddress
        );
        this.autocompletedpItems = [];
      }
    });
  }

  updateSearchRTResults() {
    if (this.autocompleteRT.input == "") {
      this.autocompleteRTItems = [];
      return;
    }
    this.GoogleAutocomplete.getPlacePredictions(
      { input: this.autocompleteRT.input },
      (predictions, status) => {
        this.autocompleteRTItems = [];
        if (predictions) {
          this.zone.run(() => {
            predictions.forEach((prediction) => {
              this.autocompleteRTItems.push(prediction);
            });
          });
        }
      }
    );
  }

  selectSearchRTResult(item) {
    this.autocompleteRTItems = [];
    this.geocoder.geocode({ placeId: item.place_id }, (results, status) => {
      if (status === "OK" && results[0]) {
        console.log(results[0]);
        console.log(results[0].geometry.location);
        this.autocompleteRTItems = [];
        this.PickUpformattedRTAddress = results[0].formatted_address;
        this.locationItems.push({
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
          locType: "PickUp",
        });
        console.log(this.PickUpformattedRTAddress);
      }
    });
  }

  updateSearchdpRTResults() {
    if (this.autocompletedpRT.input == "") {
      this.autocompletedpRTItems = [];
      return;
    }
    this.GoogleAutocomplete.getPlacePredictions(
      { input: this.autocompletedpRT.input },
      (predictions, status) => {
        this.autocompletedpRTItems = [];
        if (predictions) {
          this.zone.run(() => {
            predictions.forEach((prediction) => {
              this.autocompletedpRTItems.push(prediction);
            });
          });
        }
      }
    );
  }

  selectSearchdpRTResult(item) {
    this.autocompletedpRTItems = [];
    this.geocoder.geocode({ placeId: item.place_id }, (results, status) => {
      if (status === "OK" && results[0]) {
        console.log(results[0]);
        console.log(results[0].geometry.location);
        this.autocompletedpRTItems = [];
        this.DropOffformattedRTAddress = results[0].formatted_address;
        this.locationItems.push({
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
          locType: "PickUp",
        });
        console.log(this.DropOffformattedRTAddress);
      }
    });
  }

  calculateAndDisplayRoute(source: string, destination: string) {
    const that = this;
    this.directionsService.route(
      {
        origin: source,
        destination: destination,
        travelMode: "DRIVING",
      },
      (response, status) => {
        if (status === "OK") {
          that.directionsDisplay.setDirections(response);
        } else {
          window.alert("Directions request failed due to " + status);
        }
      }
    );
  }

  getQuote() {
    let routeLocations = {
      source: this.PickUpformattedAddress,
      destination: this.DropOffformattedAddress,
      date: this.myDate,
      time: this.starttime,
      returnRide: null,
    };
    if (this.isReturnChecked) {
      routeLocations.returnRide = {
        source: this.PickUpformattedRTAddress,
        destination: this.DropOffformattedRTAddress,
        date: this.myDateRT,
        time: this.starttimeRT,
      };
    }

    let navigationExtras: NavigationExtras = {
      queryParams: {
        location: JSON.stringify(routeLocations),
      },
    };
    this.router.navigate(["quote"], navigationExtras);
  }

  requestPermission() {
    this.afMessaging.requestToken.subscribe(
      (token) => {
        console.log(token);
      },
      (error) => {
        console.error(error);
      }
    );
  }

  requiredReturnTick(isReturunCheck) {
    console.log(isReturunCheck);
    console.log(this.isReturnChecked);
  }
}
