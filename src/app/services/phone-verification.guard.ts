import { Injectable } from '@angular/core';
import { CanActivate, CanLoad, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Device } from '@capacitor/core';
import { Observable, of } from 'rxjs';
import { take, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { DeviceService } from "../services/device.service";
import { StoreService } from './store.service';

@Injectable({
  providedIn: 'root'
})
export class PhoneVerificationGuard implements CanActivate, CanLoad {
  deviceUuid: string;

  constructor(private authSer: AuthService, 
    private router: Router, 
    private _DeviceService:DeviceService,
    private _StoreService: StoreService)
  {
   
  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true;
  }
  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
            const result:any = this.getDeviceInfo();
            if(result !== null && result !== undefined)
            {

                 return this._DeviceService.iSDeviceRegistered(result.uuid).pipe(
            take(1),
            switchMap((devicedbInfo) => {
              if(devicedbInfo === null || devicedbInfo === undefined )
              {
                return of(true);
              }
               this.router.navigateByUrl("/auth");
            }))
             
       
            }
           
      
      //  return this._DeviceService.iSDeviceRegistered("1234").pipe(
      //       take(1),
      //       switchMap((devicedbInfo) => {
      //         if(devicedbInfo === null || devicedbInfo === undefined )
      //         {
      //           return of(true);
      //         }
      //          this.router.navigateByUrl("/auth");
      //       }))



      // this._DeviceService.getDeviceInfo().then((device)=>{
         
          //  this._DeviceService.iSDeviceRegistered(device.uuid).subscribe((deviceDb)=>{
          //     if(deviceDb !== null)
          //     {
          //       this.router.navigateByUrl("/auth");
          //     }

          //      return true;
          //  },(err)=>{

          //  })
        
      //},(err)=>console.log);
    // return this.authSer.userIsAuthenticated.pipe(
    //   take(1),
    //   switchMap((isAuthenticated) => {
    //     if (!isAuthenticated) {
    //       return this.authSer.autoLogin();
    //     } else {
    //       return of(isAuthenticated);
    //     }
    //   }),
    //   tap((isAuthenticated) => {
    //     if (!isAuthenticated) {
    //       this.router.navigateByUrl("/auth");
    //     }
    //   })
    // );

   
  }

  async getDeviceInfo()
  {
    const Deviceinfo = await Device.getInfo();
    return Deviceinfo;
  }
}
