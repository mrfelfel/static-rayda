import { Component, OnInit } from '@angular/core';
import {ServerService} from '../../@core/server.service';
import {Router} from '@angular/router';
import {AuthService} from '../../@core/auth.service';
import { environment } from '../../../environments/environment';
// tslint:disable-next-line:class-name
interface university {
  name: string;
  id: string;
}
interface UserTypes {
  name: string;
  ID: string;
}
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  providers : [AuthService]
})
export class RegisterComponent implements OnInit {

  constructor(public Auth: AuthService, private router: Router, private server: ServerService) {
    if (this.Auth.IsLoggedIn()) {this.router.navigate(['/']); }
  }
  base_url = environment.Endpoint;
  utypes: UserTypes[] = [{
     name : 'پذیرفته شده',
     ID : 'ik',
  },
  {
    name : 'ورودی جدید',
    ID : 'nik',
 }];

  userNationalcode = '';
  EmployeeNumber = '';
  univeristy = null;
  uniin: university;
  finded = false;
  err = '';
  level_one = false;
  UserLevel = 0;
  password = '';
  rpassword = '';
  UserDetailsObject = {
    EmployeeNumber : '',
    Name : '',
    Family : '',
    Father : ' ',
    IDNumber : '',
    BirthPlace : '',
    Sadere : '',
    BirthDate : '',
    Sex : '',
    Married : '',
    Address_Home : '',
    HomePostalCode : '',
    MobileNum : '',
    EMail : '',
    SemesterEntry : ''

  };
  ngOnInit() {
  }
  FindUser() {
    this.server.get(this.base_url + 'UserByEmployeeNumber?emp=' + this.EmployeeNumber + '&id=' + this.userNationalcode)
    .toPromise().then((d) => {
      this.UserDetailsObject = d.json();
      this.UserLevel = 1;
    })
    .catch((e) => {
      if (e.status === 404) {
        this.err = 'خطا شماره دانشجویی صحیح نیست';
      }
      setTimeout(() => {
        this.err = '';
      }, 3000);
    });
  }
  SubmitInformation() {
    if (this.password === '') {
      this.err = 'کلمه عبور نمیتواند خالی باشد';
      return;
    }
    if (this.password.length < 8) {
      this.err = 'کلمه عبور حداقل باید ۸ رقمی باشد';
      return;
    }
     if (this.password !== this.rpassword) {
       this.err = 'کلمه عبور با تکرار آن مطابقت ندارد';
       return;
     }
    const SignUp = {
      NationalCode : this.userNationalcode,
      EmployeeNumber : this.EmployeeNumber,
      Password       : this.password,
      MobileNum      : this.UserDetailsObject.MobileNum,
      BirthDate      : this.UserDetailsObject.BirthDate,
      Address_Home   : this.UserDetailsObject.Address_Home,
      Sadere         : this.UserDetailsObject.Sadere,
      BirthPlace     : this.UserDetailsObject.BirthPlace,
    };

  this.server.post(this.base_url + 'register', SignUp).toPromise()
  .then((d) => {
    console.log(d);
    this.UserLevel = 3;
  })
  .catch((e) => {
    if (e.status === 400) {
      this.err = 'لطفا کلمه عبور را خالی رها نکنید';
      setTimeout(() => {
        this.err = '';
      }, 3000);
    }


  });

  }
  checkInput() {
    if (this.userNationalcode.length === 10) {
      this.server.get(this.base_url + 'UniverByNationalCode?id=' + this.userNationalcode)
      .toPromise().then((d) => {
        this.univeristy = d.json();
        console.log(this.univeristy);
        this.uniin = this.univeristy['university'];
        this.finded = true;
        this.level_one = true;
        this.err = '';
        console.log(this.uniin);
      })
      .catch((e) => {
        this.finded = false;
        this.level_one = false;
        if (e.status === 404) {
          this.err = 'این کد ملی وجود ندارد';
        }
        if (e.status === 302) {
          this.err = 'قبلا ثبت نام کرده است';
        }
        if (e.status === 500) {

          this.err = 'سرور دچار خطا میباشد - لطفا بعدا تلاش کنید';
        }
        if (e.status === 0) {

          this.err = 'عدم برقراری ارتباط - لطفا اتصال به اینترنت را بررسی کنید';
        }
      });
    } else {
      this.level_one = false;
      this.finded = false;
    }
  }
}
