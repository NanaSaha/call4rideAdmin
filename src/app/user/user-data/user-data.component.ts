import { Component, Input, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-user-data',
  templateUrl: './user-data.component.html',
  styleUrls: ['./user-data.component.scss'],
})
export class UserDataComponent implements OnInit {

  @Input('userdata')userdata:any
  constructor(private toastCtrl:ToastController) { }

  ngOnInit() {
    console.log(this.userdata);
  }

}
