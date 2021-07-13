import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../auth/user.service';
import { DriverRegService } from '../driver-registration/driver-reg.service';
import { FcmMessagingService } from '../services/fcm-messaging.service';

@Component({
  selector: 'app-job',
  templateUrl: './job.page.html',
  styleUrls: ['./job.page.scss'],
})
export class JobPage implements OnInit {
  drivers: any;
  data: any;
  job: any;
  user: any;
  driver: any;
  isAssigned: boolean = false;
  rider:string;
  SelectedDriver: any;

  constructor(
     private driverSvr:DriverRegService, 
     private zone: NgZone, 
     private activatedRoute: ActivatedRoute,
     private userService: UserService,
     private fcmSer:FcmMessagingService
     ) { }

  ngOnInit() {

    this.activatedRoute.queryParams.subscribe((params) => {
      if (params && params.job) {
        this.job = JSON.parse(params.job);
        this.rider = this.job.user.firstName +" "+this.job.user.lastName; 
        // console.log("this is the Job!! "+ JSON.stringify(this.job));
        console.log("this is the Job!! "+ this.job.id);
      }
    });
    this.driverSvr.getDrivers().subscribe((res)=>{
      //console.log(res);
      this.drivers = res.map(item=>item = {...item,open:false});
      if(this.drivers.length > 0)
      {
        this.zone.run(() => {
          this.drivers[0].open = true;
        });
      }
    }, 
    (err)=>{
      console.log(err);
    });
    this.getUserData();
  }
  ionViewWillEnter() {
    
   }
 
  private getUserData() {
    this.userService.getUserByUserId().subscribe((userdatas) => {
      console.log(userdatas);
      if (userdatas.length > 0) {
        let userdata = userdatas[0];
        this.user = userdata;
      
        //console.log(userdata);
      }
    
    });
  }
  toggleSelection(index){
    this.SelectedDriver =  this.drivers[index];
    this.drivers[index].open = !this.drivers[index].open;
    if(this.drivers[index].open)
    {
      this.drivers.filter((item, itemIndex) => itemIndex != index)
      .map(item => item.open = false);
    }
  }

  assignedJobtoMe()
  {
      let driverJob:any = {};
      driverJob.startAddress = this.job.startAddress;
      driverJob.endAddress = this.job.endAddress;
      driverJob.tripDate = this.job.tripDate;
      driverJob.time = this.job.time;
      driverJob.active = true;
      driverJob.status = "in progress";
      driverJob.assignedDate = new Date();
      driverJob.driverId =    this.SelectedDriver.uid;
      driverJob.jobDocId = this.job.id;
      driverJob.firstName = this.job.user.firstName
      driverJob.lastName = this.job.user.lastName
      driverJob.phoneNumber = this.job.user.phone

      this.driverSvr.assignJobToDriver(this.SelectedDriver.id,driverJob).then(
        (res)=>{
          this.isAssigned = true;
          console.log(res);
          if(this.job.appToken !== "")
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
                    "message": "Your ride has been approved. its being assigned to a driver",
                    "status": "approval",
                    "driverId":`${this.SelectedDriver.uid}`,
                    "rideId":` ${this.job.id}`
                  },
                  "to": `${this.job.appToken}`
                };
              this.fcmSer.sendNotification(fcmData).subscribe((result)=>{
                console.log(result);
              },err=>{
                console.log(err);
            })
          }
      },(err)=>{
        this.isAssigned = false;
        console.log(err);
      })

    // this.driverSvr.getDriverById(this.user.userId).subscribe((drivers)=>{
    //   let driverJob:any = {};
    //   driverJob.startAddress = this.job.startAddress;
    //   driverJob.endAddress = this.job.endAddress;
    //   driverJob.tripDate = this.job.tripDate;
    //   driverJob.time = this.job.time;
    //   driverJob.active = true;
    //   driverJob.status = "in progress";
    //   driverJob.assignedDate = new Date();
    //   driverJob.driverId = drivers[0].uid;
    //   driverJob.jobDocId = this.job.id;

    //   console.log(driverJob);
 
    // },
    // (err)=>{
    //   console.log(err);
    // });
   
    //console.log(this.job);
  }

}
