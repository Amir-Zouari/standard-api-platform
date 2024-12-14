import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../api/user';

@Injectable({
  providedIn: 'root'
})
export class UserSessionService {
  private user = new BehaviorSubject<User>(null);
  constructor() { }
  setUser(user: User) {
    this.user.next(user);
  }

  getUser():Observable<User> {
    return this.user.asObservable();
  }
}
