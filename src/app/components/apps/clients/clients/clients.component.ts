import { Component, OnInit } from '@angular/core';
import { ClientData, ClientDataType } from './client.module';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {
  ClientData!:ClientDataType[];
  constructor() { }

  ngOnInit(): void {
    this.ClientData = ClientData
  }

}
