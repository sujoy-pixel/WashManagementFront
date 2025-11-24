import { Injectable } from '@angular/core';
import * as alertify from 'alertifyjs';

@Injectable({
  providedIn: 'root'
})

export class AlertifyService {
defaults: any;

constructor() { }

confirm(message: string, okCallback: () => any) {
  alertify.confirm(message, (e: any) => {
    if (e) {
      okCallback();
    } else {}
  });
}

confirm2(message: string, header:string, okCallback: () => any) {
  alertify.confirm(message, (e: any) => {
    if (e) {
      okCallback();
    } else {}
  }).setHeader(header);
}

/*confirmation(title:string,message:string,ok: () => any){
    alertify.confirm(title, message, function(){ ok() }, function(){ alertify.error('Cancel')});
}*/


success(message: string) {
  alertify.success(message);
}

error(message: string) {
  alertify.error(message);
}

warning(message: string) {
  alertify.warning(message);
}

message(message: string) {
  alertify.message(message);
}

}
