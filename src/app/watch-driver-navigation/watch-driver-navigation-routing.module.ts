import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WatchDriverNavigationPage } from './watch-driver-navigation.page';

const routes: Routes = [
  {
    path: '',
    component: WatchDriverNavigationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WatchDriverNavigationPageRoutingModule {}
