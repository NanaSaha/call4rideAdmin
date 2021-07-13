import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RideRequestsPage } from './ride-requests.page';

const routes: Routes = [
  {
    path: '',
    component: RideRequestsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RideRequestsPageRoutingModule {}
