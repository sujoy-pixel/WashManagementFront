import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateTaskComponent } from './create-task/create-task.component';
import { EditTaskComponent } from './edit-task/edit-task.component';
import { TaskListComponent } from './task-list/task-list.component';

const routes: Routes = [{
  path:'task', children: [
    {path: 'task-list', component: TaskListComponent},
    {path: 'edit-task', component: EditTaskComponent},
    {path: 'create-task', component: CreateTaskComponent},
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TasksRoutingModule { }
