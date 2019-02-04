import { Component, OnInit, ViewChild, Inject, OnDestroy } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {BookingService} from '../../@core/self/booking.service';
import {JwtService} from '../../@core/jwt.service';
import {TimeService} from '../../time.service';
import {SnaksService} from '../../snaks.service';
import {ServerService} from '../../@core/server.service';
import {UniversityService} from '../../@core/university.service';

import * as moment from 'jalali-moment';
import * as _ from 'lodash';
interface FoodData {
  dow:  Number;
  ID:   string;
  week: Number;
  year: Number;
  reserve: Boolean;
  meal: string;
  food: string;
  self: string;
  place: string;
}
interface Reservation {
  dow:  Number;
  week: Number;
  year: Number;
  meal: string;
  food: string;
  self: string;
  place: string;
}
@Component({
  selector: 'app-foods',
  templateUrl: './foods-list.component.html',
  styleUrls: ['./foods-list.component.scss'],
  providers : [BookingService, JwtService, TimeService]
})
export class FoodsListComponent implements OnInit, OnDestroy {
   constructor( private snaks: SnaksService,
     public dialog: MatDialog,
     private booking: BookingService,
     private jwt: JwtService,
     private time: TimeService,
     private Server: ServerService,
     private university: UniversityService,
     ) {}
  @ViewChild('tabGroup') tabGroup;
  Gweeknum = moment().isoWeek();
  TestWeek = moment('1398/1/1', 'jYYYY/jM/jD').jWeek();
  weekNum = moment().jWeek();
  days =  [];
  t = null;
  self = '';
  ft = {y : 0, w : 0};
  selfList = null;
  foodList = [];
  mealList = null;
  showInter = true;
  firstDw: {};
  errMsg = '';
  Sche = null;
  loadmessage = '';
  my = {
    cost : 0,
    sum : 0,
  };
  show_dis = false;
  SelectedDow = 0;
  reserved: Reservation[] = [];
  favs = [];
  myGroup = '';
  User = {
    balance : '',
    email : '',
  };

 cost: string;
 transferNational: string;
 name: string;
 storageEvent = null;
 // TODO : DELIVERSystem from server
 DeliverPlace = [
    {
      ID : 'main',
      name : 'سلف مرکزی',
    },
    {
      ID : 'amiralmomenin',
      name : 'خوابگاه امیر المومنین',
    },
    {
      ID : 'mashinsazi',
      name : 'خوابگاه ماشین سازی',
    }
 ];
  formatLabel(value: number | null) {
    return 'ه ' + value;
  }
  formatLabel2(value: number | null) {
    return  'ع ' + value;
  }
  public tabChanged(tabChangeEvent: MatTabChangeEvent): void {

  }
  ngOnInit() {
    this.Init();
    const self = this;
    this.university.getMessage().subscribe(() => {
      // console.log('hi from uni event');
      this.weekNum = moment().jWeek();
      self.Init();
    });

  }
  ngOnDestroy() {
  }
  Init() {
    this.weekNum++;
    this.ft = {w : this.weekNum, y : moment().jYear()};
    this.GetSelfLits();
    this.SelfData();
    this.jwt.GetUser().then((d) => {
      this.User = d['user'];
      this.my.cost = Number(this.User.balance);
      localStorage.setItem('user-det', JSON.stringify(this.User));
    });
    this.booking.GetMyGroup(localStorage.Uni)
    .then((d) => {
      this.myGroup = d.json();
    });
      if (localStorage.getItem('reserved-food')) {
        this.reserved = JSON.parse(localStorage.getItem('reserved-food'));
      }
    this.booking.GetBooking(localStorage.Uni).then((d) => {
    this.reserved = d.json();
    });
    this.days = [
      'شنبه',
      'یکشنبه',
      'دوشنبه',
      'سه شنبه',
      'چهار شنبه',
      'پنجشنبه',
      'جمعه'
    ];
  }
  GetSelfLits() {
    this.booking.GetSelfsList(localStorage.Uni).then((d) => {
    this.selfList = d.json();
    this.self = this.selfList[0].ID;
    this.showInter = true;
    })
    .catch((e) => {
      if (e.status === 404) {
        this.showInter = false;
        this.errMsg = 'هیچ سلفی برای این دانشگاه تعریف نشده است';
        return;
      } else {
        this.showInter = false;
        this.errMsg = 'خطای نرم افزار ! صفحه را مجددا بارگیری کنید';
        return;
      }
    });
  }
 // get food schedule by week d
 ListOfFood(num) {
   if (this.Sche.days) {
    const m = _.filter(this.Sche.days, {weekDay : num});
    return m;
   }
    return null;
 }

