import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DriverJobPageRoutingModule } from './driver-job-routing.module';

import { DriverJobPage } from './driver-job.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DriverJobPageRoutingModule
  ],
  declarations: [DriverJobPage]
})
export class DriverJobPageModule {}
