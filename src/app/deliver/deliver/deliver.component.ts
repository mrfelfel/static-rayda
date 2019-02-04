import { Component, OnInit , OnDestroy, Inject} from '@angular/core';
import Push from 'push.js';
import {SnaksService} from '../../snaks.service';
import {Router} from '@angular/router';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import * as io from 'socket.io-client';
import {CardsService} from '../../@core/cards.service';
import {BookingService} from '../../@core/self/booking.service';
import * as moment from 'jalali-moment';
import * as _ from 'lodash';
import {ServerService} from '../../@core/server.service';
import { XlsxService } from '../../@core/xlsx.service';
import {UniversityService} from '../../@core/university.service';
@Component({
  selector: 'app-home',
  templateUrl: './deliver.component.html',
  styleUrls: ['./deliver.component.scss']
})
export class DeliverComponent implements OnInit, OnDestroy {

  // tslint:disable-next-line:max-line-length
  constructor(private dialog: MatDialog, private snaks: SnaksService, private cards: CardsService, private booking: BookingService, private excelService: XlsxService, private http: ServerService , private router: Router, private universityMessage: UniversityService) { }
  socket: SocketIOClient.Socket;

  SelectedDate = {
     week : moment().jWeek(),
     year : moment().jYear(),
     dow  :  Number(moment().jDay())
  };
  code_meli = null;
  Sum = 0;
  Mode = 'deliver';
  All = 0;
  card_number = null;
  delivered = [];
  OfflineDelivered = [];
  UserList = [];
  mealList = null;
  selectedMeal = null;
  num = 52;
  Plus = 1;
  days = [
    'شنبه',
    'یکشنبه',
    'دوشنبه',
    'سه شنبه',
    'چهار شنبه',
    'پنجشنبه',
    'جمعه'
  ];
  viewSetting = false;
  foodDeliver = true;
  MELI = false;

