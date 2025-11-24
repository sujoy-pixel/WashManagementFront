import {
  Component,
  ViewEncapsulation,
  HostListener,
  ElementRef,
} from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Menu, NavService } from '../../services/nav.service';
import { switcherArrowFn, parentNavActive, checkHoriMenu } from './sidebar';
import { fromEvent } from 'rxjs';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { MenuService } from '../../services/menu.service';
//import { CommonServiceService } from "src/app/components/merchandising/Common-Services/common-service.service";
import { AuthService } from '../../services/firebase/auth.service';
//import { SpinnerService } from "../../service/spinner.service";
import { DomSanitizer } from '@angular/platform-browser';
import { number } from 'echarts';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SidebarComponent {
  public menuItems!: Menu[];
  public url: any;
  public routerSubscription: any;
  public windowSubscribe$!:any;

  public fileurl: any;
  spinnerName = "listSpinner";
  public image: any;


  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private navServices: NavService,
    public elRef: ElementRef,
    public authService: AuthService,
    private menuService: MenuService,
    //private commonService: CommonServiceService,
    //private spinner: SpinnerService,
    private sanitizer: DomSanitizer
  ) {
    this.checkNavActiveOnLoad();
    //this.LoadMenu();
  }

  

  //================Menu function
  // LoadMenu() {
  //   debugger;

  //  let userId  = this.authService.decodedToken?.nameid;

  //  if(userId==null)
  //  {
  //   userId=localStorage.getItem("user_create_id");
  //  }
  //  this.menuService.GetMenusByUserId(userId).subscribe(
  //    (res: any) => {
  //      if (res) {
  //         debugger;
  //        console.log("Menu List", res);
  //        localStorage.setItem('MenuTemp', JSON.stringify(res));

  //        var LstMenu = res;

  //        if(LstMenu.length > 0){

  //        var _FinalMenu: any = [];
  //        var _obj={};
  //        var mainMenu = LstMenu.filter(pID => pID.parent_Menu_Id == 0);
  //        }

  //        mainMenu.forEach(element => {
        
  //          var subMenu = LstMenu.filter(m => m.parent_Menu_Id == element.menu_Id);
  //            if(subMenu.length > 0){
  //              var _objSub:any ={
  //                title: element.menu_Name,
  //                icon: "grid",
  //                type: "sub",
  //                active: false,
  //                children: []
  //              }
  //              subMenu.forEach(li => {
  //                var _oo:any ={
  //                  title: li.menu_Name,
  //                  path: li.page_link,
  //                  type: "link",
  //                  icon:"School",
  //                  badgeType:"primary",
  //                  active: false
  //                }
  //                _objSub.children.push(_oo);
  //              });
  //              _FinalMenu.push(_objSub)
  //            }else{
  //              _obj= {
  //                title: element.menu_Name,
  //                path: element.page_link,
  //                icon: "home",
  //                type: "link",
  //                badgeType: "primary",
  //                active: true,
  //              }
  //              _FinalMenu.push(_obj)
  //            }

  //            this.menuItems = _FinalMenu;
  //        });
         
    
  //      }
  //    },
  //    (error) => {
  //    }
  //  );
   
 
  // }

  LoadMenu() {
  let userId = this.authService.decodedToken?.nameid;
  if (!userId) {
    userId = localStorage.getItem("user_create_id");
  }

  this.menuService.GetMenusByUserId(userId).subscribe(
    (res: any) => {
      if (res) {
        console.log("Menu List", res);
        localStorage.setItem("MenuTemp", JSON.stringify(res));

        var LstMenu = res;
        if (LstMenu.length > 0) {
          var _FinalMenu: any = [];
          var mainMenu = LstMenu.filter(pID => pID.parent_Menu_Id == 0);

          mainMenu.forEach(element => {
            var subMenu = LstMenu.filter(m => m.parent_Menu_Id == element.menu_Id);

            if (subMenu.length > 0) {
              var _objSub: any = {
                title: element.menu_Name,
                icon: "grid",
                type: "sub",
                active: false,
                children: []
              };

              subMenu.forEach(li => {
                // check if this sub menu has children (3rd level)
                var subSubMenu = LstMenu.filter(x => x.parent_Menu_Id == li.menu_Id);

                if (subSubMenu.length > 0) {
                  var _oo: any = {
                    title: li.menu_Name,
                    type: "sub",
                    icon: "layers",
                    active: false,
                    children: []
                  };

                  subSubMenu.forEach(ss => {
                    var _ooo: any = {
                      title: ss.menu_Name,
                      path: ss.page_link,
                      type: "link",
                      icon: "file",
                      active: false
                    };
                    _oo.children.push(_ooo);
                  });

                  _objSub.children.push(_oo);
                } else {
                  var _oo: any = {
                    title: li.menu_Name,
                    path: li.page_link,
                    type: "link",
                    icon: "school",
                    badgeType: "primary",
                    active: false
                  };
                  _objSub.children.push(_oo);
                }
              });

              _FinalMenu.push(_objSub);
            } else {
              var _obj = {
                title: element.menu_Name,
                path: element.page_link,
                icon: "home",
                type: "link",
                badgeType: "primary",
                active: true
              };
              _FinalMenu.push(_obj);
            }
          });

          this.menuItems = _FinalMenu;
        }
      }
    },
    (error) => {}
  );
}


  // To set Active on Load
  checkNavActiveOnLoad() {

    //var userImage = localStorage.getItem("userImage");
   // let objectURL = 'data:image/png;base64,' + userImage;
    //this.image = this.sanitizer.bypassSecurityTrustUrl(objectURL);
    //this.LoadMenu_02();
    this.LoadMenu();



    this.navServices.items.subscribe((menuItems: any) => {
      //this.menuItems = menuItems;

      this.router.events.subscribe((event: any) => {
        if (event instanceof NavigationStart) {
          this.closeNavActive();
          setTimeout(() => {
            let sidemenu = document.querySelectorAll('.side-menu__item.active');
            let subSidemenu = document.querySelectorAll(
              '.sub-side-menu__item.active'
            );
            sidemenu.forEach((e) => e.classList.remove('active'));
            subSidemenu.forEach((e) => e.classList.remove('active'));
          }, 100);
        }
        if (event instanceof NavigationEnd) {
          menuItems.filter((items: any) => {
            if (items.path === event.url) {
              this.setNavActive(items);
            }
            if (!items.children) {
              return false;
            }
            items.children.filter((subItems: any) => {
              if (subItems.path === event.url) {
                this.setNavActive(subItems);
              }
              if (!subItems.children) {
                return false;
              }
              subItems.children.filter((subSubItems: any) => {
                if (subSubItems.path === event.url) {
                  this.setNavActive(subSubItems);
                }
              });
              return;
            });
            return;
          });
          setTimeout(() => {
            parentNavActive();
          }, 200);
        }
      });
    });
  }

  checkCurrentActive() {
    this.LoadMenu();

    this.navServices.items.subscribe((menuItems: any) => {
      //this.menuItems = menuItems;
      let currentUrl = this.router.url;
      menuItems.filter((items: any) => {
        if (items.path === currentUrl) {
          this.setNavActive(items);
        }
        if (!items.children) {
          return false;
        }
        items.children.filter((subItems: any) => {
          if (subItems.path === currentUrl) {
            this.setNavActive(subItems);
          }
          if (!subItems.children) {
            return false;
          }
          subItems.children.filter((subSubItems: any) => {
            if (subSubItems.path === currentUrl) {
              this.setNavActive(subSubItems);
            }
          });
          return;
        });
        return;
      });
    });
  }
  //Active Nav State
  setNavActive(item: any) {
    this.menuItems.filter((menuItem) => {
      if (menuItem !== item) {
        menuItem.active = false;
        document.querySelector('.app')?.classList.remove('sidenav-toggled');
        document.querySelector('.app')?.classList.remove('sidenav-toggled1');

        this.navServices.collapseSidebar = false;
      }
      if (menuItem.children && menuItem.children.includes(item)) {
        menuItem.active = true;
      }
      if (menuItem.children) {
        menuItem.children.filter((submenuItems) => {
          if (submenuItems.children && submenuItems.children.includes(item)) {
            menuItem.active = true;
            submenuItems.active = true;
          }
        });
      }
    });
  }

  // Toggle menu
  toggleNavActive(item: any) {
    if (!item.active) {
      this.menuItems.forEach((a: any) => {
        if (this.menuItems.includes(item)) {
          a.active = false;
        }
        if (!a.children) {
          return false;
        }
        a.children.forEach((b: any) => {
          if (a.children.includes(item)) {
            b.active = false;
          }
        });
        return;
      });
    }
    item.active = !item.active;
  }

  // Close Nav menu
  closeNavActive() {
    this.menuItems.forEach((a: any) => {
      if (this.menuItems) {
        a.active = false;
      }
      if (!a.children) {
        return false;
      }
      a.children.forEach((b: any) => {
        if (a.children) {
          b.active = false;
        }
      });
      return;
    });
  }
  ngOnInit(): void {
    //this.LoadMenu();
    switcherArrowFn();
    // detect screen size changes
    this.breakpointObserver
      .observe(['(max-width: 991px)'])
      .subscribe((result: BreakpointState) => {
        if (result.matches) {
          // small screen
          this.checkCurrentActive();
        } else {
          // large screen
          document
            .querySelector('body.horizontal')
            ?.classList.remove('sidenav-toggled');
          if (document.querySelector('.horizontal')) {
            this.closeNavActive();
            setTimeout(() => {
              parentNavActive();
            }, 300);
          }
        }
      });

    let horizontal: any = document.querySelectorAll('#myonoffswitch35');
    let horizontalHover: any = document.querySelectorAll('#myonoffswitch111');
    fromEvent(horizontal, 'click').subscribe(() => {
      this.closeNavActive();
    });
    fromEvent(horizontalHover, 'click').subscribe(() => {
      this.closeNavActive();
    });

    const WindowResize = fromEvent(window, 'resize')
    // subscribing the Observable 
    this.windowSubscribe$ = WindowResize.subscribe(() => {
      let menuWidth: any = document.querySelector<HTMLElement>('.horizontal-main');
    let menuItems: any = document.querySelector<HTMLElement>('.side-menu');
    let mainSidemenuWidth: any = document.querySelector<HTMLElement>('.main-sidemenu');
    let menuContainerWidth = menuWidth?.offsetWidth - mainSidemenuWidth?.offsetWidth;
    let marginLeftValue = Math.ceil(Number(window.getComputedStyle(menuItems).marginLeft.split('px')[0]));
    let marginRightValue = Math.ceil(Number(window.getComputedStyle(menuItems).marginRight.split('px')[0]));
    let check = menuItems.scrollWidth + (0 - menuWidth?.offsetWidth) + menuContainerWidth;

    // to check and adjst the menu on screen size change
    if (document.querySelector('body')?.classList.contains('ltr')) {
      if (marginLeftValue > -check == false && menuWidth?.offsetWidth - menuContainerWidth < menuItems.scrollWidth) {
        menuItems.style.marginLeft = -check;
      } else {
        menuItems.style.marginLeft = 0;
      }
    } else {
      console.log(menuWidth?.offsetWidth, menuItems.scrollWidth);
      if (marginRightValue > -check == false && menuWidth?.offsetWidth - menuContainerWidth < menuItems.scrollWidth
      ) { menuItems.style.marginRight = -check;
      } else {
        menuItems.style.marginRight = 0;
      }
      if (menuWidth?.offsetWidth > menuItems.scrollWidth) {
        document.querySelector('.slide-leftRTL')?.classList.add('d-none');
        document.querySelector('.slide-rightRTL')?.classList.add('d-none');
      } else {
        document.querySelector('.slide-rightRTL')?.classList.remove('d-none');
      }
    }
    checkHoriMenu();
    });
  }

  sidebarClose() {
    if ((this.navServices.collapseSidebar = true)) {
      document.querySelector('.app')?.classList.remove('sidenav-toggled');
      this.navServices.collapseSidebar = false;
    }
  }

  scrolled: boolean = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.scrollY > 74;
  }
  ngDoCheck() {
    if (document.querySelector('.horizontal')) {
      document.querySelector('.horizontal .main-content')?.addEventListener('click', () => {this.closeNavActive();});
    }
  }
  
  ngOnDestroy(){
    // unsubscribing the Observable 
    this.windowSubscribe$.unsubscribe()
  }
}
