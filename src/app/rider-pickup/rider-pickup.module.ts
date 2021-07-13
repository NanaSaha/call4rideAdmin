import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RiderPickupPageRoutingModule } from './rider-pickup-routing.module';

import { RiderPickupPage } from './rider-pickup.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RiderPickupPageRoutingModule
  ],
  declarations: [RiderPickupPage]
})
export class RiderPickupPageModule {}
