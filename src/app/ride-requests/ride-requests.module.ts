import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RideRequestsPageRoutingModule } from './ride-requests-routing.module';

import { RideRequestsPage } from './ride-requests.page';
import { RequestComponent } from './request/request.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RideRequestsPageRoutingModule
  ],
  declarations: [RideRequestsPage,RequestComponent]
})
export class RideRequestsPageModule {}
