/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
import {Injectable, PipeTransform} from '@angular/core';

import {BehaviorSubject, Observable, of, Subject} from 'rxjs';


import {DecimalPipe} from '@angular/common';
import {debounceTime, delay, switchMap, tap} from 'rxjs/operators';
import { SortColumn, SortDirection } from 'src/app/shared/directives/soratable.directive';
import { ProjectListData, ProjectListType } from './project-list.module';

interface SearchResult {
  projectList: ProjectListType[];
  total: number;
}

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
}

const compare = (v1: string | number, v2: string | number) => v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

function sort(projectList: ProjectListType[], column: SortColumn, direction: string): ProjectListType[] {
  if (direction === '' || column === '') {
    return projectList;
  } else {
    return [...projectList].sort((a:any, b:any) => {
      const res = compare(a[column], b[column]);
      return direction === 'asc' ? res : -res;
    });
  }
}

function matches(projectlist: ProjectListType, term: string, pipe: PipeTransform) {
  return projectlist.title?.toLowerCase().includes(term.toLowerCase()) || projectlist.date?.toLowerCase().includes(term.toLowerCase())
}

@Injectable({providedIn: 'root'})
export class ProjectListService {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _projectList$ = new BehaviorSubject<ProjectListType[]>([]);
  private _total$ = new BehaviorSubject<number>(0);

  private _state: State = {
    page: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: '',
    sortDirection: ''
  };

  constructor(private pipe: DecimalPipe) {
    this._search$.pipe(
      tap(() => this._loading$.next(true)),
      debounceTime(200),
      switchMap(() => this._search()),
      delay(200),
      tap(() => this._loading$.next(false))
    ).subscribe(result => {
      this._projectList$.next(result.projectList);
      this._total$.next(result.total);
    });

    this._search$.next();
  }

  get projectList$() { return this._projectList$.asObservable(); }
  get total$() { return this._total$.asObservable(); }
  get loading$() { return this._loading$.asObservable(); }
  get page() { return this._state.page; }
  get pageSize() { return this._state.pageSize; }
  get searchTerm() { return this._state.searchTerm; }

  set page(page: number) { this._set({page}); }
  set pageSize(pageSize: number) { this._set({pageSize}); }
  set searchTerm(searchTerm: string) { this._set({searchTerm}); }
  set sortColumn(sortColumn: SortColumn) { this._set({sortColumn}); }
  set sortDirection(sortDirection: SortDirection) { this._set({sortDirection}); }

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this._search$.next();
  }

  private _search(): Observable<SearchResult> {
    const {sortColumn, sortDirection, pageSize, page, searchTerm} = this._state;

    // 1. sort
    let projectList = sort(ProjectListData, sortColumn, sortDirection);

    // 2. filter
    projectList = projectList.filter(projectlist => matches(projectlist, searchTerm, this.pipe));
    const total = projectList.length;

    // 3. paginate
    projectList = projectList.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
    return of({projectList, total});
  }
}