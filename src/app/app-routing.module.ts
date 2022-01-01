import { AuthGuard } from "./auth/auth.guard";
import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { PhoneVerificationGuard } from "./services/phone-verification.guard";

const routes: Routes = [
  {
    path: "",
    redirectTo: "ride-requests",
    pathMatch: "full",
  },

  {
    path: "setup",
    loadChildren: () =>
      import("./setup/setup.module").then((m) => m.SetupPageModule),
  },
  {
    path: "quote",
    loadChildren: () =>
      import("./quote/quote.module").then((m) => m.QuotePageModule),
    canLoad: [AuthGuard],
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
    path: "driver-registration",
    loadChildren: () =>
      import("./driver-registration/driver-registration.module").then(
        (m) => m.DriverRegistrationPageModule
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
    path: "entrance",
    loadChildren: () =>
      import("./entrance/entrance.module").then((m) => m.EntrancePageModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
