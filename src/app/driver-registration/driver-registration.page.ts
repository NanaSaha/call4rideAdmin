import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../auth/user.service';
import { UserRecord } from '../auth/userrecord.model';
import { ProfileService } from '../profile/profile.service';
import { DriverRegService } from './driver-reg.service';

function base64toBlob(base64Data, contentType) {
  contentType = contentType || "";
  const sliceSize = 1024;
  const byteCharacters = window.atob(base64Data);
  const bytesLength = byteCharacters.length;
  const slicesCount = Math.ceil(bytesLength / sliceSize);
  const byteArrays = new Array(slicesCount);

  for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    const begin = sliceIndex * sliceSize;
    const end = Math.min(begin + sliceSize, bytesLength);

    const bytes = new Array(end - begin);
    for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0);
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes);
  }
  return new Blob(byteArrays, { type: contentType });
}
@Component({
  selector: 'app-driver-registration',
  templateUrl: './driver-registration.page.html',
  styleUrls: ['./driver-registration.page.scss'],
})
export class DriverRegistrationPage implements OnInit {

  driverForm : FormGroup;
  defailtImage: string = "assets/image/profile.png";
  user: UserRecord;
  phone: any;
  email: any;
  fullName: string;
  selectedImage: any;

  public disabled = false;
  public color: ThemePalette = 'primary';
  public touchUi = false;
  isRegistered: boolean = false;

  constructor( 
    private formBuilder: FormBuilder,
    private profileService: ProfileService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private userService: UserService,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private driverSvr:DriverRegService
     ) {
    this.driverForm = this.formBuilder.group({
      driverName: ['', Validators.required],
      carYear: ['', Validators.required],
      licencesPlate: ['', Validators.required],
      carType: ['', Validators.required],
      image: [null],

    });
  }
  

  ngOnInit() {
  }
  ionViewWillEnter() {
    this.getUserData();
   }
 
  private getUserData() {
    this.userService.getUserByUserId().subscribe((userdatas) => {
      console.log(userdatas);
      if (userdatas.length > 0) {
        let userdata = userdatas[0];
        this.user = userdata;
        this.phone = userdata.phone;
        this.email = userdata.email;
        this.fullName = userdata.firstName + " " + userdata.lastName;
        this.driverForm.patchValue({ driverName: this.fullName });
        
        if (userdata.imageUrl) {
          this.selectedImage = userdata.imageUrl;
        }
        else{
          this.selectedImage = this.defailtImage;
        }
        console.log(userdata);
      }
    
    });
  }

  onSubmitForm(){
    if (!this.driverForm.get("image").value) {
      return;
    }
    this.loadingCtrl
      .create({
        message: "Uploading drive data...",
      })
      .then((loadingEl) => {
        loadingEl.present();
        this.driverSvr
          .uploadImage(this.driverForm.get("image").value,this.user.userId)
          .pipe(
            switchMap((uploadRes) => {
              if (uploadRes) {
                // this.user.imageUrl = uploadRes;
                // this.selectedImage = uploadRes;
                let formData: any = this.driverForm.value as {};
                let driver:any = {};
                driver.uid = this.user.userId;
                driver.driverName =  formData.driverName;
                driver.carYear =  formData.carYear;
                driver.licencesPlate=  formData.licencesPlate;
                driver.carType =  formData.carType;
                driver.carPhotopath =  uploadRes;
                driver.profileImgUrl = this.selectedImage;
                driver.entryDate = new Date();
         
                return this.driverSvr.registerDriver(driver).then((res)=>{
                  console.log(res);
                  this.isRegistered = true;
                  loadingEl.dismiss();
                }, 
                (err)=>{
                  this.isRegistered = false;
                  console.log(err);
                  loadingEl.dismiss();
                });
              }
            })
          )
          .subscribe(() => {
            loadingEl.dismiss();
          });
      });
    console.log(this.driverForm.value)
  }

  onImagePicked(imageData: string | File) {
    let imageFile;
    if (typeof imageData === "string") {
      try {
        imageFile = base64toBlob(
          imageData.replace("data:image/jpeg;base64,", ""),
          "image/jpeg"
        );
        //this.selectedImage = "data:image/jpeg;base64, " + imageData;
      } catch (error) {
        console.log(error);
        return;
      }
    } else {
      imageFile = imageData;
    }
    this.driverForm.patchValue({ image: imageFile });
  }
  
}
