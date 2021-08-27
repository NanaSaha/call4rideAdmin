import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DriverDashboardPageRoutingModule } from './driver-dashboard-routing.module';

import { DriverDashboardPage } from './driver-dashboard.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DriverDashboardPageRoutingModule
  ],
  declarations: [DriverDashboardPage]
})
export class DriverDashboardPageModule {}
