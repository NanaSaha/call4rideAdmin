import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { DriverNavigationPageRoutingModule } from "./driver-navigation-routing.module";

import { DriverNavigationPage } from "./driver-navigation.page";
import { IonicSelectableModule } from "ionic-selectable";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    DriverNavigationPageRoutingModule,
    IonicSelectableModule,
  ],
  declarations: [DriverNavigationPage],
})
export class DriverNavigationPageModule {}
