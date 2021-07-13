import { Component, ElementRef, NgZone, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ActionSheetController, LoadingController, Platform } from '@ionic/angular';
import { AuthService } from '../auth/auth.service';
import { DriverRegService } from '../driver-registration/driver-reg.service';
import { RideRequestsService } from '../ride-requests/ride-requests.service';
import { FcmMessagingService } from '../services/fcm-messaging.service';


@Component({
  selector: 'app-driver-job',
  templateUrl: './driver-job.page.html',
  styleUrls: ['./driver-job.page.scss'],
})
export class DriverJobPage implements OnInit {

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
  showOnMap = false;
  myDate: string = new Date().toISOString();
  isDeleteJob = false;
  

  information:any[];
  automaticClose: boolean = true;
  isLoading: boolean;
  driver: any;
  driverJobs: any[];

  
  constructor(
    private rideRequestsService:RideRequestsService,
    private renderer: Renderer2,
    private platform: Platform,
    public zone: NgZone,
    public loadingCtrl: LoadingController,
    private activatedRoute: ActivatedRoute,
    public actionSheetController: ActionSheetController,
    private router: Router,
    private fcmSer:FcmMessagingService,
    private authService: AuthService,
    private driverSvr:DriverRegService,
  ) {
    this.loading = this.loadingCtrl.create();
    this.directionsService = new google.maps.DirectionsService();
    this.directionsDisplay = new google.maps.DirectionsRenderer();

   }

  ngOnInit() {

    this.authService.userId.subscribe(userId=>{
      if (!userId) {
        throw new Error("User not found!");
      }
      this.userId = userId;
     
        this.driverSvr.getDriverById(userId).subscribe((drivers)=>{
        this.zone.run(() => {
           console.log(drivers);
          if(drivers.length > 0)
          {

            this.driver = drivers[0];
            this.driverJobs = [];
            this.driverSvr.getDriverJobDocId( this.driver.id).subscribe((driverJobs)=>{
            
              this.driverJobs = driverJobs.map(item => item ={ ...item, open: false, distance: "",tripeTime: new Date(item.time) });
              if (this.driverJobs.length > 0) {

                if(driverJobs.length > 0)
                {
                  this.zone.run(() => {
                    this.driverJobs[0].open = true;
                    this.createMap(-34.397, 150.644);
                    this.calculateAndDisplayRoute(
                      this.driverJobs[0].startAddress,
                      this.driverJobs[0].endAddress,
                      this.driverJobs[0].assignedDate,
                      this.driverJobs[0].time,
                      0
                    );
          
                  });
                }

              //   let index = 0;
              // this.information.forEach( (element) => {
              //   // element.product_desc = element.product_desc.substring(0,10);
              //   this.rideRequestsService.getRideByDocId( element.jobDocId).subscribe((riderData)=>{

              //     console.log(riderData);

              //     index++;
              //   })
              // });
            

                
                
              }


              console.log(this.driverJobs);
            },err=>console.log)
          }
          // this.calculateRoute(this.ride.startAddress,this.ride.endAddress);         
        }); 
      });
    
      
    });

    //this.fetchRides();
  }

  gotoPickUP(item)
  {
    if(item !== null && item !== undefined)
    {
      let navigationExtras: NavigationExtras = {
        queryParams: {
          message: JSON.stringify(item)
        }
      };
      this.router.navigate(['rider-pickup'], navigationExtras);
    }   
  }

  private fetchRides() {
    this.information = [];
    this.rideRequestsService.ridesRequestsCollectionFetch().subscribe(ride => {
      console.log(ride);
      this.information = ride.filter((item) => item.user != null).map(item => item = { ...item, open: false, distance: "", tripeTime: new Date(item.time) });
     
      if (this.information.length > 0) {
        this.zone.run(() => {
          this.information[0].open = true;
          this.createMap(-34.397, 150.644);
          this.calculateAndDisplayRoute(
            this.information[0].startAddress,
            this.information[0].endAddress,
            this.information[0].tripDate,
            this.information[0].time,
            0
          );

        });

      }
      console.log(this.information);
    },
      err => {
        console.log(err);
      });
  }

  validateCheck(event,data)
  {
    // console.log(event)
    // console.log(data);
    if(this.isDeleteJob && (data !== null && data !== undefined))
    {
      this.rideRequestsService.deleteRide(data.id).then((ride)=>{
        this.fetchRides();
      },err=>{
        console.log(err);
      })

    }
    //this.isDeleteJob = false;
  }
 