 FindMealByID(ID) {
   // //console.log(ID)
   const meal = _.find(this.mealList, {ID : ID});
   return meal;
 }
 FindFoodByID(ID) {
   const food = _.find(this.foodList, {ID : ID});
   return food;
 }
 FindPriceByMethod(food, meal) {
   if (this.Sche.calculateMethod === 'meal') {
     const ml: any = _.find(meal.config.prices, {group_id : this.myGroup});
     if (ml) {return ml.price; } else {return 0; }
   }
   return 0;
 }
 SelfData(): void {
   this.foodList = [];
   this.mealList = [];
   this.Sche = null;
   this.loadmessage = 'loading';
   this.firstDw = this.time.firstDayOfWeek(this.weekNum);
   this.booking.GetFoods(localStorage.Uni).then((d) => {
         this.foodList = d.json().foods;
          // console.log(this.foodList)
   });
   this.booking.GetMeals(localStorage.Uni).then((d) => {
         this.mealList = d.json().meals;
         // //console.log(this.mealList)

   });
   this.booking.GetSchedule(localStorage.Uni, this.ft.w, this.ft.y)
   .then((d) => {
    const list = d.json()['self'];
    if (list === this.self) {
      this.Sche = d.json();
    } else {
      this.loadmessage = 'notfound';
      this.Sche = false;
    }
   })
   .catch((e) => {
     this.loadmessage = 'notfound';
     this.Sche = false;
   });
 }
 SetWeek(p): void {
   if (p === 'next') {
          this.weekNum++;
   } else if (p === 'previous') {
    this.weekNum--;
   } else if (p === 'current') {
    this.weekNum = moment().jWeek();
   }
   this.ft = {w : this.weekNum, y : moment().jYear()};
   this.SelfData();
 }
 // get week d unix time
 GetUnixTime() {
 return moment().unix();
 }
 DayWeekPlusPlus(y, m, d, dp) {
   const mome = moment(y + '/' + m + '/' + d, 'jYYYY/jM/jD');
   const result = moment.unix(mome.unix() + dp * 86400);

   /* let f = d+ dp
   if(f> mome.endOf("jMonth").jDates()){
        m++
        f = f - mome.endOf("jMonth").jDates()
   }else{
     f = d+dp
   }
   if(m > 12){
     m = 1
     y++
   }*/
   return result;
 }

getDateOfISOWeek(w, y) {
  const d = (1 + (w - 1) * 7); // 1st of January + 7 days for each week

   const simple =  new Date(y, 1, d);
   return {y : simple.getFullYear() , m : simple.getMonth(), d : simple.getDate()};
}
  openDialog(): void {
    const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      width: '250px',
      data: {cost: this.cost }
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was closed');
      this.cost = result;
      if (Number(this.cost) < 1000) {
        this.snaks.openSnackBar('خطا مبلغ ورودی حداقل باید 1000 ریال باشد', 'بستن');
         return;
      }
      if (this.cost) {
        this.snaks.snackBar.open('در حال اتصال به بانک ...', 'بستن', {
          duration : 60000,
        });
      // tslint:disable-next-line:max-line-length
      this.Server.get(`https://payment.rayda.ir/pay/${JSON.parse(localStorage.getItem('user-det')).email}/${this.cost}`)      .toPromise()
      .then((d) => {
        window.location.href = d.json()['message'];
      })
      .catch((e) => {
        this.snaks.openSnackBar(e.json()['message'], 'بستن');
      });
    }
    });
  }
  openSellDialog(item): void {
    const dialogRef = this.dialog.open(SellDialog, {
      width: '27 0px',
      data: {selected: item}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
    });
  }
  openTransferDialog(): void {
    const dialogRef = this.dialog.open(TransferDialog, {
      width: '250px',
      data: {cost: this.cost, national : this.transferNational }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.cost = result;
      if (Number(this.cost) < 1) {
        this.snaks.openSnackBar('خطا مبلغ ورودی حداقل باید 1 ریال باشد', 'بستن');
         return;
      }
      if (this.cost) {
        this.snaks.openSnackBar('سیستم انتقال در حال حاضر غیر فعال است', 'بستن');

      }
    });
  }
  book(item, d, w, o, price, time) {
    if (!(time / 3600 >= this.Sche.config.booking_time)) {
      this.snaks.openSnackBar('زمان مجاز برای رزرو / لغو وعده تمام شده است', 'بستن');
      return;
    }
    if (!item.place) {
      item.place = this.DeliverPlace[0].ID;
    }
    const food = _.find(this.foodList, {ID : item.food});
    if (food) {
    food.reserve = true;
    food.dow = d;
    food.week = w;
    food.meal = item.meal;
    if (o) {
      if (this.my.cost >= Number(price)) {
        this.snaks.openSnackBar('در حال رزرو ...', 'بستن');
        console.log(item.place);
        this.booking.FoodBooking(localStorage.getItem('Uni'), {
          meal : item.meal,
          food : item.food,
          self : this.self,
          dow : d,
          week : this.weekNum,
          year : this.ft.y,
          place : item.place,
        })
        .then(() => {
          this.jwt.GetUser().then((di) => {
            this.User = di['user'];
            this.my.cost = Number(this.User.balance);
            this.reserved.push({
              meal : item.meal,
              self : this.self,
              food : item.food,
              dow : d,
              week : this.weekNum,
              year : this.ft.y,
              place : item.place,
            });
            localStorage.setItem('reserved-food', JSON.stringify(this.reserved));
            localStorage.setItem('user-det', JSON.stringify(this.User));
            this.snaks.openSnackBar('رزرو شد', 'بستن');
          });
        })
        .catch((e) => {
          if (e.status === 0) {
            this.snaks.openSnackBar('اتصال به اینترنت بر قرار نیست', 'بستن');
            return;
          }
          this.snaks.openSnackBar('یک خطای پیش بینی نشده وجود دارد', 'بستن');
        });
      } else {
        this.snaks.openSnackBar('عدم موجودی کافی', 'بستن');
      }
    } else {
      this.snaks.openSnackBar('در حال لغو', 'بستن');

      this.booking.FoodUnBooking(localStorage.getItem('Uni'), {
        meal : item.meal,
        food : item.food,
        dow : d,
        week : this.weekNum,
        year : this.ft.y,
      }).toPromise().then(() => {
          this.my.cost = this.my.cost + Number(price);
          this.my.sum = this.my.sum - Number(price);
          _.remove(this.reserved, {
            dow : food.dow,
            week : food.week,
            year : this.ft.y,
            meal : food.meal,
            food : item.food,
          });
          localStorage.setItem('reserved-food', JSON.stringify(this.reserved));
          this.snaks.openSnackBar('غذای رزرو شده لغو شد', 'بستن');
      })
      .catch((e) => {
        if (e.status === 0) {
          this.snaks.openSnackBar('اتصال به اینترنت بر قرار نیست', 'بستن');
          return;
        }
        this.snaks.openSnackBar('یک خطای پیش بینی نشده وجود دارد', 'بستن');
      });

    }
  }
  }

  favobutton(item, d) {
    if (d) {
      this.favs.push({
        ID : item,
      });
    } else {
      _.remove(this.favs, {
        ID : item,
      });
    }
  }
  checkfav(item) {
    const m = _.find(this.favs, {ID : item});
    if (m) {
      return true;
    } else {
      return false;
    }
  }
  checkBook(item, d, w) {
    // console.log({food : item.food, dow : d, week : w, meal : item.meal})
    const food = _.find(this.reserved, {food : item.food, dow : d, week : w, meal : item.meal});
    if (food) {
      return true;
    } else {
      return false;
    }
  }

}



@Component({
  // tslint:disable-next-line:component-selector
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'dialog.html',
})
// tslint:disable-next-line:component-class-suffix
export class DialogOverviewExampleDialog {

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'transfer-dialog',
  templateUrl: 'transfer.html',
})
// tslint:disable-next-line:component-class-suffix
export class TransferDialog {

  constructor(
    public dialogRef: MatDialogRef<TransferDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'sell-dialog',
  templateUrl: 'sell.html',
})
// tslint:disable-next-line:component-class-suffix
export class SellDialog {

  constructor(
    public dialogRef: MatDialogRef<SellDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}

