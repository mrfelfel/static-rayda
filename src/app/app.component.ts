import { SwUpdate, SwPush } from '@angular/service-worker';
import { Component, ChangeDetectorRef, OnInit, OnDestroy , Inject} from '@angular/core';
import {Router} from '@angular/router';
import {MediaMatcher} from '@angular/cdk/layout';
import Soso from 'soso-client';
import { environment } from './../environments/environment';
import {SnaksService} from './snaks.service';
import {JwtService} from './@core/jwt.service';
import {AuthService} from './@core/auth.service';
import {UniversityService} from './@core/university.service';
import { Http } from '@angular/http';
const VAPID_PUBLIC = 'BBKGyirh1hsZa-hXc6pC2oqY03a7RwtpJ762j5Gn5DPmu1Yt_UrurFdRO5chj9pKpd1pSz1wGHgSFGDZKHceCrs';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers : [UniversityService]

})
export class AppComponent implements OnInit, OnDestroy {

  clientVersion = '0.4.9.99';
  selectedUni =  '';
// tslint:disable-next-line:max-line-length
constructor(private http: Http, private swUpdate: SwUpdate, private swPush: SwPush,  changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private router: Router,  private sanks: SnaksService, private jwt: JwtService, private Auth: AuthService, private university: UniversityService ) {
  this.mobileQuery = media.matchMedia('(max-width: 600px)');
  this._mobileQueryListener = () => changeDetectorRef.detectChanges();
  this.mobileQuery.addListener(this._mobileQueryListener);
  this.isDarkTheme = localStorage.getItem('IsDark') === 'true' ? true : false;
  this.selectedUni =  localStorage.getItem('Uni');



}
  mobileQuery: MediaQueryList;



public _mobileQueryListener: () => void;
showReqs = false;
public isDarkTheme = false;
public Me = null;
soso = null;
connected = false;
showRoute = this.Auth.IsLoggedIn();
logedIn = false;
subscription: any;
public Proutes = [
  {name : 'صفحه اصلی', icon : 'home', viewMenu : true, path: '/', primary : true},
  {name : 'رزرو غذا', icon : 'restaurant', viewMenu : true, path: 'foods', primary : true},
  {name : 'تراکنش های مالی', icon : 'account_balance_wallet', viewMenu : true, path: 'financial/transactions', primary : true},
   {name : 'تحویل غذا', icon : 'local_dining', viewMenu : true, path: 'deliver', primary : true},
  {name : 'بازار غذا', icon : 'store', viewMenu : true, path: 'bazzar', primary : true},
  {name : 'پروفایل من', icon : 'person', viewMenu : true, path: 'users/profile', primary : true}

];
shouldRun = true;
  private RequestPushNotify(swPush: SwPush) {
    swPush
      .requestSubscription({
        serverPublicKey: VAPID_PUBLIC
      })
      .then(subscription => {
        console.log('hi push');
        console.log(subscription);
        const key = subscription.getKey('p256dh');
        const auth = subscription.getKey('auth');
        // send subscription to the server
        this.sendSubscriptionToServer(subscription.endpoint, key, auth);
      })
      .catch(console.log);

  }

   ngOnInit() {
     if (!localStorage.Pushing) {
           localStorage.setItem('Pushing', 'ok');
           this.RequestPushNotify(this.swPush);
       }
        if (this.swUpdate.isEnabled) {
            this.swUpdate.available.subscribe((evt) => {
              // localStorage.clear();

               // this.sanks.openSnackBar(' رایدا به روز رسانی شد ' + this.clientVersion, 'بستن');
              localStorage.removeItem('Pushing');
               setTimeout(() => {
                     window.location.reload();
               }, 1000);
            });

            this.swUpdate.checkForUpdate().then(() => {
                // noop
            }).catch((err) => {
              this.sanks.openSnackBar('مشکل در اپدیت رایدا', 'بستن');
            });
              this.soso = new Soso(environment.WebSocket);
              this.soso.onopen = (e) => {
                console.log(e);
              this.connected = true;
            };
              this.soso.onerror = (e) => {
                console.log(e);
              this.connected = false;
            };
              this.soso.onclose = (e) => {
                console.log(e);
              this.connected = false;
            };
        }
        this.router.events.subscribe((d) =>  {

            this.showRoute =  this.Auth.IsLoggedIn();
            this.GetUserData();
        });

      }


ngOnDestroy(): void {
  this.mobileQuery.removeListener(this._mobileQueryListener);
}
GetUserData() {
  if ((localStorage.token) && (!this.logedIn)) {
    this.logedIn = true;
    this.jwt.GetUser().then((d) => {
    this.Me = d;
    if (!localStorage.getItem('Uni')) {
      this.selectedUni = this.Me['university'][0].ID;
      this.UniSaver();
    }
    this.Proutes.forEach((item) => {
      // control path exits in User Routes?
    if ((item['path'] === this.Me['Routes']) || (this.Me['Routes'] === '*')) {
    item['viewMenu'] =   !item['viewMenu'];
    if (item['primary']) {
      // IF ROUTE IS primary SHOW
    item['viewMenu'] = true;
    }
    }
    });
    });
}
}
exit() {
  localStorage.removeItem('token');
  this.router.navigate(['/users/login']);
  this.showRoute = false;
  this.logedIn = false;
}

UniSaver() {
  localStorage.setItem('Uni', this.selectedUni);
  this.university.sendMessage('unichanged');
}
sendSubscriptionToServer(endpoint, key, auth) {
  const encodedKey = btoa(String.fromCharCode.apply(null, new Uint8Array(key)));
  const encodedAuth = btoa(String.fromCharCode.apply(null, new Uint8Array(auth)));

   this.http.post('https://api.rayda.ir/pushSystemsubscribe', {publicKey: encodedKey, auth: encodedAuth, notificationEndPoint: endpoint})
   .toPromise();
}


}
