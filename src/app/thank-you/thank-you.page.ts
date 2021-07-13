import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-thank-you',
  templateUrl: './thank-you.page.html',
  styleUrls: ['./thank-you.page.scss'],
})
export class ThankYouPage implements OnInit {
  data: any;
  riderName: string;

  constructor(private activatedRoute: ActivatedRoute,) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params && params.location) {
        this.data = JSON.parse(params.location);
        if (this.data != null) {
         this.riderName = this.data.customer.fullName;
        }
      }
    });
  }

}
