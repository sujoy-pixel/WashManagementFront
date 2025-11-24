import { DecimalPipe } from '@angular/common';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Observable } from 'rxjs';
import { NgbdSortableHeader, SortEvent } from 'src/app/shared/directives/soratable.directive';
import { TaskListService } from './product-details.service';
import { TaskListType } from './task-list.module';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  providers: [TaskListService, DecimalPipe],
})
export class TaskListComponent implements OnInit {

  TaskList$: Observable<TaskListType[]>;
  totalTaskList$: Observable<number>;
  @ViewChildren(NgbdSortableHeader) headers!: QueryList<NgbdSortableHeader>;
  constructor(public service: TaskListService) {
    
    // task list
    this.TaskList$ = service.TaskList$;
    this.totalTaskList$ = service.totalTaskList$;
   }

  ngOnInit(): void {
  }

  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.service.sortColumnTaskList = column;
    this.service.sortDirectionTaskList = direction;
  }
  

}
