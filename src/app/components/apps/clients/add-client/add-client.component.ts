import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-client',
  templateUrl: './add-client.component.html',
  styleUrls: ['./add-client.component.scss']
})
export class AddClientComponent implements OnInit {


  ngOnInit(): void {
  }

  ShowPassword(e:any){
    if(e.type !== "password"){
      e.type = 'password'
    }
    else{
      e.type = 'text'
    }    
  }

  
  // ng2-intl-input

  telInputObject(obj:any) {
    console.log(obj);
    obj.setCountry('in');
  }
  onCountryChange(country:any) {
    console.log(country);
  }
  hasError(error:any) {
    console.log(error);
  }
  getNumber(number:any) {
    console.log(number);
  }
}
