import { Component, OnInit } from '@angular/core';
export interface PeriodicElement {
  id: number;
  description: string;
  amount: number;
  type: string;
  issuer: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {id: 1, description: 'تراکنش خالی', amount: 1, issuer: 'سلف', type : 'UP'},
  {id: 2, description: 'تراکنش خالی', amount: 2, issuer: 'بانک', type : 'UP'},

];
@Component({
  selector: 'app-finslist',
  templateUrl: './finslist.component.html',
  styleUrls: ['./finslist.component.scss']
})
export class FinslistComponent implements OnInit {
  displayedColumns: string[] = [ 'description', 'amount', 'issuer'];
  dataSource = ELEMENT_DATA;
  constructor() { }
  showLabels = true;
  view: any[] = [300, 300];
  explodeSlices = false;
  doughnut = true;
  colorScheme = {
    domain: ['#3f51b5', '#f44336']
  };
  public single = [
    {
      'name': 'پرداختی',
      'value': 2
    },
    {
      'name': 'مصرفی',
      'value': 1
    }
  ];
  ngOnInit() {
  }

}
