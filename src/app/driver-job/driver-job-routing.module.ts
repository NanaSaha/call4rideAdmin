import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DriverJobPage } from './driver-job.page';

const routes: Routes = [
  {
    path: '',
    component: DriverJobPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DriverJobPageRoutingModule {}
