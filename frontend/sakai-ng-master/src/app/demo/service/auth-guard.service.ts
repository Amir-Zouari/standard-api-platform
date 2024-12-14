import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles = route.data['expectedRoles'];
    const userRoles = this.authService.getRoles();

    if (!this.authService.isLoggedIn() || !userRoles.some(role => expectedRoles.includes(role))) {
      this.router.navigate(['/auth/login']);
      return false;
    }
    return true;
  }
}