  dateFilterchanged(event)
  {
    console.log(this.myDate);
    //console.log("dateEventObject=>"+ event);
    this.rideRequestsService.ridesRequestsCollectionFetch(this.myDate).subscribe(ride=>{
      console.log(ride);
      this.information = ride.filter((item)=>item.user != null).map(item=>item = {...item,open:false,distance:"", tripeTime:new Date(item.time)});
        if(this.information.length > 0)
      {
        console.log("Tripe Time "+this.information[0].tripeTime);
        this.zone.run(() => {
          this.information[0].open = true;
          this.createMap(-34.397, 150.644);
          this.calculateAndDisplayRoute(
            this.information[0].startAddress,
            this.information[0].endAddress,
            this.information[0].tripDate,
            this.information[0].time,
            0
          );
         
        });
        
      }
      console.log(this.information);
    },
    err=>{
      console.log(err);
    })

  }


  toggleSelection(index){
    this.driverJobs[index].open = !this.driverJobs[index].open;
    if(this.automaticClose &&  this.driverJobs[index].open)
    {
      this.driverJobs.filter((item, itemIndex) => itemIndex != index)
      .map(item => item.open = false);
    }
    this.createMap(-34.397, 150.644);
    this.calculateAndDisplayRoute(
            this.driverJobs[0].startAddress,
            this.driverJobs[0].endAddress,
            this.driverJobs[0].tripDate,
            this.driverJobs[0].time,
            index
          );

  }

  ngAfterViewInit() {
    this.createMap(-34.397, 150.644);
    // this.calculateAndDisplayRoute(
    //   this.information[0].startAddress,
    //   this.information[0].endAddress,
    //   this.information[0].tripDate,
    //   this.information[0].time
    // );
  }

  viewOnMap(item, index)
  {
    this.showOnMap = true;
    console.log(item);
    this.createMap(-34.397, 150.644);
    this.calculateAndDisplayRoute(
      item.startAddress,
      item.endAddress,
      item.tripDate,
      item.time,
      index
    );
    // this.information[index].distance = this.distance;
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

  calculateAndDisplayRoute(source: string, destination: string, tripDate:Date, time:number,index:number) {
   console.log("tripe date"+tripDate);
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
          this.distance = response.routes[0].legs[0].distance.text;
          this.driverJobs[index].distance = this.distance;
          if (
            that.distance.split(" ")[0] !== undefined &&
            that.distance.split(" ")[0] !== null
          ) {
            console.log(that.distance.split(" ")[0]);
           
          }
          
          const startlocation = response.routes[0].legs[0].start_location;
          const endlocation = response.routes[0].legs[0].end_location;
          
          
          that.directionsDisplay.setDirections(response);
        
        } else {
          window.alert("Directions request failed due to " + status);
        }
      }
    );
  }

  assignJob(item)
  {
    console.log(item);
    let navigationExtras: NavigationExtras = {
      queryParams: {
        job: JSON.stringify(item)
      }
    };
    this.router.navigate(['job'], navigationExtras);
  }

  onSelectChange(value, item)
  {
    console.log(value.detail.value);
    console.log(item);
    this.isLoading = true;
    this.loadingCtrl
      .create({ keyboardClose: true, message: "Updateing ride..." })
      .then((loadingEl) => {
        loadingEl.present();
    item.approveRide = false;
    if(value.detail.value === "approve")
    {
      item.approveRide = true;
      if(item.appToken !== "")
      {
        const fcmData = {
              "notification":
               {
                "title": 'Call For Ride',
                "body": '',
                "sound": "default",
                "click_action": "FCM_PLUGIN_ACTIVITY",
                "icon": "./../../assets/images/logos/arabic-purpal-logo.png"
              },
              "data": 
              {
                "Message": "Your ride has been approved. its being assigned to a driver",
                "status": "approval",
                "driverId":"",
                "rideId":` ${item.id}`
              },
              "to": `${item.appToken}`
            };
          this.fcmSer.sendNotification(fcmData).subscribe((result)=>{
            console.log(result);
          },err=>{
            console.log(err);
        })
      }
    }
    this.rideRequestsService.updateRidesRequest(item).then(
      (res)=>{
        loadingEl.dismiss();
    },
    (err)=>{
      loadingEl.dismiss();
    })
  });
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Albums',
      cssClass: 'my-custom-class',
      buttons: [{
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          console.log('Delete clicked');
        }
      }, {
        text: 'Share',
        icon: 'share',
        handler: () => {
          console.log('Share clicked');
        }
      }, {
        text: 'Play (open modal)',
        icon: 'caret-forward-circle',
        handler: () => {
          console.log('Play clicked');
        }
      }, {
        text: 'Favorite',
        icon: 'heart',
        handler: () => {
          console.log('Favorite clicked');
        }
      }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    await actionSheet.present();
  }

}
