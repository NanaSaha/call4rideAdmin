import { AfterViewInit, Component, ElementRef, NgZone, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Platform } from '@ionic/angular';
import { AuthService } from '../auth/auth.service';
import { DriverRegService } from '../driver-registration/driver-reg.service';
import { RideRequestsService } from '../ride-requests/ride-requests.service';

@Component({
  selector: 'app-driver',
  templateUrl: './driver.page.html',
  styleUrls: ['./driver.page.scss'],
})
export class DriverPage implements OnInit , AfterViewInit{
  @ViewChild("map", { static: false }) mapElementRef: ElementRef;
  map: any;
  information: any;
  ride: any;
  distance: any;
  directionsService: any;
  directionsDisplay = new google.maps.DirectionsRenderer();
  driver: any;
  message:any;
  driverId: any = 0;

  constructor( 
    private rideRequestsService:RideRequestsService,
    public zone: NgZone,
    private authService: AuthService,
    private driverSvr:DriverRegService,
    private renderer: Renderer2,
    private platform: Platform,
    private activatedRoute: ActivatedRoute,
    ) {
      this.directionsService = new google.maps.DirectionsService();
      this.directionsDisplay = new google.maps.DirectionsRenderer();
     }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params && params.message) {
        this.message = JSON.parse(params.message);
        alert(params.message)
        if(this.message != undefined && this.message != null && this.message.data != null)
        {
        this.driverId =  this.message.data.driverId;
          if(this.message.data.driverId != 0){
            this.driverSvr.getDriverById(this.message.data.driverId).subscribe((drivers)=>{
            this.zone.run(() => {
               console.log(drivers);
              if(drivers.length > 0)
              {
                this.driver = drivers[0];
              }
              this.calculateRoute(this.ride.startAddress,this.ride.endAddress);         
            }); 
          });
         }
        }
      }
    },err=>{
      console.log(err)
    });
   
    // this.authService.userId.subscribe(userid =>{
    // this.rideRequestsService.getMyRide(userid).subscribe(rides=>{
    //       console.log(rides);
        
    //       let therides =  rides.filter((item)=>item.user != null).map(item=>item = {...item,distance:""});
    //       this.ride = therides[0];
    //       console.log(this.ride);
    //       if(this.ride != undefined && this.ride != null)
    //       {
    //         this.driverSvr.getDriverById(userid).subscribe((drivers)=>{
    //         this.zone.run(() => {
             
    //           console.log(drivers);
    //           if(drivers.length > 0)
    //           {
    //             this.driver = drivers[0];
    //           }
    //           this.calculateRoute(this.ride.startAddress,this.ride.endAddress);         
    //         }); 
    //       });
    //       }
    //     });
    //   });
      this.createMap(-34.397, 150.644);
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
          this.ride.distance = that.distance;
                 
        } else {
          window.alert("Directions request failed due to " + status);
        }
      }
    );
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


}

