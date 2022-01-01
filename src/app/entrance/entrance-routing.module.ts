import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EntrancePage } from './entrance.page';

const routes: Routes = [
  {
    path: '',
    component: EntrancePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EntrancePageRoutingModule {}
