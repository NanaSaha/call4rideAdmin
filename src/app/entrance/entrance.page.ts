import { Component, OnInit } from "@angular/core";
import { NavigationExtras, Router } from "@angular/router";
@Component({
  selector: "app-entrance",
  templateUrl: "./entrance.page.html",
  styleUrls: ["./entrance.page.scss"],
})
export class EntrancePage implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {}

  GotoLogin() {
    this.router.navigateByUrl("/auth");
  }

  GotoSignup() {
    this.router.navigateByUrl("/setup");
  }
}
