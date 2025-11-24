import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SidebarToggleService {
  private toggleSidebarSubject = new Subject<void>();
  toggleSidebar$ = this.toggleSidebarSubject.asObservable();

  private isToggled = false;

  triggerToggle() {
    console.log('Trigger toggle called');
    const body = document.body;
  
    if (this.isToggled) {
      body.classList.remove('sidenav-toggled');
    } else {
      body.classList.add('sidenav-toggled');
    }
  
    this.isToggled = !this.isToggled;
    }
    resetToggleState() {
        this.isToggled = false;
        document.body.classList.remove('sidenav-toggled');
      }
}
