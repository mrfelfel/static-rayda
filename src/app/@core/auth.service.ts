import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: Http) {

  }
  private messageSource = new BehaviorSubject('hello');
  currentMessage = this.messageSource.asObservable();
  base_url = environment.Endpoint;
  changeMessage(message: string) {
   this.messageSource.next('hi');
 }
  login(data) {
    return this.http.post(this.base_url + 'login', data).toPromise()
    .then((d) => {
       if (d.json().status) {
         this.changeMessage('logged');
       localStorage.setItem('token', d.json().token);
       }
       return d.json().status;

    });
  }
  forgot(data) {
    return this.http.post(this.base_url + 'forgoten', data)
    .toPromise();
  }

IsLoggedIn() {
  return localStorage.token ? true : false;
}
}
