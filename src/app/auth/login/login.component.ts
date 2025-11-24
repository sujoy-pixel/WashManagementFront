import { Component, OnInit,ViewChild,ElementRef,Renderer2,ChangeDetectorRef  } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../shared/services/firebase/auth.service';


import { Router } from "@angular/router";
//import { MustMatch } from "src/app/shared/custom-validators";
// import { AlertifyService } from 'src/app/shared/services/alertify.service';
import { userInfo } from 'os';
//import { SpinnerService } from "src/app/shared/services/spinner.service";

 
//import { RoleService } from "../../admin/Services/role.service";
//import { CommonServiceService } from "../../merchandising/Common-Services/common-service.service";
import { ToastrService } from "ngx-toastr";
import { SidebarToggleService } from "../../components/mascowash/services/sidebar-toggle.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public show: boolean = false;
  public loginForm: FormGroup | any;
  public errorMessage: any;
  toaster: any;
  @ViewChild('toggleSidebar') toggleSidebar!: ElementRef;


  constructor(
    public authService: AuthService, 
    private fb: FormBuilder,
    private router: Router,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    private sidebarToggleService: SidebarToggleService,
    // private alertify: AlertifyService,  
    private toastr: ToastrService) {
    this.loginForm = this.fb.group({
      username: ["", [Validators.required]],
      password: ['', Validators.required],
    });
//alert(this.loginForm.username);
    document.querySelector('body')?.classList.add('login-img');
  }
  

  
  

  
  ngOnInit() {
    
  }

  showPassword() {
    this.show = !this.show;
  }

  // Login With Google
  loginGoogle() {
    this.authService.GoogleAuth();
  }

  // Login With Twitter
  loginTwitter(): void {
    this.authService.signInTwitter();
  }

  // Login With Facebook
  loginFacebook() {
    this.authService.signInFacebok();
  }

  // Simple Login
  // login() {
  //   this.authService.SignIn(
  //     this.loginForm.value['email'],
  //     this.loginForm.value['password']
  //   );
  // }
 private menuData: any[] = [];

  login() {
    
    //debugger;
    console.log("loginFormValue",this.loginForm.value);
    let {username, password} = this.loginForm.value;

    if(username === "" || username === null || username === undefined){
     this.toastr.warning("Please Enter User ID", "Warning");
     return;
    }

    if(password === "" || password === null || password === undefined){
     this.toastr.warning("Please Enter Password", "Warning");
     return;
    }

    this.loginForm = this.fb.group({
      username: [this.loginForm.value.username, [Validators.required]],
      password: [this.loginForm.value.password, Validators.required],
    });
    if (this.loginForm.valid) {
            this.authService.login(this.loginForm.value).subscribe({
              
              complete: () => {  

             
                
                this.router.navigate(['/dashboard/default/']).then(() => {
                  document.body.classList.remove('sidenav-toggled'); // Reset
                  this.sidebarToggleService.resetToggleState();      // Reset service flag
                  setTimeout(() => {
                    this.sidebarToggleService.triggerToggle();
                    this.toastr.success("Login Successful", "Success");// Open sidebar
                  }, 1000); // Delay ensures dashboard is ready
                });
              
            }, // completeHandler
              error: () => { 
                //this.alertify.error("Failed to login!");
                this.toastr.warning("Invalid UserID or Password", "Warning");
              },    // errorHandler 
              next: () => { 
                //this.alertify.success("Login successfully!"); 
                //this.toastr.success("Login Successful", "Success");
              this.router.navigate(["/dashboard/default/"]);
                 },     // nextHandler
            
          });
      
    } else {
      //this.commonService.ValidationShow(this.loginForm);
    }
  }





  ngOnDestroy() {
    document.querySelector('body')?.classList.remove('login-img');
  }
}
