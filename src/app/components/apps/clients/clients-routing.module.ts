import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddClientComponent } from './add-client/add-client.component';
import { ClientsComponent } from './clients/clients.component';

const routes: Routes = [
  {path: 'client', children:[
    {path: 'client', component: ClientsComponent},
    {path: 'add-client', component: AddClientComponent},
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientsRoutingModule { }
