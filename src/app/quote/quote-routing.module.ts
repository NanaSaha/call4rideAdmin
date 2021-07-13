import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QuotePage } from './quote.page';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: QuotePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuotePageRoutingModule {}
