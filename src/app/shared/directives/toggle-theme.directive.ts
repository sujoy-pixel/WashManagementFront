import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appToggleTheme]'
})
export class ToggleThemeDirective {
  private body:HTMLBodyElement | any = document.querySelector('body');
  constructor() { }

  @HostListener('click') toggleTheme(){

    if (this.body != !this.body) {
      this.body.classList.toggle('dark-mode');
      this.body.classList.remove('bg-img1');
      this.body.classList.remove('bg-img2');
      this.body.classList.remove('bg-img3');
      this.body.classList.remove('bg-img4');

      let darkBtn: any = document.getElementById(
        'myonoffswitch2'
      ) as HTMLInputElement;
      let darkheader = document.getElementById('myonoffswitch8') as HTMLInputElement;
      let darkmenu = document.getElementById('myonoffswitch5') as HTMLInputElement;

      if(this.body.classList.contains("dark-mode")){
        darkheader.checked = true;
        darkmenu.checked = true;
        darkBtn.checked = true;
      }
      else{
        darkheader.checked = false;
        darkmenu.checked = false;
        darkBtn.checked = false;
      }
    }
  }
}
