import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DataTableComponent } from './data-table/data-table.component';
import { DefaultTableComponent } from './default-table/default-table.component';
import { EditableTableComponent } from './editable-table/editable-table.component';
import { AddMemberComponent } from './firebase_crud_table/add-member/add-member.component';
import { EditMemberComponent } from './firebase_crud_table/edit-member/edit-member.component';
import { MemberListComponent } from './firebase_crud_table/member-list/member-list.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'default-table', component: DefaultTableComponent },
      { path: 'data-table', component: DataTableComponent },
      {
        path: 'editable-table',
        component: EditableTableComponent,
        children: [
          { path: '', component: MemberListComponent },
          { path: 'register-member', component: AddMemberComponent },
          { path: 'edit-member/:id', component: EditMemberComponent },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TableRoutingModule {}
