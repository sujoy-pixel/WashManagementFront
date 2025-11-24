import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms'; // Reactive form services
import { ToastrService } from 'ngx-toastr'; // Alert message using NGX toastr
import { CrudService } from 'src/app/shared/services/firebase/crud.service'; // CRUD services API

@Component({
  selector: 'app-add-member',
  templateUrl: './add-member.component.html',
  styleUrls: ['./add-member.component.scss']
})

export class AddMemberComponent implements OnInit {
  
  public memberForm!: FormGroup;  // Define FormGroup to member's form
 
  constructor(
    public crudApi: CrudService,  // CRUD API services
    public fb: FormBuilder,       // Form Builder service for Reactive forms
    public toastr: ToastrService  // Toastr service for alert message
  ) { }

 
  ngOnInit() {
    this.crudApi.GetmembersList();  // Call GetmembersList() before main form is being called
    this.studenForm();              // Call member form when component is ready
  }

  // Reactive member form
  studenForm() {
    this.memberForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(4)]],
      lastName: [''],
      email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')]],
      mobileNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(12), Validators.pattern('^[0-9]+$')]],
      designation: ['']
    })  
  }

  // Accessing form control using getters
  get firstName() {
    return this.memberForm.get('firstName');
  }

  get lastName() {
    return this.memberForm.get('lastName');
  }  

  get email() {
    return this.memberForm.get('email');
  }

  get mobileNumber() {
    return this.memberForm.get('mobileNumber');
  }
  get designation() {
    return this.memberForm.get('designation');
  }

  // Reset member form's values
  ResetForm() {
    this.memberForm.reset();
  }  
 
  submitMemberData() {
    this.crudApi.Addmember(this.memberForm.value); // Submit member data using CRUD API
    this.toastr.success(this.memberForm.controls['firstName'].value + ' ' + this.memberForm.controls['lastName'].value +' successfully added!'); // Show success message when data is successfully submited
    this.ResetForm();  // Reset form when clicked on reset button
   };

}
