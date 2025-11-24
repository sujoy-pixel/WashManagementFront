import { Component, HostListener, OnInit } from '@angular/core';
import { Menu, NavService } from 'src/app/shared/services/nav.service';
import { SwitcherService } from 'src/app/shared/services/switcher.service';

@Component({
  selector: 'app-content-layout',
  templateUrl: './content-layout.component.html',
  styleUrls: ['./content-layout.component.scss'],
})
export class ContentLayoutComponent implements OnInit {
  public menuItems!: Menu[];

  constructor(
    public SwitcherService: SwitcherService,
    public navServices: NavService
  ) {
    this.navServices.items.subscribe((menuItems: any) => {

        const savedMenu = localStorage.getItem('MenuTemp');
        if (savedMenu) {
            console.log("Temp calling");
              this.menuItems = JSON.parse(savedMenu);
        }
      else 
      {
        console.log("server calling");
        this.menuItems = menuItems;
      }
     
     
    });
  }
  ngOnInit() {}

  toggleSwitcherBody() {
    this.SwitcherService.emitChange(false);
  }

  scrolled: boolean = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.scrollY > 74;
  }


}
