import { AuthGuard } from "./auth/auth.guard";
import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { PhoneVerificationGuard } from "./services/phone-verification.guard";

const routes: Routes = [
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full",
  },
  {
    path: "home",
    loadChildren: () =>
      import("./home/home.module").then((m) => m.HomePageModule),
    canLoad: [AuthGuard],
  },
  {
    path: "setup",
    loadChildren: () =>
      import("./setup/setup.module").then((m) => m.SetupPageModule),
  },
  {
    path: "auth",
    loadChildren: () =>
      import("./auth/auth.module").then((m) => m.AuthPageModule),
  },
  {
    path: "profile",
    loadChildren: () =>
      import("./profile/profile.module").then((m) => m.ProfilePageModule),
    canLoad: [AuthGuard],
  },
  {
    path: "settings",
    loadChildren: () =>
      import("./settings/settings.module").then((m) => m.SettingsPageModule),
    canLoad: [AuthGuard],
  },
  {
    path: "quote",
    loadChildren: () =>
      import("./quote/quote.module").then((m) => m.QuotePageModule),
    canLoad: [AuthGuard],
  },
  {
    path: "ride-requests",
    loadChildren: () =>
      import("./ride-requests/ride-requests.module").then(
        (m) => m.RideRequestsPageModule
      ),
    canLoad: [AuthGuard],
  },
  {
    path: "phone-signin",
    loadChildren: () =>
      import("./phone-signin/phone-signin.module").then(
        (m) => m.PhoneSigninPageModule
      ),
  },
  {
    path: "thank-you",
    loadChildren: () =>
      import("./thank-you/thank-you.module").then((m) => m.ThankYouPageModule),
  },
  {
    path: "user",
    loadChildren: () =>
      import("./user/user.module").then((m) => m.UserPageModule),
  },
  {
    path: "driver",
    loadChildren: () =>
      import("./driver/driver.module").then((m) => m.DriverPageModule),
  },
  {
    path: "job",
    loadChildren: () => import("./job/job.module").then((m) => m.JobPageModule),
  },
  {
    path: "driver-registration",
    loadChildren: () =>
      import("./driver-registration/driver-registration.module").then(
        (m) => m.DriverRegistrationPageModule
      ),
  },
  {
    path: "driver-job",
    loadChildren: () =>
      import("./driver-job/driver-job.module").then(
        (m) => m.DriverJobPageModule
      ),
  },
  {
    path: "rider-pickup",
    loadChildren: () =>
      import("./rider-pickup/rider-pickup.module").then(
        (m) => m.RiderPickupPageModule
      ),
  },
  {
    path: "driver-navigation",
    loadChildren: () =>
      import("./driver-navigation/driver-navigation.module").then(
        (m) => m.DriverNavigationPageModule
      ),
  },
  {
    path: "watch-driver-navigation",
    loadChildren: () =>
      import("./watch-driver-navigation/watch-driver-navigation.module").then(
        (m) => m.WatchDriverNavigationPageModule
      ),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
