import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-show-profile',
  templateUrl: './show-profile.component.html',
  styleUrls: ['./show-profile.component.scss']
})
export class ShowProfileComponent implements OnInit {

  constructor() { }
  d = {
    password : '',
    new_password : '',

  };
    ngOnInit() {
  }

}
