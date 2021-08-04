import {
  Component,
  ElementRef,
  NgZone,
  OnInit,
  Renderer2,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, NavigationExtras, Router } from "@angular/router";
import { Platform } from "@ionic/angular";
import { Capacitor, Plugins } from "@capacitor/core";
const { Geolocation, Toast } = Plugins;

import {
  NativeGeocoder,
  NativeGeocoderResult,
  NativeGeocoderOptions,
} from "@ionic-native/native-geocoder/ngx";

import { AuthService } from "../auth/auth.service";
import { DriverRegService } from "../driver-registration/driver-reg.service";
import { RideRequestsService } from "../ride-requests/ride-requests.service";

@Component({
  selector: "app-rider-pickup",
  templateUrl: "./rider-pickup.page.html",
  styleUrls: ["./rider-pickup.page.scss"],
})
export class RiderPickupPage implements OnInit {
  @ViewChild("map", { static: false }) mapElementRef: ElementRef;
  map: any;
  information: any;
  ride: any;
  distance: any;
  directionsService: any;
  directionsDisplay = new google.maps.DirectionsRenderer();
  driver: any;
  message: any;
  driverId: any = 0;
  latitude: number;
  longitude: number;
  address: any;

  // geocoder options
  nativeGeocoderOptions: NativeGeocoderOptions = {
    useLocale: true,
    maxResults: 5,
  };
  userCity: string;
  latLngResult: string;

  constructor(
    private rideRequestsService: RideRequestsService,
    public zone: NgZone,
    private authService: AuthService,
    private driverSvr: DriverRegService,
    private renderer: Renderer2,
    private platform: Platform,
    private activatedRoute: ActivatedRoute,
    private nativeGeocoder: NativeGeocoder,
    private router: Router
  ) {
    this.directionsService = new google.maps.DirectionsService();
    this.directionsDisplay = new google.maps.DirectionsRenderer();
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(
      (params) => {
        if (params && params.message) {
          this.message = JSON.parse(params.message);
          console.log(params.message);
          if (this.message != undefined && this.message != null) {
            this.getCurrentPosition();
            //this.driverId =  this.message.data.driverId;
            //   if(this.message.data.driverId != 0){
            //     this.driverSvr.getDriverById(this.message.data.driverId).subscribe((drivers)=>{
            //     this.zone.run(() => {
            //        console.log(drivers);
            //       if(drivers.length > 0)
            //       {
            //         this.driver = drivers[0];
            //       }
            //       this.calculateRoute(this.ride.startAddress,this.ride.endAddress);
            //     });
            //   });
            //  }
          }
        }
      },
      (err) => {
        console.log(err);
      }
    );

    this.createMap(-34.397, 150.644);
  }

  drive(message) {
    if (message !== null && message !== undefined) {
      let navigationExtras: NavigationExtras = {
        queryParams: {
          message: JSON.stringify(message),
        },
      };
      this.router.navigate(["driver-navigation"], navigationExtras);
    }
  }

  calculateRoute(source: string, destination: string) {
    const that = this;
    this.directionsService.route(
      {
        origin: source,
        destination: destination,
        travelMode: "DRIVING",
      },
      (response, status) => {
        if (status === "OK") {
          console.log(response);
          that.distance = response.routes[0].legs[0].distance.text;
          this.distance = that.distance;

          that.directionsDisplay.setDirections(response);
        } else {
          window.alert("Directions request failed due to " + status);
        }
      }
    );
  }

  async getCurrentPosition() {
    // this.platform.ready().then(() => {

    Geolocation.getCurrentPosition()
      .then((resp) => {
        console.log(resp);
        this.latitude = resp.coords.latitude;
        this.longitude = resp.coords.longitude;
        this.getAddress(this.latitude, this.longitude);
      })
      .catch((error) => {
        console.log("Error getting location", error);
      });
    // })
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
          this.calculateRoute(this.address, this.message.startAddress);
        })
        .catch((error: any) => {
          alert("Error getting location" + JSON.stringify(error));
        });
    }
  }
  riderStartAddress(address: any, riderStartAddress: any) {
    throw new Error("Method not implemented.");
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

      geocoder.geocode(request, (results, status) => {
        if (status == google.maps.GeocoderStatus.OK) {
          let result = results[0];
          this.zone.run(() => {
            if (result != null) {
              this.userCity = result.formatted_address;
              console.log(this.userCity);
              this.calculateRoute(this.userCity, this.message.startAddress);
              // this.autocomplete.input =  result.formatted_address;
              // this.PickUpformattedAddress = result.formatted_address;
              // this.DropOffformattedRTAddress = result.formatted_address;
              // this.autocompletedpRT.input =  result.formatted_address;
              if (type === "reverseGeocode") {
                this.latLngResult = result.formatted_address;
              }
            }
          });
        }
      });
    }
  }

  ngAfterViewInit() {
    this.createMap(-34.397, 150.644);
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

        map.addListener("click", (event) => {});

        this.directionsDisplay.setMap(map);
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
}
