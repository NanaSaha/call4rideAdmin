import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DriverDashboardPage } from './driver-dashboard.page';

const routes: Routes = [
  {
    path: '',
    component: DriverDashboardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DriverDashboardPageRoutingModule {}