  ngOnInit() {
    this.socket = io('http://localhost:1591');
    console.log(this.SelectedDate);
    this.socket.on('card-inserted', (data) => {
      if (data.startsWith('3b868001f0')) {
         data = data.replace('3b868001f0', '');
         console.log(data);
      }
      if (data.startsWith('3bf99100ff9181713c40000a80')) {
        data = data.replace('3bf99100ff9181713c40000a80', '');
        data = data.slice(0, -2);
      }
      this.card_number = data.toUpperCase();
      this.code_meli = null;
      this.Deliver();
    });
    this.booking.GetMeals(localStorage.Uni).then((d) => {
      this.mealList = d.json().meals;
      this.selectedMeal = this.mealList[0].ID;
      this.GetReportsByDow();
    });
    this.universityMessage.getMessage().subscribe(() => {
      this.booking.GetMeals(localStorage.Uni).then((d) => {
        this.mealList = d.json().meals;
        this.selectedMeal = this.mealList[0].ID;
        this.GetReportsByDow();
      });
    });



  }
  Deliver() {
    if (!this.foodDeliver) {
            return;
    }
    let data = '';
    if (this.code_meli) {
      data = this.code_meli;
    } else {
      data = this.card_number;
    }
    if ((this.code_meli)  && (this.card_number)) {
            data = this.code_meli;
    }
    console.log(this.selectedMeal);
    this.cards.GetByCard(localStorage.getItem('Uni'), data, this.selectedMeal,
     this.SelectedDate.week, this.SelectedDate.dow).toPromise().then((d) => {
     this.Sum++;
     // tslint:disable-next-line:max-line-length
     localStorage.setItem('sum-' + this.selectedMeal +  moment().jYear().toString() +  this.SelectedDate.week.toString()  + this.SelectedDate.dow.toString() , this.Sum.toString());
     this.delivered.push(  d.json().profile.Name + ' ' + d.json().profile.Family);
     this.delivered.reverse();
     this.code_meli = d.json().email;
     this.playAudio('finish.ogg');
     this.snaks.openSnackBar(' غذا تحویل شد ' + d.json().profile.Name + ' ' + d.json().profile.Family, 'بستن');
     Push.create('غذا تحویل شد' + d.json().profile.Name + ' ' + d.json().profile.Family, {
      body: 'غذا تحویل شد',
      icon: '/icon.png',
      timeout: 3000,
      onClick: function () {
          this.window.focus();
          this.close();
      }
    });
 })
 .catch((e) => {
   if (e.status === 0) {
     console.log(this.UserList);
     const v = this.UserList.find((item) => {
              if (item.email === data)  {
                  return true;
              }
              const result = _.find(item.card, {identify : data});
              if (result) {
                return true;
              }
     });
     if (v) {
      const finded = this.OfflineDelivered.find((olo) => {
        if (olo.user.email === v.email)  {
          return true;
        }
       });
       if (!finded) {
         const temp = {
           pdate : moment().format('hh:mm:ss'),
           user : v,
         };
        this.Sum++;
        this.OfflineDelivered.push(temp);
        localStorage.setItem('offline-delivered-' +
        this.selectedMeal +
           moment().jYear().toString()
         + this.SelectedDate.week.toString()
         + this.SelectedDate.dow.toString() ,
         JSON.stringify(this.OfflineDelivered));

        localStorage.setItem('sum-' +
         this.selectedMeal +
         moment().jYear().toString()
          +  this.SelectedDate.week.toString()  + this.SelectedDate.dow.toString() ,
         this.Sum.toString());
        this.delivered.push(  v.name + ' ' +  v.family);
        this.delivered.reverse();
        this.playAudio('finish.ogg');
        this.snaks.openSnackBar(' غذا تحویل شد ' + v.name + ' ' + v.family, 'بستن');
        Push.create('غذا تحویل شد' +  v.name  + ' ' +  v.family , {
         body: 'غذا تحویل شد',
         icon: '/icon.png',
         timeout: 3000,
         onClick: function () {
          this.window.focus();
          this.close();
          }
        });
       } else {
         const time = finded.pdate;
         this.snaks.snackBar.open(`کاربر غذای خود را در ${time} تحویل گرفته است`, 'بستن', {
         duration : 7000,
         });
         return;
       }
     }
      this.playAudio('error.ogg');
      this.snaks.openSnackBar('کاربر غذایی ندارد', 'بستن');
      return;
   }
   if (e.status === 409) {
    Push.create('تحویل گرفته است', {
      body: ` تحویل گرفته است`,
      icon: '/icon.png',
      timeout: 3000,
      onClick: function () {
          this.window.focus();
          this.close();
      }
    });
    const time = moment.unix(e.json().date).format('hh:mm:ss');
    this.playAudio('error.ogg');
    // e.json().date
    this.snaks.snackBar.open(`کاربر غذای خود را در ${time} تحویل گرفته است`, 'بستن', {
      duration : 7000,
    });
    return;
   }
   this.snaks.snackBar.open('کاربر غذایی رزرو نکرده است', 'بستن', {
    duration : 7000,
  });
   Push.create('رزرو نکرده است', {
    body: 'کاربر غذایی رزرو نکرده است',
    icon: '/icon.png',
    timeout: 3000,
    onClick: function () {
        this.window.focus();
        this.close();
    }
  });
   this.playAudio('error.ogg');
 });
 this.code_meli = null;
}
  DefineNewCard() {
    if ((this.code_meli) && (this.card_number)) {
      this.cards.DefineCard(localStorage.getItem('Uni'), {
        user : this.code_meli,
        card : {
          identify : this.card_number,
        },
  }).toPromise().then(() => {
    this.snaks.openSnackBar('کارت ثبت شد', 'بستن');
  }).catch((e) => {
           console.log(e);
  });
    } else {
      this.snaks.openSnackBar('ورود کد ملی و کارت اجباریست', 'بستن');
    }
  }
  RemoveCard() {
    if (this.card_number) {
      this.cards.RemoveCard(localStorage.getItem('Uni'), {
        card : {
          identify : this.card_number,
        },
  }).toPromise().then(() => {
    this.snaks.openSnackBar('کارت حذف شد', 'بستن');
  }).catch((e) => {
           console.log(e);
  });
    } else {
      this.snaks.openSnackBar('ورود کارت اجباری است', 'بستن');
    }
  }
  GetReportsByDow() {
    // reset
    this.ResetStatistics();
    this.booking.GetDeliveredByDow(localStorage.Uni, moment().jYear(), this.SelectedDate.week, this.SelectedDate.dow)
    .then((d) => {
      const delivered = [];
      d.json().map((item, index) => {
        if (item.meal === this.selectedMeal) {
            const m = {email : item.reports[0].email, card : item.reports[0].cards, place: item.place, name : item.reports[0].profile.Name,
              family : item.reports[0].profile.Family};
              delivered.push(m);

        }
     });
     if (delivered.length > 0) {
       delivered.forEach((item, index) => {
        this.delivered.push(  item.name + ' ' +  item.family);
       });

      this.Sum = delivered.length;
      this.delivered.reverse();
     }
    });
    this.booking.GetBookedByDow(localStorage.Uni, moment().jYear(), this.SelectedDate.week, this.SelectedDate.dow)
    .then((d) => {
      this.UserList = [];
     d.json().map((item, index) => {

        if (item.meal === this.selectedMeal) {
            const m = {email : item.reports[0].email, card : item.reports[0].cards, place: item.place, name : item.reports[0].profile.Name,
              family : item.reports[0].profile.Family};
              this.UserList.push(m);

        }
     });
     const SumString = localStorage.getItem(
      'sum-' + this.selectedMeal +
      moment().jYear().toString() +
      this.SelectedDate.week.toString() +
      this.SelectedDate.dow.toString()
      );

     if (SumString) {
      this.Sum = Number(SumString);
     }
     this.All = this.UserList.length;
      // offline
    const temp = localStorage.getItem('offline-delivered-' +
    this.selectedMeal +
    moment().jYear().toString()
  + this.SelectedDate.week.toString()
  + this.SelectedDate.dow.toString());
   if (temp) {
     this.OfflineDelivered =  JSON.parse(temp);
    }

    })
    .catch((e) => {
      if (e.status === 403) {
        this.router.navigate(['/']);
      }
    });
  }
  ResetStatistics() {
        this.delivered = [];
        this.Sum = 0;
        this.All = 0;
  }
  ExExport() {
    this.excelService.exportAsExcelFile(this.UserList, 'list');
  }
  ngOnDestroy() {
    this.socket.close();
  }
  ToggleSetting() {
    if (this.viewSetting) {
      this.viewSetting = false;
    } else {
      this.viewSetting = true;

    }
  }
  ToggleDeliver() {
    if (this.foodDeliver) {
      this.foodDeliver = false;
    } else {
      this.foodDeliver = true;

    }
  }
  playAudio(n) {
    const audio = new Audio();
    audio.src = '/assets/' + n;
    audio.load();
    audio.play();
  }
  Getmicro() {
    this.snaks.openSnackBar('به همگام شد', 'بستن');
  }
  openBuyDialog(): void {
    const nc = '';
    const cost = 0;
    const dialogRef = this.dialog.open(BuyDialog, {
      width: '270px',
      data: {national: nc, cost : cost}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
      if (result.national) {
        this.snaks.openSnackBar('در حال حاضر غیر فعال است', 'بستن');
      }
    });
  }
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'buy-dialog',
  templateUrl: './dialog.html',
})
// tslint:disable-next-line:component-class-suffix
export class BuyDialog {

  constructor(
    public dialogRef: MatDialogRef<BuyDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }


  onNoClick(): void {
    this.dialogRef.close();
  }

}


