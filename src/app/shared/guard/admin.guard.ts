import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { AuthService } from '../services/firebase/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(public authService: AuthService,
    public router: Router, public cookieService: CookieService) { }

  canActivate(next: ActivatedRouteSnapshot, 
      state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    // Guard for user is login or not
    //debugger;
    let user = JSON.parse(this.cookieService.get('user')|| '{}');
    if (!user || user === null) {
      this.router.navigate(['/auth/login']);
      return true
    }
    else if (user) {
      if (!Object.keys(user).length) {
        //this.router.navigate(['/auth/login']);
        this.router.navigate(['/dashboard']);
        return true
      }
    }
    return true
  }
  
}
