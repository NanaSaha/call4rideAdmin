import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PhoneSigninPage } from './phone-signin.page';

const routes: Routes = [
  {
    path: '',
    component: PhoneSigninPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PhoneSigninPageRoutingModule {}
