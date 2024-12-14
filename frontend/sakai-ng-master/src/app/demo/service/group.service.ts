import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Group } from '../api/group';
import { environment } from 'src/environments/environment';

const baseUrl = environment.groupsUrl;

@Injectable({ providedIn: 'root' })
export class GroupService {
  constructor(private http: HttpClient) {}

  getGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(baseUrl)
     
  }

  getGroup(id: number): Observable<Group> {
    return this.http.get<Group>(`${baseUrl}/${id}`)
      
  }

  createGroup(group: Group): Observable<Group> {
    return this.http.post<Group>(baseUrl, group)
      
  }

  updateGroup(id: number, group: Group): Observable<Group> {
    return this.http.put<Group>(`${baseUrl}/${id}`, group)
      
  }

  deleteGroup(id: number): Observable<any> {
    return this.http.delete<any>(`${baseUrl}/${id}`)
      
  }

  deleteGroups(params:any): Observable<any> {
    return this.http.delete(baseUrl , {params} )
    
  }

 /*  addUsersToGroup(groupId: number, usersIds: number[]): Observable<any> {
    return this.http.post(`${baseUrl}/${groupId}/users`, usersIds)
      .pipe(
        catchError(this.handleError)
      );
  } */



 /*  removeUsersFromGroup(groupId: number, usersIds: number[]): Observable<any> {
    return this.http.delete(`${baseUrl}/${groupId}/users`,usersIds)
      .pipe(
        catchError(this.handleError)
      );
  } */

  /* removeUserFromGroup(groupId: number, userId: number): Observable<any> {
    return this.http.delete(`${baseUrl}/${groupId}/users/${userId}`)
      .pipe(
        catchError(this.handleError)
      );
  } */

  updateGroupUsers(groupId: number, usersIds: number[]): Observable<any>
  {
    return this.http.put(`${baseUrl}/${groupId}/users`,usersIds)
     
  }

  getAvailableUsers(groupId: number): Observable<any>
  {
    return this.http.get(`${baseUrl}/${groupId}/available-users`)
     
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    // Handle error gracefully, e.g., return a user-friendly error message
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}
