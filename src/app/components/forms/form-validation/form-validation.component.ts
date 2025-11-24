import { Component, OnInit } from '@angular/core';
import { FormGroup,  FormBuilder,  Validators, NgForm, FormControl } from '@angular/forms';
import { User } from './user.module';
import { UserService } from './user.service';

@Component({
  selector: 'app-form-validation',
  templateUrl: './form-validation.component.html',
  styleUrls: ['./form-validation.component.scss']
})
export class FormValidationComponent implements OnInit {
  title = 'Angular Form Validation Tutorial';
  angForm!: FormGroup;
  constructor(private fb: FormBuilder, private userService: UserService) {
   this.createForm();
 }
  createForm() {
   this.angForm = this.fb.group({
      name: ['', Validators.required, ],
      address: ['', Validators.required ]
   });
 }

  ngOnInit(): void {
  }


  submit(form:any){
    var firstName = form.firstName;
    var lastName = form.lastName;
    var comment = form.comment;
    var selectedList = form.selectedList;
    var checkedStatus = form.checkedStatus;
    console.log(firstName, lastName, comment, selectedList, checkedStatus);
    
  }

  // 
  isValidFormSubmitted = false;
  user:any = new User();
  onFormSubmit(form: NgForm) {
    this.isValidFormSubmitted = false;
    if (form.invalid) {
       return;
    }
    this.isValidFormSubmitted = true;
    this.user = form.value;
    this.userService.createUser(this.user);
    this.user = new User();
    form.resetForm();
 }

 // reactive forms module isValidFormSubmitted = null;
 isValidFormSubmittedReactive= false
  reactiveuserForm = new FormGroup({
    UserName: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(10)]),
    cityName: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(8)])	 
  });
  onFormSubmitReactive() {
    this.isValidFormSubmittedReactive = false;
    if (this.reactiveuserForm.invalid) {
      return;
    }
    this.isValidFormSubmittedReactive = true;
    this.user = this.reactiveuserForm.value;
    this.userService.createUser(this.user);
    this.reactiveuserForm.reset();
  }
  get UserName() {
    return this.reactiveuserForm.get('UserName');
  }
  get cityName() {
    return this.reactiveuserForm.get('cityName');
  }  
}
