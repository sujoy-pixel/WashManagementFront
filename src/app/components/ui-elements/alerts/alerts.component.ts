import { Component, OnInit } from '@angular/core';

interface Alert {
  type: string;
  message: string;
}

const ALERTS: Alert[] = [{
    type: 'default',
    message: 'Default alert—At vero eos et accusamus praesentium!',
  }, {
    type: 'primary',
    message: 'Primary alert—At vero eos et accusamus praesentium!',
  }, {
    type: 'secondary',
    message: 'Secondary alert—At vero eos et accusamus praesentium!',
  }, {
    type: 'success',
    message: 'Success alert—At vero eos et accusamus praesentium!',
  }, {
    type: 'warning',
    message: 'Warning alert—At vero eos et accusamus praesentium!',
  }, {
    type: 'info',
    message: 'Info alert—At vero eos et accusamus praesentium!',
  }, {
    type: 'danger',
    message: 'Danger alert—At vero eos et accusamus praesentium!',
  }, {
    type: 'light',
    message: 'Light alert—At vero eos et accusamus praesentium!',
  }, {
    type: 'dark',
    message: 'Dark alert—At vero eos et accusamus praesentium!',
  }
];
interface AlertIcon {
  icon: string;
  type: string;
  message: string;
}
const AlertWithIcon: AlertIcon[] = [{
    icon:'fe fe-download',
    type: 'default',
    message: 'Default alert—At vero eos et accusamus praesentium!',
  }, {
    icon:'fe fe-check-square',
    type: 'primary',
    message: 'Primary alert—At vero eos et accusamus praesentium!',
  }, {
    icon:'fe fe-thumbs-up',
    type: 'success',
    message: 'Success alert—At vero eos et accusamus praesentium!',
  }, {
    icon:'fe fe-bell',
    type: 'warning',
    message: 'Warning alert—At vero eos et accusamus praesentium!',
  }, {
    icon:'fe fe-info',
    type: 'info',
    message: 'Info alert—At vero eos et accusamus praesentium!',
  }, {
    icon:'fe fe-slash',
    type: 'danger',
    message: 'Danger alert—At vero eos et accusamus praesentium!',
  }
];


@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.scss']
})
export class AlertsComponent implements OnInit {

  alerts!: Alert[];
  alertIcon!: AlertIcon[]
  constructor() {
    this.alerts = ALERTS
    this.alertIcon = AlertWithIcon
  }

  close(alert: Alert) {
    this.alerts.splice(this.alerts.indexOf(alert), 1);
  }
  closeIconAlert(alertIcon: AlertIcon) {
    this.alertIcon.splice(this.alertIcon.indexOf(alertIcon), 1);
  }
  ngOnInit(): void {
  }

  
}
