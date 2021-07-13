import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PhoneSigninPageRoutingModule } from './phone-signin-routing.module';

import { PhoneSigninPage } from './phone-signin.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PhoneSigninPageRoutingModule
  ],
  declarations: [PhoneSigninPage]
})
export class PhoneSigninPageModule {}
