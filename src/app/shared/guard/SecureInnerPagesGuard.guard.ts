import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { AuthService } from '../services/firebase/auth.service';

@Injectable({
    providedIn: 'root'
})

export class SecureInnerPagesGuard implements CanActivate {
    
    constructor(private authService: AuthService,
        private router: Router, public cookieService:CookieService) { }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        let user = JSON.parse(this.cookieService.get('user')|| '{}');
        if (this.authService.isLoggedIn) {
            window.alert("You are not allowed to access this URL!");
            this.router.navigate(['/dashboard'])
        }
        return true;
    }
}