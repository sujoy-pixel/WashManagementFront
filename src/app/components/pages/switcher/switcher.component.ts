import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { SwitcherService } from 'src/app/shared/services/switcher.service';
import * as switcher from 'src/app/shared/layout-components/switcher/switcher';

@Component({
  selector: 'app-switcher',
  templateUrl: './switcher.component.html',
  styleUrls: ['./switcher.component.scss'],
})
export class SwitcherComponent implements OnInit {
  layoutSub: Subscription;

  body = document.querySelector('body');

  @ViewChild('switcher', { static: false }) switcher!: ElementRef;
  constructor(
    public renderer: Renderer2,
    public switcherServic: SwitcherService
  ) {
    this.layoutSub = switcherServic.changeEmitted.subscribe((value) => {
      if (value) {
        this.renderer.addClass(
          this.switcher.nativeElement.firstElementChild,
          'active'
        );
        this.renderer.setStyle(
          this.switcher.nativeElement.firstElementChild,
          'right',
          '0px'
        );
        value = true;
      } else {
        this.renderer.removeClass(
          this.switcher.nativeElement.firstElementChild,
          'active'
        );
        this.renderer.setStyle(
          this.switcher.nativeElement.firstElementChild,
          'right',
          '-270px'
        );
        value = false;
      }
    });
  }
  ngOnInit(): void {
    switcher?.localStorageBackUp();
    switcher?.customClickFn();
    switcher?.updateChanges();

  }
  reset() {
    sessionStorage.clear();
    let html: any = document.querySelector('html');
    html.style = '';
    this.body?.classList.remove('dark-mode');
    this.body?.classList.remove('light-header');
    this.body?.classList.remove('dark-header');
    this.body?.classList.remove('color-header');
    this.body?.classList.remove('gradient-header');
    this.body?.classList.remove('light-menu');
    this.body?.classList.remove('color-menu');
    this.body?.classList.remove('dark-menu');
    this.body?.classList.remove('gradient-menu');
    this.body?.classList.remove('layout-boxed');
    this.body?.classList.remove('scrollable-layout');
    this.body?.classList.remove('bg-img1');
    this.body?.classList.remove('bg-img2');
    this.body?.classList.remove('bg-img3');
    this.body?.classList.remove('bg-img4');
    switcher.updateChanges();
    switcher.checkOptions();
  }

  public color1: string = '#38cab3';
  public color2: string = '#38cab3';
  public color3: string = '#38cab3';
  public color4: string = '#38cab3';
  public color5: string = '#38cab3';

  public dynamicLightPrimary(data: any): void {
    this.color1 = data.color;

    const dynamicPrimaryLight = document.querySelectorAll(
      'input.color-primary-light'
    );

    switcher.dynamicLightPrimaryColor(dynamicPrimaryLight, this.color1);

    sessionStorage.setItem('light-primary-color', this.color1);
    sessionStorage.setItem('light-primary-hover', this.color1);
    sessionStorage.setItem('light-primary-border', this.color1);
    let light = document.getElementById('myonoffswitch1') as HTMLInputElement;
    light.checked = true;

    // Adding
    this.body?.classList.add('light-mode');

    // Removing
    this.body?.classList.remove('dark-mode');
    this.body?.classList.remove('bg-img1');
    this.body?.classList.remove('bg-img2');
    this.body?.classList.remove('bg-img3');
    this.body?.classList.remove('bg-img4');
    // removing data from session storage
    sessionStorage.removeItem('dark-primary-color');
    sessionStorage.removeItem('dark-primary-hover');
    sessionStorage.removeItem('dark-primary-border');
    sessionStorage.removeItem('dark-body');
    sessionStorage.removeItem('BgImage');
    switcher.checkOptions();
    switcher.updateChanges();
  }
  public dynamicDarkPrimary(data: any): void {
    this.color2 = data.color;

    const dynamicPrimaryDark = document.querySelectorAll(
      'input.color-primary-dark'
    );

    switcher.dynamicDarkPrimaryColor(dynamicPrimaryDark, this.color2);

    sessionStorage.setItem('dark-primary-color', this.color2);
    sessionStorage.setItem('dark-primary-hover', this.color2);
    sessionStorage.setItem('dark-primary-border', this.color2);
    let dark = document.getElementById('myonoffswitch2') as HTMLInputElement;
    dark.checked = true;

    // Adding
    this.body?.classList.add('dark-mode');
    // removing data from session storage
    sessionStorage.removeItem('light-primary-color');
    sessionStorage.removeItem('light-primary-hover');
    sessionStorage.removeItem('light-primary-border');

    // Removing
    this.body?.classList.remove('light-mode');

    switcher.checkOptions();
    switcher.updateChanges();
  }
  public dynamicDarkBg(data: any): void {
    this.color3 = data.color;

    const dynamicBodyDark = document.querySelectorAll('input.dark-bg-body');

    switcher.dynamicDarkBodyColor(dynamicBodyDark, this.color3);

    sessionStorage.setItem('dark-body', this.color3);
    let dark = document.getElementById('myonoffswitch2') as HTMLInputElement;
    dark.checked = true;

    // Adding
    this.body?.classList.add('dark-mode');

    // Removing
    this.body?.classList.remove('light-mode');
    let allImg = document.querySelectorAll('.bg-img');
    allImg.forEach((el, i) => {
      let ele = el.classList[0];
      this.body?.classList.remove(ele);
    });

    // removing data from session storage
    sessionStorage.removeItem('light-primary-color');
    sessionStorage.removeItem('light-primary-hover');
    sessionStorage.removeItem('light-primary-border');
    sessionStorage.removeItem('BgImage');

    switcher.checkOptions();
    switcher.updateChanges();
  }

  bgImage(e: any) {
    let transparent = document.getElementById(
      'myonoffswitch2'
    ) as HTMLInputElement;
    transparent.checked = true;

    let img = e.parentElement.classList[0];
    sessionStorage.setItem('BgImage', img);
    // this.body?.classList.add(img);
    let allImg = document.querySelectorAll('.bg-img');
    allImg.forEach((el, i) => {
      let ele = el.classList[0];
      this.body?.classList.remove(ele);
      this.body?.classList.add(img);
    });

    // Adding
    this.body?.classList.add('dark-mode');

    // Removing
    this.body?.classList.remove('light-mode');
    sessionStorage.removeItem('light-primary-color');
    sessionStorage.removeItem('light-primary-hover');
    sessionStorage.removeItem('light-primary-border');
    sessionStorage.removeItem('dark-body');

    switcher.removeForTransparent();
    switcher.updateChanges();
  }

  ngOnDestroy(){
    document.querySelector('body')?.classList.remove('horizontal')
    document.querySelector('body')?.classList.remove('horizontal-hover')
    document.querySelector('body')?.classList.add('sidebar-mini')
    // window.location.reload();
  }
}
