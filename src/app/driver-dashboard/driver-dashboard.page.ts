import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-driver-dashboard",
  templateUrl: "./driver-dashboard.page.html",
  styleUrls: ["./driver-dashboard.page.scss"],
})
export class DriverDashboardPage implements OnInit {
  online;
  goOn: boolean = false;
  constructor() {}

  ngOnInit() {}

  myChange($event) {
    this.online = !this.online;
    console.log("online", this.online);
  }

  onToggleBtnChange(event): void {
    const isChecked = this.online;

    if (isChecked == true) {
      this.goOn = true;
      console.log(this.goOn);
    } else {
      this.goOn = false;
      console.log(this.goOn);
    }
  }
}
