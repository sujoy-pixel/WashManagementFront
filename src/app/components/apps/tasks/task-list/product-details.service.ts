/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
import { Injectable, PipeTransform } from '@angular/core';

import { BehaviorSubject, Observable, of, Subject } from 'rxjs';

import { DecimalPipe } from '@angular/common';
import { debounceTime, delay, switchMap, tap } from 'rxjs/operators';
import {
  SortColumn,
  SortDirection,
} from 'src/app/shared/directives/soratable.directive';
import { TaskListData, TaskListType } from './task-list.module';


const compare = (v1: string | number, v2: string | number) =>
  v1 < v2 ? -1 : v1 > v2 ? 1 : 0;


// TaskListType
interface SearchResultTaskList {
  TaskList: TaskListType[];
  totalTaskList: number;
}
interface StateTaskList {
  pageTaskList: number;
  pageSizeTaskList: number;
  searchTermTaskList: string;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
}
function sortTaskList(
  ProductDetails: TaskListType[],
  column: SortColumn,
  direction: string
): TaskListType[] {
  if (direction === '' || column === '') {
    return ProductDetails;
  } else {
    return [...ProductDetails].sort((a: any, b: any) => {
      const res = compare(a[column], b[column]);
      return direction === 'asc' ? res : -res;
    });
  }
}
function matchesTaskList(
  TaskList: TaskListType,
  term: string,
  pipe: PipeTransform
) {
  return (
    TaskList.task.toLowerCase().includes(term.toLowerCase()) ||
    TaskList.name.toLowerCase().includes(term.toLowerCase()) ||
    TaskList.email.toLowerCase().includes(term.toLowerCase()) ||
    TaskList.dueDate.toLowerCase().includes(term.toLowerCase()) ||
    pipe.transform(TaskList.id).includes(term)
  );
}
@Injectable({ providedIn: 'root' })
export class TaskListService {
  private _loading$ = new BehaviorSubject<boolean>(true);

  // product details  Task list
  private _searchTaskList$ = new Subject<void>();
  private _productDetailsTaskList$ = new BehaviorSubject<TaskListType[]>([]);
  private _totalTaskList$ = new BehaviorSubject<number>(0);
  private _stateTaskList: StateTaskList = {
    pageTaskList: 1,
    pageSizeTaskList: 5,
    searchTermTaskList: '',
    sortColumn: '',
    sortDirection: '',
  };

  constructor(private pipe: DecimalPipe) {


    //Task List
    this._searchTaskList$
      .pipe(
        tap(() => this._loading$.next(true)),
        debounceTime(200),
        switchMap(() => this._searchProductDetailsTaskList()),
        delay(200),
        tap(() => this._loading$.next(false))
      )
      .subscribe((result) => {
        this._productDetailsTaskList$.next(result.TaskList);
        this._totalTaskList$.next(result.totalTaskList);
      });

    this._searchTaskList$.next();
    
  }

  
  get loading$() {
    return this._loading$.asObservable();
  }
  
  // product details Task list
  get TaskList$() {
    return this._productDetailsTaskList$.asObservable();
  }
  get totalTaskList$() {
    return this._totalTaskList$.asObservable();
  }
  get pageTaskList() {
    return this._stateTaskList.pageTaskList;
  }
  get pageSizeTaskList() {
    return this._stateTaskList.pageSizeTaskList;
  }
  get searchTermTaskList() {
    return this._stateTaskList.searchTermTaskList;
  }
  set pageTaskList(pageTaskList: number) {
    this._setTaskList({ pageTaskList });
  }
  set pageSizeTaskList(pageSizeTaskList: number) {
    this._setTaskList({ pageSizeTaskList });
  }
  set searchTermTaskList(searchTermTaskList: string) {
    this._setTaskList({ searchTermTaskList });
  }
  set sortColumnTaskList(sortColumn: SortColumn) {
    this._setTaskList({ sortColumn });
  }
  set sortDirectionTaskList(sortDirection: SortDirection) {
    this._setTaskList({ sortDirection });
  }
  private _setTaskList(patch: Partial<StateTaskList>) {
    Object.assign(this._stateTaskList, patch);
    this._searchTaskList$.next();
  }
  private _searchProductDetailsTaskList(): Observable<SearchResultTaskList> {
    const {
      sortColumn,
      sortDirection,
      pageSizeTaskList,
      pageTaskList,
      searchTermTaskList,
    } = this._stateTaskList;

    // 1. sort
    let TaskList = sortTaskList(
      TaskListData,
      sortColumn,
      sortDirection
    );

    // 2. filter
    TaskList = TaskList.filter(
      (ProductsDetails) =>
        matchesTaskList(ProductsDetails, searchTermTaskList, this.pipe)
    );
    const totalTaskList = TaskList.length;

    // 3. paginate
    TaskList = TaskList.slice(
      (pageTaskList - 1) * pageSizeTaskList,
      (pageTaskList - 1) * pageSizeTaskList + pageSizeTaskList
    );
    return of({ TaskList, totalTaskList });
  }
}
