import { Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { fromEvent, Subscription } from 'rxjs';
import { SwitcherService } from 'src/app/shared/services/switcher.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export class LandingPageComponent implements OnInit {
  layoutSub: Subscription;
  @ViewChild('switcher', { static: false }) switcher!: ElementRef;
  public isMenuCollapsed = true;
  constructor(public SwitcherService: SwitcherService,
    public renderer: Renderer2) {
    document.querySelector('body')?.classList.remove('sidebar-mini');
    document.querySelector('body')?.classList.add('landing-page', 'horizontal');

    
    this.layoutSub = SwitcherService.changeEmitted.subscribe((value) => {
      if (value) {
        this.renderer.addClass(this.switcher.nativeElement.firstElementChild,'active');
        this.renderer.setStyle(this.switcher.nativeElement.firstElementChild,'right','0px');
        value = true;
      } else {
        this.renderer.removeClass(this.switcher.nativeElement.firstElementChild,'active');
        this.renderer.setStyle(this.switcher.nativeElement.firstElementChild,'right','-270px');
        value = false;
      }
    });
  }

  ngOnInit(): void {
    let body: HTMLBodyElement | any = document.querySelector('body');
    let html: any = document.querySelector('html');
    let ltr: any = document.querySelector('#myonoffswitch23');
    let rtl: any = document.querySelector('#myonoffswitch24');
    let lightBtn: any = document.getElementById('myonoffswitch1');
    let darkBtn: any = document.getElementById('myonoffswitch2');
    let styleId = document.querySelector('#style');
    
    // LTR
    fromEvent(ltr, 'click').subscribe(() => {
      //add
      body?.classList.add('ltr');
      html?.setAttribute('dir', 'ltr');
      styleId?.setAttribute(
        'href',
        './assets/plugins/bootstrap/css/bootstrap.css'
      );
      this.customOptions = { ...this.customOptions, rtl: false } // this will make the carousel refresh
      this.customOptions1 = { ...this.customOptions1, rtl: false } // this will make the carousel refresh
      //remove
      body?.classList.remove('rtl');
      localStorage.removeItem('Noartl');
    });
    // RTL
    fromEvent(rtl, 'click').subscribe(() => {
      //add
      body?.classList.add('rtl');
      html?.setAttribute('dir', 'rtl');
      styleId?.setAttribute('href','./assets/plugins/bootstrap/css/bootstrap.rtl.css');
      this.customOptions = { ...this.customOptions, rtl: true } // this will make the carousel refresh
      this.customOptions1 = { ...this.customOptions1, rtl: true } // this will make the carousel refresh

      //remove
      body?.classList.remove('ltr');
      localStorage.setItem('Noartl', 'true');
      localStorage.removeItem('Noaltr');
    });
    // Theme
    fromEvent(lightBtn, 'click').subscribe(() => {
      lightBtn.checked = true;
      // add
      document.querySelector('body')?.classList.add('light-mode');
      // remove
      document.querySelector('body')?.classList.remove('dark-mode');
      localStorage.clear();
      localStorage.setItem('Noalight-theme', 'true');
      localStorage.removeItem('Noadark-theme');
    });
    fromEvent(darkBtn, 'click').subscribe(() => {
      darkBtn.checked = true;
      // add
      document.querySelector('body')?.classList.add('dark-mode');
      // remove
      document.querySelector('body')?.classList.remove('light-mode');
      localStorage.clear();
      localStorage.setItem('Noadark-theme', 'true');
      localStorage.removeItem('Noalight-theme');
    });
    let demoScreen :any = document.querySelector('.demo-screen-headline')
    let horContent :any = document.querySelector('.hor-content')
    fromEvent([horContent, demoScreen], 'click').subscribe(() => {
      this.SwitcherService.emitChange(false);
    });

    this.localStorageBackup();
  }
  ngOnDestroy() {
    document
      .querySelector('body')
      ?.classList.remove('horizontal', 'landing-page');
    document.querySelector('body')?.classList.add('sidebar-mini');
  }

  // ngx owl carousel
  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    autoplay: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    margin: 50,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 4,
      },
      740: {
        items: 6,
      },
      940: {
        items: 8,
      },
    },
    nav: false,
  };
  customOptions1: OwlOptions = {
    loop: true,
    mouseDrag: true,
    autoplay: true,
    margin: 50,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1,
      },
      768: {
        items: 1,
      },
      992: {
        items: 1,
      },
      1200: {
        items: 1,
      },
      1600: {
        items: 1,
      },
    },
    nav: false,
  };

  scroll(el: HTMLElement) {
    el.scrollIntoView({ behavior: 'smooth' });
  }

  scrolled: boolean = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.scrollY > 10;

    const sections = document.querySelectorAll('.side-menu__item');
    const scrollPos =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop;

    sections.forEach((ele, i) => {
      const currLink = sections[i];
      const val: any = currLink.getAttribute('value');
      const refElement: any = document.querySelector('#' + val);
      const scrollTopMinus = scrollPos + 73;
      if (
        refElement.offsetTop <= scrollTopMinus &&
        refElement.offsetTop + refElement.offsetHeight > scrollTopMinus
      ) {
        document.querySelector('.nav-scroll')?.classList.remove('active');
        currLink.classList.add('active');
      } else {
        currLink.classList.remove('active');
      }
    });
  }

  reset() {
    let body: HTMLBodyElement | any = document.querySelector('body');
    let html: any = document.querySelector('html');
    let lightBtn: any = document.getElementById('myonoffswitch1');
    let styleId = document.querySelector('#style');
    lightBtn.checked = true;
    // add
    document.querySelector('body')?.classList.add('light-mode');
    // remove
    document.querySelector('body')?.classList.remove('dark-mode');
    localStorage.clear();
    //add
    body?.classList.add('ltr');
    html?.setAttribute('dir', 'ltr');
    styleId?.setAttribute(
      'href',
      './assets/plugins/bootstrap/css/bootstrap.css'
    );
    this.customOptions = { ...this.customOptions, rtl: false } // this will make the carousel refresh
    this.customOptions1 = { ...this.customOptions1, rtl: false } // this will make the carousel refresh
    //remove
    body?.classList.remove('rtl');
  }
  toggleSwitcher() {
    if(this.switcher.nativeElement.firstElementChild.classList.contains('active')){
      this.SwitcherService.emitChange(false);
    }
    else{
      this.SwitcherService.emitChange(true);
    }
  }
  @HostListener('window:resize', [])
  onResize() {
    if (window.innerWidth >= 992) {
      document.querySelector('body')?.classList.remove('sidenav-toggled');
    }
  }
  localStorageBackup(){
    if(localStorage.getItem('Noartl')){
      let body: HTMLBodyElement | any = document.querySelector('body');
      let html: any = document.querySelector('html');
      let styleId = document.querySelector('#style');
      body?.classList.add('rtl');
      html?.setAttribute('dir', 'rtl');
      styleId?.setAttribute('href','./assets/plugins/bootstrap/css/bootstrap.rtl.css');
      this.customOptions = { ...this.customOptions, rtl: true } // this will make the carousel refresh
      this.customOptions1 = { ...this.customOptions1, rtl: true } // this will make the carousel refresh
  
      //remove
      body?.classList.remove('ltr');  
    }
    if(localStorage.getItem('Noadark-theme')){
      let darkBtn: any = document.getElementById('myonoffswitch2');
      darkBtn.checked = true;
      // add
      document.querySelector('body')?.classList.add('dark-mode');
      // remove
      document.querySelector('body')?.classList.remove('light-mode');
      localStorage.clear();
      localStorage.setItem('Noadark-theme', 'true');
      localStorage.removeItem('Noalight-theme');
    }
  }
}
