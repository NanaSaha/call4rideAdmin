import { AuthService } from "./auth.service";
import { Injectable } from "@angular/core";
import { CanLoad, Route, Router } from "@angular/router";
import { Observable, of } from "rxjs";
import { take, tap, switchMap } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanLoad {
  /**
   *
   */
  constructor(private authSer: AuthService, private router: Router) {}
  canLoad(
    route: Route,
    segments: import("@angular/router").UrlSegment[]
  ): boolean | Observable<boolean> | Promise<boolean> {
    return this.authSer.userIsAuthenticated.pipe(
      take(1),
      switchMap((isAuthenticated) => {
        if (!isAuthenticated) {
          return this.authSer.autoLogin();
        } else {
          return of(isAuthenticated);
        }
      }),
      tap((isAuthenticated) => {
        if (!isAuthenticated) {
          this.router.navigateByUrl("/auth");
        }
      })
    );
  }
}
