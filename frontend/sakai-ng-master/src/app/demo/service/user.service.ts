import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, throwError } from 'rxjs';
import { User } from '../api/user';
import { environment } from 'src/environments/environment';
import { UpdateRequest } from '../api/updateRequest';

const baseUrl = environment.usersUrl;
@Injectable()
export class UserService {
  /*  private userAddedSource = new BehaviorSubject<boolean>(false);
   userAdded$ = this.userAddedSource.asObservable(); */

  constructor(private http: HttpClient) { }
  getAll(): Observable<User[]> {
    /* const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` }); */
    return this.http.get<User[]>(baseUrl/* ,{headers} */)
  }

  get(id: any): Observable<User> {
    return this.http.get<User>(`${baseUrl}/${id}`)
  }

  create(data: any): Observable<User> {
    return this.http.post(baseUrl, data)
    
  }

  update(id: number, data: UpdateRequest): Observable<any> {
    return this.http.put(`${baseUrl}/${id}`, data)
   
  }

  delete(id: any): Observable<any> {
    return this.http.delete(`${baseUrl}/${id}`)
    
  }

  deleteUsers(params: any): Observable<any> {
    return this.http.delete(baseUrl, { params })
    
  }

  checkUsernameAvailability(username: string): Observable<boolean> {
    return this.http.get<boolean>(`${baseUrl}/check-username-availability`, { params: { username } })
    .pipe(
      catchError(this.handleError)
    );
  }

  checkEmailAvailability(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${baseUrl}/check-email-availability`, { params: { email } })
    .pipe(
      catchError(this.handleError)
    );
  }

  getAssignableRoles(): Observable<string[]> {
    return this.http.get<string[]>(`${baseUrl}/me/assignable-roles`)
  }

  leaveGroup(groupId: number): Observable<any> {
    return this.http.delete<any>(`${baseUrl}/me/groups/${groupId}/leave`)
  }

  updateProfile(data: UpdateRequest): Observable<any> {
    return this.http.put(`${baseUrl}/me`, data)
  }

  /* hasRole(id:number,role:string):asyn
  {
      this.get(id).subscribe(user=>
        {
          const roleNames = user.roles.map(role=>role.name);
          if (roleNames.includes(role)) return true;
          else return false;
        })
  } */


  private handleError(error: any) {
    console.error('An error occurred:', error);
    // Handle error gracefully, e.g., return a user-friendly error message
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }

}
