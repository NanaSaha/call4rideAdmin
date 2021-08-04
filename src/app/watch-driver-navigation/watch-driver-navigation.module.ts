import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WatchDriverNavigationPageRoutingModule } from './watch-driver-navigation-routing.module';

import { WatchDriverNavigationPage } from './watch-driver-navigation.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WatchDriverNavigationPageRoutingModule
  ],
  declarations: [WatchDriverNavigationPage]
})
export class WatchDriverNavigationPageModule {}
