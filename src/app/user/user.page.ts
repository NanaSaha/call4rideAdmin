import { Component, NgZone, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Platform, LoadingController, ActionSheetController } from '@ionic/angular';
import { UserService } from '../auth/user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})
export class UserPage implements OnInit {
  loading: Promise<HTMLIonLoadingElement>;
  userdatas: any[];
  automaticClose: boolean = true;
  roleModel:string;
  selectedIndex: any;

  constructor(
    private userService:UserService,
    private renderer: Renderer2,
    private platform: Platform,
    public zone: NgZone,
    public loadingCtrl: LoadingController,
    private activatedRoute: ActivatedRoute,
    public actionSheetController: ActionSheetController
    ) {
      this.loading = this.loadingCtrl.create();
      this.roleModel = "user";
     }

  ngOnInit()
  {
    this.userService.usersCollectionFetch().subscribe(ride=>{
      console.log(ride);
      this.userdatas = ride.map(item=>item = {...item,open:false,role:"user"});
      this.userdatas.forEach( (element) => {
        console.log(element.roles);
        if(element.roles !== undefined){
          element.role = this.getRole(element.roles);
        }
          
      });

      
      if(this.userdatas.length > 0)
      {
        this.zone.run(() => {
          this.userdatas[0].open = true;
         
        });
        
      }
      console.log(this.userdatas);
    },
    err=>{
      console.log(err);
    })
  }
  getRole(roles: any) {
    if(roles.admin)
    {
      return 'admin';
    }
    return 'user';
  }

  toggleSelection(index){
    this.selectedIndex = index;
    this.userdatas[index].open = !this.userdatas[index].open;
    if(this.automaticClose &&  this.userdatas[index].open)
    {
      this.userdatas.filter((item, itemIndex) => itemIndex != index)
      .map(item => item.open = false);
    }
  }

  onSelectChange(event, item)
  {
    console.log(event.detail.value);
    console.log(this.roleModel);
    console.log(item);
   let role:string;
    if(event.detail.value === "admin")
    {
      role = "admin";
      item.roles.admin = true;
    }
    else{
      item.roles.admin = false;
      role = "user";
    }
    this.loadingCtrl
    .create({
      message: "Uploading profile image...",
    })
    .then((loadingEl) => {
      loadingEl.present();
    this.userService.updateUserRole(item).then(
      (res)=>{
        console.log(res);
        this.userdatas[this.selectedIndex].role = role;
        loadingEl.dismiss();
      },
      (err)=>{
        console.log(err);
        loadingEl.dismiss();
      }
    )
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
