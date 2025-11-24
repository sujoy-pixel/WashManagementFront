import { Component, OnInit } from '@angular/core';
declare var require: any;
const Swal = require('sweetalert2');

@Component({
  selector: 'app-sweet-alerts',
  templateUrl: './sweet-alerts.component.html',
  styleUrls: ['./sweet-alerts.component.scss'],
})
export class SweetAlertsComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  Confirm() {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result:any) => {
      if (result.isConfirmed) {
        Swal.fire(
          'Deleted!',
          'Your file has been deleted.',
          'success'
        )
      }
    })
  }
  ConfirmStatus() {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success me-2',
        cancelButton: 'btn btn-danger me-2'
      },
      buttonsStyling: false
    })
    
    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result:any) => {
      if (result.isConfirmed) {
        swalWithBootstrapButtons.fire(
          'Deleted!',
          'Your file has been deleted.',
          'success'
        )
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Your imaginary file is safe :)',
          'error'
        )
      }
    })
  }
  Success() {
    Swal.fire({
      icon: 'success',
      title: 'Congratulations!',
      text: 'Your message has been succesfully sent',
      showConfirmButton: true,
      confirmButtonColor: '#705ec8',
    });
  }

  Warning() {
    Swal.fire({
      icon: 'warning',
      title: 'Some Risk File Is Founded!',
      text: 'Some Virus file is detected your system going to be in Risk',
      confirmButtonColor: '#705ec8',
      cancelButtonColor: '#705ec8',
      showCancelButton: true,
      confirmButtonText: 'Stay on the page',
      cancelButtonText: 'Exit',
    });
  }

  Danger() {
    Swal.fire({
      icon: 'error',
      title: 'Something Went Wrong',
      text: 'Please fix the issue the issue file not loaded & items not found',
      confirmButtonColor: '#705ec8',
      cancelButtonColor: '#705ec8',
      showCancelButton: true,
      confirmButtonText: 'Stay on the page',
      cancelButtonText: 'Exit',
    });
  }

  Info() {
    Swal.fire({
      icon: 'info',
      title: 'Notification Alert',
      text: 'Your getting some notification from mail please check it',
      confirmButtonColor: '#705ec8',
      cancelButtonColor: '#705ec8',
      showCancelButton: true,
      confirmButtonText: 'Stay on the page',
      cancelButtonText: 'Exit',
    });
  }
  ThreeBtn() {
    Swal.fire({
      title: 'Do you want to save the changes?',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Save',
      denyButtonText: `Don't save`,
    }).then((result: any) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        Swal.fire('Saved!', '', 'success');
      } else if (result.isDenied) {
        Swal.fire('Changes are not saved', '', 'info');
      }
    });
  }
  
  AutoClose() {
    let timerInterval:any;
    Swal.fire({
      title: 'Auto close alert!',
      html: 'I will close in <b></b> milliseconds.',
      timer: 2000,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
        const b = Swal.getHtmlContainer().querySelector('b');
        timerInterval = setInterval(() => {
          b.textContent = Swal.getTimerLeft();
        }, 100);
      },
      willClose: () => {
        clearInterval(timerInterval);
      },
    }).then((result:any) => {
      /* Read more about handling dismissals below */
      if (result.dismiss === Swal.DismissReason.timer) {
        console.log('I was closed by the timer');
      }
    });
  }
  AjaxReq() {
    Swal.fire({
      title: 'Submit your Github username',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Look up',
      showLoaderOnConfirm: true,
      preConfirm: (login:any) => {
        return fetch(`//api.github.com/users/${login}`)
          .then(response => {
            if (!response.ok) {
              throw new Error(response.statusText)
            }
            return response.json()
          })
          .catch(error => {
            Swal.showValidationMessage(
              `Request failed: ${error}`
            )
          })
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result:any) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: `${result.value.login}'s avatar`,
          // imageUrl: result.value.avatar_url
        })
      }
    })
  }
  //custom Alerts
  public SimpleMessage = 'New Notification From admitro';
  public SimpleTitle = 'Notifications Styles';
  simpleAlert() {
    Swal.fire({
      text: this.SimpleMessage,
      showConfirmButton: true,
      confirmButtonColor: '#705ec8',
    });
  }

  titleAlert() {
    Swal.fire({
      title: this.SimpleTitle,
      showConfirmButton: true,
      confirmButtonColor: '#705ec8',
    });
  }

  imageAlert() {
    Swal.fire({
      title: this.SimpleTitle,
      text: this.SimpleMessage,
      imageUrl: './assets/images/brand/logo-2.png',
      imageAlt: 'Custom image',
      confirmButtonColor: '#705ec8',
    });
  }

  timerAlert() {
    Swal.fire({
      title: this.SimpleTitle,
      html: 'New Notification From admitro (Close after 2 Seconds)',
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  }
}
