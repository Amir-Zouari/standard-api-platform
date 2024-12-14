import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginRequest } from '../api/loginRequest';
import { environment } from 'src/environments/environment';

const baseUrl = environment.authUrl;
@Injectable()
export class AuthService {

  constructor(private http: HttpClient) { }

  signin(data: LoginRequest): Observable<any> {
    return this.http.post(`${baseUrl}/signin`, data);
  }
  signup(data: any): Observable<any> {
    return this.http.post(`${baseUrl}/signup`, data);
  }

  signOut() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('id');
  }

  isLoggedIn() {
    return !!localStorage.getItem('jwtToken');
  }

  getToken() {
    return localStorage.getItem('jwtToken');
  }

  getUserID()
  {
    try {
      const token = localStorage.getItem('jwtToken');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId;
      }
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return ;
    }
    return ;
  }
  
  getRoles(): string[] {
    try {
      const token = localStorage.getItem('jwtToken');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.roles;
      }
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return [];
    }
    return [];
  }

  hasRole(role: string): boolean {
    const roles = this.getRoles();
    return roles.includes(role);
  }

}
