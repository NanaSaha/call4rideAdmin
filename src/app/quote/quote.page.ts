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
import { Router, ActivatedRoute, NavigationExtras } from "@angular/router";
import { Ride } from './ride';
import { QuoteService } from './quote.service';
import { take, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { StoreService } from '../services/store.service';
import { UserService } from '../auth/user.service';
import { Guid } from "guid-typescript";

@Component({
  selector: "app-quote",
  templateUrl: "./quote.page.html",
  styleUrls: ["./quote.page.scss"],
})
export class QuotePage implements OnInit, AfterViewInit {
  @ViewChild("map", { static: false }) mapElementRef: ElementRef;
  map: any;
  locationItems: any;
  directionsService: any;
  directionsDisplay = new google.maps.DirectionsRenderer();
  loading: any;
  data: any;
  distance: any = "15 KM";
  fare: any;
  ride: any;
  userId: string;
  showLoader = false;
  user: any;
  startAddress: any;
  endAddress: any;
  rtStartAddress: any;
  rtEndAddress: any;
  isShowReturnSection: boolean;
  rtfare: any;
  rtRide: any;
  rtdistance:any;
  appToken: string;

  constructor(
    private renderer: Renderer2,
    private platform: Platform,
    public zone: NgZone,
    public loadingCtrl: LoadingController,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private quoteService: QuoteService,
    private authService: AuthService,
    private _StoreService: StoreService,
    private _userService:UserService
  ) {
    this.loading = this.loadingCtrl.create();
    this.directionsService = new google.maps.DirectionsService();
    this.directionsDisplay = new google.maps.DirectionsRenderer();
    // this.activatedRoute.queryParams.subscribe(params => {
    //   if (this.router.getCurrentNavigation().extras.state) {
    //     this.data = this.router.getCurrentNavigation().extras.state.user;
    //     if(this.data != null)
    //     {
    //       this.calculateAndDisplayRoute(this.data.source, this.data.destination);
    //     }
    //   }
    // });
  }

  ngOnInit() {
    this.createMap(-34.397, 150.644);
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params && params.location) {
        this.data = JSON.parse(params.location);
        console.log(this.data);
        this.isShowReturnSection = false;
        if (this.data != null) {
         
          this.calculateAndDisplayRoute(
            this.data.source,
            this.data.destination,
            this.data.date,
            this.data.time
          );

          if(this.data.returnRide !== null && 
            this.data.returnRide !== undefined)
          {
            this.isShowReturnSection = true;
            this.rtStartAddress = this.data.returnRide.source;
            this.rtEndAddress = this.data.returnRide.destination;
            this.reCalculateAndDisplayRoute(
              this.data.returnRide.source,
              this.data.returnRide.destination,
              this.data.returnRide.date,
              this.data.returnRide.time
            );
          }

         
        }
      }
    });

    this.authService.userId.subscribe(userId=>{
      if (!userId) {
        throw new Error("User not found!");
      }
      this.userId = userId;
      
    });
    this._userService.getUserByUserId().subscribe(users=>{
      if(users.length >0 )
      {
        this.user = users[0];
      }
    });
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

        map.addListener("click", (event) => {
          // const selectedCoords = {
          //   lat: event.latLng.lat(),
          //   lng: event.latLng.lng(),
          // };
          //this.modalCtrl.dismiss(selectedCoords);
        });

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
  reCalculateAndDisplayRoute(source: string, destination: string, tripDate:Date, time:Date) {
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
          that.rtdistance = response.routes[0].legs[0].distance.text;
          if (
            that.distance.split(" ")[0] !== undefined &&
            that.distance.split(" ")[0] !== null
          ) {
            console.log( that.rtdistance.split(" ")[0]);
            that.rtfare = that.calculatefare( that.rtdistance.split(" ")[0]);
          }

          this.rtStartAddress = response.routes[0].legs[0].start_address;
          this.rtEndAddress = response.routes[0].legs[0].end_address;

          const startlocation = response.routes[0].legs[0].start_location;
          const endlocation = response.routes[0].legs[0].end_location;
          that.rtRide = this.createRide(response, tripDate, time);
          that.rtRide.startLocation = {
            lat: startlocation.lat(),
            lag: startlocation.lng()
          };
          that.rtRide.endLocation = {
            lat: endlocation.lat(),
            lag: endlocation.lng()
          };
          that.rtRide.outboundReference = that.ride.outboundReference;
          that.rtRide.fare = that.rtfare;
          console.log(that.rtRide);
          
          //that.directionsDisplay.setDirections(response);
        } else {
          window.alert("Directions request failed due to " + status);
        }
      }
    );
  }
  calculateAndDisplayRoute(source: string, destination: string, tripDate:Date, time:Date) {
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
          that.rtdistance =  that.distance;
          if (
            that.distance.split(" ")[0] !== undefined &&
            that.distance.split(" ")[0] !== null
          ) {
            console.log(that.distance.split(" ")[0]);
            that.fare = that.calculatefare(that.distance.split(" ")[0]);
            that.rtfare = that.fare;
          }
          
          this.startAddress = response.routes[0].legs[0].start_address;
          this.endAddress = response.routes[0].legs[0].end_address;

          const startlocation = response.routes[0].legs[0].start_location;
          const endlocation = response.routes[0].legs[0].end_location;
          that.ride = this.createRide(response, tripDate, time);
          that.ride.startLocation = {
            lat: startlocation.lat(),
            lag: startlocation.lng()
          };
          that.ride.endLocation = {
            lat: endlocation.lat(),
            lag: endlocation.lng()
          };


          that.ride.fare = that.fare;
          console.log(that.ride);

          that.ride.outboundReference =  Guid.create().toString();
          
          that.directionsDisplay.setDirections(response);
        } else {
          window.alert("Directions request failed due to " + status);
        }
      }
    );
  }
  private createRide(response: any, tripDate: Date, time: Date):Ride {
      let date: Date = new Date(); 
      tripDate = new Date((new Date(tripDate)).setHours(0, 0, 0, 0)) 
      let appToken:string = "";
      if(!this.platform.is('pwa'))
      {
      this._StoreService.getItem('apptoken').then(value=>{
        appToken = value;
        this.appToken = appToken;
        console.log(appToken);
        let ride:Ride = new Ride("",this.userId,null,null,response.routes[0].legs[0].start_address,response.routes[0].legs[0].end_address,tripDate,time,"",date,false,appToken,null);
        return ride;
      })
     }
      let ride:Ride = new Ride("",this.userId,null,null,response.routes[0].legs[0].start_address,response.routes[0].legs[0].end_address,tripDate,time,"",date,false,appToken,null);

      // ride.userId = this.userId;
      // ride.startAddress = response.routes[0].legs[0].start_address;
      // ride.endAddress = response.routes[0].legs[0].end_address;
      // ride.tripDate = tripDate;
      // ride.time = time;
      // ride.entryDate = date;

      // ride.approveRide = false;

      return ride
      
}

  calculatefare(distance: number): string {
    const result = distance * 1.3;
    return "$" + result.toFixed(2) + ":00";
  }

  bookRide()
  {
    if(this.ride !== null && this.ride !== undefined)
    {
      this.showLoader = true;
      this._userService. getUserByUserId().subscribe(users=>{
        if(users.length >0 )
        {
          let user = users[0];
        this.ride.user = {firstName:user.firstName, lastName:user.lastName,email:user.email,phone: user.phone, userId: user.userId};
        this.ride.userId =  user.userId;
        this.ride.appToken = (this.appToken != undefined && this.appToken != null)? this.appToken:"";
        this.quoteService.addItem(this.ride).then(
          success => {
            if(this.rtRide !== null && this.rtRide !== undefined)
            {
              this.rtRide.user = {firstName:user.firstName, lastName:user.lastName,email:user.email,phone: user.phone, userId: user.userId};
              this.rtRide.userId =  user.userId;
              this.quoteService.addItem(this.rtRide).then((sucess)=>{
                this.showLoader = false;
                this.gotoThankYoupage(user)

              },err=>{
                this.showLoader = false;
                console.log(err);
              });
            }
            else{
              this.showLoader = false;
              console.log(success);
              this.gotoThankYoupage(user)
            }
              
          },
          err=>{
            this.showLoader = false;
            console.log(err);
          });
        }
        else{
          this.showLoader = false;
        }
      },
      err=>{
        console.log(err);
      })
     
    }
  }
  gotoThankYoupage(user:any) {
    let routeLocation = {
      source:this.data.source,
      destination: this.data.destination,
      date: this.data.date,
      time: this.data.time,
      customer:{
        fullName:user.firstName+" "+user.lastName
      }
    };
    let navigationExtras: NavigationExtras = {
      queryParams: {
        location: JSON.stringify(routeLocation)
      }
    };
    this.router.navigate(['thank-you'], navigationExtras);
  }

}

