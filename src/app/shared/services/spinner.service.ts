import { Injectable } from '@angular/core';
// import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

constructor() { }
//constructor(private spinner: NgxSpinnerService) { }

showSpinner(name?: string) {
 // this.spinner.show(name);
}

hideSpinner(name?: string) {
 // this.spinner.hide(name);
}

}
